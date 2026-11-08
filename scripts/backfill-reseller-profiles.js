/**
 * @filepath scripts/backfill-reseller-profiles.js
 * @description One-time backfill: create a reseller_profile row for every
 *              existing user who doesn't have one. Idempotent — safe to run
 *              multiple times. Uses the shared reseller module for consistency.
 *
 * Usage:
 *   node scripts/backfill-reseller-profiles.js
 *   node scripts/backfill-reseller-profiles.js --dry-run
 *
 * Environment:
 *   DATABASE_URL         — Required. Neon / Postgres connection string.
 *   RESELLER_DEFAULT_PRICE — Optional. Override default price (default 1000).
 */

require('dotenv').config();

const path = require('path');
const { Pool } = require('pg');

/* Load shared modules via the project's path aliases or relative paths */
const reseller = require(path.join(__dirname, '..', 'packages', 'shared', 'reseller'));
const { loadResellerConfig } = reseller;

/* ── Argument parsing ────────────────────────────────────────────────────── */
const isDryRun = process.argv.includes('--dry-run');
const isVerbose = process.argv.includes('--verbose') || process.argv.includes('-v');

/* ── Database pool ───────────────────────────────────────────────────────── */
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set.');
  process.exit(1);
}

const isNeon = process.env.DATABASE_URL.includes('neon.tech');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isNeon ? { rejectUnauthorized: false } : false,
});

/* ── Adapt pool to reseller module's `db` interface ─────────────────────── */
const db = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};

/**
 * Main backfill routine.
 */
const run = async () => {
  const startTime = Date.now();
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  Reseller Profile Backfill');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Mode: ${isDryRun ? 'DRY RUN (no writes)' : 'APPLY'}`);
  console.log('');

  /* 1. Load config (so we respect the current default price) */
  const config = await loadResellerConfig({ db });
  const defaultPrice = Number(process.env.RESELLER_DEFAULT_PRICE) || config.pricing.defaultRetailPriceETB;
  console.log(`  Default price for backfilled profiles: ${defaultPrice} ETB`);

  /* 2. Find users without a reseller profile */
  const missingResult = await pool.query(
    `SELECT u.id, u.full_name, u.phone
     FROM users u
     LEFT JOIN reseller_profiles rp ON rp.user_id = u.id
     WHERE rp.id IS NULL`
  );

  const users = missingResult.rows;
  console.log(`  Users without a reseller profile: ${users.length}`);
  console.log('');

  if (users.length === 0) {
    console.log('✅ Nothing to backfill. All users already have a profile.');
    return;
  }

  if (isDryRun) {
    console.log('  DRY RUN — would create profiles for:');
    users.slice(0, 20).forEach((u, i) => {
      console.log(`    ${i + 1}. ${u.full_name} (${u.phone})`);
    });
    if (users.length > 20) {
      console.log(`    ... and ${users.length - 20} more`);
    }
    return;
  }

  /* 3. Create profiles one by one (in its own transaction per user for safety) */
  let created = 0;
  let failed = 0;
  const failures = [];

  for (const user of users) {
    try {
      await reseller.ensureResellerProfile(db, user.id, { customPrice: defaultPrice });
      created++;
      if (isVerbose) {
        console.log(`  ✅ ${user.full_name} (${user.phone})`);
      } else if (created % 50 === 0) {
        console.log(`  Progress: ${created} / ${users.length}`);
      }
    } catch (err) {
      failed++;
      failures.push({ userId: user.id, fullName: user.full_name, error: err.message });
      console.error(`  ❌ Failed for ${user.full_name} (${user.id}): ${err.message}`);
    }
  }

  /* 4. Summary */
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  Summary');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Created:  ${created}`);
  console.log(`  Failed:   ${failed}`);
  console.log(`  Duration: ${duration}s`);
  if (failures.length > 0) {
    console.log('');
    console.log('  Failures:');
    failures.forEach((f, i) => {
      console.log(`    ${i + 1}. ${f.fullName} (${f.userId}): ${f.error}`);
    });
  }
  console.log('═══════════════════════════════════════════════════════════════');
};

/* ── Entry point ─────────────────────────────────────────────────────────── */
run()
  .then(() => {
    pool.end();
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Fatal error:', err);
    pool.end();
    process.exit(1);
  });