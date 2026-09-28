/**
 * @fileoverview MLM Commission Distribution (Money Model v2)
 *
 * Walks the buyer's ancestors up to maxLevels and credits each a fixed
 * amount per level. Enforces:
 *   - Idempotency (skips if any commission already exists for the payment)
 *   - Per-sale cap (sum cannot exceed maxTotalPerSaleETB)
 *   - Per-user monthly cap (excess is silently dropped)
 *   - Platform monthly cap (distribution stops if exceeded)
 *
 * Money Model v2 additions:
 *   - On the buyer's FIRST approved payment, increments the paying
 *     counters (paying_direct_count for depth-1, paying_team_size for
 *     depth 2-4) of all ancestors within maxLevels.
 *   - On refund, decrements those same counters if the refunded payment
 *     was the buyer's only approved payment, and reverses any locked
 *     bonuses tied to this payment.
 *
 * Database-agnostic: all SQL is inlined. Consumers inject a `db` object
 * providing query() and getClient() so this module runs identically on
 * the Express server and inside Next.js API routes.
 *
 * Path: packages/shared/mlm/commissions.js
 */

const { formatMonthKey, computeUserTier } = require('./helpers');
const { BadRequestError } = require('./errors');

/**
 * Distribute commissions for an approved payment.
 *
 * @param {object} db - { query, getClient }
 * @param {object} config - Referrals config object
 * @param {string} buyerUserId - UUID of the buyer
 * @param {string} paymentId - UUID of the approved payment
 * @param {number} saleAmount - Amount the buyer actually paid
 * @returns {Promise<{distributed: number, totalCommission: number, month?: string, reason?: string, firstPayment?: boolean}>}
 */
