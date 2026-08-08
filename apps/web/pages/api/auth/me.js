/**
 * @fileoverview Get Current User API Route
 * Returns full user profile including referral discount info.
 * The pricing page uses this to show referral discounts even
 * if the user registered days/weeks ago.
 * Path: apps/web/pages/api/auth/me.js
 */

import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const isNeon = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isNeon ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /*
     * Fetch user with referral discount fields
     * These are critical for showing persistent referral discounts
     * on the pricing page and checkout flow.
     */
    const result = await pool.query(
      `SELECT id, full_name, phone, email, is_enrolled, payment_status,
              referred_by_code, referral_discount_percent
       FROM users WHERE id = $1`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          full_name: user.full_name,
          phone: user.phone,
          email: user.email,
          is_enrolled: user.is_enrolled,
          payment_status: user.payment_status,
          referred_by_code: user.referred_by_code || null,
          referral_discount_percent: parseFloat(user.referral_discount_percent || 0),
        },
      },
    });
  } catch (error) {
    console.error('Auth me error:', error.message);
    res.status(401).json({ success: false, message: 'Invalid token.' });
  }
}