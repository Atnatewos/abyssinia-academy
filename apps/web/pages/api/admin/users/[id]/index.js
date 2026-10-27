/**
 * @fileoverview Admin Single User Detail API
 *
 * Returns one user object (never an array) with schema-verified columns
 * and a derived enrollment status. Verified against the users table:
 *   id, full_name, email, phone, avatar_url, is_enrolled, enrolled_at,
 *   direct_referral_count, total_team_size, paying_direct_count,
 *   paying_team_size, lifetime_referral_earnings, last_active, created_at
 *
 * Path: apps/web/pages/api/admin/users/[id]/index.js
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
 * Validate and decode admin JWT from the Authorization header.
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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  try {
    verifyAdmin(req.headers.authorization);

    const userId = req.query.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User id is required.' });
    }

    const sql = `
      SELECT
        id,
        full_name,
        email,
        phone,
        avatar_url,
        is_enrolled,
        enrolled_at,
        direct_referral_count,
        total_team_size,
        paying_direct_count,
        paying_team_size,
        lifetime_referral_earnings,
        last_active,
        created_at,
        updated_at,
        CASE WHEN is_enrolled = TRUE THEN 'enrolled' ELSE 'registered' END AS status,
        'user' AS role
      FROM users
      WHERE id = $1
      LIMIT 1
    `;

    const result = await pool.query(sql, [userId]);

    return res.status(200).json({
      success: true,
      data: result.rows[0] || null,
    });
  } catch (error) {
    console.error('[admin/users/[id]] Error:', error.message);
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to load user details.',
    });
  }
}