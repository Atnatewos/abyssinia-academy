/**
 * @fileoverview Shared Database Connection Pool
 *
 * Single pool instance for all Next.js API routes. Configured for Neon
 * serverless PostgreSQL, which closes idle connections server-side and
 * requires the client to detect and retry on "Connection terminated"
 * errors. This module wraps the pool with:
 *
 *   - TCP keepAlive to reduce idle disconnects
 *   - Broader retry detection (covers Neon's specific termination strings)
 *   - Exponential backoff between retries
 *   - Connection recycling via maxUses to prevent long-running stale clients
 *
 * Why not Prisma / Drizzle / etc.?
 *   The entire API layer uses parameterized `pg` queries directly. Adding
 *   an ORM would mean rewriting every query module for zero functional
 *   gain. The retry wrapper below is the minimal change that makes raw
 *   `pg` resilient against Neon's connection lifecycle.
 *
 * Path: apps/web/lib/db.js
 */

import { Pool } from 'pg';

const isNeon = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech');

/*
 * Pool sizing note: Next.js API routes run in serverless functions on
 * Vercel, so each cold start gets its own pool instance. Keeping max low
 * prevents Neon connection-limit exhaustion during traffic spikes.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isNeon ? { rejectUnauthorized: false } : false,
  max: 10,
  min: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  maxUses: 7500,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

/*
 * Pool-level error events must never crash the process. Emit a warn so
 * the operator sees the disconnect, but let the retry wrapper on the
 * next query handle recovery.
 */
pool.on('error', (err) => {
  console.warn('Database pool error (will retry on next query):', err.message);
});

/**
 * Distinguish transient connection errors (retryable) from real query
 * errors (must surface to the caller). Retrying a bad SQL statement
 * burns 3 round-trips and masks the actual problem.
 *
 * @param {Error} error
 * @returns {boolean} true if the error is a transient connection issue
 */
const isRetryableError = (error) => {
  const message = String(error?.message || '');
  const code = String(error?.code || '');

  return (
    message.includes('Connection terminated') ||
    message.includes('ECONNRESET') ||
    message.includes('ETIMEDOUT') ||
    message.includes('Client has encountered a connection error') ||
    message.includes('Connection terminated unexpectedly') ||
    code === 'ECONNREFUSED' ||
    code === 'ETIMEDOUT' ||
    code === '57P01' // Postgres: admin_shutdown
  );
};

/**
 * Execute a parameterized query with automatic retry on transient
 * connection errors.
 *
 * Retry policy: up to 3 attempts, exponential backoff (500ms, 1000ms,
 * 2000ms). Total worst case ≈ 3.5 seconds. This is short enough to fit
 * inside Vercel's default function timeout and long enough for Neon to
 * warm a connection back up.
 *
 * @param {string} text - SQL with $1, $2 placeholders
 * @param {Array} [params] - Query parameters
 * @returns {Promise<import('pg').QueryResult>}
 * @throws {Error} The final error if all retries fail, or the original
 *   error immediately if it's not retryable (e.g. constraint violation).
 */
const query = async (text, params) => {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await pool.query(text, params);
    } catch (error) {
      lastError = error;

      if (!isRetryableError(error) || attempt === maxRetries - 1) {
        /*
         * Either the error is not retryable (query bug, constraint
         * violation, etc.), or we've exhausted retries. Surface it.
         */
        throw error;
      }

      /*
       * Transient error with retries remaining. Wait and try again.
       * Backoff: 500ms, 1000ms (attempt 0 and 1 respectively).
       */
      const delayMs = 500 * Math.pow(2, attempt);
      console.warn(
        `DB query failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delayMs}ms: ${error.message}`
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
};

export { pool, query };