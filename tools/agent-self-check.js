/**
 * @fileoverview Agent Self-Check Script
 *
 * Given a phone number, finds the matching user (loose match to handle
 * spacing/format differences), reports their agent setup, provisions
 * missing agent code + settings, and prints a working registration URL.
 *
 * Safe to run multiple times — every write is idempotent.
 *
 * Usage:
 *   node tools/agent-self-check.js +251920944941
 *   node tools/agent-self-check.js 0920944941
 *
 * Path: tools/agent-self-check.js
 */
'use strict';

require('dotenv').config({ path: './apps/web/.env.local' });

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
      ? { rejectUnauthorized: false }
      : false,
});

/**
 * Find a user by a loose phone match (ignores spaces, leading +, and
 * country code variations).
 *
 * @param {string} rawInput
 * @returns {Promise<object|null>}
 */
const findUserByPhone = async (rawInput) => {
  const digits = rawInput.replace(/\D/g, '');
  if (!digits) return null;

  /* Try several normalized forms so any region format works. */
  const variants = new Set([
    digits,
    `0${digits.slice(-9)}`,
    `+251${digits.slice(-9)}`,
    `251${digits.slice(-9)}`,
    `+251 9${digits.slice(-8, -7)} ${digits.slice(-7, -4)} ${digits.slice(-4)}`,
  ]);

  const result = await pool.query(
    `SELECT id, full_name, phone, is_agent, created_at
     FROM users
     WHERE REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = ANY($1::text[])
     ORDER BY created_at DESC
     LIMIT 1`,
    [Array.from(variants)]
  );

  return result.rows[0] || null;
};

/**
 * Load existing agent data for a user.
 *
 * @param {string} userId
 * @returns {Promise<{agentCode: object|null, settings: object|null}>}
 */
const loadAgentData = async (userId) => {
  const codeResult = await pool.query(
    'SELECT code, is_active, created_at FROM agent_codes WHERE user_id = $1',
    [userId]
  );
  const settingsResult = await pool.query(
    'SELECT commission_type, commission_value, is_active FROM agent_settings WHERE user_id = $1',
    [userId]
  );

  return {
    agentCode: codeResult.rows[0] || null,
    settings: settingsResult.rows[0] || null,
  };
};

/**
 * Provision an agent code + settings if missing. Idempotent.
 *
 * @param {string} userId
 */
const provisionIfMissing = async (userId) => {
  await pool.query(
    `INSERT INTO agent_codes (user_id, code, is_active)
     SELECT $1, 'AGT-' || UPPER(LEFT(REPLACE(gen_random_uuid()::text, '-', ''), 8)), true
     WHERE NOT EXISTS (SELECT 1 FROM agent_codes WHERE user_id = $1)`,
    [userId]
  );

  await pool.query(
    `INSERT INTO agent_settings (user_id, commission_type, commission_value, is_active)
     VALUES ($1, 'fixed', 500, true)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );

  await pool.query(
    `UPDATE users SET is_agent = true WHERE id = $1`,
    [userId]
  );
};

/**
 * Main.
 */
const main = async () => {
  const rawInput = process.argv[2];
  if (!rawInput) {
    console.error('Usage: node tools/agent-self-check.js +251XXXXXXXXX');
    process.exit(1);
  }

  console.log(`\nSearching for user matching: ${rawInput}\n`);

  const user = await findUserByPhone(rawInput);

  if (!user) {
    console.log('❌ No user found in this database matching that phone.\n');
    console.log('Checked against DATABASE_URL:');
    const dbUrl = process.env.DATABASE_URL || '(not set)';
    console.log(`  ${dbUrl.replace(/:\/\/[^@]+@/, '://***@')}\n`);
    console.log('Possible causes:');
    console.log('  • The account lives in a different database');
    console.log('  • The phone number has a typo');
    console.log('  • The account was deleted');
    console.log('\nTry listing recent users:');
    console.log('  node tools/agent-self-check.js list\n');
    await pool.end();
    process.exit(0);
  }

  console.log('✅ User found:');
  console.log(`   id:         ${user.id}`);
  console.log(`   name:       ${user.full_name}`);
  console.log(`   phone:      ${user.phone}`);
  console.log(`   is_agent:   ${user.is_agent}`);
  console.log(`   created:    ${user.created_at}\n`);

  let { agentCode, settings } = await loadAgentData(user.id);

  if (!agentCode) {
    console.log('ℹ  No agent code found — provisioning...\n');
    await provisionIfMissing(user.id);
    ({ agentCode, settings } = await loadAgentData(user.id));
  }

  if (!settings) {
    console.log('ℹ  No agent settings found — provisioning...\n');
    await provisionIfMissing(user.id);
    ({ agentCode, settings } = await loadAgentData(user.id));
  }

  if (agentCode) {
    console.log(`✅ Agent code: ${agentCode.code}`);
    console.log(`   active:     ${agentCode.is_active}`);
    console.log(`   Test URL:   http://localhost:3000/auth/register?agent=${agentCode.code}\n`);
  } else {
    console.log('❌ Provisioning failed — agent code still missing.\n');
  }

  if (settings) {
    const unit = settings.commission_type === 'percentage' ? '%' : 'ETB';
    console.log(
      `✅ Commission: ${settings.commission_value} ${unit} (${settings.commission_type})`
    );
    console.log(`   active:     ${settings.is_active}\n`);
  } else {
    console.log('❌ Provisioning failed — agent settings still missing.\n');
  }

  /* Wallet state */
  const wallet = await pool.query(
    'SELECT current_balance, total_earned, pending_withdrawal FROM affiliate_wallets WHERE user_id = $1',
    [user.id]
  );
  if (wallet.rows[0]) {
    console.log('💰 Wallet:');
    console.log(`   balance:            ${wallet.rows[0].current_balance}`);
    console.log(`   total earned:       ${wallet.rows[0].total_earned}`);
    console.log(`   pending withdrawal: ${wallet.rows[0].pending_withdrawal}\n`);
  }

  await pool.end();
};

main().catch((err) => {
  console.error('\n❌ Script failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});