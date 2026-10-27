/**
 * @fileoverview Admin Approve Payment API
 *
 * Approves a payment, creates the enrollment record, and distributes
 * commissions:
 *   - If payment has agent_id → instant agent commission (no lock window)
 *   - If no agent_id → MLM 4-level distribution
 *
 * Accepts both PATCH and POST so any frontend caller works regardless of
 * which HTTP verb it chooses. Both paths are identical.
 *
 * Path: apps/web/pages/api/admin/payments/[id]/approve.js
 */

import { pool, query } from '../../../../../lib/db';
import jwt from 'jsonwebtoken';
import sharedMlm from '../../../../../../../packages/shared/mlm';
import sharedAgents from '../../../../../../../packages/shared/agents';
import referralsConfig from '../../../../../../../packages/shared/config/referrals.config';
import { notify } from '../../../../../lib/notifications';
import {
  getPaymentConfig,
  getAgentConfig,
  isAgentsEnabled,
} from '../../../../../lib/config';

/*
 * Adapter for the shared MLM module — matches its expected `db` shape.
 */
const mlmDb = {
  query,
  getClient: () => pool.connect(),
};

export default async function handler(req, res) {
  /*
   * Accept both PATCH and POST. The admin UI historically sent POST,
   * while the earlier API spec required PATCH. Accepting both keeps
   * every caller working without touching the frontend.
   */
  if (req.method !== 'PATCH' && req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, message: 'Method not allowed.' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ success: false, message: 'No token provided.' });
  }

  let decoded;
  try {
    decoded = jwt.verify(
      authHeader.split(' ')[1],
      process.env.JWT_ADMIN_SECRET
    );
  } catch {
    return res
      .status(401)
      .json({ success: false, message: 'Invalid admin token.' });
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
      return res
        .status(404)
        .json({ success: false, message: 'Payment not found.' });
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

    const paymentConfig = getPaymentConfig();
    const validModes = paymentConfig.purchaseModes || {
      fullCourse: { enabled: true, id: 'full-course' },
      individualPhases: { enabled: true, id: 'individual-phases' },
    };

    if (
      !Object.values(validModes).some(
        (m) => m.id === purchaseMode && m.enabled !== false
      )
    ) {
      return res.status(400).json({
        success: false,
        message: `Invalid purchase_mode on payment record: ${purchaseMode}.`,
      });
    }

    const validPhaseIds = [
      'phase-1',
      'phase-2',
      'phase-3',
      'phase-4',
      'phase-5',
    ];
    if (purchaseMode === 'individual-phases') {
      if (
        !selectedPhases ||
        !Array.isArray(selectedPhases) ||
        selectedPhases.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Payment has purchase_mode=individual-phases but no selected_phases.',
        });
      }

      const invalidPhases = selectedPhases.filter(
        (p) => !validPhaseIds.includes(p)
      );
      if (invalidPhases.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Payment has invalid phase IDs: ${invalidPhases.join(
            ', '
          )}.`,
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
    await query('DELETE FROM enrollments WHERE user_id = $1', [
      payment.user_id,
    ]);

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

    /*
     * Determine commission path.
     *   Agent attribution (payment.agent_id) takes precedence and skips MLM.
     */
    const hasAgentAttribution =
      isAgentsEnabled() &&
      payment.agent_id &&
      payment.agent_id !== payment.user_id;

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
          selectedPhases:
            purchaseMode === 'full-course' ? 'all' : selectedPhases,
          agentAttributed: Boolean(hasAgentAttribution),
          agentId: hasAgentAttribution ? payment.agent_id : null,
        }),
        req.headers['x-forwarded-for'] || req.socket.remoteAddress || null,
        req.headers['user-agent'] || null,
      ]
    );

    /* ── Commission path A: AGENT ATTRIBUTED ── */
    if (hasAgentAttribution) {
      try {
        const saleAmount = parseFloat(payment.amount);
        const agentConfig = getAgentConfig();

        const agentResult = await sharedAgents.distributeAgentCommission(
          mlmDb,
          agentConfig,
          id,
          payment.agent_id,
          payment.user_id,
          saleAmount
        );

        if (agentResult.distributed > 0) {
          try {
            await notify(
              payment.agent_id,
              'commission_unlocked',
              { amount: agentResult.totalCommission },
              '/profile/agents'
            );
          } catch (notifErr) {
            console.error(
              '[notify] agent commission notification failed:',
              notifErr.message
            );
          }
        } else {
          console.warn('Agent commission not distributed:', {
            paymentId: id,
            agentId: payment.agent_id,
            reason: agentResult.reason,
          });
        }
      } catch (agentError) {
        console.error(
          'Agent commission distribution failed after payment approval:',
          {
            paymentId: id,
            agentId: payment.agent_id,
            error: agentError.message,
          }
        );
      }
    } else {
      /* ── Commission path B: MLM (existing behavior) ── */
      try {
        const saleAmount = parseFloat(payment.amount);

        const distribution = await sharedMlm.distributeCommissions(
          mlmDb,
          referralsConfig,
          payment.user_id,
          id,
          saleAmount
        );

        if (distribution.distributed > 0) {
          const commissionRows = await query(
            'SELECT DISTINCT earning_user_id FROM affiliate_commissions WHERE payment_id = $1',
            [id]
          );

          for (const row of commissionRows.rows) {
            try {
              const bonusResult = await sharedMlm.awardEligibleBonuses(
                mlmDb,
                referralsConfig,
                row.earning_user_id
              );

              if (
                bonusResult &&
                bonusResult.awarded &&
                bonusResult.awarded.length > 0
              ) {
                for (const bonus of bonusResult.awarded) {
                  try {
                    await notify(
                      row.earning_user_id,
                      'bonus_awarded',
                      { bonusName: bonus.name, amount: bonus.amount },
                      '/profile/referrals'
                    );
                  } catch (notifErr) {
                    console.error(
                      '[notify] bonus_awarded failed:',
                      notifErr.message
                    );
                  }
                }
              }
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
        console.error(
          'MLM commission distribution failed after payment approval:',
          {
            paymentId: id,
            buyerId: payment.user_id,
            error: mlmError.message,
          }
        );
      }
    }

    /*
     * Notifications — best-effort, fire-and-forget.
     */
    try {
      await notify(
        payment.user_id,
        'payment_approved',
        {
          amount: parseFloat(payment.amount),
          method: payment.method || 'bank-transfer',
        },
        '/profile/payments'
      );

      if (!hasAgentAttribution && payment.referred_by_code) {
        const referrerResult = await query(
          `SELECT rc.user_id, u.full_name
           FROM referral_codes rc
           JOIN users u ON u.id = rc.user_id
           WHERE rc.code = $1 AND rc.is_active = true
           LIMIT 1`,
          [payment.referred_by_code]
        );

        if (referrerResult.rows.length > 0) {
          const referrer = referrerResult.rows[0];
          const buyerResult = await query(
            'SELECT full_name FROM users WHERE id = $1',
            [payment.user_id]
          );
          const buyerName =
            buyerResult.rows[0]?.full_name || 'A member of your team';

          await notify(
            referrer.user_id,
            'referral_purchased',
            { name: buyerName, amount: parseFloat(payment.amount) },
            '/profile/referrals'
          );
        }
      }
    } catch (notifError) {
      console.error(
        '[notify] payment approval notifications failed:',
        notifError.message
      );
    }

    res.status(200).json({
      success: true,
      message: 'Payment approved and student enrolled successfully.',
      data: {
        purchaseMode,
        selectedPhases: purchaseMode === 'full-course' ? null : selectedPhases,
        agentAttributed: Boolean(hasAgentAttribution),
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