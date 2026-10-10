/**
 * @fileoverview Change Password API Route
 *
 * Accepts POST or PUT with either camelCase or snake_case keys so every
 * client (profile edit page, legacy hooks) shares one contract.
 *
 * Security:
 *   - Bearer JWT authentication
 *   - bcrypt comparison against the stored hash (never plaintext)
 *   - Minimum length enforced from environment config
 *   - Same-password rejection prevents no-op rotations
 *   - Parameterized SQL only
 *
 * Path: apps/web/pages/api/profile/password.js
 */
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
      ? { rejectUnauthorized: false }
      : false,
});

const BCRYPT_ROUNDS = 10;

/**
 * Resolve the minimum password length from environment config.
 * @returns {number}
 */
const resolveMinLength = () => {
  const parsed = parseInt(
    process.env.PASSWORD_MIN_LENGTH || process.env.NEXT_PUBLIC_PASSWORD_MIN_LENGTH,
    10
  );
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 8;
};

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  let userId;
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    userId = decoded.userId || decoded.id;
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }

  try {
    /* Normalize both key styles so clients cannot drift out of contract */
    const currentPassword = String(
      req.body?.currentPassword || req.body?.current_password || ''
    );
    const newPassword = String(req.body?.newPassword || req.body?.new_password || '');
    const minLength = resolveMinLength();

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_FIELDS',
        message: 'Current and new passwords are required.',
      });
    }

    if (newPassword.length < minLength) {
      return res.status(400).json({
        success: false,
        code: 'PASSWORD_TOO_SHORT',
        message: `Password must be at least ${minLength} characters.`,
      });
    }

    const stored = await pool.query(`SELECT password FROM users WHERE id = $1 LIMIT 1`, [userId]);
    if (stored.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const matches = await bcrypt.compare(currentPassword, stored.rows[0].password);
    if (!matches) {
      return res.status(401).json({
        success: false,
        code: 'WRONG_CURRENT',
        message: 'Current password is incorrect.',
      });
    }

    const sameAsCurrent = await bcrypt.compare(newPassword, stored.rows[0].password);
    if (sameAsCurrent) {
      return res.status(400).json({
        success: false,
        code: 'SAME_PASSWORD',
        message: 'New password must be different from the current one.',
      });
    }

    const hashed = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await pool.query(`UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2`, [
      hashed,
      userId,
    ]);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    console.error('Password change error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
}