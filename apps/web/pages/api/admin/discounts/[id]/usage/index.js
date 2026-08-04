/**
 * @fileoverview Admin Discount Code Usage API
 * Returns usage history for a specific discount code.
 * Path: apps/web/pages/api/admin/discounts/[id]/usage/index.js
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

  const { id } = req.query;

  try {
    const result = await pool.query(
      `SELECT
         dcu.*,
         u.full_name AS user_name
       FROM discount_code_usage dcu
       LEFT JOIN users u ON u.id = dcu.user_id
       WHERE dcu.discount_code_id = $1
       ORDER BY dcu.applied_at DESC
       LIMIT 100`,
      [id]
    );

    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Discount usage fetch error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to load usage history.' });
  }
}