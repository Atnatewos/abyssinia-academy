/**
 * @fileoverview Agent System Diagnostic Script
 *
 * Read-only inspection of the database to verify the agent attribution
 * system is correctly installed. Prints a pass/fail checklist and, when
 * the target code is missing, lists real codes from the DB so a valid
 * test target can be selected.
 *
 * Does NOT modify anything — safe to run against production.
 *
 * Usage:
 *   node tools/diagnose-agent-system.js
 *   node tools/diagnose-agent-system.js --agent-code=AGT-XXXXXXXX
 *
 * Path: tools/diagnose-agent-system.js
 */
'use strict';

require('dotenv').config({ path: './apps/web/.env.local' });
require('dotenv').config({ path: './apps/api/.env' });

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_URL &&
    process.env.DATABASE_URL.includes('neon.tech')
      ? { rejectUnauthorized: false }
      : false,
});

/**
 * Parse CLI flags.
 *
 * @returns {{ agentCode: string }}
 */
const parseArgs = () => {
  const agentArg = process.argv.find((a) => a.startsWith('--agent-code='));
  return {
    agentCode: agentArg ? agentArg.split('=')[1].trim().toUpperCase() : null,
  };
};

/**
 * Print a labeled PASS/FAIL line.
 *
 * @param {boolean} ok
 * @param {string} label
 * @param {string} [detail]
 */
const check = (ok, label, detail) => {
  const icon = ok ? '✅' : '❌';
  const suffix = detail ? ` — ${detail}` : '';
  console.log(`  ${icon}  ${label}${suffix}`);
};

/**
 * Run a query, returning null on error instead of throwing.
 *
 * @param {string} sql
 * @param {Array} [params]
 * @returns {Promise<object|null>}
 */
const safeQuery = async (sql, params = []) => {
  try {
    return await pool.query(sql, params);
  } catch (err) {
    console.log(`     ⚠ query error: ${err.message}`);
    return null;
  }
};

/**
 * Verify a table exists.
 *
 * @param {string} tableName
 * @returns {Promise<boolean>}
 */
const checkTable = async (tableName) => {
  const result = await safeQuery(
    `SELECT COUNT(*)::int AS c FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1`,
    [tableName]
  );
  const count = result?.rows[0]?.c || 0;
  check(count > 0, `Table "${tableName}"`, count > 0 ? `${count} columns` : 'MISSING');
  return count > 0;
};

/**
 * Verify a specific column exists.
 *
 * @param {string} tableName
 * @param {string} columnName
 * @returns {Promise<boolean>}
 */
const checkColumn = async (tableName, columnName) => {
  const result = await safeQuery(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
    [tableName, columnName]
  );
  const exists = (result?.rows.length || 0) > 0;
  check(exists, `Column "${tableName}.${columnName}"`);
  return exists;
};

/**
 * Report agent data presence and, when the target code is missing,
 * show a sample of real codes from the DB.
 *
 * @param {string|null} targetCode
 */
const checkAgentData = async (targetCode) => {
  console.log('\n── Agent Data Presence ──');

  const codes = await safeQuery(
    'SELECT COUNT(*)::int AS c FROM agent_codes WHERE is_active = true'
  );
  const codeCount = codes?.rows[0]?.c || 0;
  check(codeCount > 0, 'Active agent_codes', `${codeCount} rows`);

  const settings = await safeQuery(
    'SELECT COUNT(*)::int AS c FROM agent_settings WHERE is_active = true'
  );
  const settingsCount = settings?.rows[0]?.c || 0;
  check(settingsCount > 0, 'Active agent_settings', `${settingsCount} rows`);

  if (!targetCode) {
    console.log('\n  ℹ  No --agent-code flag passed; skipping code lookup.');
    return;
  }

  /* Look up the specific code */
  const target = await safeQuery(
    `SELECT ac.user_id, ac.code, ac.is_active, u.full_name,
            ags.is_active AS settings_active
     FROM agent_codes ac
     JOIN users u ON u.id = ac.user_id
     LEFT JOIN agent_settings ags ON ags.user_id = ac.user_id
     WHERE ac.code = $1`,
    [targetCode]
  );

  if (target?.rows.length > 0) {
    const row = target.rows[0];
    check(true, `Code "${targetCode}"`, `owned by "${row.full_name}" (${row.user_id})`);
    check(row.is_active, 'Code is_active');
    check(row.settings_active !== false, 'Agent settings is_active');
    return;
  }

  /* Target code missing — surface a real code so tests can proceed */
  check(false, `Code "${targetCode}"`, 'NOT FOUND in this database');

  const samples = await safeQuery(
    `SELECT ac.code, u.full_name, ac.user_id
     FROM agent_codes ac
     JOIN users u ON u.id = ac.user_id
     LEFT JOIN agent_settings ags ON ags.user_id = ac.user_id
     WHERE ac.is_active = true
       AND (ags.is_active IS NULL OR ags.is_active = true)
     ORDER BY u.created_at DESC
     LIMIT 5`
  );

  if (samples?.rows.length) {
    console.log('\n  ℹ  Recent valid agent codes you can test with:');
    for (const s of samples.rows) {
      console.log(`       ${s.code}   (${s.full_name})`);
    }
    console.log(
      '\n  ℹ  Re-run with:  node tools/diagnose-agent-system.js --agent-code=<one-above>'
    );
  }
};

