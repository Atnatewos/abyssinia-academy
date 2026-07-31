/**
 * @fileoverview Authentication Service
 * Business logic for user registration, login, and enrollment
 * Path: apps/api/src/services/auth.service.js
 */

const bcrypt = require('bcryptjs');
const { generateUserToken, generateAdminToken } = require('../config/jwt');
const usersDb = require('../database/queries/users');
const adminsDb = require('../database/queries/admins');
const { ConflictError, UnauthorizedError } = require('../utils/errors');

/**
 * Register a new student user
 * @param {object} userData - Registration data
 * @returns {object} User and JWT token
 */
const registerStudent = async (userData) => {
  const { fullName, phone, email, password } = userData;

  if (!fullName || !phone || !password) {
    throw new Error('Full name, phone, and password are required.');
  }

  const existingUser = await usersDb.findUserByPhone(phone);
  if (existingUser) {
    throw new ConflictError('An account with this phone number already exists.');
  }

  if (email) {
    const existingEmail = await usersDb.findUserByEmail(email);
    if (existingEmail) {
      throw new ConflictError('An account with this email already exists.');
    }
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await usersDb.createUser({
    fullName,
    phone,
    email: email || null,
    password: hashedPassword,
  });

  const token = generateUserToken({ userId: user.id });

  return { user, token };
};

/**
 * Login a student user
 * @param {string} phone - User phone
 * @param {string} password - User password
 * @returns {object} User and JWT token
 */
const loginStudent = async (phone, password) => {
  const user = await usersDb.findUserByPhone(phone);

  if (!user) {
    throw new UnauthorizedError('Invalid phone number or password.');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid phone number or password.');
  }

  const token = generateUserToken({ userId: user.id });

  const { password: _, ...safeUser } = user;
  return { user: safeUser, token };
};

/**
 * Login an admin user
 * @param {string} username - Admin username
 * @param {string} password - Admin password
 * @returns {object} Admin and JWT token
 */
const loginAdmin = async (username, password) => {
  const admin = await adminsDb.findAdminByUsername(username);

  if (!admin) {
    throw new UnauthorizedError('Invalid credentials.');
  }

  const isValidPassword = await bcrypt.compare(password, admin.password);
  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid credentials.');
  }

  await adminsDb.updateAdminLastLogin(admin.id);

  const token = generateAdminToken({ adminId: admin.id });

  const { password: _, ...safeAdmin } = admin;
  return { admin: safeAdmin, token };
};

module.exports = {
  registerStudent,
  loginStudent,
  loginAdmin,
};