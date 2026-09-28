/**
 * @fileoverview MLM Referral Service — Express Adapter
 *
 * Thin wrapper over the shared MLM module (@shared/mlm). The service
 * exists to give Express controllers a single import point and to inject
 * the Express database pool into the shared logic.
 *
 * All business logic lives in packages/shared/mlm/. This file's job is:
 *   1. Import the shared MLM module
 *   2. Import the Express database pool
 *   3. Provide wrapper functions with the same names/contracts as before
 *
 * Path: apps/api/src/services/mlm-referral.service.js
 */

const mlmDb = require('../database/queries/mlm-referrals');
const pool = require('../database/pool');
const referralsConfig = require('../../../../packages/shared/config/referrals.config');
const sharedMlm = require('../../../../packages/shared/mlm');
const {
  BadRequestError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
} = require('../utils/errors');

/*
 * Build a `db` adapter that matches the shared module's expected shape.
 * The shared module needs { query, getClient }; our pool.js provides both.
 */
const dbAdapter = {
  query: pool.query,
  getClient: pool.getClient,
};

/*
 * Map shared-module errors to Express-layer errors so the global error
 * handler produces the exact same responses it did before the refactor.
 * The shared module throws its own error classes (MlmError family) so it
 * doesn't depend on workspace-specific error types.
 */
const mapSharedError = (error) => {
  if (!error || !error.isOperational) return error;

  switch (error.statusCode) {
    case 400:
      return new BadRequestError(error.message);
    case 403:
      return new ForbiddenError(error.message);
    case 404:
      return new NotFoundError(error.message);
    case 409:
      return new ConflictError(error.message);
    default:
      return error;
  }
};

/* ============================================================================
 * TREE BUILDING
 * ========================================================================== */

/**
 * Build the referral tree for a newly registered user.
 * @see packages/shared/mlm/tree.js
 */
const buildReferralTree = async (newUserId, referrerId) => {
  try {
    return await sharedMlm.buildReferralTree(
      dbAdapter,
      referralsConfig,
      newUserId,
      referrerId
    );
  } catch (error) {
    throw mapSharedError(error);
  }
};

/* ============================================================================
 * COMMISSIONS
 * ========================================================================== */

/**
 * Distribute commissions for an approved payment.
 * @see packages/shared/mlm/commissions.js
 */
const distributeCommissions = async (buyerUserId, paymentId, saleAmount) => {
  try {
    return await sharedMlm.distributeCommissions(
      dbAdapter,
      referralsConfig,
      buyerUserId,
      paymentId,
      saleAmount
    );
  } catch (error) {
    throw mapSharedError(error);
  }
};

/**
 * Reverse all commissions tied to a payment.
 * @see packages/shared/mlm/commissions.js
 */
const reverseCommissionsForPayment = async (paymentId, reason) => {
  try {
    return await sharedMlm.reverseCommissionsForPayment(
      dbAdapter,
      paymentId,
      reason
    );
  } catch (error) {
    throw mapSharedError(error);
  }
};

/* ============================================================================
 * BONUSES
 * ========================================================================== */

/**
 * Award any bonuses the user currently qualifies for.
 * @see packages/shared/mlm/bonuses.js
 */
const awardEligibleBonuses = async (userId) => {
  try {
    return await sharedMlm.awardEligibleBonuses(
      dbAdapter,
      referralsConfig,
      userId
    );
  } catch (error) {
    throw mapSharedError(error);
  }
};

/* ============================================================================
 * WITHDRAWALS
 *
 * Withdrawal flow still lives here in the Express service because it is
 * only consumed by Express routes. It is NOT shared with Next.js.
 * ========================================================================== */

/**
 * Create a withdrawal request.
 *
 * @param {string} userId - User UUID
 * @param {object} data - Withdrawal details
 * @returns {Promise<object>} Created withdrawal row
 */
