/**
 * @fileoverview Agent Commission Distribution (Money Model v2.5)
 *
 * Distributes instant-payout agent commissions when a payment is approved.
 * Unlike MLM commissions, agent commissions:
 *   - Pay instantly (no 7-day lock window)
 *   - Are calculated from the agent's personal settings (fixed or percentage)
 *   - Do NOT count toward MLM platform monthly caps
 *   - Override MLM referral commissions when an agent code is used at checkout
 *
 * Idempotency:
 *   - Skips if an agent_commission row already exists for (payment_id, agent_user_id)
 *
 * Database-agnostic: all SQL is inlined. Consumers inject a `db` object
 * providing query() and getClient() so this module runs identically on
 * the Express server and inside Next.js API routes.
 *
 * Path: packages/shared/agents/commissions.js
 */
const { BadRequestError } = require('../mlm/errors');

/**
 * Calculate the agent commission amount based on their settings.
 *
 * @param {object} agentSettings - { commission_type, commission_value }
 * @param {number} saleAmount - The payment amount in ETB
 * @param {object} config - Agent system config for limits
 * @returns {{ amount: number, commission_type: string, percentage_rate: number }}
 */
const calculateAgentCommission = (agentSettings, saleAmount, config) => {
  const { commission_type: type, commission_value: value } = agentSettings;
  const limits = config?.adminLimits || {};
  const calcRules = config?.calculation || {};

  let amount = 0;
  let percentage_rate = 0;

  if (type === 'fixed') {
    const maxFixed = limits.maxFixedAmountETB ?? Infinity;
    amount = Math.min(Number(value) || 0, maxFixed);
  } else if (type === 'percentage') {
    const maxRate = limits.maxPercentageRate ?? 100;
    const rate = Math.min(Number(value) || 0, maxRate);
    percentage_rate = rate;
    let calculated = saleAmount * (rate / 100);
    if (calcRules.roundToNearestETB !== false) {
      calculated = Math.round(calculated);
    }
    const maxFixed = limits.maxFixedAmountETB ?? Infinity;
    amount = Math.min(calculated, maxFixed);
  }

  return { amount, commission_type: type, percentage_rate };
};

/**
 * Distribute an agent commission for an approved payment.
 * Credits the agent's wallet instantly (no lock window).
 *
 * @param {object} db - { query, getClient }
 * @param {object} config - Agent system config
 * @param {string} paymentId - UUID of the approved payment
 * @param {string} agentUserId - UUID of the agent
 * @param {string} buyerUserId - UUID of the buyer
 * @param {number} saleAmount - Payment amount in ETB
 * @returns {Promise<{distributed: number, totalCommission: number, commission_type?: string, percentage_rate?: number, reason?: string}>}
 */
const distributeAgentCommission = async (db, config, paymentId, agentUserId, buyerUserId, saleAmount) => {
  if (!db || typeof db.query !== 'function' || typeof db.getClient !== 'function') {
    throw new BadRequestError('A valid db object with query and getClient is required.');
  }
  if (!paymentId || !agentUserId || !buyerUserId || !saleAmount || saleAmount <= 0) {
    throw new BadRequestError('paymentId, agentUserId, buyerUserId, and a positive saleAmount are required.');
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    /* 1. Fetch agent settings */
    const settingsResult = await client.query(
      `SELECT commission_type, commission_value, is_active
       FROM agent_settings WHERE user_id = $1`,
      [agentUserId]
    );

    if (settingsResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return { distributed: 0, totalCommission: 0, reason: 'no_agent_settings' };
    }

    const agentSettings = settingsResult.rows[0];
    if (!agentSettings.is_active) {
      await client.query('ROLLBACK');
      return { distributed: 0, totalCommission: 0, reason: 'agent_inactive' };
    }

    /* 2. Calculate commission */
    const { amount, commission_type, percentage_rate } = calculateAgentCommission(
      agentSettings,
      saleAmount,
      config
    );

    if (amount <= 0) {
      await client.query('ROLLBACK');
      return { distributed: 0, totalCommission: 0, reason: 'zero_commission' };
    }

    /* 3. Idempotency check */
    const existingResult = await client.query(
      `SELECT 1 FROM agent_commissions WHERE payment_id = $1 AND agent_user_id = $2 LIMIT 1`,
      [paymentId, agentUserId]
    );
    if (existingResult.rows.length > 0) {
      await client.query('ROLLBACK');
      return { distributed: 0, totalCommission: 0, reason: 'already_distributed' };
    }

    /* 4. Insert agent commission row (status='paid', no lock) */
    await client.query(
      `INSERT INTO agent_commissions
       (agent_user_id, source_user_id, payment_id, commission_type,
        commission_amount, sale_amount, percentage_rate, status, paid_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'paid', NOW())`,
      [agentUserId, buyerUserId, paymentId, commission_type, amount, saleAmount, percentage_rate]
    );

    /* 5. Ensure agent wallet exists */
    await client.query(
      `INSERT INTO affiliate_wallets (user_id) VALUES ($1)
       ON CONFLICT (user_id) DO NOTHING`,
      [agentUserId]
    );

    /* 6. Credit agent wallet instantly */
    await client.query(
      `UPDATE affiliate_wallets
       SET total_earned    = total_earned + $2,
           current_balance = current_balance + $2,
           updated_at      = NOW()
       WHERE user_id = $1`,
      [agentUserId, amount]
    );

    /* 7. Update user lifetime earnings counter */
    await client.query(
      `UPDATE users
       SET lifetime_referral_earnings = lifetime_referral_earnings + $2,
           updated_at = NOW()
       WHERE id = $1`,
      [agentUserId, amount]
    );

    await client.query('COMMIT');
    return {
      distributed: 1,
      totalCommission: amount,
      commission_type,
      percentage_rate,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  calculateAgentCommission,
  distributeAgentCommission,
};