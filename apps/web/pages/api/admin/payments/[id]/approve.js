/**
 * @fileoverview Admin Approve Payment API
 *
 * Approves a payment, creates the enrollment record using the purchase_mode
 * and selected_phases stored on the payment itself, then distributes MLM
 * commissions and awards bonuses via the shared MLM module.
 *
 * MLM operations are wrapped in try/catch so a failure in the referral
 * subsystem never blocks the student from gaining access.
 *
 * Path: apps/web/pages/api/admin/payments/[id]/approve.js
 */
import { pool, query } from '../../../../../lib/db';
import jwt from 'jsonwebtoken';
import sharedMlm from '../../../../../../../packages/shared/mlm';
import referralsConfig from '../../../../../../../packages/shared/config/referrals.config';

/*
 * Adapter for the shared MLM module — matches its expected `db` shape.
 */
const mlmDb = {
  query,
  getClient: () => pool.connect(),
};

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
    /* Fetch payment + user context. */
    const paymentResult = await query(
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

    /* Resolve and validate purchase mode. */
    const purchaseMode = payment.purchase_mode || 'full-course';
    const selectedPhases = payment.selected_phases || null;

    if (!['full-course', 'individual-phases'].includes(purchaseMode)) {
      return res.status(400).json({
        success: false,
        message: `Invalid purchase_mode on payment record: ${purchaseMode}.`,
      });
    }

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

    /* Core approval writes. */
    await query(
      `UPDATE payments
       SET status = 'approved', paid_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
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

    /* Replace any existing enrollment with a clean one. */
    await query('DELETE FROM enrollments WHERE user_id = $1', [payment.user_id]);

    await query(
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

    /* Initialize course progress. */
    await query(
      `INSERT INTO course_progress (user_id, course_id, progress)
       VALUES ($1, (SELECT id FROM courses WHERE slug = 'fullstack-web-engineering-masterclass' LIMIT 1), 0)
       ON CONFLICT (user_id, course_id) DO NOTHING`,
      [payment.user_id]
    );

    /* Admin audit log. */
    await query(
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

    /*
     * MLM side-effects — best-effort. Logged on failure.
     * Wrapped in try/catch so a broken referral subsystem never blocks
     * the student from gaining access.
     */
    try {
      const saleAmount = parseFloat(payment.amount);
      
      const distribution = await sharedMlm.distributeCommissions(
        mlmDb,
        referralsConfig,
        payment.user_id,
        id,
        saleAmount
      );

      /*
       * Award bonuses to every user who received a commission on this
       * sale. Their cached counters were already bumped at registration
       * time, so bonus thresholds are evaluated against current values.
       */
      if (distribution.distributed > 0) {
        const commissionRows = await query(
          'SELECT DISTINCT earning_user_id FROM affiliate_commissions WHERE payment_id = $1',
          [id]
        );

        for (const row of commissionRows.rows) {
          try {
            await sharedMlm.awardEligibleBonuses(mlmDb, referralsConfig, row.earning_user_id);
          } catch (bonusError) {
            console.error('Bonus award failed for user:', {
              userId: row.earning_user_id,
              paymentId: id,
              error: bonusError.message,
            });
          }
        }
      }
    } catch (mlmError) {
      console.error('Commission distribution failed after payment approval:', {
        paymentId: id,
        buyerId: payment.user_id,
        error: mlmError.message,
      });
    }

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