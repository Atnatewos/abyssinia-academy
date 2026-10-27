/**
 * @fileoverview MLM System Simulator & Test Harness
 *
 * Builds a complete referral network in the database and exercises the
 * REAL shared MLM module (packages/shared/mlm) — the same code path
 * production uses — then verifies every business rule with automated
 * pass/fail checks.
 *
 * Scenario (default):
 *   A → B → C → D → E → F   (6-level chain; F is Level 5 for A)
 *   G1..G4 register under E (gives E five direct referrals)
 *   Purchases: B, C, D, E, F buy the full course
 *
 * What gets verified:
 *   - 4-level depth cap (A earns nothing from F's purchase)
 *   - Exact per-level amounts from config (200/150/100/50)
 *   - Per-sale cap from config
 *   - Idempotency (double approval never double-pays)
 *   - 7-day lock (nothing withdrawable immediately after seed)
 *   - Direct-referral bonus (E hits 5 directs → 1,000 credit)
 *   - [--big]    50-team milestone + monthly bonus cap interaction
 *   - [--refund] commission reversal on refund
 *
 * Usage:
 *   node tools/mlm-simulator.js seed             # build scenario + run checks
 *   node tools/mlm-simulator.js seed --big       # + 50-team cap test
 *   node tools/mlm-simulator.js seed --refund    # + reversal drill
 *   node tools/mlm-simulator.js report           # dump current test state
 *   node tools/mlm-simulator.js clean            # delete ALL test data
 *
 * Safety:
 *   Test users are tagged with phone prefix 99900 and email domain
 *   test.abyssinia.local so `clean` can remove them precisely without
 *   touching real users.
 *
 * Path: tools/mlm-simulator.js
 */

const path = require('path');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

/* ── Environment bootstrap (apps/api/.env → root .env → process.env) ── */
require('dotenv').config({ path: path.join(__dirname, '..', 'apps', 'api', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const sharedConfig = require('../packages/shared/config');
const mlm = require('../packages/shared/mlm');

const referralConfig = sharedConfig.referrals;
const paymentsConfig = sharedConfig.payments;

if (!referralConfig || !referralConfig.commissionStructure) {
  console.error('❌ Cannot read referrals config from packages/shared/config');
  process.exit(1);
}

const LEVEL_AMOUNTS = referralConfig.commissionStructure.levelAmounts;
const MAX_LEVELS = referralConfig.commissionStructure.maxLevels;
const CAPS = referralConfig.caps;
const FULL_PRICE = paymentsConfig.pricing.fullCourse.amountETB;
const REFERRED_PRICE = paymentsConfig.pricing.fullCourse.referredAmountETB;

/* ── Test data fingerprints (used by clean) ── */
const TEST_PHONE_PREFIX = '99900';
const TEST_EMAIL_DOMAIN = 'test.abyssinia.local';
const TEST_PASSWORD_HASH = bcrypt.hashSync('MlmTest@123!', 10);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
});

/* db adapter matching the shared module contract */
const db = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};

const results = [];

/**
 * Records a check outcome for the final report.
 *
 * @param {string} name - Human-readable check name
 * @param {boolean} passed - Whether the assertion held
 * @param {string} detail - Expected vs actual detail
 */
const check = (name, passed, detail) => {
  results.push({ name, passed, detail });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}${detail ? ` — ${detail}` : ''}`);
};

/* ============================================================================
 * SCENARIO BUILDERS
 * ========================================================================== */

/**
 * Creates a tagged test user.
 *
 * @param {string} label - Short label (A, B, C...)
 * @param {number} seq - Unique sequence number
 * @returns {Promise<object>} { id, label }
 */
const createTestUser = async (label, seq) => {
  const phone = `${TEST_PHONE_PREFIX}${String(seq).padStart(5, '0')}`;
  const email = `mlmtest+${label.toLowerCase()}${seq}@${TEST_EMAIL_DOMAIN}`;

  const result = await pool.query(
    `INSERT INTO users (full_name, phone, email, password)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [`Test ${label}`, phone, email, TEST_PASSWORD_HASH]
  );

  await pool.query(
    `INSERT INTO affiliate_wallets (user_id) VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING`,
    [result.rows[0].id]
  );

  return { id: result.rows[0].id, label };
};

