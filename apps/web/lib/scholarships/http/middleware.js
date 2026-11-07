/**
 * @fileoverview Scholarship HTTP Middleware
 *
 * Reusable request helpers that every scholarship handler uses. Keeps
 * auth + body parsing consistent so no handler forgets a check.
 *
 * The middleware functions here are NOT Express-style `(req,res,next)`.
 * They are async helpers that either return a parsed value or throw a
 * domainError that the handler catches and passes to handleError().
 *
 * Ban semantics:
 *   The users table models a ban as `banned_at IS NOT NULL`. There is
 *   no boolean `is_banned` column. This middleware derives the boolean
 *   as `user.is_banned` so downstream handlers keep a stable contract
 *   without needing to know the underlying column name.
 *
 * Path: apps/web/lib/scholarships/http/middleware.js
 */

import jwt from 'jsonwebtoken';
import { query } from '../../db';
import { domainError } from './errors';

/* ============================================================================
 * AUTHENTICATION
 * ========================================================================== */

/**
 * Extract the bearer token from an Authorization header.
 *
 * @param {import('next').NextApiRequest} req
 * @returns {string} Raw token
 * @throws 401 if missing or malformed
 */
const extractBearer = (req) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw domainError('UNAUTHENTICATED', 'Authentication required.');
  }
  return header.slice(7);
};

/**
 * Verify the bearer token and load the user row.
 * On success returns `{ user, userId }`. On failure throws UNAUTHENTICATED.
 *
 * The returned `user` object always exposes `is_banned` as a boolean
 * derived from `banned_at IS NOT NULL`. Callers that read
 * `user.is_banned` never need to know the underlying column name.
 *
 * @param {import('next').NextApiRequest} req
 * @returns {Promise<{ user: object, userId: string }>}
 */
export const requireUser = async (req) => {
  const token = extractBearer(req);

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw domainError('UNAUTHENTICATED', 'Invalid or expired session.');
  }

  const result = await query(
    `SELECT id, full_name, phone, email, is_enrolled,
            banned_at, banned_reason
     FROM users WHERE id = $1`,
    [decoded.userId]
  );
  const row = result.rows[0];
  if (!row) {
    throw domainError('UNAUTHENTICATED', 'User not found.');
  }

  /* Normalize the ban flag so downstream handlers can rely on
     `user.is_banned` regardless of how the schema models it. */
  const user = {
    ...row,
    is_banned: row.banned_at !== null && row.banned_at !== undefined,
  };

  return { user, userId: user.id };
};

/**
 * Verify the admin bearer token and load the admin row.
 * On success returns `{ admin, adminId }`. On failure throws UNAUTHENTICATED
 * (not FORBIDDEN — admin tokens are a distinct surface).
 *
 * @param {import('next').NextApiRequest} req
 * @returns {Promise<{ admin: object, adminId: string }>}
 */
export const requireAdmin = async (req) => {
  const token = extractBearer(req);

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
  } catch {
    throw domainError('UNAUTHENTICATED', 'Invalid or expired admin session.');
  }

  const result = await query(
    `SELECT id, username, email, role FROM admins WHERE id = $1`,
    [decoded.adminId]
  );
  const admin = result.rows[0];
  if (!admin) {
    throw domainError('UNAUTHENTICATED', 'Admin not found.');
  }
  return { admin, adminId: admin.id };
};

/* ============================================================================
 * BODY PARSING
 * ========================================================================== */

/**
 * Parse a JSON body from a Next.js request. Enforces a max payload size
 * and rejects non-object payloads.
 *
 * @param {import('next').NextApiRequest} req
 * @param {{ maxBytes?: number }} [options]
 * @returns {object} Parsed body
 */
export const parseJsonBody = (req, options = {}) => {
  const maxBytes = options.maxBytes || 64 * 1024; // 64 KB default
  const body = req.body;

  if (body === undefined || body === null) {
    return {};
  }

  if (typeof body !== 'object' || Array.isArray(body)) {
    throw domainError(
      'VALIDATION_ERROR',
      'Request body must be a JSON object.'
    );
  }

  /* Rough byte-size guard (post-parse — Next.js already enforced its own limit) */
  const size = Buffer.byteLength(JSON.stringify(body), 'utf8');
  if (size > maxBytes) {
    throw domainError(
      'VALIDATION_ERROR',
      `Request body exceeds the ${Math.round(maxBytes / 1024)} KB limit.`
    );
  }

  return body;
};

/**
 * Reject a request whose Content-Type doesn't match what the endpoint expects.
 * Currently only used by the multipart upload endpoint. Handlers that
 * consume JSON don't need to call this.
 *
 * @param {import('next').NextApiRequest} req
 * @param {string} expectedType
 */
export const requireContentType = (req, expectedType) => {
  const contentType = req.headers['content-type'] || '';
  if (!contentType.toLowerCase().includes(expectedType.toLowerCase())) {
    throw domainError(
      'VALIDATION_ERROR',
      `Expected Content-Type to include "${expectedType}".`
    );
  }
};

/* ============================================================================
 * QUERY PARAM HELPERS
 * ========================================================================== */

/**
 * Read an integer query parameter with bounds checking.
 *
 * @param {object} query - req.query
 * @param {string} key
 * @param {number} fallback
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export const readIntQuery = (queryParams, key, fallback, min, max) => {
  const raw = queryParams?.[key];
  if (raw === undefined || raw === null || raw === '') return fallback;
  const parsed = parseInt(Array.isArray(raw) ? raw[0] : raw, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
};

/**
 * Read a string query parameter with length enforcement.
 *
 * @param {object} query - req.query
 * @param {string} key
 * @param {number} maxLen
 * @returns {string}
 */
export const readStringQuery = (queryParams, key, maxLen = 200) => {
  const raw = queryParams?.[key];
  if (raw === undefined || raw === null) return '';
  const str = Array.isArray(raw) ? raw[0] : raw;
  return String(str).trim().slice(0, maxLen);
};