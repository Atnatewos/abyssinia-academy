/**
 * @fileoverview Admin User Search Endpoint (Announcement Targeting)
 *
 * GET /api/admin/notifications/user-search?q=<term>&limit=<n>
 *
 * Purpose-built lookup for the announcement composer's "Specific users"
 * picker. Searches users by full name, phone, or email with a single
 * parameterized ILIKE query and returns a stable, normalized contract:
 *
 *   { success: true, data: { users: [{ id, fullName, phone, email, isEnrolled }] } }
 *
 * Security:
 *   - Bearer admin JWT required (JWT_ADMIN_SECRET)
 *   - ILIKE wildcards (%, _, \) escaped so user input cannot inject patterns
 *   - Minimum query length enforced server-side
 *   - Result limit clamped (1..50) to prevent abuse
 *   - Only non-sensitive columns returned (no password, no wallet data)
 *
 * Performance note:
 *   Leading-wildcard ILIKE cannot use a btree index. At current user
 *   volumes this is a fast sequential scan; if the users table grows
 *   past ~100k rows, add a pg_trgm GIN index on full_name/phone/email.
 *
 * Path: apps/web/pages/api/admin/notifications/user-search.js
 */
import jwt from 'jsonwebtoken';
import { query } from '../../../../lib/db';

const MIN_QUERY_LENGTH = 2;
const MAX_RESULT_LIMIT = 50;
const DEFAULT_RESULT_LIMIT = 15;

/**
 * Decode and verify an admin Bearer token.
 * @param {string} authHeader - Authorization header value
 * @returns {object} Decoded admin payload
 * @throws {Error} With .status attached for clean routing
 */
const verifyAdmin = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Missing or malformed Authorization header');
    err.status = 401;
    throw err;
  }
  const adminSecret = process.env.JWT_ADMIN_SECRET;
  if (!adminSecret) {
    const err = new Error('JWT_ADMIN_SECRET is not configured');
    err.status = 500;
    throw err;
  }
  try {
    return jwt.verify(authHeader.slice(7), adminSecret);
  } catch {
    const err = new Error('Invalid or expired admin token');
    err.status = 401;
    throw err;
  }
};

/**
 * Escape ILIKE special characters so raw input is treated literally.
 * @param {string} value - Raw search term
 * @returns {string} Escaped pattern body
 */
const escapeLikePattern = (value) => value.replace(/[\\%_]/g, (ch) => `\\${ch}`);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  try {
    verifyAdmin(req.headers.authorization);
  } catch (err) {
    return res.status(err.status || 401).json({ success: false, message: err.message });
  }

  const term = String(req.query.q || '').trim();
  const requestedLimit = parseInt(req.query.limit || String(DEFAULT_RESULT_LIMIT), 10);
  const limit = Math.min(MAX_RESULT_LIMIT, Math.max(1, requestedLimit || DEFAULT_RESULT_LIMIT));

  if (term.length < MIN_QUERY_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `Search term must be at least ${MIN_QUERY_LENGTH} characters.`,
    });
  }

  try {
    const pattern = `%${escapeLikePattern(term)}%`;

    const result = await query(
      `SELECT id, full_name, phone, email, is_enrolled, created_at
       FROM users
       WHERE full_name ILIKE $1
          OR phone ILIKE $1
          OR email ILIKE $1
       ORDER BY full_name ASC
       LIMIT $2`,
      [pattern, limit]
    );

    const users = result.rows.map((row) => ({
      id: row.id,
      fullName: row.full_name || 'Unknown',
      phone: row.phone || '',
      email: row.email || '',
      isEnrolled: row.is_enrolled === true,
    }));

    return res.status(200).json({ success: true, data: { users } });
  } catch (error) {
    console.error('[admin/notifications/user-search] Error:', error.message);
    return res.status(500).json({ success: false, message: 'User search failed.' });
  }
}