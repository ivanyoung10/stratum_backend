/**
 * federalRegister.js — Express router for Federal Register document endpoints.
 *
 * Routes:
 *   GET /api/federal-register                  — list documents (optionally filtered by date)
 *   GET /api/federal-register/:documentNumber  — fetch a single document by its document number
 *
 * Design decision: Results are sorted newest-first so callers always get the most recent
 * documents at the top without needing to sort client-side.
 */

const { Router } = require('express');
const FederalDocument = require('../models/FederalDocument');

const router = Router();

/**
 * GET /api/federal-register
 *
 * Returns Federal Register documents stored in the database.
 * Supports an optional `?date=YYYY-MM-DD` query parameter to filter by publication date.
 *
 * Query params:
 *   date (optional) — publication date in YYYY-MM-DD format, e.g. ?date=2026-04-07
 *
 * @returns {JSON} Array of FederalDocument objects sorted by publicationDate descending.
 */
router.get('/', async (req, res) => {
  try {
    res.status(200).send("Hello")
    // const query = {};

    // // If a date filter is provided, convert it to a day-range query so the comparison
    // // works correctly against the stored Date objects regardless of time component.
    // if (req.query.date) {
    //   const start = new Date(req.query.date);
    //   const end   = new Date(req.query.date);
    //   end.setDate(end.getDate() + 1);
    //   query.publicationDate = { $gte: start, $lt: end };
    // }

    // const documents = await FederalDocument.find(query).sort({ publicationDate: -1 });

    // res.json({ count: documents.length, documents });
  } catch (error) {
    console.error('[GET /api/federal-register] Error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve documents' });
  }
});

/**
 * GET /api/federal-register/:documentNumber
 *
 * Returns a single Federal Register document by its unique document number.
 *
 * Path params:
 *   documentNumber — the Federal Register document number, e.g. "2026-07890"
 *
 * @returns {JSON} A single FederalDocument object, or 404 if not found.
 */
router.get('/:documentNumber', async (req, res) => {
  try {
    const document = await FederalDocument.findOne({
      documentNumber: req.params.documentNumber,
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    console.error('[GET /api/federal-register/:documentNumber] Error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve document' });
  }
});

module.exports = router;
