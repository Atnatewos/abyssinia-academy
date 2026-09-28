/**
 * @fileoverview Admin Payment Approval API (Money Model v2)
 *
 * POST /api/admin/payments/[id]/approve
 *
 * Approves a pending payment, which triggers:
 *   1. Commission distribution to ancestors (4 levels)
 *   2. Bonus evaluation for affected users
 *   3. Enrollment creation for the buyer
 *
 * Money Model v2: commissions now increment paying counters, and
 * bonuses are awarded after commissions complete.
 *
 * Path: apps/web/pages/api/admin/payments/[id]/approve.js
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
  const { note } = req.body;

  try {
    /* Fetch payment details */
    const paymentResult = await query(
      `SELECT id, user_id, amount, status, purchase_mode, course_id
       FROM payments WHERE id = $1`,
      [paymentId]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found.' });
    }

    const payment = paymentResult.rows[0];

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Payment is already ${payment.status}. Only pending payments can be approved.`,
      });
    }

    /* Update payment status to approved */
    await query(
      `UPDATE payments
       SET status = 'approved',
           admin_note = $2,
           approved_at = NOW(),
           approved_by_admin_id = $3,
           updated_at = NOW()
       WHERE id = $1`,
      [paymentId, note || null, decoded.userId]
    );

    /* Create enrollment if this is a course purchase */
    if (payment.purchase_mode === 'full-course' || payment.course_id) {
      const courseId = payment.course_id || (await query(
        'SELECT id FROM courses WHERE is_full_course = true LIMIT 1'
      )).rows[0]?.id;

      if (courseId) {
        await query(
          `INSERT INTO enrollments (user_id, course_id, access_level, enrolled_at)
           VALUES ($1, $2, 'full', NOW())
           ON CONFLICT (user_id, course_id) DO NOTHING`,
          [payment.user_id, courseId]
        );
      }
    }

    /*
     * Money Model v2: distribute commissions to ancestors.
     * This also increments paying counters on the buyer's first payment.
     */
    const config = getReferralConfig();
    const db = {
      query: (text, params) => query(text, params),
      getClient: () => query.pool.connect(),
    };

    const commissionResult = await mlm.distributeCommissions(
      db,
      config,
      payment.user_id,
      paymentId,
      payment.amount
    );

    /*
     * Money Model v2: award bonuses for all ancestors who received commissions.
     * Fetch the ancestors and run awardEligibleBonuses for each.
     */
    const ancestorsResult = await query(
      `SELECT DISTINCT ancestor_id FROM referral_tree
       WHERE descendant_id = $1 AND depth <= 4`,
      [payment.user_id]
    );

    for (const ancestor of ancestorsResult.rows) {
      await mlm.awardEligibleBonuses(db, config, ancestor.ancestor_id);
    }

    /* Also award bonuses for the buyer (in case they're someone's referral) */
    await mlm.awardEligibleBonuses(db, config, payment.user_id);

    res.status(200).json({
      success: true,
      message: 'Payment approved successfully',
      data: {
        paymentId,
        commissionsDistributed: commissionResult.distributed,
        totalCommission: commissionResult.totalCommission,
        firstPayment: commissionResult.firstPayment,
      },
    });
  } catch (error) {
    console.error('Payment approval error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to approve payment.' });
  }
}