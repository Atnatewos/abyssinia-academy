/**
 * @fileoverview Profile API Route
 * Handles fetching (GET) and updating (PUT) user profile data.
 * Authenticated via JWT — reads userId from the verified token.
 * Path: apps/web/pages/api/profile/index.js
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

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  let decoded;

  try {
    const token = authHeader.split(' ')[1];
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }

  const userId = decoded.userId;

  /*
   * GET — Fetch full profile data
   */
  if (req.method === 'GET') {

    try {

      const userResult = await pool.query(
        `SELECT
           id,
           full_name,
           phone,
           email,
           is_enrolled,
           enrolled_at,
           payment_method,
           payment_status,
           avatar_url,
           profile_completed,
           created_at
         FROM users
         WHERE id = $1`,
        [userId]
      );

      if (!userResult.rows[0]) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const user = userResult.rows[0];

      let enrollment = null;

      if (user.is_enrolled) {

        const enrollmentResult = await pool.query(
          `SELECT
             e.purchase_mode,
             e.selected_phases,
             e.purchase_amount,
             e.enrolled_at,
             p.status   AS payment_status,
             p.amount   AS payment_amount,
             p.method   AS payment_method,
             p.reference AS payment_ref,
             p.created_at AS payment_date
           FROM enrollments e
           LEFT JOIN payments p ON e.payment_id = p.id
           WHERE e.user_id = $1
           ORDER BY e.enrolled_at DESC
           LIMIT 1`,
          [userId]
        );

        if (enrollmentResult.rows[0]) {
          enrollment = enrollmentResult.rows[0];
        }
      }

      const progressResult = await pool.query(
        `SELECT progress AS overall_progress, updated_at
         FROM course_progress
         WHERE user_id = $1
         LIMIT 1`,
        [userId]
      );

      const completedResult = await pool.query(
        `SELECT COUNT(*) AS total
         FROM completed_lessons
         WHERE user_id = $1`,
        [userId]
      );

      const paymentsResult = await pool.query(
        `SELECT id, amount, method, status, reference, transaction_id, created_at
         FROM payments
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 10`,
        [userId]
      );

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            fullName: user.full_name,
            phone: user.phone,
            email: user.email,
            isEnrolled: user.is_enrolled,
            enrolledAt: user.enrolled_at,
            paymentMethod: user.payment_method,
            paymentStatus: user.payment_status,
            avatarUrl: user.avatar_url,
            profileCompleted: user.profile_completed,
            createdAt: user.created_at,
          },
          enrollment,
          progress: {
            overall: progressResult.rows[0]?.overall_progress || 0,
            completedLessons: parseInt(completedResult.rows[0]?.total || 0, 10),
          },
          payments: paymentsResult.rows.map((p) => ({
            id: p.id,
            amount: p.amount,
            method: p.method,
            status: p.status,
            reference: p.reference,
            transactionId: p.transaction_id,
            createdAt: p.created_at,
          })),
        },
      });

    } catch (error) {
      console.error('Profile fetch error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to load profile.' });
    }
  }

  /*
   * PUT — Update profile data
   */
  if (req.method === 'PUT') {

    try {

      const { fullName, phone, email } = req.body;

      if (!fullName || !fullName.trim()) {
        return res.status(400).json({ success: false, message: 'Full name is required.' });
      }

      const result = await pool.query(
        `UPDATE users
         SET full_name = $1, phone = $2, email = $3,
             profile_completed = true, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING id, full_name, phone, email, avatar_url, profile_completed`,
        [fullName.trim(), phone?.trim() || null, email?.trim() || null, userId]
      );

      const updated = result.rows[0];

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: {
          user: {
            id: updated.id,
            fullName: updated.full_name,
            phone: updated.phone,
            email: updated.email,
            avatarUrl: updated.avatar_url,
            profileCompleted: updated.profile_completed,
          },
        },
      });

    } catch (error) {
      console.error('Profile update error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed.' });
}