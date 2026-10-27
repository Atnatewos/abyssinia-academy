/**
 * @fileoverview Authentication Service
 * Business logic for user registration, login, and enrollment
 * Path: apps/api/src/services/auth.service.js
 */

const bcrypt = require('bcryptjs');
const { generateUserToken, generateAdminToken } = require('../config/jwt');
const usersDb = require('../database/queries/users');
const adminsDb = require('../database/queries/admins');
const mlmDb = require('../database/queries/mlm-referrals');
const mlmReferralService = require('./mlm-referral.service');
const { ConflictError, UnauthorizedError } = require('../utils/errors');

/**
 * Register a new student user.
 *
 * After creating the user, ensures they have a wallet. If a valid
 * referral code is provided, builds the referral tree so the user's
 * ancestors start earning on their future purchases.
 *
 * The referral tree step is best-effort: if it fails, the user is still
 * created and can register again with the code later. We log the error
 * but do not fail the request — a broken referral tree should never
 * prevent someone from signing up.
 *
 * @param {object} userData - Registration data
 * @param {string} userData.fullName
 * @param {string} userData.phone
 * @param {string} [userData.email]
 * @param {string} userData.password
 * @param {string} [userData.referralCode]
 * @returns {object} User and JWT token
 */
const registerStudent = async (userData) => {
  const { fullName, phone, email, password, referralCode } = userData;

  if (!fullName || !phone || !password) {
    throw new ConflictError('Full name, phone, and password are required.');
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

  /*
   * Every user gets a wallet at registration time so no downstream
   * code has to worry about a missing wallet row.
   */
  await mlmDb.ensureWallet(user.id);

  /*
   * If a referral code was provided, resolve it and build the tree.
   * Errors here are logged but non-fatal.
   */
  if (referralCode && typeof referralCode === 'string' && referralCode.trim()) {
    try {
      const code = referralCode.trim().toUpperCase();
      const referrer = await mlmDb.findUserByReferralCode(code);

      if (referrer && referrer.user_id !== user.id) {
        await mlmReferralService.buildReferralTree(user.id, referrer.user_id);
      }
    } catch (error) {
      console.error('Referral tree build failed during registration:', {
        userId: user.id,
        referralCode,
        error: error.message,
      });
    }
  }

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