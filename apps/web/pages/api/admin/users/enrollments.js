/**
 * @fileoverview Admin User Enrollment History API
 *
 * Enrollment history is derived from approved/processed payments since
 * the platform tracks course access through the payments ledger.
 * Returns purchase mode, selected phases, amount, method, and dates.
 *
 * Path: apps/web/pages/api/admin/users/[id]/enrollments.js
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
        amount,
        method,
        status,
        reference,
        purchase_mode,
        selected_phases,
        paid_at,
        created_at
      FROM payments
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 50
    `;

    const result = await pool.query(sql, [userId]);

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('[admin/users/[id]/enrollments] Error:', error.message);
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to load enrollment history.',
    });
  }
}