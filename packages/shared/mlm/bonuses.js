/**
 * @fileoverview MLM Bonus Awarding (Money Model v2)
 *
 * Awards bonuses using the DELTA approach per category. Categories are
 * independent — a user qualifies for all applicable category bonuses
 * simultaneously. Within a category only the highest achieved threshold
 * is credited (delta from the previous award).
 *
 * Gate resolution (robust to config versions):
 *   1. If the category defines `gate` in config, use it.
 *   2. Otherwise fall back to category semantics:
 *        directReferral / speedBonus → paying_direct
 *        milestone / rank / teamBonus → paying_team
 *   This keeps the engine correct whether or not the live config file
 *   has been upgraded with explicit gate fields yet.
 *
 * Paying gate:
 *   When config.bonuses.payingGate is true (default), eligibility counts
 *   come from paying_direct_count / paying_team_size — descendants who
 *   have made at least one approved payment. Registration farms earn
 *   nothing. When false, structural counters are used (legacy behavior).
 *
 * Locks:
 *   Inserted bonus rows carry unlock_at = NOW() + unlockDelayDays and
 *   status = 'credited'. Wallet credit lands in current_balance; the
 *   withdrawable formula subtracts locked rows until unlock.
 *
 * Path: packages/shared/mlm/bonuses.js
 */

const { formatMonthKey, selectBonusDelta } = require('./helpers');
const { BadRequestError, NotFoundError } = require('./errors');

/**
 * Resolve the gate for a category: explicit config first, semantics second.
 *
 * @param {string} categoryKey - Key inside config.bonuses
 * @param {object} categoryConfig - Category definition
 * @returns {'paying_direct'|'paying_team'} Gate type
 */
const resolveGate = (categoryKey, categoryConfig) => {
  if (categoryConfig && categoryConfig.gate) return categoryConfig.gate;
  if (categoryKey === 'directReferral' || categoryKey === 'speedBonus') {
    return 'paying_direct';
  }
  return 'paying_team';
};

/**
 * Compute the speed-bonus monthly count: depth-1 descendants whose FIRST
 * approved payment falls inside the given calendar month.
 *
 * @param {object} db - { query, getClient }
 * @param {string} userId - Ancestor user UUID
 * @param {string} month - 'YYYY-MM'
 * @returns {Promise<number>} Count of first-time payers this month
 */
const getSpeedBonusMonthlyCount = async (db, userId, month) => {
  const descendantsResult = await db.query(
    `SELECT descendant_id FROM referral_tree
     WHERE ancestor_id = $1 AND depth = 1`,
    [userId]
  );
  if (descendantsResult.rows.length === 0) return 0;

  const descendantIds = descendantsResult.rows.map((row) => row.descendant_id);

  const monthStart = `${month}-01`;
  const [yearStr, monthStr] = month.split('-');
  let year = parseInt(yearStr, 10);
  let monthNum = parseInt(monthStr, 10);
  if (monthNum === 12) {
    monthNum = 1;
    year += 1;
  } else {
    monthNum += 1;
  }
  const monthEnd = `${year}-${String(monthNum).padStart(2, '0')}-01`;

  const result = await db.query(
    `SELECT COUNT(*)::int AS count FROM (
       SELECT user_id
       FROM payments
       WHERE user_id = ANY($1::uuid[])
         AND status = 'approved'
       GROUP BY user_id
       HAVING MIN(paid_at) >= $2::timestamptz
         AND MIN(paid_at) < $3::timestamptz
     ) AS first_payments_in_month`,
    [descendantIds, monthStart, monthEnd]
  );

  return result.rows[0].count || 0;
};

/**
 * Award all bonuses the user currently qualifies for.
 *
 * @param {object} db - { query, getClient }
 * @param {object} config - Referrals config object
 * @param {string} userId - User UUID
 * @returns {Promise<{awarded: Array<object>, skipped: number}>}
 */
