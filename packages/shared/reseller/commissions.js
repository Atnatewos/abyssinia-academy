/**
 * @fileoverview Reseller Commission Calculation & Distribution
 *
 * The heart of the reseller system. Computes the split for a sale and
 * returns a distribution object that the caller (orchestrator) writes
 * to the database within its transaction.
 *
 * Design principles:
 *   - Pure calculation where possible: computeSplit() has no side effects
 *   - All DB writes go through the caller's transaction (client)
 *   - Every monetary value is snapshotted on the reseller_sales row
 *
 * Path: packages/shared/reseller/commissions.js
 */

const { ResellerValidationError } = require('./errors');

/**
 * Compute the split for a sale. Pure function — no DB access, no side effects.
 *
 * @param {object} params
 * @param {number} params.retailPrice - Price paid by buyer
 * @param {number} params.platformFeePercent - Platform's percentage cut
 * @param {number} params.subSharePercent - Sub-reseller's share of the reseller pool
 * @param {boolean} params.hasParent - Whether the reseller has a parent
 * @returns {{
 *   retailPrice: number,
 *   platformFeePercent: number,
 *   platformFeeAmount: number,
 *   resellerPool: number,
 *   subResellerPayout: number,
 *   parentResellerPayout: number,
 *   subSharePercent: number
 * }}
 */
const computeSplit = ({ retailPrice, platformFeePercent, subSharePercent, hasParent }) => {
  if (!Number.isFinite(retailPrice) || retailPrice <= 0) {
    throw new ResellerValidationError(
      'retailPrice must be a positive number.',
      'INVALID_RETAIL_PRICE'
    );
  }
  if (!Number.isFinite(platformFeePercent) || platformFeePercent < 0 || platformFeePercent > 100) {
    throw new ResellerValidationError(
      'platformFeePercent must be between 0 and 100.',
      'INVALID_PLATFORM_FEE'
    );
  }

  /* Normalize to 2 decimal places throughout */
  const round2 = (n) => Math.round(n * 100) / 100;

  const platformFeeAmount = round2(retailPrice * (platformFeePercent / 100));
  const resellerPool = round2(retailPrice - platformFeeAmount);

  let subResellerPayout;
  let parentResellerPayout;

  if (hasParent) {
    if (!Number.isFinite(subSharePercent) || subSharePercent < 0 || subSharePercent > 100) {
      throw new ResellerValidationError(
        'subSharePercent must be between 0 and 100.',
        'INVALID_SUB_SHARE'
      );
    }
    subResellerPayout = round2(resellerPool * (subSharePercent / 100));
    parentResellerPayout = round2(resellerPool - subResellerPayout);
  } else {
    /* No parent → reseller keeps the entire pool */
    subResellerPayout = resellerPool;
    parentResellerPayout = 0;
  }

  return {
    retailPrice,
    platformFeePercent,
    platformFeeAmount,
    resellerPool,
    subResellerPayout,
    parentResellerPayout,
    subSharePercent: hasParent ? subSharePercent : 100,
  };
};

/**
 * Persist a reseller sale and credit wallets atomically.
 * MUST be called inside an existing transaction (the caller owns BEGIN/COMMIT).
 *
 * @param {object} client - pg PoolClient (in transaction)
 * @param {object} params
 * @param {string} params.resellerProfileId
 * @param {string} params.resellerUserId
 * @param {string} params.buyerUserId
 * @param {string} params.paymentId
 * @param {object} params.split - Result of computeSplit()
 * @param {string|null} params.parentProfileId
 * @param {string|null} params.parentUserId
 * @param {number} params.lockDays
 * @returns {Promise<object>} The created reseller_sales row
 */
const recordSale = async (client, params) => {
  const {
    resellerProfileId,
    resellerUserId,
    buyerUserId,
    paymentId,
    split,
    parentProfileId,
    parentUserId,
    lockDays,
  } = params;

  /* 1. Insert reseller_sales row with snapshots */
  const saleResult = await client.query(
    `INSERT INTO reseller_sales (
       reseller_id, buyer_user_id, payment_id,
       retail_price, platform_fee_percent, platform_fee_amount, reseller_pool_amount,
       parent_reseller_id, sub_share_percent_snapshot,
       sub_reseller_payout, parent_reseller_payout,
       status, unlock_at
     ) VALUES (
       $1, $2, $3,
       $4, $5, $6, $7,
       $8, $9,
       $10, $11,
       'approved', CURRENT_TIMESTAMP + ($12 || ' days')::INTERVAL
     )
     RETURNING *`,
    [
      resellerProfileId,
      buyerUserId,
      paymentId,
      split.retailPrice,
      split.platformFeePercent,
      split.platformFeeAmount,
      split.resellerPool,
      parentProfileId,
      split.subSharePercent,
      split.subResellerPayout,
      split.parentResellerPayout,
      String(lockDays),
    ]
  );
  const sale = saleResult.rows[0];

  /* 2. Credit sub-reseller wallet */
  const subWalletResult = await client.query(
    `UPDATE affiliate_wallets
     SET total_earned = total_earned + $2,
         current_balance = current_balance + $2,
         updated_at = NOW()
     WHERE user_id = $1
     RETURNING current_balance`,
    [resellerUserId, split.subResellerPayout]
  );

  /* 3. Log wallet event for sub-reseller */
  await client.query(
    `INSERT INTO wallet_events
       (user_id, event_type, amount, balance_after, reference_type, reference_id, metadata)
     VALUES ($1, 'reseller_sub_sale', $2, $3, 'reseller_sale', $4, $5)`,
    [
      resellerUserId,
      split.subResellerPayout,
      subWalletResult.rows[0].current_balance,
      sale.id,
      JSON.stringify({
        retailPrice: split.retailPrice,
        platformFee: split.platformFeeAmount,
        resellerPool: split.resellerPool,
        sharePercent: split.subSharePercent,
        paymentId,
      }),
    ]
  );

  /* 4. Credit parent wallet (if applicable) */
  if (parentUserId && split.parentResellerPayout > 0) {
    const parentWalletResult = await client.query(
      `UPDATE affiliate_wallets
       SET total_earned = total_earned + $2,
           current_balance = current_balance + $2,
           updated_at = NOW()
       WHERE user_id = $1
       RETURNING current_balance`,
      [parentUserId, split.parentResellerPayout]
    );

    await client.query(
      `INSERT INTO wallet_events
         (user_id, event_type, amount, balance_after, reference_type, reference_id, metadata)
       VALUES ($1, 'reseller_parent_bonus', $2, $3, 'reseller_sale', $4, $5)`,
      [
        parentUserId,
        split.parentResellerPayout,
        parentWalletResult.rows[0].current_balance,
        sale.id,
        JSON.stringify({
          retailPrice: split.retailPrice,
          parentSharePercent: 100 - split.subSharePercent,
          subResellerUserId: resellerUserId,
          paymentId,
        }),
      ]
    );
  }

  return sale;
};

module.exports = {
  computeSplit,
  recordSale,
};