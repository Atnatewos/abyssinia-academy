/**
 * @fileoverview Admin Enrollment Management API
 * GET — Fetch enrollment details for a user
 * PUT — Create or update enrollment (full-course or individual-phases)
 * DELETE — Cancel enrollment completely
 * 
 * Access: Admin JWT required
 * Path: apps/web/pages/api/admin/enrollments/[userId]/index.js
 */

import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const isNeon = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isNeon ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export default async function handler(req, res) {
  /*
   * Authenticate admin via JWT Bearer token
   */
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Admin authentication required.' });
  }

  try {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_ADMIN_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired admin token.' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required.' });
  }

  /*
   * GET — Fetch current enrollment for the user
   */
  if (req.method === 'GET') {
    try {
      const enrollmentResult = await pool.query(
        `SELECT e.id, e.user_id, e.purchase_mode, e.selected_phases,
                e.purchase_amount, e.enrolled_at, e.payment_id,
                u.full_name, u.phone, u.email, u.is_enrolled
         FROM enrollments e
         JOIN users u ON u.id = e.user_id
         WHERE e.user_id = $1
         ORDER BY e.enrolled_at DESC
         LIMIT 1`,
        [userId]
      );

      if (!enrollmentResult.rows[0]) {
        return res.status(200).json({
          success: true,
          data: {
            hasEnrollment: false,
            enrollment: null,
            user: null,
          },
        });
      }

      const enrollment = enrollmentResult.rows[0];

      return res.status(200).json({
        success: true,
        data: {
          hasEnrollment: true,
          enrollment: {
            id: enrollment.id,
            userId: enrollment.user_id,
            purchaseMode: enrollment.purchase_mode,
            selectedPhases: enrollment.selected_phases || [],
            purchaseAmount: enrollment.purchase_amount,
            enrolledAt: enrollment.enrolled_at,
            paymentId: enrollment.payment_id,
          },
          user: {
            fullName: enrollment.full_name,
            phone: enrollment.phone,
            email: enrollment.email,
            isEnrolled: enrollment.is_enrolled,
          },
        },
      });

    } catch (error) {
      console.error('Admin enrollment fetch error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to fetch enrollment.' });
    }
  }

  /*
   * PUT — Create or update enrollment
   * Accepts: { purchaseMode: 'full-course' | 'individual-phases', selectedPhases: ['phase-1', ...] }
   */
  if (req.method === 'PUT') {
    try {
      const { purchaseMode, selectedPhases } = req.body;

      /*
       * Validate purchase mode
       */
      if (!purchaseMode || !['full-course', 'individual-phases'].includes(purchaseMode)) {
        return res.status(400).json({
          success: false,
          message: 'purchaseMode must be "full-course" or "individual-phases".',
        });
      }

      /*
       * Validate selectedPhases for individual phase mode
       */
      const validPhaseIds = ['phase-1', 'phase-2', 'phase-3', 'phase-4', 'phase-5'];

      if (purchaseMode === 'individual-phases') {
        if (!selectedPhases || !Array.isArray(selectedPhases) || selectedPhases.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'selectedPhases must be a non-empty array when purchaseMode is individual-phases.',
          });
        }

        const invalidPhases = selectedPhases.filter((p) => !validPhaseIds.includes(p));
        if (invalidPhases.length > 0) {
          return res.status(400).json({
            success: false,
            message: `Invalid phase IDs: ${invalidPhases.join(', ')}. Valid IDs: ${validPhaseIds.join(', ')}.`,
          });
        }
      }

      /*
       * Delete any existing enrollment for this user
       * This ensures a clean slate before inserting the new enrollment
       */
      await pool.query('DELETE FROM enrollments WHERE user_id = $1', [userId]);

      /*
       * Insert the new enrollment record
       */
      const phasesArray = purchaseMode === 'full-course' ? null : selectedPhases;

      const insertResult = await pool.query(
        `INSERT INTO enrollments (user_id, purchase_mode, selected_phases, enrolled_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING id, user_id, purchase_mode, selected_phases, enrolled_at`,
        [userId, purchaseMode, phasesArray]
      );

      /*
       * Update the user's enrollment flag
       */
      await pool.query(
        'UPDATE users SET is_enrolled = true, updated_at = NOW() WHERE id = $1',
        [userId]
      );

      const enrollment = insertResult.rows[0];

      return res.status(200).json({
        success: true,
        message: 'Enrollment updated successfully.',
        data: {
          enrollment: {
            id: enrollment.id,
            userId: enrollment.user_id,
            purchaseMode: enrollment.purchase_mode,
            selectedPhases: enrollment.selected_phases || [],
            enrolledAt: enrollment.enrolled_at,
          },
        },
      });

    } catch (error) {
      console.error('Admin enrollment update error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to update enrollment.' });
    }
  }

  /*
   * DELETE — Cancel enrollment completely
   * Removes enrollment record and marks user as not enrolled
   */
  if (req.method === 'DELETE') {
    try {
      const deleteResult = await pool.query(
        'DELETE FROM enrollments WHERE user_id = $1 RETURNING id',
        [userId]
      );

      await pool.query(
        'UPDATE users SET is_enrolled = false, updated_at = NOW() WHERE id = $1',
        [userId]
      );

      const wasDeleted = deleteResult.rowCount > 0;

      return res.status(200).json({
        success: true,
        message: wasDeleted
          ? 'Enrollment cancelled successfully.'
          : 'No enrollment found to cancel.',
        data: { cancelled: wasDeleted },
      });

    } catch (error) {
      console.error('Admin enrollment cancel error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to cancel enrollment.' });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed.' });
}