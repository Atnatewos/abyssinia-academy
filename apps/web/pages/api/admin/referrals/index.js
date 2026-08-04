/**
 * @fileoverview Admin Referrals List API
 * Returns paginated list of all referrals with referrer and referred names.
 * Path: apps/web/pages/api/admin/referrals/index.js
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

    const { limit } = req.query;
    const maxLimit = Math.min(parseInt(limit, 10) || 50, 100);

    const result = await pool.query(
      `SELECT
         r.id,
         r.referral_code,
         r.status,
         r.discount_percent,
         r.referrer_credit_percent,
         r.referrer_credit_amount,
         r.commission_earned,
         r.created_at,
         r.completed_at,
         ref.full_name AS referrer_name,
         refd.full_name AS referred_name
       FROM referrals r
       LEFT JOIN users ref ON ref.id = r.referrer_id
       LEFT JOIN users refd ON refd.id = r.referred_user_id
       ORDER BY r.created_at DESC
       LIMIT $1`,
      [maxLimit]
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });

  } catch (error) {
    console.error('Admin referrals fetch error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to load referrals.',
    });
  }
}