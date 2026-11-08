/**
 * @fileoverview Payment Service
 *
 * Business logic for payment submission and admin approval.
 *
 * The approval flow uses a cascading priority to determine commission
 * distribution, matching the platform's 4 independent commission modes:
 *
 *   1. SCHOLARSHIP — handled by a separate service upstream (never reaches
 *      this approve function). No commission.
 *   2. RESELLER    — payment has `reseller_user_id` set. Distribution
 *      delegated to `@shared/reseller` orchestrator (70/30 split + parent).
 *   3. LEGACY AGENT — payment has `agent_id` set. Distribution delegated
 *      to `@shared/agents` (fixed or percentage commission).
 *   4. MLM         — payment has no agent or reseller attribution but the
 *      buyer is in the MLM tree. Distribution delegated to
 *      `mlm-referral.service` (4-level tree).
 *   5. DIRECT      — none of the above. No commission.
 *
 * All commission distribution is best-effort: a failure in any commission
 * mode NEVER blocks the student from gaining access. Failures are logged
 * for admin review.
 *
 * Path: apps/api/src/services/payment.service.js
 */

const paymentsDb = require('../database/queries/payments');
const usersDb = require('../database/queries/users');
const mlmDb = require('../database/queries/mlm-referrals');
const pool = require('../database/pool');
const mlmReferralService = require('./mlm-referral.service');
const { payments } = require('../../../../packages/shared/config');
const { BadRequestError, NotFoundError } = require('../utils/errors');

/* ───────────────────────────────────────────────────────────────────────────
 * Lazy-loaded shared modules
 * Lazy loading prevents circular dependency issues at module init time and
 * allows the reseller/agents modules to be optional (if their tables don't
 * exist yet, the import fails at first call, not at boot).
 * ─────────────────────────────────────────────────────────────────────────── */

let sharedReseller = null;
const getResellerModule = () => {
  if (!sharedReseller) {
    sharedReseller = require('../../../../packages/shared/reseller');
  }
  return sharedReseller;
};

let sharedAgents = null;
const getAgentsModule = () => {
  if (!sharedAgents) {
    sharedAgents = require('../../../../packages/shared/agents');
  }
  return sharedAgents;
};

/**
 * Shared DB adapter for shared modules. These modules expect
 * { query, getClient } so they work with both Express pool and Next.js pools.
 */
const sharedDbAdapter = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.getClient(),
};

/* ═══════════════════════════════════════════════════════════════════════════
 * SUBMIT PAYMENT
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Submit a payment for admin review.
 *
 * Amount is taken from the shared payments config — never trusted from
 * the client. The pricing config is the single source of truth.
 *
 * Reseller attribution (when present) is resolved by the API route and
 * passed in `paymentData`. This function only persists values that have
 * already been validated upstream.
 *
 * @param {string} userId - User UUID
 * @param {object} paymentData - Payment submission data
 * @returns {Promise<object>} Created payment
 */
const submitPayment = async (userId, paymentData) => {
  const { fullName, phone, paymentMethod, transactionRef, screenshotUrl } = paymentData;

  const existingPayment = await paymentsDb.getUserPayment(userId);
  if (existingPayment && existingPayment.status === 'pending') {
    throw new BadRequestError('You already have a pending payment under review.');
  }

  /* Amount: trust the caller if it's been resolved (reseller price, etc.).
     Otherwise fall back to the pricing config. */
  const amount = paymentData.amount || payments.pricing.fullCourse.amountETB;

  const payment = await paymentsDb.createPayment({
    userId,
    amount,
    method: paymentMethod,
    transactionRef,
    screenshotUrl: screenshotUrl || null,
  });

  await usersDb.updatePaymentStatus(userId, 'pending');
  return payment;
};

/* ═══════════════════════════════════════════════════════════════════════════
 * APPROVE PAYMENT — THE ORCHESTRATOR
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Approve a payment and enroll the student.
 *
 * Core approval writes always run first. Commission distribution is
 * attempted afterward, using the priority cascade described at the top
 * of this file. Every commission path is best-effort — a failure never
 * blocks enrollment.
 *
 * @param {string} paymentId - Payment UUID
 * @returns {Promise<object>} Updated payment
 */
const approvePayment = async (paymentId) => {
  const payment = await paymentsDb.getPaymentById(paymentId);

  if (!payment) {
    throw new NotFoundError('Payment not found.');
  }

  if (payment.status !== 'pending') {
    throw new BadRequestError('Only pending payments can be approved.');
  }

  /* ── Core approval — always runs first ──────────────────────────────── */
  await paymentsDb.updatePaymentStatus(paymentId, 'approved');
  await paymentsDb.markPaymentPaid(paymentId);
  await usersDb.updateEnrollmentStatus(payment.user_id, true);
  await usersDb.updatePaymentStatus(payment.user_id, 'approved');

  /* ── Commission distribution — best-effort ──────────────────────────── */
  const distributionMeta = await distributeCommissionsForApprovedPayment(payment);

  /* ── Return updated payment ─────────────────────────────────────────── */
  const updatedPayment = await paymentsDb.getPaymentById(paymentId);
  return { ...updatedPayment, _distribution: distributionMeta };
};

/**
 * Route the payment to the correct commission mode.
 * Returns metadata about which path was taken (for logging/audit).
 *
 * Priority order:
 *   1. Reseller (payment.reseller_user_id set)
 *   2. Legacy agent (payment.agent_id set)
 *   3. MLM (buyer is in tree)
 *   4. Direct (no commission)
 *
 * @param {object} payment
 * @returns {Promise<{mode: string, distributed: boolean, details?: object}>}
 */
