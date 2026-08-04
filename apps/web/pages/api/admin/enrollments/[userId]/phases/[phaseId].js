/**
 * @fileoverview Admin Single Phase Management API
 * POST — Add a phase to an existing individual-phases enrollment
 * DELETE — Remove a single phase from an existing individual-phases enrollment
 * 
 * Only works for enrollments with purchase_mode = 'individual-phases'
 * Full-course enrollments cannot have individual phases removed
 * 
 * Access: Admin JWT required
 * Path: apps/web/pages/api/admin/enrollments/[userId]/phases/[phaseId].js
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

  const { userId, phaseId } = req.query;

  if (!userId || !phaseId) {
    return res.status(400).json({ success: false, message: 'User ID and Phase ID are required.' });
  }

  /*
   * Validate phase ID format
   */
  const validPhaseIds = ['phase-1', 'phase-2', 'phase-3', 'phase-4', 'phase-5'];
  if (!validPhaseIds.includes(phaseId)) {
    return res.status(400).json({
      success: false,
      message: `Invalid phase ID. Must be one of: ${validPhaseIds.join(', ')}.`,
    });
  }

  /*
   * Fetch the current enrollment
   */
  const enrollmentResult = await pool.query(
    `SELECT id, purchase_mode, selected_phases
     FROM enrollments
     WHERE user_id = $1
     ORDER BY enrolled_at DESC
     LIMIT 1`,
    [userId]
  );

  if (!enrollmentResult.rows[0]) {
    return res.status(404).json({ success: false, message: 'No enrollment found for this user.' });
  }

  const enrollment = enrollmentResult.rows[0];

  /*
   * Full-course enrollments cannot have individual phases removed
   * Admin must switch to individual-phases mode first
   */
  if (enrollment.purchase_mode === 'full-course') {
    return res.status(400).json({
      success: false,
      message: 'Cannot modify individual phases on a full-course enrollment. Switch to individual-phases mode first.',
    });
  }

  const currentPhases = enrollment.selected_phases || [];

  /*
   * POST — Add a phase to the enrollment
   */
  if (req.method === 'POST') {
    try {
      if (currentPhases.includes(phaseId)) {
        return res.status(200).json({
          success: true,
          message: `Phase ${phaseId} is already in the enrollment.`,
          data: { selectedPhases: currentPhases },
        });
      }

      const updatedPhases = [...currentPhases, phaseId].sort();

      await pool.query(
        'UPDATE enrollments SET selected_phases = $1 WHERE id = $2',
        [updatedPhases, enrollment.id]
      );

      return res.status(200).json({
        success: true,
        message: `Phase ${phaseId} added successfully.`,
        data: { selectedPhases: updatedPhases },
      });

    } catch (error) {
      console.error('Admin phase add error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to add phase.' });
    }
  }

  /*
   * DELETE — Remove a phase from the enrollment
   */
  if (req.method === 'DELETE') {
    try {
      if (!currentPhases.includes(phaseId)) {
        return res.status(200).json({
          success: true,
          message: `Phase ${phaseId} was not in the enrollment.`,
          data: { selectedPhases: currentPhases },
        });
      }

      const updatedPhases = currentPhases.filter((p) => p !== phaseId);

      /*
       * If all phases are removed, cancel the enrollment entirely
       */
      if (updatedPhases.length === 0) {
        await pool.query('DELETE FROM enrollments WHERE user_id = $1', [userId]);
        await pool.query('UPDATE users SET is_enrolled = false, updated_at = NOW() WHERE id = $1', [userId]);

        return res.status(200).json({
          success: true,
          message: `Phase ${phaseId} removed. No phases remaining — enrollment cancelled.`,
          data: { selectedPhases: [], cancelled: true },
        });
      }

      await pool.query(
        'UPDATE enrollments SET selected_phases = $1 WHERE id = $2',
        [updatedPhases, enrollment.id]
      );

      return res.status(200).json({
        success: true,
        message: `Phase ${phaseId} removed successfully.`,
        data: { selectedPhases: updatedPhases },
      });

    } catch (error) {
      console.error('Admin phase remove error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to remove phase.' });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed.' });
}