const awardEligibleBonuses = async (db, config, userId) => {
  if (!db || typeof db.query !== 'function' || typeof db.getClient !== 'function') {
    throw new BadRequestError('A valid db object with query and getClient is required.');
  }
  if (!config || !config.bonuses) {
    throw new BadRequestError('Referrals config is missing bonuses.');
  }
  if (!userId) {
    throw new BadRequestError('userId is required.');
  }

  const { maxBonusPerUserPerMonthETB } = config.caps;
  const unlockDelayDays = (config.commissionStructure && config.commissionStructure.unlockDelayDays) || 7;
  const payingGateEnabled = config.bonuses.payingGate !== false;
  const currentMonth = formatMonthKey();

  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    /*
     * Counter selection: paying counters when the gate is on,
     * structural counters when explicitly disabled.
     */
    const userRow = payingGateEnabled
      ? await client.query(
          `SELECT paying_direct_count, paying_team_size FROM users WHERE id = $1`,
          [userId]
        )
      : await client.query(
          `SELECT direct_referral_count AS paying_direct_count,
                  total_team_size AS paying_team_size
           FROM users WHERE id = $1`,
          [userId]
        );

    if (userRow.rows.length === 0) {
      throw new NotFoundError('User not found.');
    }

    const payingDirectCount = userRow.rows[0].paying_direct_count || 0;
    const payingTeamCount = userRow.rows[0].paying_team_size || 0;

    /* Remaining bonus headroom for this calendar month. */
    const monthBonusResult = await client.query(
      `SELECT COALESCE(SUM(amount), 0)::numeric AS total
       FROM referral_bonuses
       WHERE user_id = $1
         AND TO_CHAR(awarded_at, 'YYYY-MM') = $2
         AND status = 'credited'`,
      [userId, currentMonth]
    );
    let monthlyRemaining =
      maxBonusPerUserPerMonthETB - parseFloat(monthBonusResult.rows[0].total);

    const awarded = [];
    let skipped = 0;

    /**
     * Evaluate one category: delta math, monthly cap, locked insert,
     * wallet credit, monthly stats upsert.
     *
     * @param {string} categoryKey - Key inside config.bonuses
     * @param {number} currentCount - Counter value to test tiers against
     */
    const processCategory = async (categoryKey, currentCount) => {
      const categoryConfig = config.bonuses[categoryKey];
      if (!categoryConfig || !Array.isArray(categoryConfig.tiers)) return;

      const { tiers, category, period } = categoryConfig;
      const effectivePeriod = period === 'monthly' ? currentMonth : null;

      /* Highest credited award already held in this category/period. */
      const lastAwardSql = effectivePeriod === null
        ? `SELECT requirement_met FROM referral_bonuses
           WHERE user_id = $1 AND bonus_category = $2
             AND period IS NULL AND status = 'credited'
           ORDER BY requirement_met DESC LIMIT 1`
        : `SELECT requirement_met FROM referral_bonuses
           WHERE user_id = $1 AND bonus_category = $2
             AND period = $3 AND status = 'credited'
           ORDER BY requirement_met DESC LIMIT 1`;
      const lastAwardParams = effectivePeriod === null
        ? [userId, category]
        : [userId, category, effectivePeriod];

      const lastAwardResult = await client.query(lastAwardSql, lastAwardParams);
      const lastRequirement = lastAwardResult.rows[0]
        ? lastAwardResult.rows[0].requirement_met
        : 0;

      const delta = selectBonusDelta(currentCount, tiers, lastRequirement);
      if (!delta || delta.deltaAmount <= 0) return;

      if (monthlyRemaining <= 0) {
        skipped += 1;
        return;
      }
      const amountToCredit = Math.min(delta.deltaAmount, monthlyRemaining);

      /* Ensure + lock wallet. */
      await client.query(
        `INSERT INTO affiliate_wallets (user_id) VALUES ($1)
         ON CONFLICT (user_id) DO NOTHING`,
        [userId]
      );
      await client.query(
        'SELECT id FROM affiliate_wallets WHERE user_id = $1 FOR UPDATE',
        [userId]
      );

      /*
       * Insert the bonus row with its 7-day lock and credited status.
       * The UNIQUE constraint guards against double awards.
       */
      const insertResult = await client.query(
        `INSERT INTO referral_bonuses
           (user_id, bonus_category, bonus_name, requirement_met, amount,
            period, unlock_at, status)
         VALUES (
           $1, $2, $3, $4, $5, $6,
           NOW() + INTERVAL '${parseInt(unlockDelayDays, 10)} days',
           'credited'
         )
         ON CONFLICT (user_id, bonus_category, requirement_met, period) DO NOTHING
         RETURNING id`,
        [userId, category, delta.tierName, delta.newRequirement, amountToCredit, effectivePeriod]
      );

      if (insertResult.rows.length === 0) {
        skipped += 1;
        return;
      }

      /* Single-wallet credit: balance and lifetime earned both move. */
      await client.query(
        `UPDATE affiliate_wallets
         SET current_balance = current_balance + $2,
             total_earned    = total_earned + $2,
             updated_at      = NOW()
         WHERE user_id = $1`,
        [userId, amountToCredit]
      );

      /* Monthly stats upsert for cap accounting. */
      await client.query(
        `INSERT INTO referral_monthly_stats (user_id, month, total_commission, total_bonus, total_payout)
         VALUES ($1, $2, 0, $3, $3)
         ON CONFLICT (user_id, month) DO UPDATE
         SET total_bonus  = referral_monthly_stats.total_bonus + $3,
             total_payout = referral_monthly_stats.total_payout + $3,
             updated_at   = NOW()`,
        [userId, currentMonth, amountToCredit]
      );

      monthlyRemaining -= amountToCredit;
      awarded.push({
        category,
        name: delta.tierName,
        amount: amountToCredit,
        requirementMet: delta.newRequirement,
      });
    };

    /*
     * Iterate every configured category, resolving its gate and counter.
     * Object.entries skips the payingGate boolean automatically because
     * it is not an object with tiers.
     */
    for (const [categoryKey, categoryConfig] of Object.entries(config.bonuses)) {
      if (!categoryConfig || typeof categoryConfig !== 'object' || !categoryConfig.category) {
        continue;
      }

      const gate = resolveGate(categoryKey, categoryConfig);
      let currentCount;

      if (gate === 'paying_direct' && categoryConfig.period === 'monthly') {
        currentCount = await getSpeedBonusMonthlyCount(db, userId, currentMonth);
      } else if (gate === 'paying_direct') {
        currentCount = payingDirectCount;
      } else {
        currentCount = payingTeamCount;
      }

      await processCategory(categoryKey, currentCount);
    }

    await client.query('COMMIT');
    return { awarded, skipped };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  awardEligibleBonuses,
  getSpeedBonusMonthlyCount,
};