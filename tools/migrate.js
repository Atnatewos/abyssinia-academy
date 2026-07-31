/**
 * @fileoverview Database Migration Runner
 * Executes the single schema SQL file against Neon PostgreSQL
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

const runMigrations = async () => {
  const client = await pool.connect();

  try {
    console.log('📦 Starting database migration...');
    console.log(`🔗 Connected to: ${process.env.DB_HOST}`);

    const sqlPath = path.join(
      __dirname,
      '..',
      'apps',
      'api',
      'src',
      'database',
      'migrations',
      '001_create_all_tables.sql'
    );

    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Migration file not found at: ${sqlPath}`);
    }

    const sql = fs.readFileSync(sqlPath, 'utf-8');
    console.log('📝 Executing schema (all tables in one migration)...');

    await client.query(sql);

    console.log('✅ All tables created successfully!');

    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('📋 Created tables:');
    tablesResult.rows.forEach((row) => {
      console.log(`   - ${row.table_name}`);
    });

    console.log('🎉 Migration completed!');
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