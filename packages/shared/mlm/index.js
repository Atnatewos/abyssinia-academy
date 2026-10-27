/**
 * @fileoverview Shared MLM Module — Entry Point (Money Model v2)
 *
 * Database-agnostic MLM operations. Consumers inject a `db` object that
 * provides `query(text, params)` and `getClient()`. This lets the same
 * logic run on the Express server and inside Next.js API routes without
 * any duplication.
 *
 * Usage:
 *   const mlm = require('@shared/mlm');
 *   const db = require('../database/pool');
 *   await mlm.buildReferralTree(db, config, newUserId, referrerId);
 *
 * Money Model v2 additions:
 *   - getWithdrawableBalance(db, userId): single source of truth for
 *     withdrawal validation (current_balance − locked_commissions −
 *     locked_bonuses).
 *   - reverseAllForPayment(db, config, paymentId, reason): orchestrated
 *     refund that reverses commissions AND bonuses AND paying counters
 *     in one atomic flow.
 *
 * Database-agnostic: all SQL is inlined in this file.
 *
 * Path: packages/shared/mlm/index.js
 */

const { buildReferralTree } = require('./tree');
const {
  distributeCommissions,
  reverseCommissionsForPayment,
} = require('./commissions');
const { awardEligibleBonuses, getSpeedBonusMonthlyCount } = require('./bonuses');
const helpers = require('./helpers');
const errors = require('./errors');

/**
 * Orchestrated refund flow: reverses commissions, bonuses, and paying
 * counters tied to a refunded payment.
 *
 * Delegates to reverseCommissionsForPayment which already handles
 * bonus reversal and paying-counter decrements inside the same
 * transaction.
 *
 * @param {object} db - { query, getClient }
 * @param {object} config - Referrals config
 * @param {string} paymentId
 * @param {string} reason
 * @returns {Promise<object>}
 */
const reverseAllForPayment = async (db, config, paymentId, reason) => {
  return reverseCommissionsForPayment(db, paymentId, reason);
};

/**
 * Compute the withdrawable balance for a user.
 *
 * Formula:
 *   withdrawable = current_balance - locked_commissions - locked_bonuses
 *
 * This is the single source of truth for withdrawal validation.
 *
 * @param {object} db - { query, getClient }
 * @param {string} userId
 * @returns {Promise<number>}
 */
const getWithdrawableBalance = async (db, userId) => {
  const result = await db.query(
    `SELECT
       COALESCE(w.current_balance, 0)::numeric AS current_balance,
       COALESCE((
         SELECT SUM(commission_amount)
         FROM affiliate_commissions
         WHERE earning_user_id = $1
           AND status = 'credited'
           AND unlock_at > NOW()
       ), 0)::numeric AS locked_commissions,
       COALESCE((
         SELECT SUM(amount)
         FROM referral_bonuses
         WHERE user_id = $1
           AND status = 'credited'
           AND unlock_at > NOW()
       ), 0)::numeric AS locked_bonuses
     FROM affiliate_wallets w
     WHERE w.user_id = $1`,
    [userId]
  );

  if (result.rows.length === 0) return 0;

  const { current_balance, locked_commissions, locked_bonuses } = result.rows[0];
  return Math.max(
    0,
    parseFloat(current_balance) - parseFloat(locked_commissions) - parseFloat(locked_bonuses)
  );
};

/**
 * Ensure a wallet exists for a user. Called during registration and
 * before any balance operations.
 *
 * @param {object} db
 * @param {string} userId
 * @returns {Promise<object>}
 */
const ensureUserWallet = async (db, userId) => {
  await db.query(
    `INSERT INTO affiliate_wallets (user_id) VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );
  const result = await db.query(
    `SELECT id, user_id, total_earned, total_withdrawn, current_balance,
            pending_withdrawal, debt_balance, created_at, updated_at
     FROM affiliate_wallets WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0];
};

/**
 * Fetch a user's wallet row.
 *
 * @param {object} db
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
const getUserWallet = async (db, userId) => {
  const result = await db.query(
    `SELECT id, user_id, total_earned, total_withdrawn, current_balance,
            pending_withdrawal, debt_balance, created_at, updated_at
     FROM affiliate_wallets WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0] || null;
};

module.exports = {
  /* Tree */
  buildReferralTree,

  /* Commissions */
  distributeCommissions,
  reverseCommissionsForPayment,

  /* Bonuses */
  awardEligibleBonuses,

  /* Money Model v2 — orchestrated flows */
  reverseAllForPayment,

  /* Money Model v2 — wallet utilities */
  getWithdrawableBalance,
  ensureUserWallet,
  getUserWallet,

  /* Money Model v2 — bonus helpers (useful for tests) */
  getSpeedBonusMonthlyCount,

  /* Utilities (legacy) */
  helpers,
  errors,
};