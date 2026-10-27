/**
 * @fileoverview Magic Login API
 * 
 * Accepts a valid one-time token, verifies it hasn't expired, and issues
 * a real JWT for that user. Clears the token afterward.
 * 
 * Path: apps/web/pages/api/auth/magic-login.js
 */

import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import godmodeConfig from '../../../../../packages/shared/config/godmode.config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed.' });

  const { token } = req.body;
  if (!token) return res.status(400).json({ success: false, message: 'Token is required.' });

  try {
    const result = await pool.query(
      'SELECT id, full_name, email, phone FROM users WHERE password_reset_token = $1 AND password_reset_expires > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Link is invalid or has expired.' });
    }

    const user = result.rows[0];

    /* Clear the token immediately (one-time use) */
    await pool.query(
      'UPDATE users SET password_reset_token = NULL, password_reset_expires = NULL WHERE id = $1',
      [user.id]
    );

    const jwtToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    return res.status(200).json({
      success: true,
      data: {
        token: jwtToken,
        user: { id: user.id, full_name: user.full_name, email: user.email, phone: user.phone },
      },
    });
  } catch (error) {
    console.error('[magic-login] Error:', error.message);
    return res.status(500).json({ success: false, message: 'Authentication failed.' });
  }
}