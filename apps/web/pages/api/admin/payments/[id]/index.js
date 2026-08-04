/**
 * @fileoverview Admin Payment Detail API
 * Returns full payment details with user info and discount breakdown.
 * Path: apps/web/pages/api/admin/payments/[id]/index.js
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
         p.*,
         u.full_name AS user_name,
         u.phone AS user_phone,
         u.email AS user_email,
         u.referred_by_code
       FROM payments p
       LEFT JOIN users u ON u.id = p.user_id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found.' });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });

  } catch (error) {
    console.error('Admin payment detail error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to load payment details.',
    });
  }
}