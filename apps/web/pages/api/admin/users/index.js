/**
 * @fileoverview Admin Users List API
 *
 * Returns paginated list of registered users with UI-friendly field
 * aliases verified against the real schema (probe 2026-10-08):
 *
 *   users columns used:
 *     id, full_name, phone, email, avatar_url, is_enrolled,
 *     direct_referral_count, total_team_size, lifetime_referral_earnings,
 *     last_active, created_at, updated_at
 *
 *   NOT in schema (never referenced):
 *     role, status, referral_count, last_active_at, commission_earned
 *
 * Path: apps/web/pages/api/admin/users/index.js
 */
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
      ? { rejectUnauthorized: false }
      : false,
});

/**
 * Validate and decode admin JWT from Authorization header.
 * @param {string} authHeader - Raw Authorization header value
 * @returns {object} Decoded admin payload
 * @throws {Error} With status code attached for clean routing
 */
const verifyAdmin = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Missing or malformed Authorization header');
    err.status = 401;
    throw err;
  }

  const token = authHeader.slice(7);
  const adminSecret = process.env.JWT_ADMIN_SECRET;
  if (!adminSecret) {
    const err = new Error('JWT_ADMIN_SECRET is not configured on the server');
    err.status = 500;
    throw err;
  }

  try {
    return jwt.verify(token, adminSecret);
  } catch {
    const err = new Error('Invalid or expired admin token');
    err.status = 401;
    throw err;
  }
};

/**
 * Parse a non-negative integer query parameter with a safe default.
 * @param {string|undefined} value - Raw query value
 * @param {number} defaultValue - Default when missing or invalid
 * @returns {number}
 */
const parsePositiveInt = (value, defaultValue) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) return defaultValue;
  return parsed;
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  try {
    verifyAdmin(req.headers.authorization);

    const statusFilter = req.query.status || 'all';
    const search = (req.query.search || '').trim();
    const limit = Math.min(parsePositiveInt(req.query.limit, 200), 1000);
    const offset = parsePositiveInt(req.query.offset, 0);

    /**
     * SQL verified against real schema. Status is DERIVED from is_enrolled
     * since the users table has no status column. Role is hardcoded 'user'
     * because there is no role column on users.
     *
     * Parameter map:
     *   $1 = searchPattern   (% when empty, so ILIKE matches everything)
     *   $2 = statusFilter    ('all' | 'enrolled' | 'registered')
     *   $3 = limit
     *   $4 = offset
     */
    const sql = `
      SELECT
        u.id,
        u.full_name AS name,
        u.phone,
        u.email,
        u.avatar_url,
        u.is_enrolled,
        CASE WHEN u.is_enrolled = TRUE THEN 'enrolled' ELSE 'registered' END AS status,
        'user' AS role,
        u.direct_referral_count AS referral_count,
        u.total_team_size,
        u.lifetime_referral_earnings AS total_earned,
        u.last_active AS last_active_at,
        u.created_at,
        u.updated_at
      FROM users u
      WHERE (
              $1 = '%'
              OR u.full_name ILIKE $1
              OR u.email ILIKE $1
              OR u.phone ILIKE $1
            )
        AND (
              $2 = 'all'
              OR ($2 = 'enrolled' AND u.is_enrolled = TRUE)
              OR ($2 = 'registered' AND (u.is_enrolled IS NULL OR u.is_enrolled = FALSE))
            )
      ORDER BY u.created_at DESC
      LIMIT $3 OFFSET $4
    `;

    const searchPattern = search ? `%${search}%` : '%';
    const result = await pool.query(sql, [searchPattern, statusFilter, limit, offset]);

    return res.status(200).json({
      success: true,
      data: result.rows,
      total: result.rows.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error('[admin/users] Error:', error.message);
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to load users.',
    });
  }
}