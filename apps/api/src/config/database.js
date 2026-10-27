/**
 * @fileoverview Database Configuration
 * PostgreSQL connection pool using Neon serverless PostgreSQL
 * Path: apps/api/src/config/database.js
 */
const { Pool } = require('pg');
const { platform } = require('../../../../packages/shared/config');

const isNeonUrl = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${platform.database.user}:${platform.database.password}@${platform.database.host}:${platform.database.port}/${platform.database.name}`,
  ssl: isNeonUrl ? { rejectUnauthorized: false } : false,
  max: platform.database.maxConnections,
  idleTimeoutMillis: platform.database.idleTimeoutMillis,
  connectionTimeoutMillis: platform.database.connectionTimeoutMillis,
});

/**
 * Test database connection with retry logic
 * @param {number} retries - Number of connection attempts
 * @returns {boolean} Connection successful
 */
const testConnection = async (retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();
      console.log('📦 PostgreSQL connected successfully at:', result.rows[0].now);
      return true;
    } catch (error) {
      console.error(`❌ Database connection attempt ${attempt}/${retries} failed:`, error.message);
      if (attempt < retries) {
        console.log('⏳ Retrying in 3 seconds...');
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }
  console.error('❌ All database connection attempts failed.');
  return false;
};

/**
 * Execute a parameterized query
 * @param {string} text - SQL query with $1, $2 placeholders
 * @param {Array} params - Query parameters
 * @returns {Object} Query result
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (platform.env === 'development' && duration > 100) {
      console.log(' Slow query:', {
        text: text.substring(0, 80),
        duration: `${duration}ms`,
        rows: result.rowCount,
      });
    }
    return result;
  } catch (error) {
    console.error('❌ Query error:', error.message);
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 * @returns {Object} Pool client
 */
const getClient = async () => {
  const client = await pool.connect();
  return client;
};

module.exports = {
  pool,
  query,
  getClient,
  testConnection,
};