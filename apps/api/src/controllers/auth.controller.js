/**
 * @fileoverview Authentication Controller
 * Request handlers for auth routes
 * Path: apps/api/src/controllers/auth.controller.js
 */

const authService = require('../services/auth.service');

/**
 * POST /api/auth/register
 * Register a new student user
 */
const register = async (req, res, next) => {
  try {
    const { fullName, phone, email, password } = req.body;

    const result = await authService.registerStudent({
      fullName,
      phone,
      email,
      password,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Abyssinia Academy.',
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Login a student user
 */
const login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    const result = await authService.loginStudent(phone, password);

    res.json({
      success: true,
      message: 'Welcome back!',
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Get current authenticated user profile
 */
const getProfile = async (req, res, next) => {
  try {
    const { password, ...user } = req.user;

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/admin/login
 * Login an admin user
 */
const adminLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const result = await authService.loginAdmin(username, password);

    res.json({
      success: true,
      message: 'Admin login successful.',
      data: {
        admin: result.admin,
        token: result.token,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  adminLogin,
};