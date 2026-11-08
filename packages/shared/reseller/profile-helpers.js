/**
 * @fileoverview Reseller Profile Helpers
 *
 * Data-access functions for reseller profiles. All SQL lives here so that
 * business logic and route handlers stay clean.
 *
 * Every query uses parameterized SQL ($1, $2, ...) — no string interpolation.
 * Functions that need a transaction accept an optional `client` argument;
 * when omitted, they fall back to the pooled `query` function.
 *
 * Path: packages/shared/reseller/profile-helpers.js
 */

const crypto = require('crypto');
const { ResellerNotFoundError, ResellerConflictError } = require('./errors');

/**
 * Generate a random reseller code matching the format RES-XXXXXXXX.
 * Uses crypto.randomInt for cryptographic randomness.
 *
 * @param {number} [charsetLength=8] - Length of the random suffix
 * @returns {string} The generated code
 */
const generateResellerCode = (charsetLength = 8) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < charsetLength; i++) {
    suffix += charset[crypto.randomInt(0, charset.length)];
  }
  return `RES-${suffix}`;
};

/**
 * Generate a unique reseller code (retries on collision).
 *
 * @param {object} db - { query, getClient }
 * @param {number} [maxAttempts=10] - Maximum generation attempts
 * @returns {Promise<string>}
 * @throws {ResellerConflictError} If unable to generate a unique code
 */
const generateUniqueResellerCode = async (db, maxAttempts = 10) => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateResellerCode();
    const existing = await db.query(
      'SELECT 1 FROM reseller_profiles WHERE reseller_code = $1 LIMIT 1',
      [code]
    );
    if (existing.rows.length === 0) return code;
  }
  throw new ResellerConflictError(
    `Failed to generate a unique reseller code after ${maxAttempts} attempts.`,
    'RESELLER_CODE_COLLISION'
  );
};

/**
 * Create a reseller profile for a user. Idempotent — returns the existing
 * profile if one already exists.
 *
 * @param {object} db - { query, getClient }
 * @param {string} userId - UUID of the user
 * @param {object} [options] - Optional overrides
 * @param {string} [options.parentResellerId] - UUID of the recruiting reseller profile
 * @param {number} [options.customPrice] - Initial custom price
 * @param {number} [options.subSharePercent] - Share percent (only used if parent is set)
 * @param {number} [options.depth] - Depth (0 = top-level, 1 = sub-reseller)
 * @returns {Promise<object>} The reseller profile row
 */
const ensureResellerProfile = async (db, userId, options = {}) => {
  /* Check if profile already exists */
  const existing = await db.query(
    'SELECT * FROM reseller_profiles WHERE user_id = $1',
    [userId]
  );
  if (existing.rows.length > 0) return existing.rows[0];

  const code = await generateUniqueResellerCode(db);
  const {
    parentResellerId = null,
    customPrice = 1000,
    subSharePercent = 100,
    depth = 0,
  } = options;

  const result = await db.query(
    `INSERT INTO reseller_profiles (
       user_id, reseller_code, parent_reseller_id, depth,
       custom_price, sub_share_percent
     ) VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, code, parentResellerId, depth, customPrice, subSharePercent]
  );

  return result.rows[0];
};

/**
 * Find a reseller profile by user_id.
 *
 * @param {object} db
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
const findByUserId = async (db, userId) => {
  const result = await db.query(
    'SELECT * FROM reseller_profiles WHERE user_id = $1',
    [userId]
  );
  return result.rows[0] || null;
};

/**
 * Find a reseller profile by reseller_code (case-insensitive).
 *
 * @param {object} db
 * @param {string} code
 * @returns {Promise<object|null>}
 */
const findByCode = async (db, code) => {
  const normalized = String(code || '').trim().toUpperCase();
  if (!normalized) return null;
  const result = await db.query(
    'SELECT * FROM reseller_profiles WHERE reseller_code = $1',
    [normalized]
  );
  return result.rows[0] || null;
};

/**
 * Get the parent reseller profile of a given reseller.
 *
 * @param {object} db
 * @param {string} resellerProfileId
 * @returns {Promise<object|null>}
 */
const getParentProfile = async (db, resellerProfileId) => {
  const result = await db.query(
    `SELECT p.* FROM reseller_profiles p
     WHERE p.id = (SELECT parent_reseller_id FROM reseller_profiles WHERE id = $1)`,
    [resellerProfileId]
  );
  return result.rows[0] || null;
};

/**
 * Count the number of sub-resellers a parent has.
 *
 * @param {object} db
 * @param {string} parentResellerId
 * @returns {Promise<number>}
 */
const countSubResellers = async (db, parentResellerId) => {
  const result = await db.query(
    'SELECT COUNT(*)::int AS count FROM reseller_profiles WHERE parent_reseller_id = $1',
    [parentResellerId]
  );
  return result.rows[0].count || 0;
};

/**
 * Update a reseller's custom price.
 *
 * @param {object} db
 * @param {string} resellerProfileId
 * @param {number} newPrice - Must already be validated
 * @returns {Promise<object>} Updated profile
 */
const updatePrice = async (db, resellerProfileId, newPrice) => {
  const result = await db.query(
    `UPDATE reseller_profiles
     SET custom_price = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [resellerProfileId, newPrice]
  );
  if (result.rows.length === 0) {
    throw new ResellerNotFoundError('Reseller profile not found.', 'RESELLER_PROFILE_NOT_FOUND');
  }
  return result.rows[0];
};

/**
 * Update a sub-reseller's share percent. Only the parent can do this;
 * authorization is enforced at the API layer.
 *
 * @param {object} db
 * @param {string} subResellerProfileId
 * @param {number} newSharePercent
 * @param {string} setByUserId - UUID of the user who set the share
 * @returns {Promise<object>} Updated profile
 */
const updateSubShare = async (db, subResellerProfileId, newSharePercent, setByUserId) => {
  const result = await db.query(
    `UPDATE reseller_profiles
     SET sub_share_percent = $2,
         sub_share_set_by = $3,
         sub_share_set_at = NOW(),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [subResellerProfileId, newSharePercent, setByUserId]
  );
  if (result.rows.length === 0) {
    throw new ResellerNotFoundError('Sub-reseller profile not found.', 'RESELLER_PROFILE_NOT_FOUND');
  }
  return result.rows[0];
};

module.exports = {
  generateResellerCode,
  generateUniqueResellerCode,
  ensureResellerProfile,
  findByUserId,
  findByCode,
  getParentProfile,
  countSubResellers,
  updatePrice,
  updateSubShare,
};