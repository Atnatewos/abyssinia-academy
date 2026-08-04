/**
 * @fileoverview Admin Payments List API
 * Returns paginated list of all payments with optional status filter.
 * Supports ?status=pending&limit=10 query parameters.
 * Path: apps/web/pages/api/admin/payments/index.js
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

  /*
   * Authenticate admin
   */
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

    const { status, limit } = req.query;
    const maxLimit = Math.min(parseInt(limit, 10) || 50, 100);

    /*
     * Build the query with optional status filter
     */
    let query = `
      SELECT
        p.id,
        p.amount,
        p.method,
        p.status,
        p.reference,
        p.transaction_id,
        p.discount_code_used,
        p.discount_code_amount,
        p.referral_discount_amount,
        p.credit_applied,
        p.created_at,
        u.full_name AS user_name,
        u.phone AS user_phone
      FROM payments p
      LEFT JOIN users u ON u.id = p.user_id
    `;

    const params = [];

    if (status && status !== 'all') {
      query += ` WHERE p.status = $1`;
      params.push(status);
    }

    query += ` ORDER BY
      CASE WHEN p.status = 'pending' THEN 0 ELSE 1 END,
      p.created_at DESC
      LIMIT $${params.length + 1}`;

    params.push(maxLimit);

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      data: result.rows,
    });

  } catch (error) {
    console.error('Admin payments fetch error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to load payments.',
    });
  }
}