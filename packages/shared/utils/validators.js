/**
 * @fileoverview Shared Validation Utilities
 * Validation functions used by both frontend and backend
 * Path: packages/shared/utils/validators.js
 */

/**
 * Validate Ethiopian phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid
 */
const isValidEthiopianPhone = (phone) => {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s-()]/g, '');
  return /^(\+251|0)?9\d{8}$/.test(cleaned);
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid
 */
const isValidEmail = (email) => {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with message
 */
const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return {
      valid: false,
      message: 'Password must be at least 6 characters.',
    };
  }
  return { valid: true, message: '' };
};

/**
 * Validate required fields
 * @param {object} data - Object to check
 * @param {Array} fields - Required field names
 * @returns {Array} Missing field names
 */
const getMissingFields = (data, fields) => {
  return fields.filter((field) => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });
};

module.exports = {
  isValidEthiopianPhone,
  isValidEmail,
  validatePassword,
  getMissingFields,
};