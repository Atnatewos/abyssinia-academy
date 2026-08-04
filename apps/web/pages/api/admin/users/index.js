/**
 * @fileoverview Admin Users List API
 * Returns paginated list of all registered users.
 * Path: apps/web/pages/api/admin/users/index.js
 */

import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
});

export default async function handler(req, res) {

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  try {
    jwt.verify(authHeader.split(' ')[1], process.env.JWT_ADMIN_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid admin token.' });
  }

  try {

    const result = await pool.query(
      `SELECT
         id,
         full_name,
         phone,
         email,
         is_enrolled,
         enrolled_at,
         payment_method,
         payment_status,
         referred_by_code,
         referral_discount_percent,
         created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT 100`
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });

  } catch (error) {
    console.error('Admin users fetch error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to load users.',
    });
  }
}