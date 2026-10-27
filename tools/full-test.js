/**
 * @fileoverview Full End-to-End Test Script
 * 
 * 1. Registers a brand new test user.
 * 2. Creates an Agent-attributed payment and an MLM-attributed payment.
 * 3. Approves both via the Admin API.
 * 4. Verifies the commission payouts in the DB.
 * 
 * Path: tools/full-test.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', 'apps', 'web', '.env.local') });
const { Pool } = require('pg');
const fetch = global.fetch;

const BASE_URL = 'http://localhost:3000'; // Change to production URL if testing remotely

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

const log = (msg) => console.log(`\n[TEST] ${msg}`);
const ok = (msg) => console.log(`  ✅ ${msg}`);
const info = (msg) => console.log(`  ℹ️  ${msg}`);

async function postJson(endpoint, body, headers = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function patchJson(endpoint, headers = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'PATCH',
    headers: { ...headers },
  });
  return res.json();
}

(async () => {
  const client = await pool.connect();
  try {
    // ─────────────────────────────────────────────────────────────
    // STEP 1: Register a fresh user
    // ─────────────────────────────────────────────────────────────
    log('1. Registering a fresh test user...');
    const phone = `+251911${String(Date.now()).slice(-6)}`;
    const password = 'TestPassword123!';
    const email = `test-${Date.now()}@example.com`;

    const regRes = await postJson('/api/auth/register', {
      fullName: 'Master Tester',
      phone,
      email,
      password,
    });

    if (!regRes.success) throw new Error(`Registration failed: ${JSON.stringify(regRes)}`);
    
    const testUserId = regRes.data.user.id;
    ok(`User registered successfully!`);
    info(`Phone: ${phone}`);
    info(`Password: ${password}`);
    info(`User ID: ${testUserId}`);

    // Wait for DB to settle (agent provisioning is async in register.js)
    await new Promise(r => setTimeout(r, 1000));

    // ─────────────────────────────────────────────────────────────
    // STEP 2: Find a buyer
    // ─────────────────────────────────────────────────────────────
    log('2. Finding a buyer in the DB...');
    const buyerRes = await client.query('SELECT id, full_name FROM users WHERE id != $1 LIMIT 1', [testUserId]);
    if (buyerRes.rows.length === 0) throw new Error('Need at least one other user in the DB.');
    const buyer = buyerRes.rows[0];
    ok(`Found buyer: ${buyer.full_name} (${buyer.id})`);

    // ─────────────────────────────────────────────────────────────
    // STEP 3: Create Payments
    // ─────────────────────────────────────────────────────────────
    log('3. Creating payments in the DB...');
    
    // 3a. Agent Payment (Buyer buys via Tester's agent code)
    const agentPaymentRes = await client.query(
      `INSERT INTO payments (user_id, amount, method, status, reference, agent_id)
       VALUES ($1::uuid, 1000, 'telebirr', 'pending', 'TEST-AGENT-123', $2::uuid)
       RETURNING id`,
      [buyer.id, testUserId]
    );
    const agentPaymentId = agentPaymentRes.rows[0].id;
    ok(`Created Agent Payment: ${agentPaymentId}`);

    // 3b. MLM Payment (Buyer buys via Tester's referral code)
    // Ensure MLM tree link exists
    await client.query(
      `INSERT INTO referral_tree (ancestor_id, descendant_id, depth) 
       VALUES ($1::uuid, $2::uuid, 1) ON CONFLICT DO NOTHING`,
      [testUserId, buyer.id]
    );

    const mlmPaymentRes = await client.query(
      `INSERT INTO payments (user_id, amount, method, status, reference)
       VALUES ($1::uuid, 1000, 'telebirr', 'pending', 'TEST-MLM-123')
       RETURNING id`,
      [buyer.id]
    );
    const mlmPaymentId = mlmPaymentRes.rows[0].id;
    ok(`Created MLM Payment: ${mlmPaymentId}`);

    // ─────────────────────────────────────────────────────────────
    // STEP 4: Login as Admin & Approve
    // ─────────────────────────────────────────────────────────────
    log('4. Logging in as Admin to approve...');
    const adminRes = await postJson('/api/auth/admin/login', {
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin2026',
    });
    if (!adminRes.success) throw new Error('Admin login failed.');
    const adminToken = adminRes.data.token;
    ok('Admin logged in.');

    log('5. Approving payments...');
    const approve1 = await patchJson(`/api/admin/payments/${agentPaymentId}/approve`, {
      Authorization: `Bearer ${adminToken}`,
    });
    if (!approve1.success) throw new Error(`Agent approval failed: ${JSON.stringify(approve1)}`);
    ok('Agent Payment approved.');

    const approve2 = await patchJson(`/api/admin/payments/${mlmPaymentId}/approve`, {
      Authorization: `Bearer ${adminToken}`,
    });
    if (!approve2.success) throw new Error(`MLM approval failed: ${JSON.stringify(approve2)}`);
    ok('MLM Payment approved.');

        // ─────────────────────────────────────────────────────────────
    // STEP 5: Verify Balances (corrected column names)
    // ─────────────────────────────────────────────────────────────
    log('6. Verifying DB state...');
    
    /* 
     * Use COALESCE to handle empty tables gracefully.
     * Column names reflect the actual schema:
     *   - affiliate_wallets.current_balance (confirmed)
     *   - agent_commissions.commission_amount (confirmed)
     *   - affiliate_commissions uses EITHER `amount` OR `commission_amount` 
     *     depending on the migration — probe both
     */
    const walletRes = await client.query(
      'SELECT current_balance, total_earned FROM affiliate_wallets WHERE user_id = $1::uuid',
      [testUserId]
    );
    
    const agentComms = await client.query(
      'SELECT COALESCE(SUM(commission_amount), 0) AS total FROM agent_commissions WHERE agent_user_id = $1::uuid AND status = $2',
      [testUserId, 'paid']
    );

    /* Try both possible column names for the MLM commissions table */
    let mlmTotal = 0;
    try {
      const r = await client.query(
        'SELECT COALESCE(SUM(commission_amount), 0) AS total FROM affiliate_commissions WHERE earning_user_id = $1::uuid',
        [testUserId]
      );
      mlmTotal = parseFloat(r.rows[0].total);
    } catch {
      try {
        const r = await client.query(
          'SELECT COALESCE(SUM(amount), 0) AS total FROM affiliate_commissions WHERE earning_user_id = $1::uuid',
          [testUserId]
        );
        mlmTotal = parseFloat(r.rows[0].total);
      } catch (e2) {
        console.warn('  ⚠️  Could not read affiliate_commissions — schema differs:', e2.message);
      }
    }

    const agentTotal = parseFloat(agentComms.rows[0]?.total || 0);
    const walletBalance = parseFloat(walletRes.rows[0]?.current_balance || 0);
    const walletTotalEarned = parseFloat(walletRes.rows[0]?.total_earned || 0);

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('🎉 TEST COMPLETE — LOG IN AND CHECK THE UI');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Phone:    ${phone}`);
    console.log(`Password: ${password}`);
    console.log('');
    console.log(`Agent Commission:    ${agentTotal} ETB`);
    console.log(`MLM Commission:      ${mlmTotal} ETB`);
    console.log(`Wallet Balance:      ${walletBalance} ETB`);
    console.log(`Wallet Total Earned: ${walletTotalEarned} ETB`);
    console.log('');
    console.log('Expected UI Overview "TOTAL EARNINGS":');
    console.log(`  ${walletBalance} ETB (from your agent + MLM combined)`);
    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    if (error.response) console.error(error.response);
  } finally {
    client.release();
    pool.end();
  }
})();