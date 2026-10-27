/**
 * @fileoverview Admin Dashboard Stats API
 *
 * Returns the 4 stat cards (students, revenue, courses, pending payments)
 * and the Top Referrers leaderboard. Top referrers are derived from the
 * users table sorted by lifetime_referral_earnings DESC, filtered to
 * users who have at least one direct referral.
 *
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

/**
 * Validate admin JWT.
 */
const verifyAdmin = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Missing or malformed Authorization header');
    err.status = 401;
    throw err;
  }
  const token = authHeader.slice(7);
  const adminSecret = process.env.JWT_ADMIN_SECRET;
  if (!adminSecret) {
    const err = new Error('JWT_ADMIN_SECRET is not configured');
    err.status = 500;
    throw err;
  }
  try {
    return jwt.verify(token, adminSecret);
  } catch {
    const err = new Error('Invalid or expired admin token');
    err.status = 401;
    throw err;
  }
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  try {
    verifyAdmin(req.headers.authorization);

    const [
      studentsRes,
      revenueRes,
      coursesRes,
      pendingRes,
      topReferrersRes,
    ] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS count FROM users`),
      pool.query(`
        SELECT COALESCE(SUM(amount), 0)::numeric AS total
        FROM payments
        WHERE status = 'approved'
      `),
      pool.query(`
        SELECT COUNT(*)::int AS count
        FROM courses
        WHERE is_published = TRUE
      `),
      pool.query(`
        SELECT COUNT(*)::int AS count
        FROM payments
        WHERE status = 'pending'
      `),
      pool.query(`
        SELECT
          id,
          full_name AS name,
          email,
          direct_referral_count AS referral_count,
          lifetime_referral_earnings AS total_earned
        FROM users
        WHERE direct_referral_count > 0
        ORDER BY lifetime_referral_earnings DESC, direct_referral_count DESC
        LIMIT 5
      `),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        total_students: studentsRes.rows[0]?.count || 0,
        total_revenue: Number(revenueRes.rows[0]?.total || 0),
        total_courses: coursesRes.rows[0]?.count || 0,
        pending_payments: pendingRes.rows[0]?.count || 0,
        top_referrers: topReferrersRes.rows,
      },
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to load dashboard stats.',
    });
  }
}