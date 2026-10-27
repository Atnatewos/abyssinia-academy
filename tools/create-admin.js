/**
 * @fileoverview Admin User Seeder
 *
 * Creates the initial super-admin account in the `admins` table.
 * Run this once after deploying the database to gain access to the admin panel.
 *
 * Usage:
 *   node tools/create-admin.js
 *
 * Path: tools/create-admin.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', 'apps', 'api', '.env') });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
});

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@abyssinia.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AbyssiniaAdmin@2026!';

const createAdmin = async () => {
  try {
    console.log('🔐 Creating initial admin account...');
    
    const existing = await pool.query(
      'SELECT id FROM admins WHERE username = $1 OR email = $2',
      [ADMIN_USERNAME, ADMIN_EMAIL]
    );

    if (existing.rows.length > 0) {
      console.log('✅ Admin account already exists.');
      console.log(`   Username: ${ADMIN_USERNAME}`);
      console.log(`   Email:    ${ADMIN_EMAIL}`);
      console.log('   (Check your .env file for the password you set)');
      await pool.end();
      return;
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    /*
     * Insert the admin record. Adjust columns if your `admins` table
     * schema differs (e.g., if it requires a `role` column).
     */
    await pool.query(
      `INSERT INTO admins (username, email, password, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [ADMIN_USERNAME, ADMIN_EMAIL, passwordHash]
    );

    console.log('🎉 Admin account created successfully!');
    console.log('────────────────────────────────────');
    console.log(`   Username: ${ADMIN_USERNAME}`);
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('────────────────────────────────────');
    console.log('⚠️  Please change this password after first login.');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Failed to create admin:', error.message);
    process.exit(1);
  }
};

createAdmin();