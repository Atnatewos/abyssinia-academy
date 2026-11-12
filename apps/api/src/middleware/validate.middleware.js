// /**
//  * @fileoverview Input Validation Middleware
//  * Request body sanitization and validation
//  * Path: apps/api/src/middleware/validate.middleware.js
//  */

// const { payments } = require('../../../../packages/shared/config');

// /**
//  * Sanitize a string value to prevent XSS
//  * @param {string} value - Input string
//  * @returns {string} Sanitized string
//  */
// const sanitizeString = (value) => {
//   if (typeof value !== 'string') return value;
//   return value
//     .replace(/&/g, '&amp;')
//     .replace(/</g, '&lt;')
//     .replace(/>/g, '&gt;')
//     .replace(/"/g, '&quot;')
//     .replace(/'/g, '&#x27;')
//     .trim();
// };

// /**
//  * Validate registration input
//  */
// const validateRegistration = (req, res, next) => {
//   const { fullName, full_name, name, phone, email, password } = req.body;
//   const actualFullName = fullName || full_name || name || '';
//   const errors = [];

//   if (!actualFullName || actualFullName.trim().length < 2) {
//     errors.push('Full name must be at least 2 characters.');
//   }

//   if (!phone || !/^\+?[\d\s-]{10,15}$/.test(phone)) {
//     errors.push('Valid phone number is required.');
//   }

//   if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//     errors.push('Valid email address is required.');
//   }

//   if (!password || password.length < 6) {
//     errors.push('Password must be at least 6 characters.');
//   }

//   if (errors.length > 0) {
//     return res.status(400).json({
//       success: false,
//       message: 'Validation failed.',
//       errors,
//     });
//   }

//   req.body.fullName = sanitizeString(actualFullName);
//   req.body.phone = sanitizeString(phone);
//   if (email) req.body.email = sanitizeString(email);

//   next();
// };

// /**
//  * Validate login input
//  */
// const validateLogin = (req, res, next) => {
//   const { phone, password } = req.body;

//   if (!phone || !password) {
//     return res.status(400).json({
//       success: false,
//       message: 'Phone and password are required.',
//     });
//   }

//   req.body.phone = sanitizeString(phone);
//   next();
// };

// /**
//  * Validate payment submission
//  */
// const validatePaymentSubmission = (req, res, next) => {
//   const { fullName, full_name, name, phone, paymentMethod, transactionRef } = req.body;
//   const actualFullName = fullName || full_name || name || '';
//   const errors = [];

//   if (!actualFullName || actualFullName.trim().length < 2) {
//     errors.push('Full name is required.');
//   }

//   if (!phone || !/^\+?[\d\s-]{10,15}$/.test(phone)) {
//     errors.push('Valid phone number is required.');
//   }

//   if (!paymentMethod) {
//     errors.push('Payment method is required.');
//   }

//   const validMethods = payments.methods.map((m) => m.id);
//   if (paymentMethod && !validMethods.includes(paymentMethod)) {
//     errors.push('Invalid payment method.');
//   }

//   if (!transactionRef || transactionRef.trim().length < 3) {
//     errors.push('Transaction reference number is required.');
//   }

//   if (errors.length > 0) {
//     return res.status(400).json({
//       success: false,
//       message: 'Validation failed.',
//       errors,
//     });
//   }

//   req.body.fullName = sanitizeString(actualFullName);
//   req.body.phone = sanitizeString(phone);
//   req.body.transactionRef = sanitizeString(transactionRef);

//   next();
// };

// module.exports = {
//   sanitizeString,
//   validateRegistration,
//   validateLogin,
//   validatePaymentSubmission,
// };

/**
 * @fileoverview Validation Middleware
 *
 * Centralized request validation. Every validator returns a 400 with a
 * specific message on failure, so client-side error handling stays clean.
 *
 * Path: apps/api/src/middleware/validate.middleware.js
 */

const { BadRequestError } = require('../utils/errors');
const {
  isValidEmail,
  isValidEthiopianPhone,
  isStrongPassword,
} = require('../utils/validators');

/* ============================================================================
 * PAYMENT SUBMISSION
 * ============================================================================
 * Rules:
 *   - paymentMethod is required
 *   - fullName and phone are optional (backend auto-fills from user, but
 *     the buyer may override for a different payer)
 *   - At least one of transactionRef OR screenshot must be provided
 *     (this is the fix — previously only transactionRef was accepted)
 * ============================================================================ */

const validatePaymentSubmission = (req, res, next) => {
  try {
    const { paymentMethod, transactionRef } = req.body;
    const hasScreenshot = Boolean(req.file);

    if (!paymentMethod || typeof paymentMethod !== 'string') {
      throw new BadRequestError('Payment method is required.');
    }

    // At least one of transactionRef OR screenshot — never both empty
    const hasReference =
      typeof transactionRef === 'string' && transactionRef.trim().length > 0;

    if (!hasReference && !hasScreenshot) {
      throw new BadRequestError(
        'Please provide either a transaction reference number or a payment screenshot.'
      );
    }

    // Defensive: if the buyer overrode name/phone, validate them
    const { fullName, phone } = req.body;

    if (fullName && typeof fullName === 'string' && fullName.trim().length < 2) {
      throw new BadRequestError('Full name must be at least 2 characters.');
    }

    if (phone && typeof phone === 'string' && !isValidEthiopianPhone(phone)) {
      throw new BadRequestError('Please provide a valid Ethiopian phone number.');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/* ============================================================================
 * USER REGISTRATION
 * ============================================================================ */

const validateRegistration = (req, res, next) => {
  try {
    const { fullName, phone, password, email } = req.body;

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      throw new BadRequestError('Full name must be at least 2 characters.');
    }

    if (!phone || typeof phone !== 'string' || !isValidEthiopianPhone(phone)) {
      throw new BadRequestError('Please provide a valid Ethiopian phone number.');
    }

    if (!password || typeof password !== 'string' || !isStrongPassword(password)) {
      throw new BadRequestError('Password must be at least 6 characters.');
    }

    if (email && typeof email === 'string' && email.trim() && !isValidEmail(email)) {
      throw new BadRequestError('Please provide a valid email address.');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/* ============================================================================
 * LOGIN
 * ============================================================================ */

const validateLogin = (req, res, next) => {
  try {
    const { phone, password } = req.body;

    if (!phone || typeof phone !== 'string') {
      throw new BadRequestError('Phone number is required.');
    }

    if (!password || typeof password !== 'string') {
      throw new BadRequestError('Password is required.');
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validatePaymentSubmission,
  validateRegistration,
  validateLogin,
};