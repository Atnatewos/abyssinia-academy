/**
 * @fileoverview MLM Referral Database Queries (Money Model v2)
 *
 * Pure data access layer for the 4-level MLM referral system.
 * No business logic, no transactions, no caps enforcement — those belong
 * to the service layer in packages/shared/mlm.
 *
 * Money Model v2 additions (compared to v1):
 *   - Paying-referral counters (paying_direct_count, paying_team_size)
 *     tracked separately from structural counters. Used for bonus gating.
 *   - Bonus rows carry unlock_at + status for 7-day lock and clawback.
 *   - getWithdrawableBalance() subtracts locked commissions + locked bonuses
 *     from current_balance — the single source of truth for withdrawals.
 *   - reverseBonusesForPayment() claws back locked bonuses tied to a
 *     refunded payment, filtered to ancestors only.
 *
 * Design notes:
 *   - Every query uses parameterized placeholders ($1, $2, ...)
 *   - Transaction-capable queries accept an optional `client` argument;
 *     when omitted they fall back to the pooled `query` wrapper.
 *   - Column names are returned in snake_case; the service layer handles
 *     camelCase conversion for API responses.
 *
 * Path: apps/api/src/database/queries/mlm-referrals.js
 */

const { query } = require('../pool');

/* ============================================================================
 * INTERNAL HELPERS
 * ========================================================================== */

/**
 * Pick the executor. If a transaction `client` is provided, use it so
 * multiple queries can run inside the same transaction. Otherwise use
 * the pool directly.
 *
 * @param {import('pg').PoolClient|null} client - Optional transaction client
 * @param {string} text - SQL query with $1, $2 placeholders
 * @param {Array} params - Query parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
const execute = async (client, text, params) => {
  if (client) return client.query(text, params);
  return query(text, params);
};

/* ============================================================================
 * WALLET OPERATIONS
 * ========================================================================== */

/**
 * Fetch a user's wallet row.
 * Migration 011 backfills a wallet for every existing user, and
 * registration also creates one, so null here should be extremely rare.
 *
 * @param {string} userId - User UUID
 * @param {import('pg').PoolClient} [client] - Optional transaction client
 * @returns {Promise<object|null>}
 */
