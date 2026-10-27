/**
 * @fileoverview Admin Enrollment Chart API
 * Returns weekly enrollment data for the last 8 weeks.
 * Path: apps/web/pages/api/admin/dashboard/enrollment-chart.js
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
         TO_CHAR(DATE_TRUNC('week', enrolled_at), 'Mon DD') AS week_label,
         DATE_TRUNC('week', enrolled_at) AS week_start,
         COUNT(*) AS enrollment_count
       FROM enrollments
       WHERE enrolled_at >= NOW() - INTERVAL '8 weeks'
       GROUP BY DATE_TRUNC('week', enrolled_at)
       ORDER BY week_start ASC`
    );

    const weeks = result.rows.map((row) => row.week_label);
    const counts = result.rows.map((row) => parseInt(row.enrollment_count, 10));

    res.status(200).json({
      success: true,
      data: { weeks, counts },
    });

  } catch (error) {
    console.error('Enrollment chart error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to load enrollment chart data.',
    });
  }
}