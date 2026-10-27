/**
 * @fileoverview Database Pool Export
 * Re-exports the configured pool for use across the API
 * Path: apps/api/src/database/pool.js
 */

const { pool, query, getClient, testConnection } = require('../config/database');

module.exports = {
  pool,
  query,
  getClient,
  testConnection,
};