/**
 * Records an approved full-course payment for a buyer.
 *
 * @param {string} buyerId - Buyer UUID
 * @param {boolean} hasReferrer - Whether buyer joined via referral
 * @param {number} seq - Payment sequence for the reference column
 * @returns {Promise<object>} { id, amount }
 */
const createApprovedPayment = async (buyerId, hasReferrer, seq) => {
  const amount = hasReferrer ? REFERRED_PRICE : FULL_PRICE;

  const result = await pool.query(
    `INSERT INTO payments (user_id, amount, method, status, reference, purchase_mode, paid_at)
     VALUES ($1, $2, 'telebirr', 'approved', $3, 'full-course', NOW())
     RETURNING id`,
    [buyerId, amount, `MLMTEST-${String(seq).padStart(4, '0')}`]
  );

  return { id: result.rows[0].id, amount };
};

/**
 * Builds the full scenario and returns the actor map.
 *
 * @param {object} options
 * @param {boolean} options.big - Also build the 50-team cap scenario
 * @returns {Promise<object>} { users, chain, root2 }
 */
const buildScenario = async ({ big }) => {
  console.log('\n🏗️  Building referral network...\n');

  /* Linear chain A → B → C → D → E → F */
  const chain = [];
  const labels = ['A', 'B', 'C', 'D', 'E', 'F'];

  for (let i = 0; i < labels.length; i++) {
    const user = await createTestUser(labels[i], i + 1);
    if (i > 0) {
      await mlm.buildReferralTree(db, referralConfig, user.id, chain[i - 1].id);
    }
    chain.push(user);
    console.log(`   • Test ${labels[i]} created${i > 0 ? ` (Level ${i} under ${labels[i - 1]})` : ' (root)'}`);
  }

  /* G1..G4 under E → gives E five direct referrals total (F + G1..G4) */
  const extras = [];
  for (let i = 0; i < 4; i++) {
    const user = await createTestUser(`G${i + 1}`, 100 + i);
    await mlm.buildReferralTree(db, referralConfig, user.id, chain[4].id);
    extras.push(user);
  }
  console.log('   • G1–G4 created under E (E now has 5 directs)');

  /* Optional 50-team cap scenario */
  let root2 = null;
  if (big) {
    root2 = await createTestUser('ROOT2', 900);
    for (let i = 0; i < 50; i++) {
      const leaf = await createTestUser(`L${i + 1}`, 1000 + i);
      await mlm.buildReferralTree(db, referralConfig, leaf.id, root2.id);
    }
    console.log('   • ROOT2 + 50 leaf members created (50-team cap test)');
  }

  return { chain, extras, root2 };
};

/**
 * Runs purchases through the real distribution + bonus pipeline.
 *
 * @param {Array} chain - Ordered chain users [A..F]
 * @returns {Promise<object>} paymentIds keyed by buyer label
 */
const runPurchases = async (chain) => {
  console.log('\n💳 Processing purchases through the real MLM pipeline...\n');

  const payments = {};

  /* B, C, D, E, F each buy the full course (all have referrers) */
  for (let buyerIndex = 1; buyerIndex < chain.length; buyerIndex++) {
    const buyer = chain[buyerIndex];
    const payment = await createApprovedPayment(buyer.id, true, buyerIndex);
    payments[buyer.label] = payment;

    const outcome = await mlm.distributeCommissions(
      db,
      referralConfig,
      buyer.id,
      payment.id,
      payment.amount
    );

    /* Mirror the approval flow: bonus check for every earner */
    const ancestors = await mlm.helpers && await pool.query(
      `SELECT ancestor_id FROM referral_tree WHERE descendant_id = $1 AND depth <= $2`,
      [buyer.id, MAX_LEVELS]
    );
    for (const row of ancestors.rows) {
      await mlm.awardEligibleBonuses(db, referralConfig, row.ancestor_id);
    }

    console.log(
      `   • ${buyer.label} paid ${payment.amount} ETB → ${outcome.distributed} commissions, ${outcome.totalCommission} ETB total`
    );
  }

  return payments;
};