const distributeCommissions = async (db, config, buyerUserId, paymentId, saleAmount) => {
  if (!db || typeof db.query !== 'function' || typeof db.getClient !== 'function') {
    throw new BadRequestError('A valid db object with query and getClient is required.');
  }
  if (!config || !config.commissionStructure) {
    throw new BadRequestError('Referrals config is missing commissionStructure.');
  }
  if (!buyerUserId || !paymentId || !saleAmount || saleAmount <= 0) {
    throw new BadRequestError('buyerUserId, paymentId, and a positive saleAmount are required.');
  }

  const { maxLevels, levelAmounts } = config.commissionStructure;
  const maxTotalPerSaleETB =
    config.commissionStructure.maxTotalPerSaleETB ?? config.caps.maxTotalPerSaleETB;
  const { maxTotalPayoutPerUserPerMonthETB, maxTotalPayoutPlatformPerMonthETB } = config.caps;
  const currentMonth = formatMonthKey();

  /* Idempotency check — cheap read, no transaction. */
  const existingResult = await db.query(
    'SELECT 1 FROM affiliate_commissions WHERE payment_id = $1 LIMIT 1',
    [paymentId]
  );
  if (existingResult.rows.length > 0) {
    return { distributed: 0, totalCommission: 0, reason: 'already_distributed' };
  }

  /*
   * Money Model v2: determine whether this is the buyer's first approved
   * payment BEFORE opening the transaction. Count OTHER approved payments
   * (excluding this one) — if zero, it's the first. Only the first
   * payment increments ancestors' paying counters.
   */
  const otherPaymentsResult = await db.query(
    `SELECT COUNT(*)::int AS count
     FROM payments
     WHERE user_id = $1 AND status = 'approved' AND id != $2`,
    [buyerUserId, paymentId]
  );
  const isFirstPayment = otherPaymentsResult.rows[0].count === 0;

  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    /* Fetch ancestors ordered by depth. */
    const ancestorsResult = await client.query(
      `SELECT ancestor_id, depth FROM referral_tree
       WHERE descendant_id = $1 AND depth <= $2
       ORDER BY depth ASC`,
      [buyerUserId, maxLevels]
    );

    if (ancestorsResult.rows.length === 0) {
      await client.query('COMMIT');
      return {
        distributed: 0,
        totalCommission: 0,
        reason: 'no_ancestors',
        firstPayment: isFirstPayment,
      };
    }

    /* Platform monthly cap check. */
    const platformResult = await client.query(
      `SELECT COALESCE(total_payout, 0)::numeric AS total
       FROM referral_platform_monthly WHERE month = $1`,
      [currentMonth]
    );
    const platformTotal = platformResult.rows[0]
      ? parseFloat(platformResult.rows[0].total)
      : 0;

    if (platformTotal >= maxTotalPayoutPlatformPerMonthETB) {
      await client.query('COMMIT');
      return {
        distributed: 0,
        totalCommission: 0,
        reason: 'platform_cap_reached',
        firstPayment: isFirstPayment,
      };
    }

    let totalCommission = 0;
    let distributedCount = 0;
    let totalCreditedToPlatform = 0;

    for (const ancestor of ancestorsResult.rows) {
      const levelIndex = ancestor.depth - 1;
      let amount = levelAmounts[levelIndex] || 0;
      if (amount <= 0) continue;

      /* Per-sale cap. */
      const remainingPerSale = maxTotalPerSaleETB - totalCommission;
      if (remainingPerSale <= 0) break;
      if (amount > remainingPerSale) amount = remainingPerSale;

      /* Per-user monthly cap. */
      const monthlyResult = await client.query(
        `SELECT COALESCE(total_payout, 0)::numeric AS total
         FROM referral_monthly_stats
         WHERE user_id = $1 AND month = $2`,
        [ancestor.ancestor_id, currentMonth]
      );
      const userMonthTotal = monthlyResult.rows[0]
        ? parseFloat(monthlyResult.rows[0].total)
        : 0;
      const userRemaining = maxTotalPayoutPerUserPerMonthETB - userMonthTotal;
      if (userRemaining <= 0) continue;
      if (amount > userRemaining) amount = userRemaining;

      /* Platform monthly cap (rolling). */
      const platformRemaining =
        maxTotalPayoutPlatformPerMonthETB - platformTotal - totalCreditedToPlatform;
      if (platformRemaining <= 0) break;
      if (amount > platformRemaining) amount = platformRemaining;

      if (amount <= 0) continue;

      const { tier, percent } = computeUserTier();

      /* Ensure + lock wallet. */
      await client.query(
        `INSERT INTO affiliate_wallets (user_id) VALUES ($1)
         ON CONFLICT (user_id) DO NOTHING`,
        [ancestor.ancestor_id]
      );
      await client.query(
        'SELECT id FROM affiliate_wallets WHERE user_id = $1 FOR UPDATE',
        [ancestor.ancestor_id]
      );

      /* Insert commission row. */
      await client.query(
        `INSERT INTO affiliate_commissions
           (earning_user_id, source_user_id, payment_id, level,
            tier_at_time, tier_percent_at_time, sale_amount, commission_amount, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'credited')`,
        [
          ancestor.ancestor_id,
          buyerUserId,
          paymentId,
          ancestor.depth,
          tier,
          percent,
          saleAmount,
          amount,
        ]
      );

      /* Wallet deltas. */
      await client.query(
        `UPDATE affiliate_wallets
         SET total_earned    = total_earned + $2,
             current_balance = current_balance + $2,
             updated_at      = NOW()
         WHERE user_id = $1`,
        [ancestor.ancestor_id, amount]
      );

      /* Lifetime earnings counter on users. */
      await client.query(
        `UPDATE users
         SET lifetime_referral_earnings = lifetime_referral_earnings + $2,
             updated_at = NOW()
         WHERE id = $1`,
        [ancestor.ancestor_id, amount]
      );

      /* Monthly stats UPSERT. */
      await client.query(
        `INSERT INTO referral_monthly_stats (user_id, month, total_commission, total_bonus, total_payout)
         VALUES ($1, $2, $3, 0, $3)
         ON CONFLICT (user_id, month) DO UPDATE
         SET total_commission = referral_monthly_stats.total_commission + $3,
             total_payout     = referral_monthly_stats.total_payout + $3,
             updated_at       = NOW()`,
        [ancestor.ancestor_id, currentMonth, amount]
      );

      totalCommission += amount;
      totalCreditedToPlatform += amount;
      distributedCount += 1;
    }

    /* Platform monthly UPSERT. */
    if (totalCreditedToPlatform > 0) {
      await client.query(
        `INSERT INTO referral_platform_monthly (month, total_payout)
         VALUES ($1, $2)
         ON CONFLICT (month) DO UPDATE
         SET total_payout = referral_platform_monthly.total_payout + $2,
             updated_at   = NOW()`,
        [currentMonth, totalCreditedToPlatform]
      );
    }

    /*
     * Money Model v2: on the buyer's first approved payment, increment
     * paying counters for all ancestors within maxLevels.
     *   depth 1 → paying_direct_count (direct referrer only)
     *   depth 2-4 → paying_team_size
     *
     * These counters gate bonus eligibility in bonuses.js.
     */
    if (isFirstPayment) {
      for (const ancestor of ancestorsResult.rows) {
        if (ancestor.depth === 1) {
          await client.query(
            `UPDATE users
             SET paying_direct_count = paying_direct_count + 1,
                 updated_at = NOW()
             WHERE id = $1`,
            [ancestor.ancestor_id]
          );
        } else {
          await client.query(
            `UPDATE users
             SET paying_team_size = paying_team_size + 1,
                 updated_at = NOW()
             WHERE id = $1`,
            [ancestor.ancestor_id]
          );
        }
      }
    }

    await client.query('COMMIT');

    return {
      distributed: distributedCount,
      totalCommission,
      month: currentMonth,
      firstPayment: isFirstPayment,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Reverse all commissions tied to a payment. Used when a refund is
 * issued within the 7-day unlock window (or by admin override).
 *
 * Money Model v2 additions over the v1 logic:
 *   - Decrements paying counters for ancestors if the refunded payment
 *     was the buyer's only approved payment.
 *   - Reverses all locked bonuses tied to this payment (filtered to
 *     ancestors, credited, and still-locked) and decrements wallets.
 *
 * Idempotent: only reverses rows currently marked 'credited'.
 *
 * @param {object} db - { query, getClient }
 * @param {string} paymentId
 * @param {string} reason
 * @returns {Promise<object>}
 */
const reverseCommissionsForPayment = async (db, paymentId, reason) => {
  if (!db || typeof db.query !== 'function' || typeof db.getClient !== 'function') {
    throw new BadRequestError('A valid db object with query and getClient is required.');
  }
  if (!paymentId) {
    throw new BadRequestError('paymentId is required.');
  }

  /* Find the buyer and check if this was their only approved payment. */
  const paymentInfo = await db.query(
    'SELECT user_id FROM payments WHERE id = $1',
    [paymentId]
  );
  const buyerId = paymentInfo.rows.length > 0 ? paymentInfo.rows[0].user_id : null;

  let wasOnlyApprovedPayment = false;
  if (buyerId) {
    const otherPayments = await db.query(
      `SELECT COUNT(*)::int AS count
       FROM payments
       WHERE user_id = $1 AND status = 'approved' AND id != $2`,
      [buyerId, paymentId]
    );
    wasOnlyApprovedPayment = otherPayments.rows[0].count === 0;
  }

  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const rowsResult = await client.query(
      `SELECT id, earning_user_id, commission_amount, created_at
       FROM affiliate_commissions
       WHERE payment_id = $1 AND status = 'credited'
       FOR UPDATE`,
      [paymentId]
    );

    let totalReversed = 0;

    for (const row of rowsResult.rows) {
      const amount = parseFloat(row.commission_amount);
      const monthKey = formatMonthKey(new Date(row.created_at));

      /* Mark reversed. */
      await client.query(
        `UPDATE affiliate_commissions
         SET status = 'reversed', reversed_at = NOW(), reversal_reason = $2
         WHERE id = $1`,
        [row.id, reason || 'admin_reversal']
      );

      /* Lock wallet. */
      const walletResult = await client.query(
        `SELECT current_balance, debt_balance
         FROM affiliate_wallets WHERE user_id = $1 FOR UPDATE`,
        [row.earning_user_id]
      );

      const wallet = walletResult.rows[0];
      if (wallet) {
        const balance = parseFloat(wallet.current_balance);
        const deductFromBalance = Math.min(balance, amount);
        const shortfall = amount - deductFromBalance;

        await client.query(
          `UPDATE affiliate_wallets
           SET current_balance = current_balance - $2,
               debt_balance    = debt_balance + $3,
               total_earned    = GREATEST(0, total_earned - $4),
               updated_at      = NOW()
           WHERE user_id = $1`,
          [row.earning_user_id, deductFromBalance, shortfall, amount]
        );
      }

      /* Reduce monthly stats for the earning user. */
      await client.query(
        `UPDATE referral_monthly_stats
         SET total_commission = GREATEST(0, total_commission - $3),
             total_payout     = GREATEST(0, total_payout - $3),
             updated_at       = NOW()
         WHERE user_id = $1 AND month = $2`,
        [row.earning_user_id, monthKey, amount]
      );

      totalReversed += amount;
    }

    /* Reduce platform monthly total. */
    if (totalReversed > 0) {
      const monthKey = formatMonthKey();
      await client.query(
        `UPDATE referral_platform_monthly
         SET total_payout = GREATEST(0, total_payout - $2),
             updated_at   = NOW()
         WHERE month = $1`,
        [monthKey, totalReversed]
      );
    }

    /*
     * Money Model v2: decrement paying counters for ancestors if the
     * refunded payment was the buyer's only approved payment.
     * Only affects ancestors within maxLevels (commission range).
     */
    let payingCountersDecremented = 0;
    if (buyerId && wasOnlyApprovedPayment) {
      const ancestors = await client.query(
        `SELECT ancestor_id, depth FROM referral_tree
         WHERE descendant_id = $1 AND depth <= 4
         ORDER BY depth ASC`,
        [buyerId]
      );

      for (const ancestor of ancestors.rows) {
        if (ancestor.depth === 1) {
          await client.query(
            `UPDATE users
             SET paying_direct_count = GREATEST(0, paying_direct_count - 1),
                 updated_at = NOW()
             WHERE id = $1`,
            [ancestor.ancestor_id]
          );
        } else {
          await client.query(
            `UPDATE users
             SET paying_team_size = GREATEST(0, paying_team_size - 1),
                 updated_at = NOW()
             WHERE id = $1`,
            [ancestor.ancestor_id]
          );
        }
        payingCountersDecremented += 1;
      }
    }

    /*
     * Money Model v2: reverse all locked bonuses belonging to ancestors
     * of the refunded buyer. Only 'credited' AND still-locked rows are
     * reversed (unlock_at > NOW()). Once unlocked, bonuses are final.
     */
    let bonusesReversedAmount = 0;
    let bonusesReversedCount = 0;

    if (buyerId) {
      /* Collect ancestors of the buyer. */
      const ancestorsResult = await client.query(
        `SELECT DISTINCT ancestor_id FROM referral_tree WHERE descendant_id = $1`,
        [buyerId]
      );
      const ancestorIds = ancestorsResult.rows.map((r) => r.ancestor_id);

      if (ancestorIds.length > 0) {
        /* Reverse locked, credited bonuses. */
        const reversedBonuses = await client.query(
          `UPDATE referral_bonuses
           SET status = 'reversed',
               reversed_at = NOW(),
               reversal_reason = $2
           WHERE user_id = ANY($1::uuid[])
             AND status = 'credited'
             AND unlock_at > NOW()
           RETURNING id, user_id, amount, bonus_category`,
          [ancestorIds, reason || 'admin_reversal']
        );

        for (const bonus of reversedBonuses.rows) {
          const bonusAmount = parseFloat(bonus.amount);

          /* Lock wallet and decrement. */
          const walletResult = await client.query(
            `SELECT current_balance, debt_balance
             FROM affiliate_wallets WHERE user_id = $1 FOR UPDATE`,
            [bonus.user_id]
          );

          const wallet = walletResult.rows[0];
          if (wallet) {
            const balance = parseFloat(wallet.current_balance);
            const deductFromBalance = Math.min(balance, bonusAmount);
            const shortfall = bonusAmount - deductFromBalance;

            await client.query(
              `UPDATE affiliate_wallets
               SET current_balance = current_balance - $2,
                   debt_balance    = debt_balance + $3,
                   total_earned    = GREATEST(0, total_earned - $4),
                   updated_at      = NOW()
               WHERE user_id = $1`,
              [bonus.user_id, deductFromBalance, shortfall, bonusAmount]
            );
          }

          bonusesReversedAmount += bonusAmount;
          bonusesReversedCount += 1;
        }
      }
    }

    await client.query('COMMIT');

    return {
      reversed: rowsResult.rows.length,
      totalReversed,
      bonusesReversed: bonusesReversedCount,
      bonusesReversedAmount,
      payingCountersDecremented,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  distributeCommissions,
  reverseCommissionsForPayment,
};