/**
 * Report on the test user phone.
 */
const checkTestUser = async () => {
  console.log('\n── Test User (+251900000099) ──');

  const result = await safeQuery(
    `SELECT id, full_name, phone, is_agent,
            password IS NOT NULL AS has_password,
            LENGTH(password) AS password_hash_length
     FROM users WHERE phone = $1`,
    ['+251900000099']
  );

  if (!result) {
    check(false, 'Query failed — pending_agent_id column may still be missing');
    return;
  }

  if (result.rows.length === 0) {
    check(false, 'User exists', 'NOT FOUND — registration never succeeded');
    return;
  }

  const user = result.rows[0];
  check(true, 'User exists', user.id);
  check(true, 'Has password hash', `${user.password_hash_length} chars`);
  check(true, 'is_agent', String(user.is_agent));

  /* pending_agent_id is optional to inspect — column may not exist yet */
  const pendingCol = await safeQuery(
    `SELECT pending_agent_id FROM users WHERE phone = $1`,
    ['+251900000099']
  );
  if (pendingCol) {
    const val = pendingCol.rows[0]?.pending_agent_id;
    console.log(`  ℹ  pending_agent_id: ${val || 'NULL'}`);
  }
};

/**
 * Report on the latest payment row.
 */
const checkLatestPayment = async () => {
  console.log('\n── Latest Payment ──');

  const result = await safeQuery(
    `SELECT id, user_id, amount, agent_id, status, created_at
     FROM payments ORDER BY created_at DESC LIMIT 1`
  );

  if (!result) {
    check(false, 'Query failed');
    return;
  }

  if (result.rows.length === 0) {
    console.log('  ℹ  No payments in DB yet');
    return;
  }

  const p = result.rows[0];
  console.log(`  ℹ  Latest payment:`);
  console.log(`       id:       ${p.id}`);
  console.log(`       status:   ${p.status}`);
  console.log(`       amount:   ${p.amount} ETB`);
  console.log(`       agent_id: ${p.agent_id || 'NULL ← attribution missing'}`);
};

/**
 * Main entry point.
 */
const main = async () => {
  const { agentCode } = parseArgs();

  console.log('\n══════════════════════════════════════════════════════');
  console.log('  AGENT SYSTEM DIAGNOSTIC');
  console.log('══════════════════════════════════════════════════════\n');

  console.log('── Tables ──');
  for (const t of [
    'agent_codes',
    'agent_settings',
    'agent_commissions',
    'users',
    'payments',
    'affiliate_wallets',
  ]) {
    await checkTable(t);
  }

  console.log('\n── Critical Columns ──');
  const hasPendingAgent = await checkColumn('users', 'pending_agent_id');
  await checkColumn('users', 'is_agent');
  await checkColumn('payments', 'agent_id');
  await checkColumn('agent_commissions', 'status');
  await checkColumn('agent_settings', 'commission_type');
  await checkColumn('agent_settings', 'commission_value');

  await checkAgentData(agentCode);
  await checkTestUser();
  await checkLatestPayment();

  console.log('\n══════════════════════════════════════════════════════');
  if (!hasPendingAgent) {
    console.log('  ❌ ACTION REQUIRED: Apply migration 018');
    console.log('     → node tools/migrate.js');
  } else {
    console.log('  ✅ Schema looks ready');
  }
  console.log('══════════════════════════════════════════════════════\n');

  await pool.end();
};

main().catch((err) => {
  console.error('\n❌ Diagnostic failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});