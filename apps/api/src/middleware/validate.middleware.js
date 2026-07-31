/**
 * @fileoverview Input Validation Middleware
 * Request body sanitization and validation
 * Path: apps/api/src/middleware/validate.middleware.js
 */

const { payments } = require('../../../../packages/shared/config');

/**
 * Sanitize a string value to prevent XSS
 * @param {string} value - Input string
 * @returns {string} Sanitized string
 */
const sanitizeString = (value) => {
  if (typeof value !== 'string') return value;
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
};

/**
 * Validate registration input
 */
const validateRegistration = (req, res, next) => {
  const { fullName, full_name, name, phone, email, password } = req.body;
  const actualFullName = fullName || full_name || name || '';
  const errors = [];

  if (!actualFullName || actualFullName.trim().length < 2) {
    errors.push('Full name must be at least 2 characters.');
  }

  if (!phone || !/^\+?[\d\s-]{10,15}$/.test(phone)) {
    errors.push('Valid phone number is required.');
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email address is required.');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors,
    });
  }

  req.body.fullName = sanitizeString(actualFullName);
  req.body.phone = sanitizeString(phone);
  if (email) req.body.email = sanitizeString(email);

  next();
};

/**
 * Validate login input
 */
const validateLogin = (req, res, next) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({
      success: false,
      message: 'Phone and password are required.',
    });
  }

  req.body.phone = sanitizeString(phone);
  next();
};

/**
 * Validate payment submission
 */
const validatePaymentSubmission = (req, res, next) => {
  const { fullName, full_name, name, phone, paymentMethod, transactionRef } = req.body;
  const actualFullName = fullName || full_name || name || '';
  const errors = [];

  if (!actualFullName || actualFullName.trim().length < 2) {
    errors.push('Full name is required.');
  }

  if (!phone || !/^\+?[\d\s-]{10,15}$/.test(phone)) {
    errors.push('Valid phone number is required.');
  }

  if (!paymentMethod) {
    errors.push('Payment method is required.');
  }

  const validMethods = payments.methods.map((m) => m.id);
  if (paymentMethod && !validMethods.includes(paymentMethod)) {
    errors.push('Invalid payment method.');
  }

  if (!transactionRef || transactionRef.trim().length < 3) {
    errors.push('Transaction reference number is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors,
    });
  }

  req.body.fullName = sanitizeString(actualFullName);
  req.body.phone = sanitizeString(phone);
  req.body.transactionRef = sanitizeString(transactionRef);

  next();
};

module.exports = {
  sanitizeString,
  validateRegistration,
  validateLogin,
  validatePaymentSubmission,
};