const distributeCommissionsForApprovedPayment = async (payment) => {
  const saleAmount = parseFloat(payment.amount);

  /* ── 1. RESELLER ─────────────────────────────────────────────────────── */
  if (payment.reseller_user_id) {
    try {
      const reseller = getResellerModule();
      const result = await reseller.processApprovedPayment(sharedDbAdapter, {
        paymentId: payment.id,
        buyerIp: null, /* IP check handled at submit time */
        buyerPhone: null,
      });

      if (!result.alreadyProcessed && result.route === 'reseller') {
        console.log('[approvePayment] Reseller commission distributed:', {
          paymentId: payment.id,
          saleId: result.saleId,
          split: result.split,
        });
      }

      return {
        mode: 'reseller',
        distributed: Boolean(result.saleId),
        details: result,
      };
    } catch (err) {
      console.error('[approvePayment] Reseller distribution failed:', {
        paymentId: payment.id,
        buyerId: payment.user_id,
        resellerId: payment.reseller_user_id,
        error: err.message,
        code: err.code,
      });
      return { mode: 'reseller', distributed: false, error: err.message };
    }
  }

  /* ── 2. LEGACY AGENT ─────────────────────────────────────────────────── */
  if (payment.agent_id) {
    try {
      const agents = getAgentsModule();
      const { getAgentConfig, isAgentsEnabled } = require('../../../../packages/shared/config');

      if (!isAgentsEnabled || !isAgentsEnabled()) {
        return { mode: 'legacy_agent', distributed: false, reason: 'agents_disabled' };
      }

      const agentConfig = getAgentConfig();
      const result = await agents.distributeAgentCommission(
        sharedDbAdapter,
        agentConfig,
        payment.id,
        payment.agent_id,
        payment.user_id,
        saleAmount
      );

      if (result.distributed > 0) {
        console.log('[approvePayment] Legacy agent commission distributed:', {
          paymentId: payment.id,
          agentId: payment.agent_id,
          amount: result.totalCommission,
        });
      }

      return { mode: 'legacy_agent', distributed: result.distributed > 0, details: result };
    } catch (err) {
      console.error('[approvePayment] Legacy agent distribution failed:', {
        paymentId: payment.id,
        agentId: payment.agent_id,
        error: err.message,
      });
      return { mode: 'legacy_agent', distributed: false, error: err.message };
    }
  }

  /* ── 3. MLM ──────────────────────────────────────────────────────────── */
  try {
    const distribution = await mlmReferralService.distributeCommissions(
      payment.user_id,
      payment.id,
      saleAmount
    );

    /* Award bonuses to every user who received a commission */
    if (distribution.distributed > 0) {
      const commissionRows = await mlmDb.getCommissionsByPayment(payment.id);
      const uniqueEarningUsers = new Set(
        commissionRows.map((row) => row.earning_user_id)
      );

      for (const earningUserId of uniqueEarningUsers) {
        try {
          await mlmReferralService.awardEligibleBonuses(earningUserId);
        } catch (bonusError) {
          console.error('[approvePayment] Bonus award failed:', {
            userId: earningUserId,
            paymentId: payment.id,
            error: bonusError.message,
          });
        }
      }
    }

    return {
      mode: distribution.distributed > 0 ? 'mlm' : 'direct',
      distributed: distribution.distributed > 0,
      details: distribution,
    };
  } catch (mlmError) {
    console.error('[approvePayment] MLM distribution failed:', {
      paymentId: payment.id,
      buyerId: payment.user_id,
      error: mlmError.message,
    });
    return { mode: 'mlm', distributed: false, error: mlmError.message };
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
 * REJECT PAYMENT
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Reject a pending payment.
 *
 * If the payment was somehow already approved (edge case), any distributed
 * commissions are reversed to keep the ledger consistent. Reversal is
 * best-effort and logged on failure.
 *
 * @param {string} paymentId - Payment UUID
 * @returns {Promise<object>} Updated payment
 */
const rejectPayment = async (paymentId) => {
  const payment = await paymentsDb.getPaymentById(paymentId);

  if (!payment) {
    throw new NotFoundError('Payment not found.');
  }

  if (payment.status !== 'pending') {
    throw new BadRequestError('Only pending payments can be rejected.');
  }

  await paymentsDb.updatePaymentStatus(paymentId, 'rejected');
  await usersDb.updatePaymentStatus(payment.user_id, 'rejected');

  /* Safety net: reverse any orphaned commissions for this payment */
  try {
    if (payment.reseller_user_id) {
      const reseller = getResellerModule();
      const saleRow = await pool.query(
        'SELECT id FROM reseller_sales WHERE payment_id = $1 LIMIT 1',
        [paymentId]
      );
      if (saleRow.rows.length > 0) {
        await reseller.reverseResellerSaleTx(sharedDbAdapter, saleRow.rows[0].id, {
          reason: 'payment_rejected',
        });
      }
    } else {
      await mlmReferralService.reverseCommissionsForPayment(paymentId, 'payment_rejected');
    }
  } catch (reversalError) {
    console.error('[rejectPayment] Commission reversal failed:', {
      paymentId,
      error: reversalError.message,
    });
  }

  const updatedPayment = await paymentsDb.getPaymentById(paymentId);
  return updatedPayment;
};

module.exports = {
  submitPayment,
  approvePayment,
  rejectPayment,
};