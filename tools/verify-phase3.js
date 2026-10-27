/**
 * @fileoverview Phase 3 End-to-End Verification Script
 *
 * Validates the agent system backend on production:
 *   1. Registers a fresh test student
 *   2. Verifies agent was auto-provisioned
 *   3. Submits a payment with agent attribution
 *   4. Logs in as admin
 *   5. Approves the payment
 *   6. Verifies commission + wallet credit
 *
 * Usage:
 *   node tools/verify-phase3.js --admin-username=admin --admin-password=xxx
 *
 *   OR set env vars:
 *   ADMIN_USERNAME=admin ADMIN_PASSWORD=xxx node tools/verify-phase3.js
 *
 * Optional:
 *   --base-url=https://abyssiniatech.vercel.app  (default: production)
 *   --base-url=http://localhost:3000             (for local testing)
 *
 * Cleanup after successful test:
 *   node tools/verify-phase3.js --cleanup
 *
 * Path: tools/verify-phase3.js
 */

require('dotenv').config({
  path: require('path').join(__dirname, '..', 'apps', 'web', '.env.local'),
});

const fs = require('fs');
const path = require('path');
const os = require('os');
const { Pool } = require('pg');

/* ─────────────────────────────────────────────────────────────
 * ARGUMENT PARSING
 * ───────────────────────────────────────────────────────────── */

const args = process.argv.slice(2).reduce((acc, arg) => {
  const match = arg.match(/^--([^=]+)=(.+)$/);
  if (match) acc[match[1]] = match[2];
  else if (arg.startsWith('--')) acc[arg.slice(2)] = true;
  return acc;
}, {});

const BASE_URL = args['base-url'] || 'https://abyssiniatech.vercel.app';

/*
 * Admin credentials — accept several shapes:
 *   --admin-username=X  (preferred)
 *   --admin-email=X     (legacy alias)
 *   ADMIN_USERNAME env var
 *   ADMIN_EMAIL env var
 */
const ADMIN_USERNAME =
  args['admin-username'] ||
  args['admin-email'] ||
  process.env.ADMIN_USERNAME ||
  process.env.ADMIN_EMAIL;

const ADMIN_PASSWORD = args['admin-password'] || process.env.ADMIN_PASSWORD;

const CLEANUP_ONLY = Boolean(args.cleanup);

/* ─────────────────────────────────────────────────────────────
 * STATE FILES — Persist between runs so --cleanup works
 * ───────────────────────────────────────────────────────────── */

const STATE_DIR = path.join(os.homedir(), '.phase3-test');
const STATE_FILE = path.join(STATE_DIR, 'state.json');

const loadState = () => {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return {};
  }
};

const saveState = (state) => {
  if (!fs.existsSync(STATE_DIR)) fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
};

const clearState = () => {
  try {
    fs.unlinkSync(STATE_FILE);
  } catch {
    // ignore
  }
};

/* ─────────────────────────────────────────────────────────────
 * HTTP HELPERS
 * ───────────────────────────────────────────────────────────── */

const log = {
  step: (n, total, msg) => console.log(`\n[${n}/${total}] ${msg}`),
  ok: (msg) => console.log(`    ✅ ${msg}`),
  fail: (msg) => console.error(`    ❌ ${msg}`),
  info: (msg) => console.log(`    ℹ️  ${msg}`),
  response: (data) => console.log(`    →`, JSON.stringify(data, null, 2)),
};

const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
      ? { rejectUnauthorized: false }
      : false,
});

async function postJson(endpoint, body, headers = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response from ${endpoint}: ${text.slice(0, 200)}`);
  }
}

async function patchJson(endpoint, body, headers = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response from ${endpoint}: ${text.slice(0, 200)}`);
  }
}

