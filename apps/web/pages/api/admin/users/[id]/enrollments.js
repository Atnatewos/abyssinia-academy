/**
 * @fileoverview Admin User Enrollments API
 *
 * Returns the enrollment history for a specific user. Used by the admin
 * user detail page to render the enrollment history section.
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
 * Validate and decode admin JWT from the Authorization header.
 *
 * @param {string} authHeader - Raw Authorization header value
 * @returns {object} Decoded admin payload
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
    return res
      .status(405)
      .json({ success: false, message: 'Method not allowed.' });
  }

  try {
    verifyAdmin(req.headers.authorization);

    const userId = req.query.id;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: 'User id is required.' });
    }

    /*
     * Join enrollments with payments so the admin can see the payment
     * context (method, reference, amount) alongside each enrollment.
     */
    const result = await pool.query(
      `SELECT
         e.id,
         e.user_id,
         e.purchase_mode,
         e.selected_phases,
         e.purchase_amount AS amount,
         e.enrolled_at AS created_at,
         e.enrolled_at AS paid_at,
         p.method,
         p.status,
         p.reference
       FROM enrollments e
       LEFT JOIN payments p ON p.id = e.payment_id
       WHERE e.user_id = $1
       ORDER BY e.enrolled_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('[admin/users/[id]/enrollments] Error:', error.message);
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to load enrollments.',
    });
  }
}