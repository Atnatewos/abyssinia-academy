
// /**
//  * @fileoverview Shared Database Connection Pool
//  *
//  * CommonJS module (matches package.json "type": "commonjs"). Consumed via
//  * require() from every API route, reseller-api.js, and any other module
//  * that needs the shared connection pool.
//  *
//  * Single pool instance for all Next.js API routes. Configured for Neon
//  * serverless PostgreSQL, which closes idle connections server-side and
//  * requires the client to detect and retry on "Connection terminated"
//  * errors. This module wraps the pool with:
//  *
//  *   - TCP keepAlive to reduce idle disconnects
//  *   - Broader retry detection (covers Neon's specific termination strings)
//  *   - Exponential backoff between retries
//  *   - Connection recycling via maxUses to prevent long-running stale clients
//  *
//  * Path: apps/web/lib/db.js
//  */

// const { Pool } = require('pg');

// const isNeon =
//   process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech');

// /*
//  * Pool sizing note: Next.js API routes run in serverless functions on
//  * Vercel, so each cold start gets its own pool instance. Keeping max low
//  * prevents Neon connection-limit exhaustion during traffic spikes.
//  */
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: isNeon ? { rejectUnauthorized: false } : false,
//   max: 10,
//   min: 1,
//   idleTimeoutMillis: 30000,
//   connectionTimeoutMillis: 15000,
//   maxUses: 7500,
//   keepAlive: true,
//   keepAliveInitialDelayMillis: 10000,
// });

// /*
//  * Pool-level error events must never crash the process. Emit a warn so
//  * the operator sees the disconnect, but let the retry wrapper on the
//  * next query handle recovery.
//  */
// pool.on('error', (err) => {
//   console.warn('Database pool error (will retry on next query):', err.message);
// });

// /**
//  * Distinguish transient connection errors (retryable) from real query
//  * errors (must surface to the caller). Retrying a bad SQL statement
//  * burns 3 round-trips and masks the actual problem.
//  *
//  * @param {Error} error
//  * @returns {boolean} true if the error is a transient connection issue
//  */
// const isRetryableError = (error) => {
//   const message = String(error?.message || '');
//   const code = String(error?.code || '');

//   return (
//     message.includes('Connection terminated') ||
//     message.includes('ECONNRESET') ||
//     message.includes('ETIMEDOUT') ||
//     message.includes('Client has encountered a connection error') ||
//     message.includes('Connection terminated unexpectedly') ||
//     code === 'ECONNREFUSED' ||
//     code === 'ETIMEDOUT' ||
//     code === '57P01'
//   );
// };

// /**
//  * Execute a parameterized query with automatic retry on transient
//  * connection errors.
//  *
//  * Retry policy: up to 3 attempts, exponential backoff (500ms, 1000ms,
//  * 2000ms). Total worst case ~= 3.5 seconds.
//  *
//  * @param {string} text - SQL with $1, $2 placeholders
//  * @param {Array} [params] - Query parameters
//  * @returns {Promise<import('pg').QueryResult>}
//  */
// const query = async (text, params) => {
//   const maxRetries = 3;
//   let lastError;

//   for (let attempt = 0; attempt < maxRetries; attempt++) {
//     try {
//       return await pool.query(text, params);
//     } catch (error) {
//       lastError = error;

//       if (!isRetryableError(error) || attempt === maxRetries - 1) {
//         throw error;
//       }

//       const delayMs = 500 * Math.pow(2, attempt);
//       console.warn(
//         `DB query failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delayMs}ms: ${error.message}`
//       );
//       await new Promise((resolve) => setTimeout(resolve, delayMs));
//     }
//   }

//   throw lastError;
// };

// module.exports = { pool, query };


/**
 * @fileoverview Shared Database Connection Pool (Next.js API routes)
 *
 * CommonJS module. Consumed only via `require()` from Next.js API routes
 * and utility modules that need a Postgres pool. Next.js API route files
 * use ESM `import` syntax for framework reasons, but they MUST resolve
 * this module through `require()` — the package declares `"type": "commonjs"`,
 * and Next's webpack handles the interop transparently.
 *
 * Why a pool here at all?
 *   Next.js API routes run as individual serverless functions. Each cold
 *   start gets its own pool. The `max: 10` cap prevents a traffic burst
 *   from exhausting Neon's connection limit. The retry wrapper below
 *   handles Neon's server-side idle disconnects gracefully.
 *
 * Why not Prisma / Drizzle / etc.?
 *   The entire API surface uses parameterized `pg` queries. Adding an ORM
 *   would require rewriting every query module for zero functional gain.
 *   The retry wrapper is the minimal change that makes raw `pg` resilient
 *   against Neon's connection lifecycle.
 *
 * Path: apps/web/lib/db.js
 */

const { Pool } = require('pg');

const isNeon =
  process.env.DATABASE_URL &&
  process.env.DATABASE_URL.includes('neon.tech');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isNeon ? { rejectUnauthorized: false } : false,
  max: Number(process.env.DB_POOL_MAX) || 10,
  min: Number(process.env.DB_POOL_MIN) || 1,
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT) || 30000,
  connectionTimeoutMillis:
    Number(process.env.DB_CONNECTION_TIMEOUT) || 15000,
  maxUses: Number(process.env.DB_MAX_USES) || 7500,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

/*
 * Pool-level error events must never crash the process. Emit a warn so
 * the operator sees the disconnect, but let the retry wrapper on the
 * next query handle recovery.
 */
pool.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.warn(
    '[db] pool error (will retry on next query):',
    err.message
  );
});

/**
 * Distinguish transient connection errors (retryable) from real query
 * errors (must surface to the caller). Retrying a bad SQL statement
 * burns round-trips and masks the actual problem.
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
    code === '57P01'
  );
};

/**
 * Execute a parameterized query with retry on transient connection
 * errors. Up to 3 attempts, exponential backoff.
 *
 * @param {string} text - SQL with $1, $2 placeholders
 * @param {Array} [params] - Query parameters
 * @returns {Promise<import('pg').QueryResult>}
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
        throw error;
      }

      const delayMs = 500 * Math.pow(2, attempt);
      // eslint-disable-next-line no-console
      console.warn(
        `[db] query failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delayMs}ms: ${error.message}`
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
};

module.exports = { pool, query };