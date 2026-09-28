/**
 * @fileoverview Admin Payment Rejection API (Money Model v2)
 *
 * POST /api/admin/payments/[id]/reject
 *
 * Rejects a pending payment (returns funds to buyer).
 * If the payment was already approved and commissions distributed,
 * this triggers the orchestrated reversal flow (commissions + bonuses
 * + paying counters reversed).
 *
 * Path: apps/web/pages/api/admin/payments/[id]/reject.js
 */

import { query } from '../../../../../lib/db';
import jwt from 'jsonwebtoken';
import { getReferralConfig } from '../../../../../lib/config';

const mlm = require('../../../../../packages/shared/mlm');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  /* Admin auth check */
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  let decoded;
  try {
    decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }

  /* Verify admin role */
  const adminCheck = await query(
    'SELECT role FROM admins WHERE user_id = $1',
    [decoded.userId]
  );

  if (adminCheck.rows.length === 0) {
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  }

  const paymentId = req.query.id;
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({
      success: false,
      message: 'Rejection reason is required',
    });
  }

  try {
    /* Fetch payment details */
    const paymentResult = await query(
      `SELECT id, user_id, amount, status FROM payments WHERE id = $1`,
      [paymentId]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found.' });
    }

    const payment = paymentResult.rows[0];
    const wasApproved = payment.status === 'approved';

    /* Update payment status to rejected */
    await query(
      `UPDATE payments
       SET status = 'rejected',
           admin_note = $2,
           rejected_at = NOW(),
           rejected_by_admin_id = $3,
           updated_at = NOW()
       WHERE id = $1`,
      [paymentId, reason, decoded.userId]
    );

    /*
     * Money Model v2: if the payment was already approved and commissions
     * were distributed, trigger the orchestrated reversal flow.
     *
     * This reverses:
     *   - All locked commissions tied to this payment
     *   - All locked bonuses tied to this payment
     *   - Paying counters for ancestors (if this was the buyer's only payment)
     */
    let reversalResult = null;

    if (wasApproved) {
      const config = getReferralConfig();
      const db = {
        query: (text, params) => query(text, params),
        getClient: () => query.pool.connect(),
      };

      reversalResult = await mlm.reverseAllForPayment(
        db,
        config,
        paymentId,
        `Payment rejected by admin: ${reason}`
      );
    }

    /* Remove enrollment if this was a course purchase */
    if (wasApproved) {
      await query(
        `DELETE FROM enrollments WHERE user_id = $1`,
        [payment.user_id]
      );
    }

    res.status(200).json({
      success: true,
      message: wasApproved
        ? 'Payment rejected and commissions reversed'
        : 'Payment rejected',
      data: {
        paymentId,
        wasApproved,
        reversal: reversalResult,
      },
    });
  } catch (error) {
    console.error('Payment rejection error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to reject payment.' });
  }
}