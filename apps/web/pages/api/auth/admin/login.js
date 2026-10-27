/**
 * @fileoverview Admin Login API Route
 * Authenticates admin users with username/password.
 * Path: apps/web/pages/api/auth/admin/login.js
 */

import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
});

export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.',
      });
    }

    /*
     * Find the admin by username
     */
    const result = await pool.query(
      'SELECT * FROM admins WHERE username = $1',
      [username.trim()]
    );

    const admin = result.rows[0];

    if (!admin) {
      /*
       * Log failed login attempt
       */
      await pool.query(
        `INSERT INTO admin_login_history (admin_id, success, ip_address, user_agent)
         VALUES (NULL, false, $1, $2)`,
        [req.headers['x-forwarded-for'] || req.socket.remoteAddress || null, req.headers['user-agent'] || null]
      );

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    /*
     * Check if account is active
     */
    if (admin.is_active === false) {
      return res.status(403).json({
        success: false,
        message: 'Admin account is disabled.',
      });
    }

    /*
     * Verify password
     */
    const isValid = await bcrypt.compare(password, admin.password);

    if (!isValid) {
      await pool.query(
        `INSERT INTO admin_login_history (admin_id, success, ip_address, user_agent)
         VALUES ($1, false, $2, $3)`,
        [admin.id, req.headers['x-forwarded-for'] || req.socket.remoteAddress || null, req.headers['user-agent'] || null]
      );

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    /*
     * Generate JWT token
     */
    const token = jwt.sign(
      { adminId: admin.id, role: admin.role },
      process.env.JWT_ADMIN_SECRET,
      { expiresIn: '30d' }
    );

    /*
     * Update last login and log success
     */
    await pool.query(
      `UPDATE admins
       SET last_login = CURRENT_TIMESTAMP,
           last_ip = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [req.headers['x-forwarded-for'] || req.socket.remoteAddress || null, admin.id]
    );

    await pool.query(
      `INSERT INTO admin_login_history (admin_id, success, ip_address, user_agent)
       VALUES ($1, true, $2, $3)`,
      [admin.id, req.headers['x-forwarded-for'] || req.socket.remoteAddress || null, req.headers['user-agent'] || null]
    );

    /*
     * Return admin data (excluding password)
     */
    const { password: _, ...safeAdmin } = admin;

    res.status(200).json({
      success: true,
      message: 'Admin login successful.',
      data: {
        admin: safeAdmin,
        token,
      },
    });

  } catch (error) {
    console.error('Admin login error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
    });
  }
}