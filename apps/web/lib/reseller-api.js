/**
 * @fileoverview Shared API Helper for Reseller Endpoints
 *
 * CommonJS module (matches package.json "type": "commonjs"). All exports
 * use module.exports. Consumed via require() from API route handlers.
 *
 * Centralizes:
 *   - JWT verification (user + admin)
 *   - Standard success / error JSON responses
 *   - Reseller profile lookup
 *   - Config loading (defaults + file + DB overrides)
 *   - Auth + profile middleware (requireReseller)
 *
 * Path: apps/web/lib/reseller-api.js
 */

const jwt = require('jsonwebtoken');
const { query } = require('./db');

/**
 * Verify a user JWT from the Authorization header.
 * Returns the decoded payload or null if invalid/missing.
 *
 * @param {object} req - Next.js request
 * @returns {{userId: string}|null}
 */
const verifyUserToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) return null;
    return decoded;
  } catch {
    return null;
  }
};

/**
 * Verify an admin JWT from the Authorization header.
 *
 * @param {object} req
 * @returns {{adminId: string, role: string}|null}
 */
const verifyAdminToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_ADMIN_SECRET);
    if (!decoded || !decoded.adminId) return null;
    return decoded;
  } catch {
    return null;
  }
};

/**
 * Standard success JSON response.
 *
 * @param {object} res
 * @param {object} data
 * @param {string|null} [message=null]
 * @param {number} [status=200]
 */
const sendSuccess = (res, data, message = null, status = 200) => {
  return res.status(status).json({
    success: true,
    ...(message && { message }),
    data,
  });
};

/**
 * Standard error JSON response.
 *
 * @param {object} res
 * @param {number} status
 * @param {string} message
 * @param {string|null} [code=null]
 */
const sendError = (res, status, message, code = null) => {
  return res.status(status).json({
    success: false,
    message,
    ...(code && { code }),
  });
};

/**
 * Fetch a user's reseller profile by user_id.
 *
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
const getResellerProfile = async (userId) => {
  const result = await query(
    'SELECT * FROM reseller_profiles WHERE user_id = $1',
    [userId]
  );
  return result.rows[0] || null;
};

/**
 * Load the merged reseller config (defaults + file + DB overrides).
 *
 * @param {string|null} [resellerId=null]
 * @returns {Promise<object>}
 */
const getConfig = async (resellerId = null) => {
  const { loadResellerConfig } = require('@shared/reseller');
  const db = { query: (t, p) => query(t, p) };
  return loadResellerConfig({ db, resellerId });
};

/**
 * Authenticate the request and require a reseller profile.
 * Throws a structured error with `.status` on failure.
 *
 * @param {object} req
 * @returns {Promise<{userId: string, profile: object}>}
 */
const requireReseller = async (req) => {
  const decoded = verifyUserToken(req);
  if (!decoded) {
    const err = new Error('Authentication required.');
    err.status = 401;
    throw err;
  }
  const profile = await getResellerProfile(decoded.userId);
  if (!profile) {
    const err = new Error('You are not registered as a reseller.');
    err.status = 403;
    throw err;
  }
  if (profile.status === 'suspended') {
    const err = new Error('Your reseller account is suspended.');
    err.status = 403;
    throw err;
  }
  return { userId: decoded.userId, profile };
};

module.exports = {
  verifyUserToken,
  verifyAdminToken,
  sendSuccess,
  sendError,
  getResellerProfile,
  getConfig,
  requireReseller,
};