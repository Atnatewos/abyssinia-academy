/**
 * @fileoverview God Mode Schema Probe
 * Dumps column definitions for core tables into tools/godmode-schema.txt
 * so workspace migrations and permission helpers match production exactly.
 *
 * Usage: node tools/dump-godmode-schema.js
 * Path: tools/dump-godmode-schema.js
 */
require('dotenv').config({
  path: require('path').join(__dirname, '..', 'apps', 'api', '.env'),
});

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const TABLES = ['users', 'admins', 'sessions', 'affiliate_wallets', 'withdrawal_requests'];
const OUT = path.join(__dirname, 'godmode-schema.txt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
});

const main = async () => {
  fs.writeFileSync(OUT, '');
  for (const table of TABLES) {
    const result = await pool.query(
      `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns
       WHERE table_name = $1
       ORDER BY ordinal_position`,
      [table]
    );
    const lines = result.rows.map((r) =>
      `${r.column_name} | ${r.data_type} | ${r.is_nullable === 'NO' ? 'NOT NULL' : 'nullable'} | default: ${r.column_default || 'none'}`
    );
    fs.appendFileSync(OUT, `== ${table} ==\n${lines.join('\n')}\n\n`);
  }
  console.log(`✅ Schema dumped to ${OUT}`);
  process.exit(0);
};

main().catch((e) => {
  console.error('❌ Probe failed:', e.message);
  process.exit(1);
});
