/**
 * @fileoverview Admin Top Referrers API
 * Returns top referrers ranked by successful referral count.
 * Path: apps/web/pages/api/admin/referrals/top.js
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
         u.full_name,
         re.user_id,
         re.total_referrals,
         re.successful_referrals,
         re.total_credit_earned,
         re.available_credit,
         re.pending_commission,
         re.current_tier
       FROM referral_earnings re
       JOIN users u ON u.id = re.user_id
       WHERE re.successful_referrals > 0
       ORDER BY re.successful_referrals DESC
       LIMIT 10`
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });

  } catch (error) {
    console.error('Admin top referrers error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to load top referrers.',
    });
  }
}