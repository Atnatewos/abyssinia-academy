/**
 * @fileoverview Database Migration Runner (Strict Ledger Mode)
 *
 * Executes migration files in sequential order and records every successful
 * run in the _migrations table. Once a migration is recorded, it never runs
 * again — this enforces the "frozen ledger" migration philosophy where
 * migrations are immutable history and only new files execute.
 *
 * First-run bootstrap:
 *   If _migrations doesn't exist yet, this runner creates it. Because the
 *   database already contains schema from prior ad-hoc runs, every existing
 *   migration file is recorded as "already applied" without re-executing.
 *   This preserves data integrity on the transition to ledger mode.
 *
 * Subsequent runs:
 *   Only new migration files (not recorded in _migrations) execute. After
 *   each success, a row is inserted into _migrations so it never runs again.
 *
 * Path: tools/migrate.js
 */

require('dotenv').config({
  path: require('path').join(__dirname, '..', 'apps', 'api', '.env'),
});

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Pool } = require('pg');

/*
 * Resolve the migrations directory relative to this script's location.
 * Keeps the runner resilient to being executed from any working directory.
 */
const MIGRATIONS_DIR = path.join(
  __dirname,
  '..',
  'apps',
  'api',
  'src',
  'database',
  'migrations'
);

/*
 * Single shared pool. SSL is enabled for Neon serverless connections.
 * The connection string is read from DATABASE_URL — zero hardcoding.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

/**
 * Compute a stable SHA-256 checksum of a migration file's content.
 * Used to detect accidental edits to already-applied migrations.
 *
 * @param {string} content - Raw text of the migration file
 * @returns {string} Hex-encoded SHA-256 checksum
 */
const computeChecksum = (content) => {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
};

/**
 * Read the list of .sql migration files from disk, sorted lexicographically.
 * Numeric prefixes guarantee correct ordering across the whole set.
 *
 * @returns {Array<{filename: string, filepath: string, sql: string, checksum: string}>}
 */
const loadMigrationFiles = () => {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    throw new Error(`Migrations directory not found at: ${MIGRATIONS_DIR}`);
  }

  const filenames = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  return filenames.map((filename) => {
    const filepath = path.join(MIGRATIONS_DIR, filename);
    const sql = fs.readFileSync(filepath, 'utf8');
    return {
      filename,
      filepath,
      sql,
      checksum: computeChecksum(sql),
    };
  });
};

/**
 * Ensure the _migrations tracker table exists. If the table was just created
 * AND the database already contains schema (bootstrap case), record all
 * current migration files as "already applied" without re-executing them.
 *
 * @param {import('pg').PoolClient} client - Active database client
 * @param {Array} migrationFiles - All discovered migration files
 */
