/**
 * @fileoverview Admin User Status Transition API
 *
 * Toggles a user's enrollment state. Accepts ONLY whitelisted statuses
 * ('enrolled' | 'registered') and maps them to the verified `is_enrolled`
 * boolean column. Enrolling stamps `enrolled_at`; unenrolling preserves
 * the original timestamp for audit history.
 *
 * Path: apps/web/pages/api/admin/users/[id]/status.js
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

/* Whitelist of allowed status transitions — server-side validation */
const ALLOWED_STATUSES = ['enrolled', 'registered'];

/**
 * Validate and decode admin JWT.
 * @param {string} authHeader - Authorization header
 * @returns {object} Decoded payload
 * @throws {Error} With status code attached
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
    const err = new Error('JWT_ADMIN_SECRET is not configured');
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  try {
    verifyAdmin(req.headers.authorization);

    const userId = req.query.id;
    const requestedStatus = String(req.body?.status || '').toLowerCase();

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User id is required.' });
    }
    if (!ALLOWED_STATUSES.includes(requestedStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed: enrolled, registered.',
      });
    }

    const shouldEnroll = requestedStatus === 'enrolled';

    const sql = `
      UPDATE users
      SET is_enrolled = $2,
          enrolled_at = CASE
            WHEN $2 = TRUE AND enrolled_at IS NULL THEN NOW()
            ELSE enrolled_at
          END,
          updated_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        full_name,
        email,
        phone,
        is_enrolled,
        enrolled_at,
        CASE WHEN is_enrolled = TRUE THEN 'enrolled' ELSE 'registered' END AS status
    `;

    const result = await pool.query(sql, [userId, shouldEnroll]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
      message: shouldEnroll
        ? 'User marked as enrolled.'
        : 'User moved back to registered.',
    });
  } catch (error) {
    console.error('[admin/users/[id]/status] Error:', error.message);
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to update user status.',
    });
  }
}