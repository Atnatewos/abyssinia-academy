/**
 * @fileoverview Shared Database Connection Pool
 * Single pool instance for all API routes.
 * Path: apps/web/lib/db.js
 */

import { Pool } from 'pg';

const isNeon = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isNeon ? { rejectUnauthorized: false } : false,
  max: 10,
  min: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  maxUses: 7500,
  keepAlive: true,
});

pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
});

const query = async (text, params) => {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await pool.query(text, params);
    } catch (error) {
      lastError = error;

      if (
        error.message.includes('Connection terminated') ||
        error.message.includes('ECONNRESET') ||
        error.code === 'ECONNREFUSED' ||
        error.code === 'ETIMEDOUT'
      ) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }

      throw error;
    }
  }

  throw lastError;
};

export { pool, query };