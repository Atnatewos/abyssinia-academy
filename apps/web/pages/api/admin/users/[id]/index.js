/**
 * @fileoverview Admin User Detail API
 * Returns full user profile with enrollment, payments, progress, and referrals.
 * Path: apps/web/pages/api/admin/users/[id]/index.js
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

    /*
     * Fetch user record
     */
    const userResult = await pool.query(
      `SELECT
         id, full_name, phone, email, is_enrolled, enrolled_at,
         payment_method, payment_status, avatar_url,
         referred_by_code, referral_discount_percent,
         profile_completed, created_at
       FROM users
       WHERE id = $1`,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = userResult.rows[0];

    /*
     * Fetch enrollment
     */
    const enrollmentResult = await pool.query(
      `SELECT e.*, p.status AS payment_status, p.amount AS payment_amount,
              p.method AS payment_method, p.reference AS payment_ref
       FROM enrollments e
       LEFT JOIN payments p ON e.payment_id = p.id
       WHERE e.user_id = $1
       ORDER BY e.enrolled_at DESC
       LIMIT 1`,
      [id]
    );

    /*
     * Fetch payments
     */
    const paymentsResult = await pool.query(
      `SELECT id, amount, method, status, reference, transaction_id, created_at
       FROM payments
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [id]
    );

    /*
     * Fetch progress
     */
    const progressResult = await pool.query(
      `SELECT progress AS overall, updated_at
       FROM course_progress
       WHERE user_id = $1
       LIMIT 1`,
      [id]
    );

    const completedResult = await pool.query(
      `SELECT COUNT(*) AS count
       FROM completed_lessons
       WHERE user_id = $1`,
      [id]
    );

    /*
     * Fetch referral info
     */
    const referralCodeResult = await pool.query(
      `SELECT code FROM referral_codes WHERE user_id = $1`,
      [id]
    );

    const referralEarningsResult = await pool.query(
      `SELECT total_referrals, successful_referrals,
              available_credit, pending_commission
       FROM referral_earnings
       WHERE user_id = $1`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: {
        user,
        enrollment: enrollmentResult.rows[0] || null,
        payments: paymentsResult.rows,
        progress: {
          overall: parseFloat(progressResult.rows[0]?.overall || 0),
          completedLessons: parseInt(completedResult.rows[0]?.count || 0, 10),
        },
        referrals: {
          code: referralCodeResult.rows[0]?.code || null,
          totalReferrals: parseInt(referralEarningsResult.rows[0]?.total_referrals || 0, 10),
          successfulReferrals: parseInt(referralEarningsResult.rows[0]?.successful_referrals || 0, 10),
          availableCredit: parseFloat(referralEarningsResult.rows[0]?.available_credit || 0),
          pendingCommission: parseFloat(referralEarningsResult.rows[0]?.pending_commission || 0),
        },
      },
    });

  } catch (error) {
    console.error('Admin user detail error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to load user details.',
    });
  }
}