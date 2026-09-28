/**
 * @fileoverview MLM Full-Network Seeder for Browser Verification
 *
 * Builds a realistic 4-level referral network, runs real purchases
 * through the production shared MLM module, awards bonuses, unlocks
 * commissions (back-dates the 7-day lock) so withdrawals can be tested
 * immediately, and plants sample withdrawal requests for the admin queue.
 *
 * Network topology (default branching 5 / 2 / 2 / 1):
 *   A (root)
 *   ├── 5 direct referrals (Level 1)
 *   │   ├── 2 each (Level 2)  → 10 users
 *   │   │   ├── 2 each (Level 3) → 20 users
 *   │   │   │   └── 1 each (Level 4) → 20 users
 *   Total: 56 users, every one purchases the full course.
 *
 * What gets created:
 *   - 56 users + wallets + referral tree (real buildReferralTree)
 *   - 56 approved payments + real distributeCommissions runs
 *   - Bonuses via real awardEligibleBonuses (A hits 5-direct + 50-team)
 *   - Commissions UNLOCKED (back-dated) so withdrawals work today
 *   - 1 pending withdrawal (for admin approval UI)
 *   - 1 paid withdrawal (for history UI)
 *
 * Usage:
 *   node tools/mlm-seed.js seed            # build everything, unlocked
 *   node tools/mlm-seed.js seed --locked   # keep the 7-day lock intact
 *   node tools/mlm-seed.js report          # dump current test state
 *   node tools/mlm-seed.js clean           # delete ALL test data
 *
 * Login for every test user: password MlmTest@123!
 * Test fingerprint: phone prefix 99900 / email @test.abyssinia.local
 *
 * Path: tools/mlm-seed.js
 */

const path = require('path');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

require('dotenv').config({ path: path.join(__dirname, '..', 'apps', 'api', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const sharedConfig = require('../packages/shared/config');
const mlm = require('../packages/shared/mlm');
const referralConfig = sharedConfig.referrals;
const paymentsConfig = sharedConfig.payments;

const TEST_PASSWORD = 'MlmTest@123!';
const TEST_PASSWORD_HASH = bcrypt.hashSync(TEST_PASSWORD, 10);
const TEST_PHONE_PREFIX = '99900';
const TEST_EMAIL_DOMAIN = 'test.abyssinia.local';

/* Branching factors per depth: L1=5, L2=2 each, L3=2 each, L4=1 each */
const BRANCHING = [5, 2, 2, 1];

const FULL_PRICE = paymentsConfig.pricing.fullCourse.amountETB;
const REFERRED_PRICE = paymentsConfig.pricing.fullCourse.referredAmountETB;
const MIN_WITHDRAWAL = referralConfig.withdrawal.minimumAmountETB;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
});

const db = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};

let phoneSeq = 0;

/* ============================================================================
 * BUILDERS
 * ========================================================================== */

/**
 * Creates one tagged test user with wallet.
 *
 * @param {string} name - Display name
 * @returns {Promise<object>} { id, name, phone }
 */