/* ============================================================================
 * VERIFICATION CHECKS
 * ========================================================================== */

/**
 * Computes expected commission totals from the chain geometry and config.
 *
 * @param {Array} chain - Ordered chain users
 * @param {Array} buyers - Labels that purchased
 * @returns {object} Map of label → expected ETB
 */
const computeExpectedTotals = (chain, buyers) => {
  const expected = {};
  chain.forEach((user) => { expected[user.label] = 0; });

  buyers.forEach((buyerLabel) => {
    const buyerIndex = chain.findIndex((u) => u.label === buyerLabel);
    for (let depth = 1; depth <= MAX_LEVELS; depth++) {
      const earnerIndex = buyerIndex - depth;
      if (earnerIndex < 0) break;
      expected[chain[earnerIndex].label] += LEVEL_AMOUNTS[depth - 1];
    }
  });

  return expected;
};

/**
 * Runs all verification checks against the database.
 *
 * @param {object} scenario - Actor map from buildScenario
 * @param {object} payments - Payment map from runPurchases
 * @param {object} options - Flags
 */
const runChecks = async (scenario, payments, options) => {
  console.log('\n🔬 Running verification checks...\n');

  const { chain, root2 } = scenario;
  const buyers = ['B', 'C', 'D', 'E', 'F'];
  const expected = computeExpectedTotals(chain, buyers);

  /* C1 — Level 5 exclusion: A must NOT be an ancestor of F */
  const aAncestorOfF = await pool.query(
    `SELECT 1 FROM referral_tree WHERE ancestor_id = $1 AND descendant_id = $2`,
    [chain[0].id, chain[5].id]
  );
  check(
    'Level 5 exclusion (A ∉ F upline)',
    aAncestorOfF.rows.length === 0,
    aAncestorOfF.rows.length === 0 ? 'no depth-5 row exists' : 'UNEXPECTED depth-5 row found'
  );

  /* C2 — Commission rows per payment equal min(4, chain depth) */
  let perPaymentOk = true;
  for (const buyerLabel of buyers) {
    const buyerIndex = chain.findIndex((u) => u.label === buyerLabel);
    const expectedRows = Math.min(buyerIndex, MAX_LEVELS);
    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS count FROM affiliate_commissions WHERE payment_id = $1`,
      [payments[buyerLabel].id]
    );
    if (countResult.rows[0].count !== expectedRows) perPaymentOk = false;
  }
  check('Commission row count per payment', perPaymentOk, 'each payment paid exactly its ≤4 ancestors');

  /* C3 — Per-level amounts match config exactly */
  const levelAmountsOk = await pool.query(
    `SELECT DISTINCT level, commission_amount FROM affiliate_commissions ORDER BY level`,
    []
  );
  const amountsMatch = levelAmountsOk.rows.every(
    (row) => parseFloat(row.commission_amount) === LEVEL_AMOUNTS[row.level - 1]
  );
  check(
    'Per-level amounts match config',
    amountsMatch,
    levelAmountsOk.rows.map((r) => `L${r.level}=${r.commission_amount}`).join(', ')
  );

  /* C4 — Per-user totals match chain math */
  let totalsOk = true;
  const totalDetails = [];
  for (const user of chain) {
    const sumResult = await pool.query(
      `SELECT COALESCE(SUM(commission_amount), 0)::numeric AS total
       FROM affiliate_commissions
       WHERE earning_user_id = $1 AND status = 'credited'`,
      [user.id]
    );
    const actual = parseFloat(sumResult.rows[0].total);
    totalDetails.push(`${user.label}=${actual}`);
    if (actual !== expected[user.label]) totalsOk = false;
  }
  check('Per-user commission totals', totalsOk, totalDetails.join(', '));

  /* C5 — Per-sale cap respected */
  const capResult = await pool.query(
    `SELECT payment_id, SUM(commission_amount)::numeric AS total
     FROM affiliate_commissions GROUP BY payment_id HAVING SUM(commission_amount) > $1`,
    [CAPS.maxTotalPerSaleETB]
  );
  check(
    `Per-sale cap ≤ ${CAPS.maxTotalPerSaleETB} ETB`,
    capResult.rows.length === 0,
    capResult.rows.length === 0 ? 'no payment exceeded the cap' : `${capResult.rows.length} violations`
  );

  /* C6 — Idempotency: re-running distribution adds nothing */
  const beforeCount = await pool.query(
    `SELECT COUNT(*)::int AS count FROM affiliate_commissions`, []
  );
  const replay = await mlm.distributeCommissions(
    db, referralConfig, chain[5].id, payments.F.id, payments.F.amount
  );
  const afterCount = await pool.query(
    `SELECT COUNT(*)::int AS count FROM affiliate_commissions`, []
  );
  check(
    'Idempotency (double approval safe)',
    replay.distributed === 0 && beforeCount.rows[0].count === afterCount.rows[0].count,
    `replay returned distributed=${replay.distributed}`
  );

  /* C7 — 7-day lock: nothing withdrawable yet */
  const unlockedResult = await pool.query(
    `SELECT COALESCE(SUM(commission_amount), 0)::numeric AS total
     FROM affiliate_commissions WHERE status = 'credited' AND unlock_at <= NOW()`
  );
  const lockedResult = await pool.query(
    `SELECT COALESCE(SUM(commission_amount), 0)::numeric AS total
     FROM affiliate_commissions WHERE status = 'credited' AND unlock_at > NOW()`
  );
  check(
    '7-day lock enforced',
    parseFloat(unlockedResult.rows[0].total) === 0 && parseFloat(lockedResult.rows[0].total) > 0,
    `unlocked=${unlockedResult.rows[0].total}, locked=${lockedResult.rows[0].total}`
  );

  /* C8 — Direct-referral bonus: E has 5 directs → 1,000 credit */
  const eBonus = await pool.query(
    `SELECT COALESCE(SUM(amount), 0)::numeric AS total
     FROM referral_bonuses WHERE user_id = $1 AND bonus_category = 'direct_referral'`,
    [chain[4].id]
  );
  const expectedEBonus = referralConfig.bonuses.directReferral.tiers[0].amountETB;
  check(
    'Direct-referral bonus (E, 5 directs)',
    parseFloat(eBonus.rows[0].total) === expectedEBonus,
    `expected ${expectedEBonus}, got ${eBonus.rows[0].total}`
  );

  /* C9 — [--big] 50-team: category independence + monthly bonus cap */
  if (options.big && root2) {
    await mlm.awardEligibleBonuses(db, referralConfig, root2.id);

    const byCategory = await pool.query(
      `SELECT bonus_category, COALESCE(SUM(amount), 0)::numeric AS total
       FROM referral_bonuses WHERE user_id = $1 GROUP BY bonus_category`,
      [root2.id]
    );
    const catMap = {};
    let grandTotal = 0;
    byCategory.rows.forEach((row) => {
      catMap[row.bonus_category] = parseFloat(row.total);
      grandTotal += parseFloat(row.total);
    });

    check(
      `Monthly bonus cap = ${CAPS.maxBonusPerUserPerMonthETB} ETB`,
      grandTotal === CAPS.maxBonusPerUserPerMonthETB,
      Object.entries(catMap).map(([k, v]) => `${k}=${v}`).join(', ') + ` | total=${grandTotal}`
    );
  }

  /* C10 — [--refund] reversal drill on F's payment */
  if (options.refund) {
    const beforeBalances = {};
    for (const user of chain) {
      const wallet = await pool.query(
        `SELECT current_balance FROM affiliate_wallets WHERE user_id = $1`, [user.id]
      );
      beforeBalances[user.label] = parseFloat(wallet.rows[0].current_balance);
    }

    await mlm.reverseCommissionsForPayment(db, payments.F.id, 'simulator refund drill');

    const reversedRows = await pool.query(
      `SELECT earning_user_id, commission_amount FROM affiliate_commissions
       WHERE payment_id = $1 AND status = 'reversed'`,
      [payments.F.id]
    );

    let reversalOk = reversedRows.rows.length === MAX_LEVELS;
    for (const user of chain) {
      const wallet = await pool.query(
        `SELECT current_balance FROM affiliate_wallets WHERE user_id = $1`, [user.id]
      );
      const after = parseFloat(wallet.rows[0].current_balance);
      const reversedForUser = reversedRows.rows
        .filter((r) => r.earning_user_id === user.id)
        .reduce((sum, r) => sum + parseFloat(r.commission_amount), 0);
      if (Math.abs(beforeBalances[user.label] - reversedForUser - after) > 0.001) reversalOk = false;
    }

    check('Refund reversal (F payment)', reversalOk, `${reversedRows.rows.length} commissions reversed, wallets decremented`);
  }
};

/* ============================================================================
 * REPORT & CLEANUP
 * ========================================================================== */

/**
 * Prints a human-readable state dump of all test users.
 */
const printReport = async () => {
  const rows = await pool.query(
    `SELECT u.full_name, u.phone,
            w.current_balance, w.total_earned, w.total_withdrawn,
            u.direct_referral_count, u.total_team_size,
            (SELECT COALESCE(SUM(commission_amount), 0) FROM affiliate_commissions c
              WHERE c.earning_user_id = u.id AND c.status = 'credited') AS credited,
            (SELECT COALESCE(SUM(amount), 0) FROM referral_bonuses b
              WHERE b.user_id = u.id) AS bonuses
     FROM users u
     LEFT JOIN affiliate_wallets w ON w.user_id = u.id
     WHERE u.phone LIKE $1 OR u.email LIKE $2
     ORDER BY u.phone`,
    [`${TEST_PHONE_PREFIX}%`, `%@${TEST_EMAIL_DOMAIN}`]
  );

  console.log('\n📊 Current MLM test state:\n');
  console.table(
    rows.rows.map((r) => ({
      user: r.full_name,
      phone: r.phone,
      balance: parseFloat(r.current_balance || 0),
      credited: parseFloat(r.credited || 0),
      bonuses: parseFloat(r.bonuses || 0),
      directs: r.direct_referral_count,
      team: r.total_team_size,
    }))
  );
};

/**
 * Deletes every trace of simulator data in FK-safe order.
 */
const cleanTestData = async () => {
  console.log('\n🧹 Cleaning simulator data...\n');

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
     SET total_payout = COALESCE((SELECT SUM(total_payout) FROM referral_monthly_stats m WHERE m.month = p.month), 0)`
  );

  console.log('\n✅ Simulator data removed. Real users untouched.');
};

