/**
 * @fileoverview Database Contract Probe
 *
 * Development-only introspection tool that prints the exact column
 * contract (names, types, nullability) and one sample row shape for every
 * table the admin UI consumes. Eliminates field-name guessing between
 * DB → API → JSX by printing the single source of truth.
 *
 * Usage:
 *   node tools/db-contract.js                 # probes the default table set
 *   node tools/db-contract.js users payments  # probes specific tables
 *
 * Security: table identifiers are validated against a strict pattern and
 * confirmed to exist in information_schema before any query runs, so no
 * user-supplied string can reach SQL unvalidated.
 *
 * Path: tools/db-contract.js
 */
const path = require('path');
const { Pool } = require('pg');

/* Environment bootstrap: apps/api/.env → repo root .env → process.env */
require('dotenv').config({ path: path.join(__dirname, '..', 'apps', 'api', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

/* Tables the admin/student surfaces read from (override via CLI args) */
const DEFAULT_TABLES = [
  'users',
  'referral_codes',
  'courses',
  'course_videos',
  'discussion_videos',
  'payments',
];

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
      ? { rejectUnauthorized: false }
      : false,
});

/**
 * Validate a table identifier before it can ever reach a query string.
 * @param {string} name - Candidate table name
 * @returns {boolean} True when the identifier is safe
 */
const isSafeIdentifier = (name) => /^[a-z_][a-z0-9_]*$/.test(name);

/**
 * Read the column contract of one public-schema table.
 * @param {string} table - Validated table name
 * @returns {Promise<Array>} Column metadata rows
 */
const columnsOf = async (table) => {
  const result = await pool.query(
    `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
      ORDER BY ordinal_position`,
    [table]
  );
  return result.rows;
};

/**
 * Read one sample row so the runtime shape (not just schema) is visible.
 * @param {string} table - Validated, existing table name
 * @returns {Promise<object|null>} Sample row or null when empty
 */
const sampleOf = async (table) => {
  const result = await pool.query(`SELECT * FROM "${table}" LIMIT 1`);
  return result.rows[0] || null;
};

/**
 * Probe every requested table and print contracts + sample shapes.
 */
const main = async () => {
  const requested = process.argv.slice(2).filter(Boolean);
  const targets = requested.length > 0 ? requested : DEFAULT_TABLES;

  for (const table of targets) {
    if (!isSafeIdentifier(table)) {
      console.warn(`Skipping invalid identifier: ${table}`);
      continue;
    }

    const columns = await columnsOf(table);
    if (columns.length === 0) {
      console.log(`\n[${table}] table not found in public schema`);
      continue;
    }

    console.log(`\n[${table}] ${columns.length} columns`);
    console.table(columns.map((column) => ({
      column: column.column_name,
      type: column.data_type,
      nullable: column.is_nullable,
    })));

    const sample = await sampleOf(table);
    console.log(
      `[${table}] sample keys: ${sample ? Object.keys(sample).join(', ') : '(empty table)'}`
    );
  }
};

main()
  .catch((error) => {
    console.error('Contract probe failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());