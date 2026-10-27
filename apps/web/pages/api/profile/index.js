/**
 * @fileoverview Profile API Route
 * 
 * Handles fetching (GET) and updating (POST/PUT) user profile data.
 * Authenticated via JWT — reads userId from the verified token.
 * 
 * Supports email updates with:
 *   - Format validation
 *   - Uniqueness enforcement (excludes current user)
 *   - Typed error codes for client-side handling
 * 
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

/* 
 * Validation rules — business constants mirrored client-side for UX only.
 * The server remains the source of truth.
 */
const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 100;
const PHONE_PATTERN = /^\+?[0-9]{9,15}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async function handler(req, res) {

  /*
   * Authenticate the request via JWT Bearer token
   */
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

      /*
       * Fetch enrollment data
       */
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

      /*
       * Fetch progress
       */
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

      /*
       * Fetch payment history
       */
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
   * POST / PUT — Update profile data (accepts both for frontend compatibility)
   */
  if (req.method === 'POST' || req.method === 'PUT') {

    try {

      const { fullName, phone, email } = req.body;

      /* Validate full name */
      const trimmedName = String(fullName || '').trim();
      if (!trimmedName || trimmedName.length < NAME_MIN_LENGTH || trimmedName.length > NAME_MAX_LENGTH) {
        return res.status(400).json({ 
          success: false, 
          code: 'INVALID_NAME',
          message: `Full name must be between ${NAME_MIN_LENGTH} and ${NAME_MAX_LENGTH} characters.` 
        });
      }

      /* Validate phone (optional but must be valid if provided) */
      const trimmedPhone = String(phone || '').trim();
      if (trimmedPhone && !PHONE_PATTERN.test(trimmedPhone)) {
        return res.status(400).json({ 
          success: false, 
          code: 'INVALID_PHONE',
          message: 'Please provide a valid phone number.' 
        });
      }

      /* Validate email (optional but must be valid if provided) */
      const trimmedEmail = String(email || '').trim().toLowerCase();
      if (trimmedEmail && !EMAIL_PATTERN.test(trimmedEmail)) {
        return res.status(400).json({ 
          success: false, 
          code: 'INVALID_EMAIL',
          message: 'Please provide a valid email address.' 
        });
      }

      /* Check email uniqueness (excluding current user) */
      if (trimmedEmail) {
        const emailCheck = await pool.query(
          `SELECT id FROM users WHERE email = $1 AND id <> $2 LIMIT 1`,
          [trimmedEmail, userId]
        );

        if (emailCheck.rows.length > 0) {
          return res.status(409).json({ 
            success: false, 
            code: 'EMAIL_TAKEN',
            message: 'This email is already used by another account.' 
          });
        }
      }

      /* Update the user record */
      const result = await pool.query(
        `UPDATE users
         SET full_name = $1, 
             phone = $2, 
             email = $3,
             profile_completed = true, 
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING id, full_name, phone, email, avatar_url, profile_completed`,
        [trimmedName, trimmedPhone || null, trimmedEmail || null, userId]
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