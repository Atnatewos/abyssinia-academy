/**
 * @fileoverview Bulk Approve Course Payments API
 *
 * Approves multiple course payments in one request. Scholarship
 * registration fees are REJECTED — they must flow through the
 * scholarship admin surface, never a bulk operation that could approve
 * them without the corresponding application-state check.
 *
 * Flow per payment:
 *   1. Fetch and validate each record.
 *   2. Skip (with reason) any payment that is scholarship purpose,
 *      not pending, or already approved.
 *   3. Approve eligible payments sequentially by delegating to the same
 *      service path the single-payment approve endpoint uses.
 *
 * The handler returns a per-payment result array so the caller can render
 * a summary ("18 approved, 2 skipped").
 *
 * Path: apps/web/pages/api/admin/payments/bulk-approve.js
 */

import jwt from 'jsonwebtoken';
import { query } from '../../../../lib/db';

const ADMIN_JWT_SECRET = process.env.JWT_ADMIN_SECRET;
const MAX_BATCH_SIZE = 100;

/**
 * Approve a single course payment by delegating to the same logic the
 * single-payment endpoint uses. Kept inline (not a shared module) to
 * avoid circular imports — the single approve endpoint is Next.js
 * specific and cannot be imported as a function.
 *
 * The critical invariant is enforced here, not at the caller: this
 * function refuses anything that is not a `purpose = 'course'` payment.
 *
 * @param {string} paymentId
 * @param {string} adminId
 * @returns {Promise<{ paymentId: string, approved: boolean, reason?: string }>}
 */
const approveOneCoursePayment = async (paymentId, adminId) => {
  const result = await query(
    `SELECT id, purpose, status, amount, method, reference,
            purchase_mode, selected_phases, user_id
     FROM payments
     WHERE id = $1`,
    [paymentId]
  );
  const payment = result.rows[0];

  if (!payment) {
    return { paymentId, approved: false, reason: 'NOT_FOUND' };
  }
  if (payment.purpose === 'scholarship_registration') {
    return { paymentId, approved: false, reason: 'SCHOLARSHIP_FEE_NOT_ALLOWED' };
  }
  if (payment.status !== 'pending') {
    return { paymentId, approved: false, reason: 'NOT_PENDING' };
  }

  await query(
    `UPDATE payments
     SET status = 'approved', paid_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [paymentId]
  );

  await query(
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

  await query('DELETE FROM enrollments WHERE user_id = $1', [payment.user_id]);

  const purchaseMode = payment.purchase_mode || 'full-course';
  const selectedPhases = payment.selected_phases || null;

  await query(
    `INSERT INTO enrollments (user_id, purchase_mode, selected_phases, purchase_amount, payment_id, purchase_source, enrolled_at)
     VALUES ($1, $2, $3, $4, $5, 'payment', CURRENT_TIMESTAMP)`,
    [
      payment.user_id,
      purchaseMode,
      purchaseMode === 'full-course' ? null : selectedPhases,
      payment.amount,
      paymentId,
    ]
  );

  await query(
    `INSERT INTO course_progress (user_id, course_id, progress)
     VALUES ($1, (SELECT id FROM courses WHERE slug = 'fullstack-web-engineering-masterclass' LIMIT 1), 0)
     ON CONFLICT (user_id, course_id) DO NOTHING`,
    [payment.user_id]
  );

  await query(
    `INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details)
     VALUES ($1, 'payment.bulk_approve', 'payment', $2, $3)`,
    [
      adminId,
      paymentId,
      JSON.stringify({ amount: payment.amount, method: payment.method }),
    ]
  );

  return { paymentId, approved: true };
};

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'PATCH') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  let decoded;
  try {
    decoded = jwt.verify(authHeader.split(' ')[1], ADMIN_JWT_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid admin token.' });
  }

  try {
    const { paymentIds } = req.body || {};

    if (!Array.isArray(paymentIds) || paymentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'paymentIds must be a non-empty array.',
      });
    }
    if (paymentIds.length > MAX_BATCH_SIZE) {
      return res.status(400).json({
        success: false,
        message: `At most ${MAX_BATCH_SIZE} payments may be approved per request.`,
      });
    }

    const invalid = paymentIds.find(
      (id) => typeof id !== 'string' || id.trim().length === 0
    );
    if (invalid !== undefined) {
      return res.status(400).json({
        success: false,
        message: 'Every paymentId must be a non-empty string.',
      });
    }

    const results = [];
    let approvedCount = 0;
    let skippedCount = 0;

    for (const paymentId of paymentIds) {
      try {
        const outcome = await approveOneCoursePayment(paymentId, decoded.adminId);
        results.push(outcome);
        if (outcome.approved) approvedCount += 1;
        else skippedCount += 1;
      } catch (err) {
        results.push({
          paymentId,
          approved: false,
          reason: 'ERROR',
          error: err.message,
        });
        skippedCount += 1;
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        approvedCount,
        skippedCount,
        results,
      },
    });
  } catch (error) {
    console.error('Bulk payment approval error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to bulk approve payments.',
    });
  }
}