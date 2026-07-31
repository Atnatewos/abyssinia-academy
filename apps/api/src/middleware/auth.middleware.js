/**
 * @fileoverview Authentication Middleware
 * JWT verification for student routes
 * Path: apps/api/src/middleware/auth.middleware.js
 */

const { verifyUserToken } = require('../config/jwt');
const { query } = require('../database/pool');

/**
 * Authenticate student user from JWT token
 * Attaches user object to req.user
 */
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyUserToken(token);

    const result = await query(
      'SELECT id, full_name, phone, email, is_enrolled, payment_status FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found.',
      });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.',
      });
    }
    next(error);
  }
};

/**
 * Check if user is enrolled
 * Must be used after authenticateUser middleware
 */
const requireEnrollment = (req, res, next) => {
  if (!req.user || !req.user.is_enrolled) {
    return res.status(403).json({
      success: false,
      message: 'Enrollment required to access this resource.',
    });
  }
  next();
};

module.exports = {
  authenticateUser,
  requireEnrollment,
};