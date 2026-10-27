/**
 * @fileoverview Social Proof Finance Booster
 *
 * Enriches the existing seeded student base with realistic money activity:
 *   - Level commissions (1-4) for every approved payment, traced through
 *     the referral tree (idempotent: skips already-commissioned payments)
 *   - Direct-referral bonuses for users who hit configured tiers
 *   - Recomputed wallet balances (earned / withdrawn / pending / available)
 *   - Paid withdrawal history + pending requests for the admin queue
 *   - Monthly stats + platform monthly totals so admin analytics look alive
 *   - Paying-counter backfill (paying_direct_count / paying_team_size)
 *
 * Safety:
 *   - Single transaction with SAVEPOINTs per record
 *   - Tagged withdrawal rows ('Seeded%') are replaceable on re-run
 *   - Loud error handlers: this script can never die silently
 *   - Generates realistic Ethiopian bank accounts and phone numbers
 *
 * Usage:
 *   node scripts/seed-realistic-activity.js
 *
 * Path: scripts/seed-realistic-activity.js
 */

process.on('uncaughtException', (err) => {
  console.error('\n❌ UNCAUGHT EXCEPTION:', err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('\n❌ UNHANDLED REJECTION:', err && err.message ? err.message : err);
  process.exit(1);
});

require('dotenv').config({
  path: require('path').join(__dirname, '..', 'apps', 'api', '.env'),
});

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL missing. Check apps/api/.env exists.');
  process.exit(1);
}

const { Pool } = require('pg');

const loadReferralConfig = () => {
  try {
    return require('../packages/shared/config/referrals.config');
  } catch {
    return require('../packages/shared/config/defaults.config').referrals;
  }
};

const referralConfig = loadReferralConfig();
const LEVEL_AMOUNTS = referralConfig.commissionStructure.levelAmounts;
const MAX_LEVELS = referralConfig.commissionStructure.maxLevels;
const DIRECT_BONUS_TIERS = [...referralConfig.bonuses.directReferral.tiers].sort(
  (a, b) => b.requirement - a.requirement
);
const WITHDRAWAL_METHODS = referralConfig.withdrawal.methods;
const MIN_WITHDRAWAL = referralConfig.withdrawal.minimumAmountETB;

const ETHIOPIAN_BANKS = [
  'Commercial Bank of Ethiopia', 'Awash Bank', 'Dashen Bank', 'Bank of Abyssinia',
  'Abyssinia Bank', 'United Bank', 'Zemen Bank', 'Nib International Bank',
  'Oromia International Bank', 'Cooperative Bank of Oromia', 'Bunna Bank', 'Berhan Bank',
];

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const daysAgoDate = (maxDays) => new Date(Date.now() - Math.random() * maxDays * 24 * 60 * 60 * 1000);
const monthKey = (date) => {
  const d = new Date(date);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
};
const roundDown100 = (value) => Math.floor(value / 100) * 100;

const generateAccountNumber = (method, userPhone) => {
  if (method === 'bank-transfer') return `1000${Math.floor(100000000 + Math.random() * 900000000)}`;
  if (userPhone && userPhone.startsWith('09')) return userPhone;
  return `09${Math.floor(10000000 + Math.random() * 90000000)}`;
};

const generateBankName = (method) => method === 'bank-transfer' ? pick(ETHIOPIAN_BANKS) : null;

