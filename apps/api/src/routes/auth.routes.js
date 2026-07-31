/**
 * @fileoverview Authentication Routes
 * Public and protected auth endpoints
 * Path: apps/api/src/routes/auth.routes.js
 */

const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const { authenticateUser } = require('../middleware/auth.middleware');
const { validateRegistration, validateLogin } = require('../middleware/validate.middleware');
const { platform } = require('../../../../packages/shared/config');

const router = Router();

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: platform.rateLimit.windowMs,
  max: platform.rateLimit.authMax,
  message: {
    success: false,
    message: 'Too many attempts. Please try again later.',
  },
});

router.post('/register', authLimiter, validateRegistration, authController.register);
router.post('/login', authLimiter, validateLogin, authController.login);
router.get('/me', authenticateUser, authController.getProfile);
router.post('/admin/login', authLimiter, authController.adminLogin);

module.exports = router;