const createTestUser = async (name) => {
  phoneSeq += 1;
  const phone = `${TEST_PHONE_PREFIX}${String(phoneSeq).padStart(5, '0')}`;
  const email = `mlmtest+${phoneSeq}@${TEST_EMAIL_DOMAIN}`;

  const result = await pool.query(
    `INSERT INTO users (full_name, phone, email, password)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [name, phone, email, TEST_PASSWORD_HASH]
  );

  await pool.query(
    `INSERT INTO affiliate_wallets (user_id) VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING`,
    [result.rows[0].id]
  );

  return { id: result.rows[0].id, name, phone };
};

/**
 * Builds the full 4-level network via the real tree builder.
 *
 * @returns {Promise<Array>} Flat list of { id, name, depth, parentId }
 */
const buildNetwork = async () => {
  console.log('\n🏗️  Building 4-level network (56 users)...\n');

  const root = await createTestUser('Test Root A');
  const users = [{ ...root, depth: 0, parentId: null }];

  let currentLevel = [users[0]];

  for (let depth = 1; depth <= BRANCHING.length; depth++) {
    const nextLevel = [];
    const perParent = BRANCHING[depth - 1];

    for (const parent of currentLevel) {
      for (let i = 1; i <= perParent; i++) {
        const child = await createTestUser(`Test L${depth}-${parent.name.slice(-4)}-${i}`);
        await mlm.buildReferralTree(db, referralConfig, child.id, parent.id);
        const entry = { ...child, depth, parentId: parent.id };
        users.push(entry);
        nextLevel.push(entry);
      }
    }

    console.log(`   • Level ${depth}: ${nextLevel.length} users registered`);
    currentLevel = nextLevel;
  }

  console.log(`   • Total network: ${users.length} users`);
  return users;
};

/**
 * Creates an approved payment and runs the real commission distribution.
 *
 * @param {object} buyer - User entry
 * @param {number} seq - Payment sequence
 * @returns {Promise<object>} Distribution outcome
 */
const runPurchase = async (buyer, seq) => {
  const amount = buyer.depth > 0 ? REFERRED_PRICE : FULL_PRICE;

  const payment = await pool.query(
    `INSERT INTO payments (user_id, amount, method, status, reference, purchase_mode, paid_at)
     VALUES ($1, $2, 'telebirr', 'approved', $3, 'full-course', NOW())
     RETURNING id`,
    [buyer.id, amount, `MLMSEED-${String(seq).padStart(4, '0')}`]
  );

  return mlm.distributeCommissions(db, referralConfig, buyer.id, payment.rows[0].id, amount);
};

/**
 * Runs purchases for the whole network in small parallel batches.
 *
 * @param {Array} users - Network users
 */
const runAllPurchases = async (users) => {
  console.log('\n💳 Processing purchases (real commission pipeline)...\n');

  const batchSize = 4;
  let processed = 0;

  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    await Promise.all(
      batch.map((user, offset) => runPurchase(user, i + offset + 1))
    );
    processed += batch.length;
    console.log(`   • ${processed}/${users.length} purchases distributed`);
  }
};

/**
 * Awards bonuses for every user via the real bonus engine.
 *
 * @param {Array} users - Network users
 */
const awardAllBonuses = async (users) => {
  console.log('\n🎁 Awarding bonuses (real bonus engine)...');

  for (const user of users) {
    await mlm.awardEligibleBonuses(db, referralConfig, user.id);
  }

  const bonusCount = await pool.query(
    `SELECT COUNT(*)::int AS count FROM referral_bonuses
     WHERE user_id IN (SELECT id FROM users WHERE phone LIKE $1)`,
    [`${TEST_PHONE_PREFIX}%`]
  );
  console.log(`   • ${bonusCount.rows[0].count} bonus rows awarded`);
};

/**
 * Detects whether unlock_at is a stored generated column.
 *
 * @returns {Promise<boolean>} True if GENERATED ALWAYS ... STORED
 */
const isUnlockGenerated = async () => {
  const result = await pool.query(
    `SELECT attgenerated FROM pg_attribute
     WHERE attrelid = 'affiliate_commissions'::regclass AND attname = 'unlock_at'`
  );
  return result.rows[0]?.attgenerated === 's';
};

/**
 * Back-dates commissions so they are withdrawable immediately.
 *
 * @param {boolean} generated - Whether unlock_at is generated from created_at
 */
const unlockAllCommissions = async (generated) => {
  console.log('\n🔓 Unlocking commissions for immediate withdrawal testing...');

  if (generated) {
    /* Generated column: shift created_at back so unlock_at recomputes */
    await pool.query(
      `UPDATE affiliate_commissions
       SET created_at = created_at - INTERVAL '8 days'
       WHERE earning_user_id IN (SELECT id FROM users WHERE phone LIKE $1)`,
      [`${TEST_PHONE_PREFIX}%`]
    );
  } else {
    /* Plain column: rewrite unlock_at directly */
    await pool.query(
      `UPDATE affiliate_commissions
       SET unlock_at = NOW() - INTERVAL '1 day'
       WHERE earning_user_id IN (SELECT id FROM users WHERE phone LIKE $1)`,
      [`${TEST_PHONE_PREFIX}%`]
    );
  }

  const unlocked = await pool.query(
    `SELECT COALESCE(SUM(commission_amount), 0)::numeric AS total
     FROM affiliate_commissions
     WHERE earning_user_id IN (SELECT id FROM users WHERE phone LIKE $1)
       AND status = 'credited' AND unlock_at <= NOW()`,
    [`${TEST_PHONE_PREFIX}%`]
  );
  console.log(`   • ${unlocked.rows[0].total} ETB now withdrawable across the network`);
};

/**
 * Plants sample withdrawal requests so admin + history UIs have data.
 *
 * @param {Array} users - Network users
 */
const seedWithdrawalSamples = async (users) => {
  console.log('\n💸 Planting sample withdrawals...');

  const pendingUser = users[1];
  const paidUser = users[2];
  const pendingAmount = MIN_WITHDRAWAL * 2;
  const paidAmount = MIN_WITHDRAWAL;

  /* Pending request: reserve funds on the wallet */
  await pool.query(
    `UPDATE affiliate_wallets
     SET current_balance = current_balance - $2,
         pending_withdrawal = pending_withdrawal + $2
     WHERE user_id = $1`,
    [pendingUser.id, pendingAmount]
  );
  await pool.query(
    `INSERT INTO withdrawal_requests
       (user_id, amount, method, account_number, account_name, status)
     VALUES ($1, $2, 'telebirr', '0911000001', $3, 'pending')`,
    [pendingUser.id, pendingAmount, pendingUser.name]
  );
  console.log(`   • PENDING: ${pendingUser.name} → ${pendingAmount} ETB (admin queue)`);

  /* Paid request: funds already left the wallet */
  await pool.query(
    `UPDATE affiliate_wallets
     SET current_balance = current_balance - $2,
         total_withdrawn = total_withdrawn + $2
     WHERE user_id = $1`,
    [paidUser.id, paidAmount]
  );
  await pool.query(
    `INSERT INTO withdrawal_requests
       (user_id, amount, method, account_number, account_name, status,
        processed_at, transaction_ref, admin_note)
     VALUES ($1, $2, 'cbe-birr', '0911000002', $3, 'paid',
             NOW() - INTERVAL '2 days', 'MLMSEED-TX-0001', 'Seeded test payout')`,
    [paidUser.id, paidAmount, paidUser.name]
  );
  console.log(`   • PAID:    ${paidUser.name} → ${paidAmount} ETB (history)`);
};

/* ============================================================================
 * REPORT & CLEAN
 * ========================================================================== */

/**
 * Prints the full current state of the test network.
 */
const printReport = async () => {
  const rows = await pool.query(
    `SELECT u.full_name, u.phone, rc.code,
            COALESCE(w.current_balance, 0)::numeric AS balance,
            COALESCE(w.pending_withdrawal, 0)::numeric AS pending,
            COALESCE(w.total_withdrawn, 0)::numeric AS withdrawn,
            u.direct_referral_count AS directs,
            u.total_team_size AS team,
            (SELECT COALESCE(SUM(commission_amount), 0) FROM affiliate_commissions c
              WHERE c.earning_user_id = u.id AND c.status = 'credited'
                AND c.unlock_at <= NOW())::numeric AS unlocked,
            (SELECT COALESCE(SUM(amount), 0) FROM referral_bonuses b
              WHERE b.user_id = u.id)::numeric AS bonuses
     FROM users u
     LEFT JOIN referral_codes rc ON rc.user_id = u.id
     LEFT JOIN affiliate_wallets w ON w.user_id = u.id
     WHERE u.phone LIKE $1 OR u.email LIKE $2
     ORDER BY unlocked DESC
     LIMIT 25`,
    [`${TEST_PHONE_PREFIX}%`, `%@${TEST_EMAIL_DOMAIN}`]
  );

  console.log('\n📊 Top 25 test users by unlocked commission:\n');
  console.table(
    rows.rows.map((r) => ({
      user: r.full_name,
      phone: r.phone,
      code: r.code || '—',
      unlocked: parseFloat(r.unlocked),
      bonuses: parseFloat(r.bonuses),
      balance: parseFloat(r.balance),
      pending: parseFloat(r.pending),
      withdrawn: parseFloat(r.withdrawn),
      directs: r.directs,
      team: r.team,
    }))
  );

  console.log('🔑 Login: phone from table + password MlmTest@123!');
  console.log('🧹 Cleanup: node tools/mlm-seed.js clean\n');
};

/**
 * Deletes every trace of seeded data in FK-safe order.
 */
const cleanTestData = async () => {
  console.log('\n🧹 Cleaning all seeded data...\n');

  const userFilter = `(SELECT id FROM users WHERE phone LIKE '${TEST_PHONE_PREFIX}%' OR email LIKE '%@${TEST_EMAIL_DOMAIN}')`;

  const steps = [
    `DELETE FROM referral_tree WHERE ancestor_id IN ${userFilter} OR descendant_id IN ${userFilter}`,
    `DELETE FROM affiliate_commissions WHERE earning_user_id IN ${userFilter} OR source_user_id IN ${userFilter}`,
    `DELETE FROM referral_bonuses WHERE user_id IN ${userFilter}`,
    `DELETE FROM withdrawal_requests WHERE user_id IN ${userFilter}`,
    `DELETE FROM referral_monthly_stats WHERE user_id IN ${userFilter}`,
    `DELETE FROM referral_codes WHERE user_id IN ${userFilter}`,
    `DELETE FROM completed_lessons WHERE user_id IN ${userFilter}`,
    `DELETE FROM course_progress WHERE user_id IN ${userFilter}`,
    `DELETE FROM enrollments WHERE user_id IN ${userFilter}`,
    `DELETE FROM payments WHERE user_id IN ${userFilter}`,
    `DELETE FROM affiliate_wallets WHERE user_id IN ${userFilter}`,
    `DELETE FROM users WHERE phone LIKE '${TEST_PHONE_PREFIX}%' OR email LIKE '%@${TEST_EMAIL_DOMAIN}'`,
  ];

  for (const sql of steps) {
    const result = await pool.query(sql);
    if (result.rowCount > 0) {
      console.log(`   • ${result.rowCount} row(s): ${sql.split(' FROM ')[1].split(' WHERE')[0]}`);
    }
  }

  /* Recompute platform monthly totals from surviving real data */
  await pool.query(
    `UPDATE referral_platform_monthly p
     SET total_payout = COALESCE(
       (SELECT SUM(total_payout) FROM referral_monthly_stats m WHERE m.month = p.month), 0)`
  );

  console.log('\n✅ Seed data removed. Real users untouched.\n');
};

/* ============================================================================
 * ENTRY POINT
 * ========================================================================== */

const main = async () => {
  const [command, ...flags] = process.argv.slice(2);
  const keepLocked = flags.includes('--locked');

  try {
    if (command === 'clean') {
      await cleanTestData();
    } else if (command === 'report') {
      await printReport();
    } else if (command === 'seed') {
      /* Guard: never double-seed on top of existing test data */
      const existing = await pool.query(
        `SELECT COUNT(*)::int AS count FROM users WHERE phone LIKE $1`,
        [`${TEST_PHONE_PREFIX}%`]
      );
      if (existing.rows[0].count > 0) {
        console.log('⚠️  Test users already exist. Run: node tools/mlm-seed.js clean');
        return;
      }

      const users = await buildNetwork();
      await runAllPurchases(users);
      await awardAllBonuses(users);

      if (!keepLocked) {
        const generated = await isUnlockGenerated();
        await unlockAllCommissions(generated);
      } else {
        console.log('\n🔒 Keeping 7-day lock intact (--locked)');
      }

      await seedWithdrawalSamples(users);
      await printReport();

      console.log('🎉 Seed complete. Log in as any test user and explore!');
      console.log('   • Student dashboards: /profile/referrals');
      console.log('   • Admin payout queue: /admin/referrals/mlm/withdrawals');
      console.log('   • Admin MLM stats:    /admin/referrals/mlm/stats');
    } else {
      console.log('Usage: node tools/mlm-seed.js <seed|report|clean> [--locked]');
    }
  } catch (error) {
    console.error('\n❌ Seeder error:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

main();