const main = async () => {
  console.log('💰 Starting Social Proof Finance Booster...\n');
  const client = await pool.connect();

  let commissionsCreated = 0;
  let bonusesCreated = 0;
  let walletsUpdated = 0;
  let withdrawalsCreated = 0;
  const monthlyStats = new Map();
  const platformMonthly = new Map();
  const sectionErrors = [];

  const bumpMonthly = (userId, month, commission, bonus) => {
    const key = `${userId}|${month}`;
    const entry = monthlyStats.get(key) || { commission: 0, bonus: 0 };
    entry.commission += commission;
    entry.bonus += bonus;
    monthlyStats.set(key, entry);
    const platformEntry = platformMonthly.get(month) || 0;
    platformMonthly.set(month, platformEntry + commission + bonus);
  };

  try {
    await client.query('BEGIN');

    console.log('🔄 Backfilling paying counters...');
    await client.query(`
      UPDATE users u SET paying_direct_count = COALESCE(sub.paying_direct, 0), paying_team_size = COALESCE(sub.paying_team, 0)
      FROM (
        SELECT rt.ancestor_id AS user_id,
               COUNT(*) FILTER (WHERE rt.depth = 1) AS paying_direct,
               COUNT(*) FILTER (WHERE rt.depth > 1 AND rt.depth <= $1) AS paying_team
        FROM referral_tree rt JOIN payments p ON p.user_id = rt.descendant_id AND p.status = 'approved'
        GROUP BY rt.ancestor_id
      ) AS sub WHERE u.id = sub.user_id
    `, [MAX_LEVELS]);

    console.log('💸 Seeding level commissions...');
    const payments = await client.query(`SELECT id, user_id, amount, paid_at, created_at FROM payments WHERE status = 'approved'`);
    const paymentIds = payments.rows.map((r) => r.id);
    const existing = await client.query(`SELECT payment_id, level FROM affiliate_commissions WHERE payment_id = ANY($1::uuid[])`, [paymentIds]);
    const existingKeys = new Set(existing.rows.map((r) => `${r.payment_id}:${r.level}`));

    for (const payment of payments.rows) {
      await client.query('SAVEPOINT commission_payment');
      try {
        const ancestors = await client.query(`
          SELECT ancestor_id, depth FROM referral_tree WHERE descendant_id = $1 AND depth <= $2 ORDER BY depth ASC
        `, [payment.user_id, MAX_LEVELS]);

        const paidAt = new Date(payment.paid_at || payment.created_at);

        for (const ancestor of ancestors.rows) {
          const levelIndex = ancestor.depth - 1;
          const amount = LEVEL_AMOUNTS[levelIndex] || 0;
          if (amount <= 0) continue;
          const key = `${payment.id}:${ancestor.depth}`;
          if (existingKeys.has(key)) continue;

          /* FIX: Compute unlock_at precisely 7 days after the back-dated paidAt timestamp */
          const unlockAt = new Date(paidAt.getTime() + 7 * 24 * 60 * 60 * 1000);
          
          /* FIX: tier_at_time is an INTEGER, passing 1 instead of 'bronze' */
          const inserted = await client.query(
            `INSERT INTO affiliate_commissions
               (earning_user_id, source_user_id, payment_id, level,
                tier_at_time, tier_percent_at_time, sale_amount,
                commission_amount, status, created_at, unlock_at)
             VALUES ($1, $2, $3, $4, 1, 10, $5, $6, 'credited', $7, $8)
             RETURNING id`,
            [ancestor.ancestor_id, payment.user_id, payment.id, ancestor.depth,
             payment.amount, amount, paidAt, unlockAt]
          );

          existingKeys.add(key);
          commissionsCreated += 1;
          bumpMonthly(ancestor.ancestor_id, monthKey(paidAt), amount, 0);
        }
        await client.query('RELEASE SAVEPOINT commission_payment');
      } catch (err) {
        await client.query('ROLLBACK TO SAVEPOINT commission_payment');
        sectionErrors.push(`commission ${payment.id}: ${err.message}`);
      }
    }
    console.log(`✅ Commissions created: ${commissionsCreated}`);

    console.log('🏆 Seeding milestone bonuses...');
    for (const tier of DIRECT_BONUS_TIERS) {
      const candidates = await client.query(`SELECT id FROM users WHERE paying_direct_count >= $1`, [tier.requirement]);
      for (const candidate of candidates.rows) {
        const already = await client.query(`
          SELECT 1 FROM referral_bonuses WHERE user_id = $1 AND bonus_category = 'direct_referral' AND requirement_met = $2 LIMIT 1
        `, [candidate.id, tier.requirement]);
        if (already.rows.length > 0) continue;

        await client.query('SAVEPOINT bonus_row');
        try {
          const awardedAt = Math.random() < 0.2 ? daysAgoDate(5) : daysAgoDate(45);
          const unlockAt = new Date(awardedAt.getTime() + 7 * 24 * 60 * 60 * 1000);

          await client.query(
            `INSERT INTO referral_bonuses
               (user_id, bonus_category, bonus_name, requirement_met, amount, period, status, awarded_at, unlock_at)
             VALUES ($1, 'direct_referral', $2, $3, $4, NULL, 'credited', $5, $6) RETURNING id`,
            [candidate.id, tier.name, tier.requirement, tier.amountETB, awardedAt, unlockAt]
          );
          bonusesCreated += 1;
          bumpMonthly(candidate.id, monthKey(awardedAt), 0, tier.amountETB);
          await client.query('RELEASE SAVEPOINT bonus_row');
        } catch (err) {
          await client.query('ROLLBACK TO SAVEPOINT bonus_row');
          sectionErrors.push(`bonus ${candidate.id}: ${err.message}`);
        }
      }
    }
    console.log(`✅ Bonuses created: ${bonusesCreated}`);

    console.log('🏦 Rebuilding withdrawal history...');
    await client.query(`DELETE FROM withdrawal_requests WHERE admin_note LIKE 'Seeded%'`);

    console.log('💼 Recomputing wallets & generating realistic account numbers...');
    const earnedRows = await client.query(`
      SELECT user_id, COALESCE(SUM(earned), 0)::numeric AS earned, COALESCE(SUM(locked), 0)::numeric AS locked
      FROM (
        SELECT earning_user_id AS user_id, commission_amount AS earned,
               CASE WHEN unlock_at > NOW() THEN commission_amount ELSE 0 END AS locked
        FROM affiliate_commissions WHERE status = 'credited'
        UNION ALL
        SELECT user_id, amount AS earned, CASE WHEN unlock_at > NOW() THEN amount ELSE 0 END AS locked
        FROM referral_bonuses WHERE status = 'credited'
      ) AS money GROUP BY user_id
    `);

    for (const row of earnedRows.rows) {
      const earned = parseFloat(row.earned);
      if (earned <= 0) continue;
      const locked = parseFloat(row.locked);
      const available = Math.max(0, earned - locked);

      let withdrawn = available >= MIN_WITHDRAWAL ? roundDown100(available * (randomInt(50, 85) / 100)) : 0;
      if (withdrawn > 0 && withdrawn < MIN_WITHDRAWAL) withdrawn = 0;

      let pending = 0;
      const remainingAfterWithdraw = available - withdrawn;
      if (remainingAfterWithdraw >= MIN_WITHDRAWAL && Math.random() < 0.12) {
        pending = Math.min(roundDown100(remainingAfterWithdraw * 0.4), remainingAfterWithdraw);
        if (pending < MIN_WITHDRAWAL) pending = 0;
      }

      const currentBalance = earned - withdrawn - pending;

      await client.query(
        `UPDATE affiliate_wallets SET total_earned = $1, total_withdrawn = $2, current_balance = $3, pending_withdrawal = $4, debt_balance = 0, updated_at = NOW() WHERE user_id = $5`,
        [earned, withdrawn, currentBalance, pending, row.user_id]
      );
      walletsUpdated += 1;

      await client.query(`UPDATE users SET lifetime_referral_earnings = $1 WHERE id = $2`, [earned, row.user_id]);

      const userRow = await client.query(`SELECT full_name, phone FROM users WHERE id = $1`, [row.user_id]);
      const userName = userRow.rows[0]?.full_name || 'Unknown User';
      const userPhone = userRow.rows[0]?.phone || null;

      let left = withdrawn;
      const slices = left >= MIN_WITHDRAWAL * 3 ? randomInt(2, 3) : 1;
      for (let i = 0; i < slices && left >= MIN_WITHDRAWAL; i++) {
        const isLast = i === slices - 1;
        const amount = isLast ? left : Math.min(left - MIN_WITHDRAWAL, roundDown100(left / (slices - i)) || MIN_WITHDRAWAL);
        if (amount < MIN_WITHDRAWAL) break;

        const method = pick(WITHDRAWAL_METHODS);
        const accountNumber = generateAccountNumber(method, userPhone);
        const bankName = generateBankName(method);
        const createdAt = daysAgoDate(40);
        const processedAt = new Date(createdAt.getTime() + randomInt(4, 30) * 60 * 60 * 1000);

        await client.query(
          `INSERT INTO withdrawal_requests
             (user_id, amount, method, account_number, account_name, bank_name, status, created_at, processed_at, admin_note, transaction_ref)
           VALUES ($1, $2, $3, $4, $5, $6, 'paid', $7, $8, $9, $10)`,
          [row.user_id, amount, method, accountNumber, userName, bankName, createdAt, processedAt, 'Seeded payout — verified', `TXN-${randomInt(100000, 999999)}`]
        );
        withdrawalsCreated += 1;
        left -= amount;
      }

      if (pending > 0) {
        const method = pick(WITHDRAWAL_METHODS);
        const accountNumber = generateAccountNumber(method, userPhone);
        const bankName = generateBankName(method);

        await client.query(
          `INSERT INTO withdrawal_requests
             (user_id, amount, method, account_number, account_name, bank_name, status, created_at, admin_note)
           VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8)`,
          [row.user_id, pending, method, accountNumber, userName, bankName, daysAgoDate(2), 'Seeded — awaiting verification']
        );
        withdrawalsCreated += 1;
      }
    }
    console.log(`✅ Wallets updated: ${walletsUpdated}`);
    console.log(`✅ Withdrawal rows created: ${withdrawalsCreated}`);

    console.log('📊 Upserting monthly stats...');
    for (const [key, value] of monthlyStats.entries()) {
      const [userId, month] = key.split('|');
      const payout = value.commission + value.bonus;
      await client.query(
        `INSERT INTO referral_monthly_stats (user_id, month, total_commission, total_bonus, total_payout)
         VALUES ($1, $2, $3, $4, $5) ON CONFLICT (user_id, month) DO UPDATE
         SET total_commission = referral_monthly_stats.total_commission + $3,
             total_bonus = referral_monthly_stats.total_bonus + $4,
             total_payout = referral_monthly_stats.total_payout + $5, updated_at = NOW()`,
        [userId, month, value.commission, value.bonus, payout]
      );
    }

    for (const [month, total] of platformMonthly.entries()) {
      await client.query(
        `INSERT INTO referral_platform_monthly (month, total_payout) VALUES ($1, $2)
         ON CONFLICT (month) DO UPDATE SET total_payout = referral_platform_monthly.total_payout + $2, updated_at = NOW()`,
        [month, total]
      );
    }

    await client.query('COMMIT');

    console.log('\n🎉 Finance booster completed successfully!');
    console.log('──────────────────────────────────────────');
    console.log(`   💸 Commissions:      ${commissionsCreated}`);
    console.log(`   🏆 Bonuses:          ${bonusesCreated}`);
    console.log(`   💼 Wallets:          ${walletsUpdated}`);
    console.log(`   🏦 Withdrawals:      ${withdrawalsCreated}`);
    console.log(`   📊 Monthly stat rows:${monthlyStats.size}`);

    if (sectionErrors.length > 0) {
      console.log(`\n⚠️  Skipped ${sectionErrors.length} record(s) due to errors:`);
      sectionErrors.slice(0, 5).forEach((e) => console.log(`   - ${e}`));
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Booster failed:', error.message);
    console.error(error.stack);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

main();