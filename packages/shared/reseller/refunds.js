/**
 * @fileoverview Reseller Refund Reversal Logic
 *
 * Handles the complete reversal of a reseller sale when a payment is
 * refunded. Reverses:
 *   - Sub-reseller payout (debits wallet, adds to debt if already withdrawn)
 *   - Parent payout (same)
 *   - Marks reseller_sales as 'refunded'
 *   - Logs wallet_events for both reversals
 *
 * MUST be called inside an existing transaction. Idempotent: only
 * processes sales with status='approved' or 'paid'.
 *
 * Path: packages/shared/reseller/refunds.js
 */

const { ResellerNotFoundError, ResellerValidationError } = require('./errors');
const { loadResellerConfig } = require('./config-loader');

/**
 * Debit a user's wallet. If the balance is insufficient, the deficit goes
 * into debt_balance (to be recovered from future earnings).
 *
 * @param {object} client - Transaction client
 * @param {string} userId
 * @param {number} amount - Positive amount to debit
 * @returns {Promise<{debited: number, toDebt: number}>}
 */
const debitWallet = async (client, userId, amount) => {
  /* Lock wallet */
  const walletResult = await client.query(
    'SELECT current_balance, debt_balance FROM affiliate_wallets WHERE user_id = $1 FOR UPDATE',
    [userId]
  );
  if (walletResult.rows.length === 0) {
    throw new ResellerNotFoundError('Wallet not found for user.', 'WALLET_NOT_FOUND');
  }

  const currentBalance = parseFloat(walletResult.rows[0].current_balance);
  const debited = Math.min(currentBalance, amount);
  const toDebt = amount - debited;

  const updated = await client.query(
    `UPDATE affiliate_wallets
     SET current_balance = current_balance - $2,
         debt_balance    = debt_balance + $3,
         total_earned    = GREATEST(0, total_earned - $4),
         updated_at      = NOW()
     WHERE user_id = $1
     RETURNING current_balance`,
    [userId, debited, toDebt, amount]
  );

  return {
    debited,
    toDebt,
    balanceAfter: parseFloat(updated.rows[0].current_balance),
  };
};

/**
 * Reverse a single reseller sale.
 *
 * @param {object} client - Transaction client
 * @param {string} saleId - UUID of the reseller_sales row
 * @param {object} [options]
 * @param {string} [options.reason='customer_refund'] - Audit reason
 * @returns {Promise<object>} Reversal summary
 */
const reverseResellerSale = async (client, saleId, options = {}) => {
  const { reason = 'customer_refund' } = options;

  /* ── 1. Lock sale row ────────────────────────────────────────────────── */
  const saleResult = await client.query(
    `SELECT id, reseller_id, buyer_user_id, parent_reseller_id,
            sub_reseller_payout, parent_reseller_payout, status
     FROM reseller_sales
     WHERE id = $1
     FOR UPDATE`,
    [saleId]
  );
  if (saleResult.rows.length === 0) {
    throw new ResellerNotFoundError('Reseller sale not found.', 'SALE_NOT_FOUND');
  }
  const sale = saleResult.rows[0];

  /* ── 2. Idempotency ──────────────────────────────────────────────────── */
  if (sale.status === 'refunded' || sale.status === 'reversed') {
    return { alreadyReversed: true, saleId };
  }
  if (sale.status !== 'approved' && sale.status !== 'paid') {
    throw new ResellerValidationError(
      `Cannot reverse sale in status '${sale.status}'.`,
      'INVALID_SALE_STATUS'
    );
  }

  /* ── 3. Load config for loss-bearing strategy ────────────────────────── */
  const config = await loadResellerConfig({ db: client });
  const lossBearing = config.refunds.lossBearing;

  /* ── 4. Load user IDs from profiles ──────────────────────────────────── */
  const subProfile = await client.query(
    'SELECT user_id FROM reseller_profiles WHERE id = $1',
    [sale.reseller_id]
  );
  const subUserId = subProfile.rows[0].user_id;

  let parentUserId = null;
  if (sale.parent_reseller_id) {
    const parentProfile = await client.query(
      'SELECT user_id FROM reseller_profiles WHERE id = $1',
      [sale.parent_reseller_id]
    );
    parentUserId = parentProfile.rows[0].user_id;
  }

  /* ── 5. Determine what to reverse ────────────────────────────────────── */
  const subPayout = parseFloat(sale.sub_reseller_payout);
  const parentPayout = parseFloat(sale.parent_reseller_payout);

  let subToReverse = subPayout;
  let parentToReverse = parentPayout;

  if (lossBearing === 'platform') {
    /* Platform absorbs the loss — do not debit resellers */
    subToReverse = 0;
    parentToReverse = 0;
  } else if (lossBearing === 'reseller') {
    /* Resellers bear the full loss — reverse everything */
    subToReverse = subPayout;
    parentToReverse = parentPayout;
  }
  /* 'split' (default) is the same as 'reseller' for individual earnings */

  /* ── 6. Debit sub-reseller ───────────────────────────────────────────── */
  let subResult = { debited: 0, toDebt: 0, balanceAfter: 0 };
  if (subToReverse > 0) {
    subResult = await debitWallet(client, subUserId, subToReverse);
    await client.query(
      `INSERT INTO wallet_events
         (user_id, event_type, amount, balance_after, reference_type, reference_id, metadata)
       VALUES ($1, 'reversal', $2, $3, 'reseller_sale', $4, $5)`,
      [
        subUserId,
        -subToReverse,
        subResult.balanceAfter,
        saleId,
        JSON.stringify({ reason, originalPayout: subPayout, debited: subResult.debited, toDebt: subResult.toDebt }),
      ]
    );
  }

  /* ── 7. Debit parent ─────────────────────────────────────────────────── */
  let parentResult = { debited: 0, toDebt: 0, balanceAfter: 0 };
  if (parentUserId && parentToReverse > 0) {
    parentResult = await debitWallet(client, parentUserId, parentToReverse);
    await client.query(
      `INSERT INTO wallet_events
         (user_id, event_type, amount, balance_after, reference_type, reference_id, metadata)
       VALUES ($1, 'reversal', $2, $3, 'reseller_sale', $4, $5)`,
      [
        parentUserId,
        -parentToReverse,
        parentResult.balanceAfter,
        saleId,
        JSON.stringify({ reason, originalPayout: parentPayout, debited: parentResult.debited, toDebt: parentResult.toDebt }),
      ]
    );
  }

  /* ── 8. Mark sale as refunded ────────────────────────────────────────── */
  await client.query(
    `UPDATE reseller_sales
     SET status = 'refunded',
         refunded_at = NOW(),
         reversal_reason = $2
     WHERE id = $1`,
    [saleId, reason]
  );

  return {
    saleId,
    subReversed: subToReverse,
    parentReversed: parentToReverse,
    subDebtAdded: subResult.toDebt,
    parentDebtAdded: parentResult.toDebt,
    lossBearing,
  };
};

/**
 * Orchestrated reversal — wraps reverseResellerSale in a transaction.
 *
 * @param {object} db - { query, getClient }
 * @param {string} saleId
 * @param {object} [options]
 * @returns {Promise<object>}
 */
const reverseResellerSaleTx = async (db, saleId, options = {}) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const result = await reverseResellerSale(client, saleId, options);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  reverseResellerSale,
  reverseResellerSaleTx,
  debitWallet,
};