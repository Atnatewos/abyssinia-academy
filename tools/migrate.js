/**
 * @fileoverview Database Migration Runner
 * Executes all migration SQL files in sequential order against Neon PostgreSQL
 * Path: tools/migrate.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', 'apps', 'api', '.env') });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

/**
 * Run all migrations in sequential order
 * Files are sorted alphabetically, so 001_ runs before 002_, etc.
 */
const runMigrations = async () => {
  const client = await pool.connect();

  try {
    console.log('📦 Starting database migration...');
    console.log(`🔗 Connected to: ${new URL(process.env.DATABASE_URL).hostname}`);

    /*
     * Path to the migrations directory
     */
    const migrationsDir = path.join(
      __dirname,
      '..',
      'apps',
      'api',
      'src',
      'database',
      'migrations'
    );

    if (!fs.existsSync(migrationsDir)) {
      throw new Error(`Migrations directory not found at: ${migrationsDir}`);
    }

    /*
     * Read all .sql files and sort them alphabetically
     * This ensures 001_ runs before 002_, etc.
     */
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    if (migrationFiles.length === 0) {
      console.log('📭 No migration files found.');
      return;
    }

    console.log(`📋 Found ${migrationFiles.length} migration file(s):`);
    migrationFiles.forEach((file) => console.log(`   - ${file}`));

    /*
     * Execute each migration file in order
     */
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      console.log(`\n📝 Executing: ${file}...`);

      try {
        await client.query(sql);
        console.log(`   ✅ ${file} — completed successfully`);
      } catch (error) {
        /*
         * If the error is about a column/table already existing,
         * treat it as a warning (idempotent migration) rather than a failure
         */
        if (
          error.message.includes('already exists') ||
          error.message.includes('duplicate column') ||
          error.message.includes('duplicate key')
        ) {
          console.log(`   ⚠️  ${file} — already applied (skipped): ${error.message.split('\n')[0]}`);
        } else {
          throw error;
        }
      }
    }

    /*
     * Display the final table structure
     */
    console.log('\n📋 Current tables:');
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    tablesResult.rows.forEach((row) => {
      console.log(`   - ${row.table_name}`);
    });

    /*
     * Display enrollments table columns to verify the migration
     */
    console.log('\n📋 Enrollments table columns:');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'enrollments'
      ORDER BY ordinal_position
    `);

    columnsResult.rows.forEach((row) => {
      const defaultInfo = row.column_default ? ` [default: ${row.column_default}]` : '';
      console.log(`   - ${row.column_name} (${row.data_type})${defaultInfo}`);
    });

    console.log('\n🎉 All migrations completed!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

runMigrations()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));