const getWallet = async (userId, client = null) => {
  const result = await execute(
    client,
    `SELECT id, user_id, total_earned, total_withdrawn, current_balance,
            pending_withdrawal, debt_balance, created_at, updated_at
     FROM affiliate_wallets
     WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0] || null;
};

/**
 * Insert a wallet row for a user if one does not exist.
 * ON CONFLICT DO NOTHING makes this safe to call repeatedly.
 *
 * @param {string} userId - User UUID
 * @param {import('pg').PoolClient} [client] - Optional transaction client
 * @returns {Promise<object>}
 */
const ensureWallet = async (userId, client = null) => {
  await execute(
    client,
    `INSERT INTO affiliate_wallets (user_id)
     VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );

  const result = await execute(
    client,
    `SELECT id, user_id, total_earned, total_withdrawn, current_balance,
            pending_withdrawal, debt_balance, created_at, updated_at
     FROM affiliate_wallets
     WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0];
};

/**
 * Lock a user's wallet row for update inside a transaction.
 * MUST be called with a transaction client. Outside a transaction,
 * FOR UPDATE is a no-op and semantically wrong here.
 *
 * @param {import('pg').PoolClient} client - Transaction client (required)
 * @param {string} userId - User UUID
 * @returns {Promise<object|null>}
 */
const lockWalletForUpdate = async (client, userId) => {
  const result = await client.query(
    `SELECT id, user_id, total_earned, total_withdrawn, current_balance,
            pending_withdrawal, debt_balance, updated_at
     FROM affiliate_wallets
     WHERE user_id = $1
     FOR UPDATE`,
    [userId]
  );
  return result.rows[0] || null;
};

/**
 * Apply signed deltas to a wallet's balance columns.
 * Caller must have already locked the row with lockWalletForUpdate()
 * and computed safe deltas. DB-level CHECK constraints prevent any
 * column from going below zero.
 *
 * @param {import('pg').PoolClient} client - Transaction client (required)
 * @param {string} userId - User UUID
 * @param {object} deltas
 * @param {number} [deltas.totalEarned=0]
 * @param {number} [deltas.totalWithdrawn=0]
 * @param {number} [deltas.currentBalance=0]
 * @param {number} [deltas.pendingWithdrawal=0]
 * @param {number} [deltas.debtBalance=0]
 * @returns {Promise<object>} Updated wallet row
 */
const applyWalletDeltas = async (client, userId, deltas = {}) => {
  const {
    totalEarned = 0,
    totalWithdrawn = 0,
    currentBalance = 0,
    pendingWithdrawal = 0,
    debtBalance = 0,
  } = deltas;

  const result = await client.query(
    `UPDATE affiliate_wallets
     SET total_earned       = total_earned + $2,
         total_withdrawn    = total_withdrawn + $3,
         current_balance    = current_balance + $4,
         pending_withdrawal = pending_withdrawal + $5,
         debt_balance       = debt_balance + $6,
         updated_at         = NOW()
     WHERE user_id = $1
     RETURNING id, user_id, total_earned, total_withdrawn, current_balance,
               pending_withdrawal, debt_balance, updated_at`,
    [userId, totalEarned, totalWithdrawn, currentBalance, pendingWithdrawal, debtBalance]
  );
  return result.rows[0];
};

/* ============================================================================
 * REFERRAL TREE OPERATIONS
 * ========================================================================== */

/**
 * Insert a single row into the referral tree.
 * ON CONFLICT DO NOTHING keeps this idempotent if called twice.
 *
 * @param {import('pg').PoolClient} client
 * @param {string} ancestorId
 * @param {string} descendantId
 * @param {number} depth - Distance (1-4)
 * @returns {Promise<object|null>} Inserted row or null on conflict
 */
const insertTreeEntry = async (client, ancestorId, descendantId, depth) => {
  const result = await client.query(
    `INSERT INTO referral_tree (ancestor_id, descendant_id, depth)
     VALUES ($1, $2, $3)
     ON CONFLICT (ancestor_id, descendant_id) DO NOTHING
     RETURNING id, ancestor_id, descendant_id, depth, created_at`,
    [ancestorId, descendantId, depth]
  );
  return result.rows[0] || null;
};

/**
 * Fetch all ancestors of a user up to a maximum depth, ordered by depth.
 * Used when distributing commissions — the buyer's ancestors at depth 1-4
 * are exactly the people who earn.
 *
 * @param {string} descendantId
 * @param {number} [maxDepth=4]
 * @param {import('pg').PoolClient} [client]
 * @returns {Promise<Array>} Rows with { ancestor_id, depth }
 */
const getAncestors = async (descendantId, maxDepth = 4, client = null) => {
  const result = await execute(
    client,
    `SELECT ancestor_id, depth
     FROM referral_tree
     WHERE descendant_id = $1 AND depth <= $2
     ORDER BY depth ASC`,
    [descendantId, maxDepth]
  );
  return result.rows;
};

/**
 * Fetch direct ancestors (depth = 1) only. Useful for incremental tree
 * building — when a new user is inserted, we copy their referrer's
 * ancestors at one level deeper.
 *
 * @param {string} descendantId
 * @param {import('pg').PoolClient} [client]
 * @returns {Promise<Array>}
 */
const getDirectAncestors = async (descendantId, client = null) => {
  const result = await execute(
    client,
    `SELECT ancestor_id, depth
     FROM referral_tree
     WHERE descendant_id = $1 AND depth = 1`,
    [descendantId]
  );
  return result.rows;
};

/**
 * Fetch all descendants of a user (any depth 1-4).
 * Used for team size calculations and tree visualization.
 *
 * @param {string} ancestorId
 * @param {number} [maxDepth=4]
 * @param {import('pg').PoolClient} [client]
 * @returns {Promise<Array>} Rows with { descendant_id, depth }
 */
const getDescendants = async (ancestorId, maxDepth = 4, client = null) => {
  const result = await execute(
    client,
    `SELECT descendant_id, depth
     FROM referral_tree
     WHERE ancestor_id = $1 AND depth <= $2
     ORDER BY depth ASC, created_at ASC`,
    [ancestorId, maxDepth]
  );
  return result.rows;
};

/**
 * Get the count of descendants grouped by depth for a user.
 * Returns { level1, level2, level3, level4, total }.
 *
 * @param {string} ancestorId
 * @returns {Promise<object>}
 */
const getDescendantCountsByDepth = async (ancestorId) => {
  const result = await query(
    `SELECT depth, COUNT(*)::int AS count
     FROM referral_tree
     WHERE ancestor_id = $1
     GROUP BY depth`,
    [ancestorId]
  );

  const counts = { level1: 0, level2: 0, level3: 0, level4: 0, total: 0 };
  for (const row of result.rows) {
    counts[`level${row.depth}`] = row.count;
    counts.total += row.count;
  }
  return counts;
};

/* ============================================================================
 * COMMISSION OPERATIONS
 * ========================================================================== */

/**
 * Check whether any commission rows already exist for a payment.
 * Used for idempotency — distribution is skipped if already processed.
 *
 * @param {string} paymentId
 * @param {import('pg').PoolClient} [client]
 * @returns {Promise<boolean>}
 */
const paymentHasCommissions = async (paymentId, client = null) => {
  const result = await execute(
    client,
    'SELECT 1 FROM affiliate_commissions WHERE payment_id = $1 LIMIT 1',
    [paymentId]
  );
  return result.rows.length > 0;
};

/**
 * Insert a commission row. unlock_at is computed by the DB default
 * (created_at + 7 days from migration 011), so no app logic needed.
 *
 * @param {import('pg').PoolClient} client
 * @param {object} data
 * @param {string} data.earningUserId
 * @param {string} data.sourceUserId
 * @param {string} data.paymentId
 * @param {number} data.level
 * @param {number} data.tierAtTime
 * @param {number} data.tierPercentAtTime
 * @param {number} data.saleAmount
 * @param {number} data.commissionAmount
 * @returns {Promise<object>}
 */
const insertCommission = async (client, data) => {
  const {
    earningUserId,
    sourceUserId,
    paymentId,
    level,
    tierAtTime = 1,
    tierPercentAtTime = 0,
    saleAmount,
    commissionAmount,
  } = data;

  const result = await client.query(
    `INSERT INTO affiliate_commissions
       (earning_user_id, source_user_id, payment_id, level,
        tier_at_time, tier_percent_at_time, sale_amount, commission_amount, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'credited')
     RETURNING id, earning_user_id, source_user_id, payment_id, level,
               sale_amount, commission_amount, status, created_at, unlock_at`,
    [
      earningUserId,
      sourceUserId,
      paymentId,
      level,
      tierAtTime,
      tierPercentAtTime,
      saleAmount,
      commissionAmount,
    ]
  );
  return result.rows[0];
};

/**
 * Fetch paginated commission history for a user, newest first.
 * Returns rows plus total count.
 *
 * @param {string} userId
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<object>} { commissions, total }
 */
const getCommissionsForUser = async (userId, limit, offset) => {
  const rowsResult = await query(
    `SELECT c.id, c.source_user_id, c.payment_id, c.level,
            c.sale_amount, c.commission_amount, c.status,
            c.created_at, c.unlock_at, c.reversed_at, c.reversal_reason,
            u.full_name AS source_user_name
     FROM affiliate_commissions c
     LEFT JOIN users u ON u.id = c.source_user_id
     WHERE c.earning_user_id = $1
     ORDER BY c.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  const countResult = await query(
    'SELECT COUNT(*)::int AS count FROM affiliate_commissions WHERE earning_user_id = $1',
    [userId]
  );

  return {
    commissions: rowsResult.rows,
    total: countResult.rows[0].count,
  };
};

/**
 * Compute the user's currently withdrawable commission balance.
 * Counts only 'credited' rows whose unlock_at has passed.
 *
 * @param {string} userId
 * @param {import('pg').PoolClient} [client]
 * @returns {Promise<number>}
 */
const getUnlockedCommissionBalance = async (userId, client = null) => {
  const result = await execute(
    client,
    `SELECT COALESCE(SUM(commission_amount), 0)::numeric AS balance
     FROM affiliate_commissions
     WHERE earning_user_id = $1
       AND status = 'credited'
       AND unlock_at <= NOW()`,
    [userId]
  );
  return parseFloat(result.rows[0].balance);
};

/**
 * Compute the user's currently-locked commission balance.
 * Commissions still within the 7-day unlock window.
 *
 * @param {string} userId
 * @returns {Promise<number>}
 */
const getLockedCommissionBalance = async (userId) => {
  const result = await query(
    `SELECT COALESCE(SUM(commission_amount), 0)::numeric AS balance
     FROM affiliate_commissions
     WHERE earning_user_id = $1
       AND status = 'credited'
       AND unlock_at > NOW()`,
    [userId]
  );
  return parseFloat(result.rows[0].balance);
};

/**
 * Fetch all commissions tied to a specific payment.
 * Used by reversal flows and admin audit views.
 *
 * @param {string} paymentId
 * @param {import('pg').PoolClient} [client]
 * @returns {Promise<Array>}
 */
const getCommissionsByPayment = async (paymentId, client = null) => {
  const result = await execute(
    client,
    `SELECT id, earning_user_id, source_user_id, level,
            commission_amount, status, unlock_at, created_at
     FROM affiliate_commissions
     WHERE payment_id = $1
     ORDER BY level ASC`,
    [paymentId]
  );
  return result.rows;
};

/**
 * Reverse a single commission row by setting its status and
 * reversal metadata. Does NOT touch the wallet — the service layer
 * must adjust balances separately inside the same transaction.
 *
 * @param {import('pg').PoolClient} client
 * @param {string} commissionId
 * @param {string} reason
 * @returns {Promise<object|null>}
 */
const reverseCommission = async (client, commissionId, reason) => {
  const result = await client.query(
    `UPDATE affiliate_commissions
     SET status = 'reversed',
         reversed_at = NOW(),
         reversal_reason = $2
     WHERE id = $1 AND status = 'credited'
     RETURNING id, earning_user_id, commission_amount, status, reversed_at`,
    [commissionId, reason]
  );
  return result.rows[0] || null;
};

/* ============================================================================
 * BONUS OPERATIONS (Money Model v2)
 * ========================================================================== */

/**
 * Fetch all credited bonuses awarded to a user, newest first.
 * Includes unlock_at, status, reversed_at, and reversal_reason so the
 * UI can render lock status and audit trails.
 *
 * @param {string} userId
 * @returns {Promise<Array>}
 */
const getBonusesForUser = async (userId) => {
  const result = await query(
    `SELECT id, bonus_category, bonus_name, requirement_met,
            amount, period, awarded_at, unlock_at, status,
            reversed_at, reversal_reason
     FROM referral_bonuses
     WHERE user_id = $1 AND status = 'credited'
     ORDER BY awarded_at DESC`,
    [userId]
  );
  return result.rows;
};

/**
 * Fetch the highest awarded bonus within a category, optionally scoped
 * to a period ('YYYY-MM' for monthly bonuses, NULL for lifetime).
 *
 * Used for the delta approach in non-stacking bonus logic:
 * a new award is emitted only for (new_threshold - last_threshold).
 *
 * Only counts 'credited' rows — reversed bonuses don't count toward
 * the "highest achieved" marker.
 *
 * @param {string} userId
 * @param {string} category
 * @param {string|null} period - 'YYYY-MM' or NULL
 * @param {import('pg').PoolClient} [client]
 * @returns {Promise<object|null>}
 */
const getHighestBonusInCategory = async (userId, category, period = null, client = null) => {
  const sql = period === null
    ? `SELECT id, requirement_met, amount, awarded_at
       FROM referral_bonuses
       WHERE user_id = $1 AND bonus_category = $2
         AND period IS NULL AND status = 'credited'
       ORDER BY requirement_met DESC
       LIMIT 1`
    : `SELECT id, requirement_met, amount, awarded_at
       FROM referral_bonuses
       WHERE user_id = $1 AND bonus_category = $2
         AND period = $3 AND status = 'credited'
       ORDER BY requirement_met DESC
       LIMIT 1`;

  const params = period === null ? [userId, category] : [userId, category, period];
  const result = await execute(client, sql, params);
  return result.rows[0] || null;
};

/**
 * Insert a bonus row. The UNIQUE constraint on
 * (user_id, bonus_category, requirement_met, period) guarantees
 * the same milestone is never awarded twice.
 *
 * Money Model v2: sets unlock_at = NOW() + INTERVAL 'N days' and
 * status = 'credited'. The N-day window comes from the caller
 * (read from config.commissionStructure.unlockDelayDays).
 *
 * @param {import('pg').PoolClient} client
 * @param {object} data
 * @param {string} data.userId
 * @param {string} data.category
 * @param {string} data.name
 * @param {number} data.requirementMet
 * @param {number} data.amount
 * @param {string|null} [data.period=null]
 * @param {number} [data.unlockDelayDays=7]
 * @returns {Promise<object|null>}
 */
const insertBonus = async (client, data) => {
  const {
    userId,
    category,
    name,
    requirementMet,
    amount,
    period = null,
    unlockDelayDays = 7,
  } = data;

  /*
   * The interval is inlined as a literal because pg doesn't allow
   * parameterized INTERVAL values without a cast; the value comes
   * from config (integer), not user input, so this is safe from
   * SQL injection.
   */
  const result = await client.query(
    `INSERT INTO referral_bonuses
       (user_id, bonus_category, bonus_name, requirement_met, amount,
        period, unlock_at, status)
     VALUES (
       $1, $2, $3, $4, $5, $6,
       NOW() + INTERVAL '${parseInt(unlockDelayDays, 10)} days',
       'credited'
     )
     ON CONFLICT (user_id, bonus_category, requirement_met, period) DO NOTHING
     RETURNING id, user_id, bonus_category, bonus_name, requirement_met,
               amount, period, awarded_at, unlock_at, status`,
    [userId, category, name, requirementMet, amount, period]
  );
  return result.rows[0] || null;
};

/**
 * Sum the credited bonus amount awarded to a user within a calendar
 * month. Used to enforce the monthly bonus cap before awarding more.
 * Only 'credited' rows count — reversed bonuses free up headroom.
 *
 * @param {string} userId
 * @param {string} month - 'YYYY-MM'
 * @param {import('pg').PoolClient} [client]
 * @returns {Promise<number>}
 */
const getBonusTotalForMonth = async (userId, month, client = null) => {
  const result = await execute(
    client,
    `SELECT COALESCE(SUM(amount), 0)::numeric AS total
     FROM referral_bonuses
     WHERE user_id = $1
       AND TO_CHAR(awarded_at, 'YYYY-MM') = $2
       AND status = 'credited'`,
    [userId, month]
  );
  return parseFloat(result.rows[0].total);
};

/**
 * Reverse all locked bonuses belonging to ancestors of the refunded
 * buyer. Called when a payment is refunded within the bonus lock window.
 *
 * Scope of reversal:
 *   - Only ancestors of the refunded buyer (the people who could have
 *     had their counters incremented by that buyer's first payment).
 *   - Only 'credited' AND still-locked rows (unlock_at > NOW()).
 *     Once a bonus has unlocked, it is final and not clawed back.
 *
 * Does NOT decrement wallets — the service layer does that in the same
 * transaction after reading the RETURNING rows.
 *
 * @param {import('pg').PoolClient} client
 * @param {string} paymentId - Payment UUID that was refunded
 * @param {string} reason - Audit trail reason
 * @returns {Promise<Array>} Reversed bonus rows { id, user_id, amount, bonus_category }
 */
const reverseBonusesForPayment = async (client, paymentId, reason) => {
  /* Find the refunded buyer. */
  const paymentResult = await client.query(
    'SELECT user_id FROM payments WHERE id = $1',
    [paymentId]
  );
  if (paymentResult.rows.length === 0) return [];

  const buyerId = paymentResult.rows[0].user_id;

  /* Collect ancestors of the buyer (people who could have earned bonuses). */
  const ancestorsResult = await client.query(
    `SELECT DISTINCT ancestor_id FROM referral_tree WHERE descendant_id = $1`,
    [buyerId]
  );
  if (ancestorsResult.rows.length === 0) return [];

  const ancestorIds = ancestorsResult.rows.map((r) => r.ancestor_id);

  /*
   * Reverse all locked, credited bonuses for those ancestors.
   * A single UPDATE with ANY($1::uuid[]) is more efficient than
   * looping per ancestor.
   */
  const result = await client.query(
    `UPDATE referral_bonuses
     SET status = 'reversed',
         reversed_at = NOW(),
         reversal_reason = $2
     WHERE user_id = ANY($1::uuid[])
       AND status = 'credited'
       AND unlock_at > NOW()
     RETURNING id, user_id, amount, bonus_category, reversed_at`,
    [ancestorIds, reason]
  );

  return result.rows;
};

/* ============================================================================
 * WITHDRAWAL OPERATIONS
 * ========================================================================== */

/**
 * Insert a new withdrawal request. Caller is responsible for having
 * reserved the funds on the wallet (moving current_balance →
 * pending_withdrawal) inside the same transaction.
 *
 * @param {import('pg').PoolClient} client
 * @param {object} data
 * @param {string} data.userId
 * @param {number} data.amount
 * @param {string} data.method - 'telebirr' | 'cbe-birr' | 'bank-transfer'
 * @param {string} data.accountNumber
 * @param {string} data.accountName
 * @param {string|null} [data.bankName=null]
 * @returns {Promise<object>}
 */
const insertWithdrawal = async (client, data) => {
  const {
    userId,
    amount,
    method,
    accountNumber,
    accountName,
    bankName = null,
  } = data;

  const result = await client.query(
    `INSERT INTO withdrawal_requests
       (user_id, amount, method, account_number, account_name, bank_name, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'pending')
     RETURNING id, user_id, amount, method, account_number, account_name,
               bank_name, status, created_at`,
    [userId, amount, method, accountNumber, accountName, bankName]
  );
  return result.rows[0];
};

/**
 * Fetch paginated withdrawal history for a user.
 *
 * @param {string} userId
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<object>} { withdrawals, total }
 */
const getWithdrawalsForUser = async (userId, limit, offset) => {
  const rowsResult = await query(
    `SELECT id, amount, method, account_number, account_name, bank_name,
            status, admin_note, transaction_ref, created_at, processed_at
     FROM withdrawal_requests
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  const countResult = await query(
    'SELECT COUNT(*)::int AS count FROM withdrawal_requests WHERE user_id = $1',
    [userId]
  );

  return {
    withdrawals: rowsResult.rows,
    total: countResult.rows[0].count,
  };
};

/**
 * Check whether a user already has an open withdrawal request.
 * Enforced at DB level too via a partial unique index; this check
 * gives a cleaner error before hitting the constraint.
 *
 * @param {string} userId
 * @param {import('pg').PoolClient} [client]
 * @returns {Promise<boolean>}
 */
const hasOpenWithdrawal = async (userId, client = null) => {
  const result = await execute(
    client,
    `SELECT 1 FROM withdrawal_requests
     WHERE user_id = $1 AND status IN ('pending', 'approved')
     LIMIT 1`,
    [userId]
  );
  return result.rows.length > 0;
};

/**
 * Fetch a withdrawal row and lock it for update inside a transaction.
 *
 * @param {import('pg').PoolClient} client
 * @param {string} withdrawalId
 * @returns {Promise<object|null>}
 */
const lockWithdrawalForUpdate = async (client, withdrawalId) => {
  const result = await client.query(
    `SELECT id, user_id, amount, method, account_number, account_name,
            bank_name, status, admin_note, transaction_ref, created_at, processed_at
     FROM withdrawal_requests
     WHERE id = $1
     FOR UPDATE`,
    [withdrawalId]
  );
  return result.rows[0] || null;
};

/**
 * Update a withdrawal request's status after admin processing.
 * The caller (service layer) is responsible for the wallet-side
 * adjustments that correspond to each status.
 *
 * @param {import('pg').PoolClient} client
 * @param {string} withdrawalId
 * @param {object} data
 * @param {string} data.status - 'paid' | 'rejected'
 * @param {string} data.adminId
 * @param {string|null} [data.note=null]
 * @param {string|null} [data.transactionRef=null]
 * @returns {Promise<object|null>}
 */
const updateWithdrawalStatus = async (client, withdrawalId, data) => {
  const { status, adminId, note = null, transactionRef = null } = data;

  const result = await client.query(
    `UPDATE withdrawal_requests
     SET status = $2,
         processed_by_admin = $3,
         processed_at = NOW(),
         admin_note = $4,
         transaction_ref = $5
     WHERE id = $1 AND status = 'pending'
     RETURNING id, user_id, amount, status, admin_note, transaction_ref, processed_at`,
    [withdrawalId, status, adminId, note, transactionRef]
  );
  return result.rows[0] || null;
};

/**
 * Fetch paginated withdrawals for the admin panel, optionally filtered
 * by status. Pending rows ordered oldest-first so admins work FIFO.
 *
 * @param {object} options
 * @param {string|null} [options.status=null]
 * @param {number} options.limit
 * @param {number} options.offset
 * @returns {Promise<object>} { withdrawals, total }
 */
const getWithdrawalsForAdmin = async ({ status = null, limit, offset }) => {
  const filterClause = status ? 'WHERE w.status = $1' : '';
  const filterParams = status ? [status] : [];
  const limitPlaceholder = `$${filterParams.length + 1}`;
  const offsetPlaceholder = `$${filterParams.length + 2}`;

  const rowsResult = await query(
    `SELECT w.id, w.user_id, w.amount, w.method, w.account_number, w.account_name,
            w.bank_name, w.status, w.admin_note, w.transaction_ref,
            w.created_at, w.processed_at,
            u.full_name AS user_name, u.phone AS user_phone
     FROM withdrawal_requests w
     LEFT JOIN users u ON u.id = w.user_id
     ${filterClause}
     ORDER BY
       CASE WHEN w.status = 'pending' THEN 0 ELSE 1 END,
       w.created_at ASC
     LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`,
    [...filterParams, limit, offset]
  );

  const countResult = await query(
    `SELECT COUNT(*)::int AS count FROM withdrawal_requests ${status ? 'WHERE status = $1' : ''}`,
    filterParams
  );

  return {
    withdrawals: rowsResult.rows,
    total: countResult.rows[0].count,
  };
};

/* ============================================================================
 * MONTHLY STATS & PLATFORM CAP OPERATIONS
 * ========================================================================== */

/**
 * Fetch a user's monthly stats row for a specific month.
 *
 * @param {string} userId
 * @param {string} month - 'YYYY-MM'
 * @param {import('pg').PoolClient} [client]
 * @returns {Promise<object|null>}
 */
const getMonthlyStats = async (userId, month, client = null) => {
  const result = await execute(
    client,
    `SELECT id, user_id, month, total_commission, total_bonus, total_payout, updated_at
     FROM referral_monthly_stats
     WHERE user_id = $1 AND month = $2`,
    [userId, month]
  );
  return result.rows[0] || null;
};

/**
 * Upsert a user's monthly stats, adding signed deltas. Auto-creates
 * the row on first write for the month.
 *
 * @param {import('pg').PoolClient} client
 * @param {string} userId
 * @param {string} month - 'YYYY-MM'
 * @param {object} deltas
 * @param {number} [deltas.commission=0]
 * @param {number} [deltas.bonus=0]
 * @returns {Promise<object>}
 */
const upsertMonthlyStats = async (client, userId, month, deltas = {}) => {
  const { commission = 0, bonus = 0 } = deltas;
  const payout = commission + bonus;

  const result = await client.query(
    `INSERT INTO referral_monthly_stats (user_id, month, total_commission, total_bonus, total_payout)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id, month) DO UPDATE
     SET total_commission = referral_monthly_stats.total_commission + $3,
         total_bonus      = referral_monthly_stats.total_bonus + $4,
         total_payout     = referral_monthly_stats.total_payout + $5,
         updated_at       = NOW()
     RETURNING id, user_id, month, total_commission, total_bonus, total_payout, updated_at`,
    [userId, month, commission, bonus, payout]
  );
  return result.rows[0];
};

/**
 * Fetch the platform-wide monthly payout total.
 * Returns 0 if no row exists yet for the given month.
 *
 * @param {string} month - 'YYYY-MM'
 * @param {import('pg').PoolClient} [client]
 * @returns {Promise<number>}
 */
const getPlatformMonthlyTotal = async (month, client = null) => {
  const result = await execute(
    client,
    `SELECT COALESCE(total_payout, 0)::numeric AS total
     FROM referral_platform_monthly
     WHERE month = $1`,
    [month]
  );
  return result.rows[0] ? parseFloat(result.rows[0].total) : 0;
};

/**
 * Upsert a platform-wide monthly delta. Auto-creates the row on first
 * write for the month.
 *
 * @param {import('pg').PoolClient} client
 * @param {string} month - 'YYYY-MM'
 * @param {number} delta
 * @returns {Promise<object>}
 */
const incrementPlatformMonthly = async (client, month, delta) => {
  const result = await client.query(
    `INSERT INTO referral_platform_monthly (month, total_payout)
     VALUES ($1, $2)
     ON CONFLICT (month) DO UPDATE
     SET total_payout = referral_platform_monthly.total_payout + $2,
         updated_at   = NOW()
     RETURNING id, month, total_payout, updated_at`,
    [month, delta]
  );
  return result.rows[0];
};

/* ============================================================================
 * USER METADATA UPDATES
 * ========================================================================== */

/**
 * Set the direct referrer on a user. Only used at registration time.
 *
 * @param {import('pg').PoolClient} client
 * @param {string} userId
 * @param {string} referrerId
 * @returns {Promise<object|null>}
 */
const setUserReferrer = async (client, userId, referrerId) => {
  const result = await client.query(
    `UPDATE users
     SET referred_by_user_id = $2,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, referred_by_user_id`,
    [userId, referrerId]
  );
  return result.rows[0] || null;
};

/**
 * Increment the STRUCTURAL direct_referral_count by 1.
 * Called at registration — counts every descendant regardless of payment.
 *
 * @param {import('pg').PoolClient} client
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
const incrementDirectReferralCount = async (client, userId) => {
  const result = await client.query(
    `UPDATE users
     SET direct_referral_count = direct_referral_count + 1,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, direct_referral_count`,
    [userId]
  );
  return result.rows[0] || null;
};

/**
 * Increment the STRUCTURAL total_team_size by amount.
 * Called for every ancestor when a new descendant is added.
 *
 * @param {import('pg').PoolClient} client
 * @param {string} userId
 * @param {number} [amount=1]
 * @returns {Promise<object|null>}
 */
const incrementTeamSize = async (client, userId, amount = 1) => {
  const result = await client.query(
    `UPDATE users
     SET total_team_size = total_team_size + $2,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, total_team_size`,
    [userId, amount]
  );
  return result.rows[0] || null;
};

/**
 * Add to a user's lifetime referral earnings total.
 * Called on every commission credit.
 *
 * @param {import('pg').PoolClient} client
 * @param {string} userId
 * @param {number} amount
 * @returns {Promise<object|null>}
 */
const incrementLifetimeEarnings = async (client, userId, amount) => {
  const result = await client.query(
    `UPDATE users
     SET lifetime_referral_earnings = lifetime_referral_earnings + $2,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, lifetime_referral_earnings`,
    [userId, amount]
  );
  return result.rows[0] || null;
};

/**
 * Increment the PAYING direct_referral counter by 1.
 * Called when a depth-1 descendant makes their FIRST approved payment.
 * Used by the bonus engine to enforce the paying-referral gate.
 *
 * @param {import('pg').PoolClient} client
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
const incrementPayingDirectCount = async (client, userId) => {
  const result = await client.query(
    `UPDATE users
     SET paying_direct_count = paying_direct_count + 1,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, paying_direct_count`,
    [userId]
  );
  return result.rows[0] || null;
};

/**
 * Increment the PAYING total team counter by amount.
 * Called when a depth-2..4 descendant makes their FIRST approved payment.
 * Used by the bonus engine to enforce the paying-referral gate.
 *
 * @param {import('pg').PoolClient} client
 * @param {string} userId
 * @param {number} [amount=1]
 * @returns {Promise<object|null>}
 */
const incrementPayingTeamSize = async (client, userId, amount = 1) => {
  const result = await client.query(
    `UPDATE users
     SET paying_team_size = paying_team_size + $2,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, paying_team_size`,
    [userId, amount]
  );
  return result.rows[0] || null;
};

/**
 * Decrement the PAYING direct_referral counter by 1, clamped at 0.
 * Called when a depth-1 descendant's payment is refunded and was the
 * descendant's only approved payment.
 *
 * @param {import('pg').PoolClient} client
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
const decrementPayingDirectCount = async (client, userId) => {
  const result = await client.query(
    `UPDATE users
     SET paying_direct_count = GREATEST(0, paying_direct_count - 1),
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, paying_direct_count`,
    [userId]
  );
  return result.rows[0] || null;
};

/**
 * Decrement the PAYING total team counter by amount, clamped at 0.
 * Called when a depth-2..4 descendant's payment is refunded and was the
 * descendant's only approved payment.
 *
 * @param {import('pg').PoolClient} client
 * @param {string} userId
 * @param {number} [amount=1]
 * @returns {Promise<object|null>}
 */
const decrementPayingTeamSize = async (client, userId, amount = 1) => {
  const result = await client.query(
    `UPDATE users
     SET paying_team_size = GREATEST(0, paying_team_size - $2),
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, paying_team_size`,
    [userId, amount]
  );
  return result.rows[0] || null;
};

/* ============================================================================
 * LOOKUPS
 * ========================================================================== */

/**
 * Find a user by their referral code.
 * Joins through referral_codes to users. Returns minimal user info
 * for the registration flow and the referral tree builder.
 *
 * @param {string} code
 * @returns {Promise<object|null>}
 */
const findUserByReferralCode = async (code) => {
  const result = await query(
    `SELECT rc.user_id, rc.code, rc.is_active, u.full_name
     FROM referral_codes rc
     JOIN users u ON u.id = rc.user_id
     WHERE rc.code = $1`,
    [code]
  );
  return result.rows[0] || null;
};

/**
 * Fetch a minimal user snapshot by ID.
 * Used in commission distribution to attach names to dashboard payloads.
 *
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
const getUserSnapshot = async (userId) => {
  const result = await query(
    'SELECT id, full_name, phone FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0] || null;
};

/**
 * Check whether a user has made at least one approved payment.
 * Used during distribution to decide whether to increment paying
 * counters (only on the FIRST approved payment).
 *
 * @param {string} userId
 * @param {import('pg').PoolClient} [client]
 * @returns {Promise<boolean>}
 */
const hasApprovedPayment = async (userId, client = null) => {
  const result = await execute(
    client,
    `SELECT 1 FROM payments WHERE user_id = $1 AND status = 'approved' LIMIT 1`,
    [userId]
  );
  return result.rows.length > 0;
};

/**
 * Fetch the earliest approved payment date for a user.
 * Used to compute the speed-bonus monthly count (depth-1 descendants
 * whose FIRST payment falls in the target calendar month).
 *
 * @param {string} userId
 * @returns {Promise<Date|null>}
 */
const getFirstPaymentDate = async (userId) => {
  const result = await query(
    `SELECT MIN(paid_at) AS first_paid
     FROM payments
     WHERE user_id = $1 AND status = 'approved'`,
    [userId]
  );
  return result.rows[0]?.first_paid || null;
};

/* ============================================================================
 * WITHDRAWABLE BALANCE (Money Model v2)
 * ========================================================================== */

/**
 * Compute the withdrawable balance for a user.
 *
 * Formula:
 *   withdrawable = current_balance - locked_commissions - locked_bonuses
 *
 * Where:
 *   - current_balance: wallet.current_balance (all credited earnings)
 *   - locked_commissions: SUM(commission_amount) where unlock_at > NOW() AND status='credited'
 *   - locked_bonuses: SUM(amount) where unlock_at > NOW() AND status='credited'
 *
 * This is the single source of truth for withdrawal validation.
 * The API layer must validate against this before accepting a request.
 *
 * @param {string} userId
 * @param {import('pg').PoolClient} [client]
 * @returns {Promise<number>}
 */
const getWithdrawableBalance = async (userId, client = null) => {
  const result = await execute(
    client,
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

/* ============================================================================
 * EXPORTS
 * ========================================================================== */

module.exports = {
  /* Wallet */
  getWallet,
  ensureWallet,
  lockWalletForUpdate,
  applyWalletDeltas,

  /* Referral tree */
  insertTreeEntry,
  getAncestors,
  getDirectAncestors,
  getDescendants,
  getDescendantCountsByDepth,

  /* Commissions */
  paymentHasCommissions,
  insertCommission,
  getCommissionsForUser,
  getCommissionsByPayment,
  getUnlockedCommissionBalance,
  getLockedCommissionBalance,
  reverseCommission,

  /* Bonuses (Money Model v2) */
  getBonusesForUser,
  getHighestBonusInCategory,
  insertBonus,
  getBonusTotalForMonth,
  reverseBonusesForPayment,

  /* Withdrawals */
  insertWithdrawal,
  getWithdrawalsForUser,
  hasOpenWithdrawal,
  lockWithdrawalForUpdate,
  updateWithdrawalStatus,
  getWithdrawalsForAdmin,

  /* Monthly stats & platform cap */
  getMonthlyStats,
  upsertMonthlyStats,
  getPlatformMonthlyTotal,
  incrementPlatformMonthly,

  /* User metadata — structural counters (increment on registration) */
  setUserReferrer,
  incrementDirectReferralCount,
  incrementTeamSize,
  incrementLifetimeEarnings,

  /* User metadata — paying counters (Money Model v2; increment on first payment) */
  incrementPayingDirectCount,
  incrementPayingTeamSize,
  decrementPayingDirectCount,
  decrementPayingTeamSize,

  /* Lookups */
  findUserByReferralCode,
  getUserSnapshot,
  hasApprovedPayment,
  getFirstPaymentDate,

  /* Withdrawable balance */
  getWithdrawableBalance,
};