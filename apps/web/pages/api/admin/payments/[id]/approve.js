/**
 * @fileoverview Admin Approve Payment API
 * Approves a payment and enrolls the student.
 * Path: apps/web/pages/api/admin/payments/[id]/approve.js
 */

import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
});

export default async function handler(req, res) {

  if (req.method !== 'PATCH') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  let decoded;

  try {
    decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_ADMIN_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid admin token.' });
  }

  const { id } = req.query;

  try {

    /*
     * Fetch the payment record
     */
    const paymentResult = await pool.query(
      'SELECT * FROM payments WHERE id = $1',
      [id]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found.' });
    }

    const payment = paymentResult.rows[0];

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Payment is already ${payment.status}.`,
      });
    }

    /*
     * Update payment status to approved
     */
    await pool.query(
      `UPDATE payments
       SET status = 'approved', paid_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    );

    /*
     * Update user enrollment status
     */
    await pool.query(
      `UPDATE users
       SET is_enrolled = true,
           enrolled_at = CURRENT_TIMESTAMP,
           payment_status = 'approved',
           payment_method = $1,
           payment_amount = $2,
           payment_ref = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [payment.method, payment.amount, payment.reference, payment.user_id]
    );

    /*
     * Create enrollment record if it doesn't exist
     */
    const existingEnrollment = await pool.query(
      'SELECT id FROM enrollments WHERE user_id = $1',
      [payment.user_id]
    );

    if (existingEnrollment.rows.length === 0) {
      await pool.query(
        `INSERT INTO enrollments (user_id, course_id, purchase_mode, purchase_amount, payment_id, enrolled_at)
         VALUES ($1, (SELECT id FROM courses WHERE slug = 'fullstack-web-engineering-masterclass' LIMIT 1),
                 'full-course', $2, $3, CURRENT_TIMESTAMP)`,
        [payment.user_id, payment.amount, id]
      );
    }

    /*
     * Initialize course progress if not exists
     */
    await pool.query(
      `INSERT INTO course_progress (user_id, course_id, progress)
       VALUES ($1, (SELECT id FROM courses WHERE slug = 'fullstack-web-engineering-masterclass' LIMIT 1), 0)
       ON CONFLICT (user_id, course_id) DO NOTHING`,
      [payment.user_id]
    );

    /*
     * Log the admin action
     */
    await pool.query(
      `INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details, ip_address, user_agent)
       VALUES ($1, 'payment.approve', 'payment', $2, $3, $4, $5)`,
      [
        decoded.adminId,
        id,
        JSON.stringify({ amount: payment.amount, method: payment.method }),
        req.headers['x-forwarded-for'] || req.socket.remoteAddress || null,
        req.headers['user-agent'] || null,
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Payment approved and student enrolled successfully.',
    });

  } catch (error) {
    console.error('Payment approval error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve payment.',
    });
  }
}