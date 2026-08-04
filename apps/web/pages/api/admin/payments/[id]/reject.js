/**
 * @fileoverview Admin Reject Payment API
 * Rejects a payment without enrolling the student.
 * Path: apps/web/pages/api/admin/payments/[id]/reject.js
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
     * Update payment status to rejected
     */
    await pool.query(
      `UPDATE payments
       SET status = 'rejected'
       WHERE id = $1`,
      [id]
    );

    /*
     * Update user payment status
     */
    await pool.query(
      `UPDATE users
       SET payment_status = 'rejected', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [payment.user_id]
    );

    /*
     * Log the admin action
     */
    await pool.query(
      `INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details, ip_address, user_agent)
       VALUES ($1, 'payment.reject', 'payment', $2, $3, $4, $5)`,
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
      message: 'Payment rejected successfully.',
    });

  } catch (error) {
    console.error('Payment rejection error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to reject payment.',
    });
  }
}