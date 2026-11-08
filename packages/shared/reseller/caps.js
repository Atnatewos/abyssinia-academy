/**
 * @fileoverview Reseller Payout Caps
 *
 * Enforces per-reseller and platform-wide monthly payout caps. Called
 * during commission distribution to prevent runaway payouts.
 *
 * Design principle: this module is READ-ONLY (only counts). The actual
 * enforcement (rejecting a sale) happens in the orchestrator, which can
 * choose to (a) reject the sale, (b) cap the payout, or (c) flag for review.
 *
 * Path: packages/shared/reseller/caps.js
 */

/**
 * Get the current month key in 'YYYY-MM' format (UTC).
 *
 * @param {Date} [date=new Date()]
 * @returns {string}
 */
const currentMonthKey = (date = new Date()) => {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

/**
 * Compute a user's total reseller earnings for a given month.
 *
 * @param {object} db - { query, getClient }
 * @param {string} userId
 * @param {string} [month] - 'YYYY-MM' (defaults to current UTC month)
 * @returns {Promise<number>}
 */
const getMonthlyEarnings = async (db, userId, month = currentMonthKey()) => {
  const result = await db.query(
    `SELECT COALESCE(SUM(amount), 0)::numeric AS total
     FROM wallet_events
     WHERE user_id = $1
       AND event_type IN ('reseller_sub_sale', 'reseller_parent_bonus')
       AND amount > 0
       AND TO_CHAR(created_at, 'YYYY-MM') = $2`,
    [userId, month]
  );
  return parseFloat(result.rows[0]?.total || 0);
};

/**
 * Compute the platform-wide reseller payout total for a given month.
 *
 * @param {object} db
 * @param {string} [month]
 * @returns {Promise<number>}
 */
const getPlatformMonthlyPayout = async (db, month = currentMonthKey()) => {
  const result = await db.query(
    `SELECT COALESCE(SUM(amount), 0)::numeric AS total
     FROM wallet_events
     WHERE event_type IN ('reseller_sub_sale', 'reseller_parent_bonus')
       AND amount > 0
       AND TO_CHAR(created_at, 'YYYY-MM') = $1`,
    [month]
  );
  return parseFloat(result.rows[0]?.total || 0);
};

/**
 * Check whether a proposed payout would exceed any cap.
 *
 * @param {object} db
 * @param {object} params
 * @param {string} params.userId
 * @param {number} params.payoutAmount
 * @param {object} params.config - Merged reseller config
 * @returns {Promise<{
 *   allowed: boolean,
 *   reason?: 'user_cap_reached' | 'platform_cap_reached',
 *   userMonthlyTotal: number,
 *   platformMonthlyTotal: number
 * }>}
 */
const checkCaps = async (db, { userId, payoutAmount, config }) => {
  const userMonthlyTotal = await getMonthlyEarnings(db, userId);
  const platformMonthlyTotal = await getPlatformMonthlyPayout(db);

  const userCap = config.caps.maxEarningsPerResellerPerMonthETB;
  const platformCap = config.caps.maxPlatformPayoutPerMonthETB;

  if (userMonthlyTotal + payoutAmount > userCap) {
    return {
      allowed: false,
      reason: 'user_cap_reached',
      userMonthlyTotal,
      platformMonthlyTotal,
    };
  }

  if (platformMonthlyTotal + payoutAmount > platformCap) {
    return {
      allowed: false,
      reason: 'platform_cap_reached',
      userMonthlyTotal,
      platformMonthlyTotal,
    };
  }

  return { allowed: true, userMonthlyTotal, platformMonthlyTotal };
};

module.exports = {
  currentMonthKey,
  getMonthlyEarnings,
  getPlatformMonthlyPayout,
  checkCaps,
};