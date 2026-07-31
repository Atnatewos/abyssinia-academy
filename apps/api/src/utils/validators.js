/**
 * @fileoverview Validation Utilities
 * Data validation and sanitization helpers
 * Path: apps/api/src/utils/validators.js
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid
 */
const isValidEmail = (email) => {
  if (!email) return true; // Email is optional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Validate Ethiopian phone number format
 * @param {string} phone - Phone to validate
 * @returns {boolean} Is valid
 */
const isValidEthiopianPhone = (phone) => {
  if (!phone) return false;
  return /^(\+251|0)?[9]\d{8}$/.test(phone.replace(/[\s-]/g, ''));
};

/**
 * Validate UUID format
 * @param {string} id - UUID to validate
 * @returns {boolean} Is valid
 */
const isValidUUID = (id) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {boolean} Is valid
 */
const isStrongPassword = (password) => {
  if (!password || password.length < 6) return false;
  return true;
};

/**
 * Validate required fields in an object
 * @param {object} data - Object to validate
 * @param {Array} requiredFields - Fields that must exist
 * @returns {Array} Missing fields
 */
const getMissingFields = (data, requiredFields) => {
  return requiredFields.filter((field) => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });
};

module.exports = {
  isValidEmail,
  isValidEthiopianPhone,
  isValidUUID,
  isStrongPassword,
  getMissingFields,
};