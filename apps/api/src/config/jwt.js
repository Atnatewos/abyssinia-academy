/**
 * @fileoverview JWT Configuration
 * Token generation and verification utilities
 * Path: apps/api/src/config/jwt.js
 */

const jwt = require('jsonwebtoken');
const { platform } = require('../../../../packages/shared/config');

/**
 * Generate JWT token for student users
 * @param {object} payload - User data to encode
 * @returns {string} JWT token
 */
const generateUserToken = (payload) => {
  return jwt.sign(payload, platform.jwt.secret, {
    expiresIn: platform.jwt.expiresIn,
    issuer: platform.jwt.issuer,
  });
};

/**
 * Generate JWT token for admin users
 * @param {object} payload - Admin data to encode
 * @returns {string} JWT token
 */
const generateAdminToken = (payload) => {
  return jwt.sign(payload, platform.jwt.adminSecret, {
    expiresIn: platform.jwt.expiresIn,
    issuer: platform.jwt.issuer,
  });
};

/**
 * Verify student JWT token
 * @param {string} token - JWT token
 * @returns {object} Decoded payload
 */
const verifyUserToken = (token) => {
  return jwt.verify(token, platform.jwt.secret);
};

/**
 * Verify admin JWT token
 * @param {string} token - JWT token
 * @returns {object} Decoded payload
 */
const verifyAdminToken = (token) => {
  return jwt.verify(token, platform.jwt.adminSecret);
};

module.exports = {
  generateUserToken,
  generateAdminToken,
  verifyUserToken,
  verifyAdminToken,
};