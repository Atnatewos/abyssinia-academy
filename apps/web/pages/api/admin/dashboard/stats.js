/**
 * @fileoverview Admin Dashboard Stats API
 * Returns comprehensive statistics for the admin dashboard.
 * Path: apps/web/pages/api/admin/dashboard/stats.js
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
   * Authenticate admin via JWT
   */
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  try {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_ADMIN_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid admin token.' });
  }

  try {

    /*
     * Run all stat queries in parallel
     */
    const [
      totalStudentsResult,
      enrolledStudentsResult,
      pendingPaymentsResult,
      totalRevenueResult,
      activeDiscountCodesResult,
      totalReferralsResult,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) AS count FROM users'),
      pool.query('SELECT COUNT(*) AS count FROM users WHERE is_enrolled = true'),
      pool.query("SELECT COUNT(*) AS count FROM payments WHERE status = 'pending'"),
      pool.query("SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'approved'"),
      pool.query("SELECT COUNT(*) AS count FROM discount_codes WHERE status = 'active' AND is_deleted = false"),
      pool.query('SELECT COUNT(*) AS count FROM referrals WHERE status = \'completed\''),
    ]);

    /*
     * Build the stats response
     */
    const stats = {
      totalStudents: parseInt(totalStudentsResult.rows[0].count, 10),
      enrolledStudents: parseInt(enrolledStudentsResult.rows[0].count, 10),
      pendingPayments: parseInt(pendingPaymentsResult.rows[0].count, 10),
      totalRevenue: parseFloat(totalRevenueResult.rows[0].total),
      activeDiscountCodes: parseInt(activeDiscountCodesResult.rows[0].count, 10),
      totalReferrals: parseInt(totalReferralsResult.rows[0].count, 10),
    };

    res.status(200).json({
      success: true,
      data: stats,
    });

  } catch (error) {
    console.error('Dashboard stats error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to load dashboard stats.',
    });
  }
}