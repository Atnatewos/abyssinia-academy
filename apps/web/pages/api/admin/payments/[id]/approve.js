/**
 * @fileoverview Admin Approve Payment API
 * Approves a payment and creates the enrollment record using the
 * purchase_mode and selected_phases stored on the payment itself.
 * No hardcoded assumptions — reads exactly what the student selected.
 * 
 * Path: apps/web/pages/api/admin/payments/[id]/approve.js
 */

import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const isNeon = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isNeon ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export default async function handler(req, res) {

  if (req.method !== 'PATCH') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  /*
   * Authenticate admin via JWT
   */
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
     * Fetch the payment record including purchase metadata
     */
    const paymentResult = await pool.query(
      `SELECT p.*, u.referred_by_code
       FROM payments p
       JOIN users u ON u.id = p.user_id
       WHERE p.id = $1`,
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
     * Determine purchase mode and selected phases from the payment record.
     * If the payment was submitted before these columns existed (legacy data),
     * default to full-course to maintain backward compatibility.
     */
    const purchaseMode = payment.purchase_mode || 'full-course';
    const selectedPhases = payment.selected_phases || null;

    /*
     * Validate purchase mode
     */
    if (!['full-course', 'individual-phases'].includes(purchaseMode)) {
      return res.status(400).json({
        success: false,
        message: `Invalid purchase_mode on payment record: ${purchaseMode}.`,
      });
    }

    /*
     * Validate selected phases for individual-phases mode
     */
    const validPhaseIds = ['phase-1', 'phase-2', 'phase-3', 'phase-4', 'phase-5'];

    if (purchaseMode === 'individual-phases') {
      if (!selectedPhases || !Array.isArray(selectedPhases) || selectedPhases.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Payment has purchase_mode=individual-phases but no selected_phases.',
        });
      }

      const invalidPhases = selectedPhases.filter((p) => !validPhaseIds.includes(p));
      if (invalidPhases.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Payment has invalid phase IDs: ${invalidPhases.join(', ')}.`,
        });
      }
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
     * Create enrollment record using the EXACT purchase data from the payment.
     * Delete any existing enrollment first to ensure a clean state,
     * then insert the correct purchase_mode and selected_phases.
     */
    await pool.query(
      'DELETE FROM enrollments WHERE user_id = $1',
      [payment.user_id]
    );

    await pool.query(
      `INSERT INTO enrollments (user_id, purchase_mode, selected_phases, purchase_amount, payment_id, enrolled_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [
        payment.user_id,
        purchaseMode,
        purchaseMode === 'full-course' ? null : selectedPhases,
        payment.amount,
        id,
      ]
    );

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
     * Log the admin action with full enrollment details for audit
     */
    await pool.query(
      `INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details, ip_address, user_agent)
       VALUES ($1, 'payment.approve', 'payment', $2, $3, $4, $5)`,
      [
        decoded.adminId,
        id,
        JSON.stringify({
          amount: payment.amount,
          method: payment.method,
          purchaseMode,
          selectedPhases: purchaseMode === 'full-course' ? 'all' : selectedPhases,
        }),
        req.headers['x-forwarded-for'] || req.socket.remoteAddress || null,
        req.headers['user-agent'] || null,
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Payment approved and student enrolled successfully.',
      data: {
        purchaseMode,
        selectedPhases: purchaseMode === 'full-course' ? null : selectedPhases,
      },
    });

  } catch (error) {
    console.error('Payment approval error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve payment.',
    });
  }
}