/* ============================================================================
 * ENTRY POINT
 * ========================================================================== */

const main = async () => {
  const [command, ...flags] = process.argv.slice(2);
  const options = {
    big: flags.includes('--big'),
    refund: flags.includes('--refund'),
  };

  try {
    if (command === 'clean') {
      await cleanTestData();
    } else if (command === 'report') {
      await printReport();
    } else if (command === 'seed') {
      const scenario = await buildScenario(options);
      const payments = await runPurchases(scenario.chain);
      await runChecks(scenario, payments, options);
      await printReport();

      const failed = results.filter((r) => !r.passed);
      console.log('\n──────────────────────────────────────────');
      console.log(
        failed.length === 0
          ? `🎉 ALL ${results.length} CHECKS PASSED — MLM engine behaves exactly per config.`
          : `⚠️  ${failed.length}/${results.length} CHECKS FAILED — review details above.`
      );
      console.log('──────────────────────────────────────────\n');
      console.log('Login in the browser as any Test user (password: MlmTest@123!) to see the UI populated.');
      console.log('When done: node tools/mlm-simulator.js clean');
    } else {
      console.log('Usage: node tools/mlm-simulator.js <seed|report|clean> [--big] [--refund]');
    }
  } catch (error) {
    console.error('\n❌ Simulator error:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

main();