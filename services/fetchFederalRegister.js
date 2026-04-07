/**
 * fetchFederalRegister.js — Fetches today's Federal Register documents and stores them in MongoDB.
 *
 * Two exported functions:
 *   fetchAndStore()  — performs a single fetch-and-insert cycle for today's date.
 *   scheduleFetch()  — registers a node-cron job that calls fetchAndStore() at 6 AM Mon–Fri,
 *                      and also runs it once immediately so data is available on startup.
 *
 * Scalability note: The Federal Register API caps responses at 1000 items per page. On high-volume
 * days this may mean some documents are missed. A production system would paginate using the
 * `next_page_url` field returned in the API response.
 *
 * Security note: We only call a well-known public government API and never forward user input
 * into the request URL, so injection risk is minimal. Still validate the response shape before
 * inserting into the database.
 */

const cron = require('node-cron');
const FederalDocument = require('../models/FederalDocument');

// Base URL for the Federal Register documents endpoint (no API key required).
const FEDERAL_REGISTER_BASE = 'https://www.federalregister.gov/api/v1/documents.json';

/**
 * Returns today's date formatted as YYYY-MM-DD.
 *
 * @returns {string} e.g. "2026-04-07"
 */
function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Builds the Federal Register API URL for a given publication date.
 * We request only the fields we store to minimise response size.
 *
 * @param {string} date - A date string in YYYY-MM-DD format.
 * @returns {string} The fully-constructed API URL.
 */
function buildApiUrl(date) {
  const fields = [
    'document_number',
    'title',
    'type',
    'publication_date',
    'agencies',
    'abstract',
    'html_url',
  ];

  // URLSearchParams handles encoding. Each field is appended as a separate param
  // because the Federal Register API expects repeated fields[]=value pairs.
  const params = new URLSearchParams({
    'conditions[publication_date][is]': date,
    per_page: '1000',
  });

  fields.forEach((f) => params.append('fields[]', f));

  return `${FEDERAL_REGISTER_BASE}?${params.toString()}`;
}

/**
 * Maps a raw API result object to the shape expected by the FederalDocument schema.
 *
 * @param {Object} doc - A single document object from the Federal Register API response.
 * @returns {Object} A plain object matching the FederalDocument schema.
 */
function mapApiDocToSchema(doc) {
  return {
    documentNumber:  doc.document_number,
    title:           doc.title,
    type:            doc.type,
    // The API returns dates as strings (e.g. "2026-04-07"). Mongoose will coerce them to Date.
    publicationDate: doc.publication_date,
    // Each agency entry has a `name` field; flatten to an array of strings.
    agencyNames:     (doc.agencies || []).map((a) => a.name).filter(Boolean),
    abstract:        doc.abstract || null,
    htmlUrl:         doc.html_url,
  };
}

/**
 * Fetches today's documents from the Federal Register API and inserts new ones into MongoDB.
 * Documents that already exist (matching documentNumber) are silently skipped.
 *
 * @returns {Promise<void>}
 */
async function fetchAndStore() {
  const date = getTodayDateString();
  console.log(`[FederalRegister] Fetching documents for ${date}...`);

  let data;
  try {
    const response = await fetch(buildApiUrl(date));

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    data = await response.json();
  } catch (error) {
    console.error('[FederalRegister] Fetch failed:', error.message);
    return;
  }

  const results = data.results;

  if (!Array.isArray(results) || results.length === 0) {
    console.log('[FederalRegister] No documents found for', date);
    return;
  }

  const documents = results.map(mapApiDocToSchema);

  try {
    // ordered: false tells Mongoose to continue inserting even if some documents
    // already exist (duplicate key on documentNumber), so this is safe to re-run.
    const inserted = await FederalDocument.insertMany(documents, { ordered: false });
    console.log(`[FederalRegister] Inserted ${inserted.length} new documents for ${date}`);
  } catch (error) {
    // Code 11000 is a MongoDB duplicate key error — expected on re-runs, not a real failure.
    if (error.code === 11000) {
      const newCount = error.insertedDocs?.length ?? 0;
      console.log(`[FederalRegister] ${newCount} new documents inserted (duplicates skipped)`);
    } else {
      console.error('[FederalRegister] Database insert error:', error.message);
    }
  }
}

/**
 * Registers a cron job to run fetchAndStore() at 6:00 AM Monday through Friday.
 * Also runs a single fetch immediately so data is available right after startup.
 *
 * Cron syntax: '0 6 * * 1-5'
 *   0      = minute 0
 *   6      = hour 6 (6 AM, server local time)
 *   *      = any day of the month
 *   *      = any month
 *   1-5    = Monday (1) through Friday (5)
 */
function scheduleFetch() {
  // Run once immediately so the database is populated as soon as the server starts.
  fetchAndStore();

  cron.schedule('0 6 * * 1-5', () => {
    console.log('[FederalRegister] Cron triggered — running scheduled fetch');
    fetchAndStore();
  });

  console.log('[FederalRegister] Scheduled daily fetch at 6 AM Mon–Fri');
}

module.exports = { fetchAndStore, scheduleFetch };
