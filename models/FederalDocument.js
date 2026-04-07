/**
 * FederalDocument.js — Mongoose model for documents fetched from the Federal Register API.
 *
 * Each document maps to one entry from the Federal Register's /documents.json response.
 * The `documentNumber` field is unique so that re-running the daily fetch never creates duplicates.
 *
 * Design decision: We store only the fields useful for display (title, type, agency names,
 * abstract, and a link to the full document) rather than the full API payload, keeping the
 * collection lean and queries fast.
 */

const mongoose = require('mongoose');

/**
 * Schema for a single Federal Register document.
 *
 * Fields:
 *   documentNumber  — unique identifier from the Federal Register (e.g. "2024-01234")
 *   title           — human-readable document title
 *   type            — Rule | Proposed Rule | Notice | Presidential Document
 *   publicationDate — the date the document was officially published
 *   agencyNames     — list of agencies that issued the document
 *   abstract        — short summary of the document's content (may be null)
 *   htmlUrl         — link to the full document on federalregister.gov
 *   fetchedAt       — timestamp of when this record was inserted into our database
 */
const federalDocumentSchema = new mongoose.Schema({
  documentNumber: { type: String, required: true, unique: true },
  title:          { type: String, required: true },
  type:           { type: String },
  publicationDate:{ type: Date },
  agencyNames:    [String],
  abstract:       { type: String },
  htmlUrl:        { type: String },
  fetchedAt:      { type: Date, default: Date.now },
});

// Index on publicationDate so date-filtered queries stay fast as the collection grows.
federalDocumentSchema.index({ publicationDate: -1 });

module.exports = mongoose.model('FederalDocument', federalDocumentSchema);