const requestWithdrawal = async (userId, data) => {
  const { amount, method, accountNumber, accountName, bankName } = data;

  const config = referralsConfig.withdrawal;

  if (!amount || amount <= 0) {
    throw new BadRequestError('A positive amount is required.');
  }
  if (amount < config.minimumAmountETB) {
    throw new BadRequestError(`Minimum withdrawal is ${config.minimumAmountETB} ETB.`);
  }
  if (amount > config.maximumAmountETB) {
    throw new BadRequestError(`Maximum single withdrawal is ${config.maximumAmountETB} ETB.`);
  }
  if (!config.methods.includes(method)) {
    throw new BadRequestError('Invalid withdrawal method.');
  }
  if (!accountNumber || !accountName) {
    throw new BadRequestError('Account number and account name are required.');
  }
  if (method === 'bank-transfer' && !bankName) {
    throw new BadRequestError('Bank name is required for bank transfers.');
  }

  const client = await pool.getClient();

  try {
    await client.query('BEGIN');

    const hasOpen = await mlmDb.hasOpenWithdrawal(userId, client);
    if (hasOpen) {
      throw new ConflictError('You already have a pending withdrawal request.');
    }

    await mlmDb.ensureWallet(userId, client);
    const wallet = await mlmDb.lockWalletForUpdate(client, userId);
    if (!wallet) throw new NotFoundError('Wallet not found.');

    const debt = parseFloat(wallet.debt_balance);
    if (debt > 0) {
      throw new ForbiddenError('You have an outstanding debt. Contact support.');
    }

    const unlockedBalance = await mlmDb.getUnlockedCommissionBalance(userId, client);
    if (unlockedBalance < amount) {
      throw new BadRequestError('Insufficient withdrawable balance.');
    }

    await mlmDb.applyWalletDeltas(client, userId, {
      currentBalance: -amount,
      pendingWithdrawal: amount,
    });

    const withdrawal = await mlmDb.insertWithdrawal(client, {
      userId,
      amount,
      method,
      accountNumber,
      accountName,
      bankName: method === 'bank-transfer' ? bankName : null,
    });

    await client.query('COMMIT');
    return withdrawal;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Admin processes a withdrawal: approve or reject.
 *
 * @param {string} withdrawalId - Withdrawal UUID
 * @param {string} adminId - Admin UUID
 * @param {object} data - { action, note?, transactionRef? }
 * @returns {Promise<object>} Updated withdrawal
 */
const processWithdrawal = async (withdrawalId, adminId, data) => {
  const { action, note, transactionRef } = data;

  if (!['approve', 'reject'].includes(action)) {
    throw new BadRequestError('Action must be "approve" or "reject".');
  }

  const client = await pool.getClient();

  try {
    await client.query('BEGIN');

    const withdrawal = await mlmDb.lockWithdrawalForUpdate(client, withdrawalId);
    if (!withdrawal) throw new NotFoundError('Withdrawal not found.');
    if (withdrawal.status !== 'pending') {
      throw new BadRequestError(`Withdrawal is already ${withdrawal.status}.`);
    }

    const amount = parseFloat(withdrawal.amount);

    if (action === 'approve') {
      await mlmDb.applyWalletDeltas(client, withdrawal.user_id, {
        pendingWithdrawal: -amount,
        totalWithdrawn: amount,
      });

      await mlmDb.updateWithdrawalStatus(client, withdrawalId, {
        status: 'paid',
        adminId,
        note: note || null,
        transactionRef: transactionRef || null,
      });
    } else {
      await mlmDb.applyWalletDeltas(client, withdrawal.user_id, {
        pendingWithdrawal: -amount,
        currentBalance: amount,
      });

      await mlmDb.updateWithdrawalStatus(client, withdrawalId, {
        status: 'rejected',
        adminId,
        note: note || null,
      });
    }

    await client.query('COMMIT');

    const result = await mlmDb.lockWithdrawalForUpdate(client, withdrawalId);
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/* ============================================================================
 * DASHBOARD & READ OPERATIONS
 * ========================================================================== */

/**
 * Fetch the full MLM dashboard payload for a user.
 *
 * @param {string} userId - User UUID
 * @returns {Promise<object>} Dashboard payload
 */
const getDashboard = async (userId) => {
  if (!userId) throw new BadRequestError('userId is required.');

  const [
    wallet,
    directReferralCounts,
    commissionsResult,
    bonuses,
    withdrawalsResult,
    userSnapshot,
    unlockedBalance,
    lockedBalance,
  ] = await Promise.all([
    mlmDb.getWallet(userId),
    mlmDb.getDescendantCountsByDepth(userId),
    mlmDb.getCommissionsForUser(userId, 10, 0),
    mlmDb.getBonusesForUser(userId),
    mlmDb.getWithdrawalsForUser(userId, 5, 0),
    mlmDb.getUserSnapshot(userId),
    mlmDb.getUnlockedCommissionBalance(userId),
    mlmDb.getLockedCommissionBalance(userId),
  ]);

  return {
    user: userSnapshot,
    wallet: wallet || {
      totalEarned: 0,
      totalWithdrawn: 0,
      currentBalance: 0,
      pendingWithdrawal: 0,
      debtBalance: 0,
    },
    balances: {
      unlocked: unlockedBalance,
      locked: lockedBalance,
    },
    team: {
      level1: directReferralCounts.level1,
      level2: directReferralCounts.level2,
      level3: directReferralCounts.level3,
      level4: directReferralCounts.level4,
      total: directReferralCounts.total,
    },
    recentCommissions: commissionsResult.commissions,
    commissionsTotal: commissionsResult.total,
    bonuses,
    recentWithdrawals: withdrawalsResult.withdrawals,
    withdrawalsTotal: withdrawalsResult.total,
  };
};

/**
 * Fetch a paginated commission list for a user.
 */
const getCommissionHistory = async (userId, limit, offset) => {
  return mlmDb.getCommissionsForUser(userId, limit, offset);
};

/**
 * Fetch the user's downline tree.
 */
const getDownlineTree = async (userId) => {
  const descendants = await mlmDb.getDescendants(userId);
  if (descendants.length === 0) return [];

  const results = [];
  for (const row of descendants) {
    const snapshot = await mlmDb.getUserSnapshot(row.descendant_id);
    if (snapshot) {
      results.push({
        id: snapshot.id,
        fullName: snapshot.full_name,
        phone: snapshot.phone,
        depth: row.depth,
      });
    }
  }
  return results;
};

/**
 * Fetch a user's withdrawal history.
 */
const getWithdrawalHistory = async (userId, limit, offset) => {
  return mlmDb.getWithdrawalsForUser(userId, limit, offset);
};

/* ============================================================================
 * ADMIN READ OPERATIONS
 * ========================================================================== */

/**
 * Fetch paginated withdrawals for admin review.
 */
const getWithdrawalsForAdmin = async (options) => {
  return mlmDb.getWithdrawalsForAdmin(options);
};

/**
 * Fetch platform-wide MLM statistics for the admin dashboard.
 */
const getAdminStats = async () => {
  const [
    commissionTotals,
    bonusTotals,
    activeReferrers,
    pendingWithdrawals,
  ] = await Promise.all([
    pool.query(
      `SELECT COALESCE(SUM(commission_amount), 0)::numeric AS total,
              COUNT(*)::int AS count
       FROM affiliate_commissions
       WHERE status = 'credited'`
    ),
    pool.query(
      `SELECT COALESCE(SUM(amount), 0)::numeric AS total,
              COUNT(*)::int AS count
       FROM referral_bonuses`
    ),
    pool.query(
      `SELECT COUNT(DISTINCT earning_user_id)::int AS count
       FROM affiliate_commissions
       WHERE status = 'credited'`
    ),
    pool.query(
      `SELECT COUNT(*)::int AS count,
              COALESCE(SUM(amount), 0)::numeric AS total
       FROM withdrawal_requests
       WHERE status = 'pending'`
    ),
  ]);

  return {
    totalCommissions: parseFloat(commissionTotals.rows[0].total),
    totalCommissionCount: commissionTotals.rows[0].count,
    totalBonuses: parseFloat(bonusTotals.rows[0].total),
    totalBonusCount: bonusTotals.rows[0].count,
    activeReferrers: activeReferrers.rows[0].count,
    pendingWithdrawals: {
      count: pendingWithdrawals.rows[0].count,
      total: parseFloat(pendingWithdrawals.rows[0].total),
    },
  };
};

/* ============================================================================
 * EXPORTS
 * ========================================================================== */

module.exports = {
  /* Tree */
  buildReferralTree,

  /* Commissions */
  distributeCommissions,
  reverseCommissionsForPayment,

  /* Bonuses */
  awardEligibleBonuses,

  /* Withdrawals */
  requestWithdrawal,
  processWithdrawal,

  /* Dashboard */
  getDashboard,
  getCommissionHistory,
  getDownlineTree,
  getWithdrawalHistory,

  /* Admin */
  getWithdrawalsForAdmin,
  getAdminStats,
};