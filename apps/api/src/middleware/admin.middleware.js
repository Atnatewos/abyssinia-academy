/**
 * @fileoverview Admin Authentication Middleware
 * JWT verification for admin routes
 * Path: apps/api/src/middleware/admin.middleware.js
 */

const { verifyAdminToken } = require('../config/jwt');
const { query } = require('../database/pool');

/**
 * Authenticate admin user from JWT token
 * Attaches admin object to req.admin
 */
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No admin token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAdminToken(token);

    const result = await query(
      'SELECT id, username, email, role FROM admins WHERE id = $1',
      [decoded.adminId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found.',
      });
    }

    req.admin = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin token.',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Admin token expired.',
      });
    }
    next(error);
  }
};

/**
 * Check if admin is superadmin
 * Must be used after authenticateAdmin middleware
 */
const requireSuperAdmin = (req, res, next) => {
  if (!req.admin || req.admin.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Super admin privileges required.',
    });
  }
  next();
};

module.exports = {
  authenticateAdmin,
  requireSuperAdmin,
};