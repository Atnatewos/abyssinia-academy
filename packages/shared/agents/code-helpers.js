/**
 * @fileoverview Agent Code Helpers
 *
 * Single source of truth for agent code normalization. Used by both
 * Express and Next.js layers to ensure consistent matching regardless of
 * how the code was generated or typed by a user.
 *
 * Normalization rules:
 *   - Trim whitespace
 *   - Uppercase everything (AGT-abc123 → AGT-ABC123)
 *
 * The database schema stores codes as VARCHAR and does not enforce
 * casing. Any endpoint that reads or writes agent codes MUST go through
 * `normalizeAgentCode` so lookups always match.
 *
 * Path: packages/shared/agents/code-helpers.js
 */

/**
 * Normalize an agent code for consistent storage and lookup.
 *
 * @param {string} rawCode - Raw code from URL, form, or DB
 * @returns {string} Normalized code (trimmed, uppercased) or '' if empty
 */
const normalizeAgentCode = (rawCode) => {
  if (rawCode === null || rawCode === undefined) return '';
  return String(rawCode).trim().toUpperCase();
};

/**
 * Convert an agent code to SQL LIKE / LOWER-compatible form for queries
 * that must match legacy lowercase rows.
 *
 * @param {string} rawCode
 * @returns {string}
 */
const toSqlLookupValue = (rawCode) => normalizeAgentCode(rawCode).toLowerCase();

module.exports = {
  normalizeAgentCode,
  toSqlLookupValue,
};