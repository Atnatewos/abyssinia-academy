/**
 * @fileoverview Admin Revenue Chart API
 * Returns monthly revenue data for the last 12 months.
 * Path: apps/web/pages/api/admin/dashboard/revenue-chart.js
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
         TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') AS month_label,
         DATE_TRUNC('month', created_at) AS month_start,
         COALESCE(SUM(amount), 0) AS revenue
       FROM payments
       WHERE status = 'approved'
         AND created_at >= NOW() - INTERVAL '12 months'
       GROUP BY DATE_TRUNC('month', created_at)
       ORDER BY month_start ASC`
    );

    const months = result.rows.map((row) => row.month_label);
    const amounts = result.rows.map((row) => parseFloat(row.revenue));

    res.status(200).json({
      success: true,
      data: { months, amounts },
    });

  } catch (error) {
    console.error('Revenue chart error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to load revenue chart data.',
    });
  }
}