const ensureTrackerTable = async (client, migrationFiles) => {
  const tableExisted = await client.query(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = '_migrations'
    ) AS exists
  `);

  const isFirstRun = !tableExisted.rows[0].exists;

  /*
   * Always create the table if missing. This block is idempotent.
   */
  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      checksum VARCHAR(64) NOT NULL,
      ran_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      duration_ms INTEGER NOT NULL DEFAULT 0,
      source VARCHAR(50) NOT NULL DEFAULT 'cli'
    )
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_migrations_ran_at
    ON _migrations(ran_at DESC)
  `);

  /*
   * Bootstrap case: the tracker was missing but the schema already exists.
   * Detect this by checking for the canonical `users` table, which every
   * prior migration chain creates. If present, record every file as applied.
   */
  if (isFirstRun) {
    const usersExists = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'users'
      ) AS exists
    `);

    const databaseHasSchema = usersExists.rows[0].exists;

    if (databaseHasSchema) {
      console.log(
        '\n🔄 Bootstrap detected: _migrations created, existing schema preserved.'
      );
      console.log(
        '📌 Recording all current migration files as "already applied".\n'
      );

      for (const file of migrationFiles) {
        await client.query(
          `INSERT INTO _migrations (filename, checksum, duration_ms, source)
           VALUES ($1, $2, 0, 'bootstrap')
           ON CONFLICT (filename) DO NOTHING`,
          [file.filename, file.checksum]
        );
        console.log(`   ✓ Recorded: ${file.filename}`);
      }

      console.log(
        '\n🎉 Bootstrap complete. Next runs will only apply NEW files.\n'
      );
    }
  }
};

/**
 * Retrieve the set of already-applied migration filenames.
 *
 * @param {import('pg').PoolClient} client - Active database client
 * @returns {Promise<Set<string>>}
 */
const getAppliedFilenames = async (client) => {
  const result = await client.query('SELECT filename FROM _migrations');
  return new Set(result.rows.map((row) => row.filename));
};

/**
 * Execute a single migration and record it in the tracker.
 * The migration runs inside its own implicit transaction. If it fails,
 * nothing is recorded, and the runner aborts before touching other files.
 *
 * @param {import('pg').PoolClient} client - Active database client
 * @param {object} file - Migration file descriptor
 * @returns {Promise<{durationMs: number}>}
 */
const executeMigration = async (client, file) => {
  const start = Date.now();

  try {
    await client.query(file.sql);

    const durationMs = Date.now() - start;

    await client.query(
      `INSERT INTO _migrations (filename, checksum, duration_ms, source)
       VALUES ($1, $2, $3, 'cli')
       ON CONFLICT (filename) DO UPDATE SET
         ran_at = CURRENT_TIMESTAMP,
         duration_ms = EXCLUDED.duration_ms`,
      [file.filename, file.checksum, durationMs]
    );

    return { durationMs };
  } catch (error) {
    throw new Error(
      `Migration failed: ${file.filename}\n  → ${error.message}`
    );
  }
};

/**
 * Main runner. Bootstraps the tracker if needed, then applies only new files.
 * Prints a summary of the tracker table at the end for transparency.
 */
const runMigrations = async () => {
  const client = await pool.connect();

  try {
    console.log('📦 Starting database migration...');

    const hostname = new URL(process.env.DATABASE_URL).hostname;
    console.log(`🔗 Connected to: ${hostname}`);

    const migrationFiles = loadMigrationFiles();

    if (migrationFiles.length === 0) {
      console.log('📭 No migration files found.');
      return;
    }

    console.log(`📋 Found ${migrationFiles.length} migration file(s) on disk.`);

    /*
     * Ensure tracker exists and, on first bootstrap, seed it with existing
     * filenames so we don't re-run them.
     */
    await ensureTrackerTable(client, migrationFiles);

    const applied = await getAppliedFilenames(client);
    const pending = migrationFiles.filter((file) => !applied.has(file.filename));

    if (pending.length === 0) {
      console.log('\n✅ Database is up to date. No pending migrations.\n');

      /*
       * Print summary even when nothing runs — this confirms the ledger is
       * healthy and is a useful sanity check after renames or restores.
       */
      const summary = await client.query(
        `SELECT COUNT(*) AS total, MAX(ran_at) AS last_run FROM _migrations`
      );
      console.log(
        `📊 Tracker: ${summary.rows[0].total} migrations on record, last run ${summary.rows[0].last_run}.`
      );
      return;
    }

    console.log(`\n📝 ${pending.length} pending migration(s) to apply:\n`);
    pending.forEach((file) => console.log(`   → ${file.filename}`));
    console.log('');

    for (const file of pending) {
      console.log(`📝 Executing: ${file.filename}...`);
      const result = await executeMigration(client, file);
      console.log(`   ✅ ${file.filename} — done in ${result.durationMs}ms`);
    }

    console.log('\n🎉 All pending migrations completed successfully.');

    /*
     * Final summary of the ledger state.
     */
    const summary = await client.query(
      `SELECT COUNT(*) AS total, MAX(ran_at) AS last_run FROM _migrations`
    );
    console.log(
      `📊 Tracker: ${summary.rows[0].total} migrations on record, last run ${summary.rows[0].last_run}.`
    );
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

runMigrations()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));