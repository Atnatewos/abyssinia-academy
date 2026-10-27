/**
 * @fileoverview Login API Route
 *
 * Serverless function for student authentication.
 * Accepts ANY of these identifier aliases so every frontend form version
 * stays compatible: `identifier`, `phone`, `email`, or `username`.
 *
 * Flow:
 *   1. Resolve the identifier from whichever alias the client sent
 *   2. Route the lookup: contains '@' → email column, else phone column
 *   3. If the primary lookup misses, retry on the other column so users
 *      who type an email into a phone field (or vice-versa) still login
 *   4. Verify the bcrypt hash
 *   5. Issue a 30-day JWT signed with JWT_SECRET
 *   6. Return the safe user object (password hash stripped)
 *
 * Uses the shared retry-enabled query wrapper from lib/db so transient
 * Neon pool terminations never surface as login failures.
 *
 * Path: apps/web/pages/api/auth/login.js
 */

import { query } from '../../../lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Determines whether a string looks like an email address.
 *
 * @param {string} value - The input string
 * @returns {boolean} True if it contains '@'
 */
const isEmailLike = (value) => {
  return typeof value === 'string' && value.includes('@');
};

/**
 * Looks a user up by email (case-insensitive) or phone.
 *
 * @param {string} identifier - Raw identifier from the client
 * @returns {Promise<object|null>} User row or null
 */
const findUserByIdentifier = async (identifier) => {
  const primarySql = isEmailLike(identifier)
    ? 'SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1'
    : 'SELECT * FROM users WHERE phone = $1 LIMIT 1';
  const fallbackSql = isEmailLike(identifier)
    ? 'SELECT * FROM users WHERE phone = $1 LIMIT 1'
    : 'SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1';

  const primary = await query(primarySql, [identifier]);
  if (primary.rows.length > 0) return primary.rows[0];

  const fallback = await query(fallbackSql, [identifier]);
  return fallback.rows[0] || null;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  try {
    /*
     * Accept every alias any version of the login form may send.
     * This eliminates 400 errors caused by field-name drift between
     * frontend and backend deployments.
     */
    const { identifier, phone, email, username, password } = req.body || {};
    const loginIdentifier = String(identifier || phone || email || username || '').trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Phone/email and password are required.',
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not set');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error.',
      });
    }

    const user = await findUserByIdentifier(loginIdentifier);

    if (!user) {
      /* Generic message prevents account enumeration. */
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    const { password: _password, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      message: 'Welcome back!',
      data: { user: safeUser, token },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
}