async function postFormData(endpoint, formData, headers = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response from ${endpoint}: ${text.slice(0, 200)}`);
  }
}

/* ─────────────────────────────────────────────────────────────
 * CLEANUP MODE
 * ───────────────────────────────────────────────────────────── */

async function runCleanup() {
  const state = loadState();

  if (!state.studentId && !state.paymentId) {
    console.log('ℹ️  No previous test state found. Nothing to clean up.');
    return;
  }

  console.log('🧹 Cleaning up previous test data...');
  console.log(`   Student: ${state.studentId || '(none)'}`);
  console.log(`   Payment: ${state.paymentId || '(none)'}`);

  try {
    if (state.paymentId) {
      await dbPool.query('DELETE FROM agent_commissions WHERE payment_id = $1', [
        state.paymentId,
      ]);
      await dbPool.query('DELETE FROM payments WHERE id = $1', [state.paymentId]);
    }
    if (state.studentId) {
      await dbPool.query('DELETE FROM agent_settings WHERE user_id = $1', [
        state.studentId,
      ]);
      await dbPool.query('DELETE FROM agent_codes WHERE user_id = $1', [
        state.studentId,
      ]);
      await dbPool.query('DELETE FROM affiliate_wallets WHERE user_id = $1', [
        state.studentId,
      ]);
      await dbPool.query('DELETE FROM users WHERE id = $1', [state.studentId]);
    }
    clearState();
    console.log('✅ Cleanup complete');
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  }
}

/* ─────────────────────────────────────────────────────────────
 * MAIN VERIFICATION FLOW
 * ───────────────────────────────────────────────────────────── */

async function runVerification() {
  const TOTAL_STEPS = 6;

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  PHASE 3 END-TO-END VERIFICATION');
  console.log(`  Base URL: ${BASE_URL}`);
  console.log('═══════════════════════════════════════════════════════════════');

  /* ═══════════════════════════════════════════════════════════
   * STEP 1 — Register a fresh test student
   * ═══════════════════════════════════════════════════════════ */
  log.step(1, TOTAL_STEPS, 'Registering test student...');

  const testPhone = `+251900${String(Date.now()).slice(-7)}`;
  const testEmail = `phase3-${Date.now()}@test.local`;
  const testPassword = 'Test123456!';

  const registerResult = await postJson('/api/auth/register', {
    fullName: 'Phase3 Node Tester',
    phone: testPhone,
    email: testEmail,
    password: testPassword,
  });

  if (!registerResult.success || !registerResult.data?.token) {
    log.fail('Registration failed');
    log.response(registerResult);
    process.exit(1);
  }

  const studentJwt = registerResult.data.token;
  const studentId = registerResult.data.user.id;

  log.ok(`Registered: ${testPhone}`);
  log.info(`Student ID: ${studentId}`);

  saveState({ studentId, testPhone, testEmail });

  /* ═══════════════════════════════════════════════════════════
   * STEP 2 — Verify agent was auto-provisioned
   * ═══════════════════════════════════════════════════════════ */
  log.step(2, TOTAL_STEPS, 'Verifying agent was auto-provisioned...');

  const agentProvisionCheck = await dbPool.query(
    `SELECT ac.code AS agent_code, ags.commission_type, ags.commission_value
     FROM agent_codes ac
     LEFT JOIN agent_settings ags ON ags.user_id = ac.user_id
     WHERE ac.user_id = $1`,
    [studentId]
  );

  if (agentProvisionCheck.rows.length === 0) {
    log.fail('Agent was NOT auto-provisioned — register.js is broken');
    process.exit(1);
  }

  const agent = agentProvisionCheck.rows[0];
  log.ok(`Auto-provisioned agent code: ${agent.agent_code}`);
  log.ok(`Commission: ${agent.commission_type} ${agent.commission_value}`);

  /* ═══════════════════════════════════════════════════════════
   * STEP 3 — Submit a payment WITH agent attribution
   * ═══════════════════════════════════════════════════════════ */
  log.step(3, TOTAL_STEPS, 'Submitting payment with a different agent...');

  const otherAgentResult = await dbPool.query(
    `SELECT ac.user_id, ac.code, ags.commission_type, ags.commission_value, u.full_name
     FROM agent_codes ac
     JOIN users u ON u.id = ac.user_id
     JOIN agent_settings ags ON ags.user_id = ac.user_id
     WHERE ac.is_active = true
       AND ags.is_active = true
       AND ac.user_id != $1
     ORDER BY ac.created_at DESC
     LIMIT 1`,
    [studentId]
  );

  if (otherAgentResult.rows.length === 0) {
    log.fail('No other active agent found in DB');
    process.exit(1);
  }

  const otherAgent = otherAgentResult.rows[0];
  log.info(`Using agent: ${otherAgent.full_name} (${otherAgent.code})`);

  saveState({
    ...loadState(),
    targetAgentId: otherAgent.user_id,
    targetAgentCode: otherAgent.code,
  });

  const formData = new FormData();
  formData.append('fullName', 'Phase3 Node Tester');
  formData.append('phone', testPhone);
  formData.append('paymentMethod', 'telebirr');
  formData.append('transactionRef', `PHASE3-${Date.now()}`);
  formData.append('purchaseMode', 'full-course');
  formData.append('amount', '1000');
  formData.append('agentId', otherAgent.user_id);

  const submitResult = await postFormData('/api/payments/submit', formData, {
    Authorization: `Bearer ${studentJwt}`,
  });

  if (!submitResult.success || !submitResult.data?.paymentId) {
    log.fail('Payment submission failed');
    log.response(submitResult);
    process.exit(1);
  }

  if (!submitResult.data.agentAttributed) {
    log.fail('agentAttributed is FALSE — submit.js is broken');
    log.response(submitResult);
    process.exit(1);
  }

  const paymentId = submitResult.data.paymentId;
  log.ok(`Payment submitted: ${paymentId}`);
  log.ok(`agentAttributed: TRUE`);

  saveState({ ...loadState(), paymentId });

  const agentIdCheck = await dbPool.query(
    'SELECT agent_id FROM payments WHERE id = $1',
    [paymentId]
  );

  if (!agentIdCheck.rows[0]?.agent_id) {
    log.fail('agent_id is NULL in the payments table — submit.js storage failed');
    process.exit(1);
  }
  log.ok(`DB confirms agent_id stored: ${agentIdCheck.rows[0].agent_id}`);

  /* ═══════════════════════════════════════════════════════════
   * STEP 4 — Admin login
   * ═══════════════════════════════════════════════════════════ */
  log.step(4, TOTAL_STEPS, 'Admin login...');

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    log.fail('Missing admin credentials');
    console.log('');
    console.log('  Provide them one of these ways:');
    console.log('    node tools/verify-phase3.js --admin-username=admin --admin-password=xxx');
    console.log('    ADMIN_USERNAME=admin ADMIN_PASSWORD=xxx node tools/verify-phase3.js');
    process.exit(1);
  }

  log.info(`Attempting login as: ${ADMIN_USERNAME}`);

  const adminLoginResult = await postJson('/api/auth/admin/login', {
    username: ADMIN_USERNAME,
    password: ADMIN_PASSWORD,
  });

  if (!adminLoginResult.success || !adminLoginResult.data?.token) {
    log.fail('Admin login failed');
    log.response(adminLoginResult);
    process.exit(1);
  }

  const adminJwt = adminLoginResult.data.token;
  log.ok(`Admin authenticated (${adminJwt.length} chars)`);

  /* ═══════════════════════════════════════════════════════════
   * STEP 5 — Approve the payment
   * ═══════════════════════════════════════════════════════════ */
  log.step(5, TOTAL_STEPS, 'Approving payment...');

  const approveResult = await patchJson(
    `/api/admin/payments/${paymentId}/approve`,
    null,
    { Authorization: `Bearer ${adminJwt}` }
  );

  if (!approveResult.success) {
    log.fail('Approval failed');
    log.response(approveResult);
    process.exit(1);
  }

  if (approveResult.data?.agentAttributed !== true) {
    log.fail('Approval did not confirm agent attribution');
    log.response(approveResult);
    process.exit(1);
  }

  log.ok('Payment approved');
  log.ok('agentAttributed: TRUE (agent branch fired)');

  /* ═══════════════════════════════════════════════════════════
   * STEP 6 — Verify commission + wallet
   * ═══════════════════════════════════════════════════════════ */
  log.step(6, TOTAL_STEPS, 'Verifying commission + wallet...');

  await new Promise((resolve) => setTimeout(resolve, 500));

  const commissionRow = await dbPool.query(
    `SELECT agent_user_id, commission_type, commission_amount, sale_amount, status, paid_at
     FROM agent_commissions
     WHERE payment_id = $1`,
    [paymentId]
  );

  if (commissionRow.rows.length === 0) {
    log.fail('No agent_commissions row found — approve.js commission FAILED');
    process.exit(1);
  }

  const commission = commissionRow.rows[0];
  log.ok(
    `Commission row created: ${commission.commission_amount} ETB (${commission.commission_type}, status=${commission.status})`
  );

  const walletRow = await dbPool.query(
    'SELECT current_balance, total_earned FROM affiliate_wallets WHERE user_id = $1',
    [otherAgent.user_id]
  );

  if (walletRow.rows.length === 0) {
    log.fail('Agent wallet not found — wallet credit FAILED');
    process.exit(1);
  }

  const wallet = walletRow.rows[0];
  log.ok(`Agent wallet balance: ${wallet.current_balance} ETB`);
  log.ok(`Agent total earned: ${wallet.total_earned} ETB`);

  /* ═══════════════════════════════════════════════════════════
   * FINAL REPORT
   * ═══════════════════════════════════════════════════════════ */
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  ✅ PHASE 3 VERIFIED END-TO-END');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('  Summary:');
  console.log(`    Student registered:   ${testPhone}`);
  console.log(`    Agent auto-created:   ${agent.agent_code}`);
  console.log(`    Payment submitted:    ${paymentId}`);
  console.log(`    Attribution agent:    ${otherAgent.full_name} (${otherAgent.code})`);
  console.log(`    Commission paid:      ${commission.commission_amount} ETB`);
  console.log(`    Agent wallet:         ${wallet.current_balance} ETB`);
  console.log('');
  console.log('  To clean up test data:');
  console.log('    node tools/verify-phase3.js --cleanup');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
}

/* ─────────────────────────────────────────────────────────────
 * ENTRY POINT
 * ───────────────────────────────────────────────────────────── */

(async () => {
  try {
    if (CLEANUP_ONLY) {
      await runCleanup();
    } else {
      await runVerification();
    }
  } catch (error) {
    console.error('');
    console.error('❌ FATAL:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await dbPool.end();
  }
})();