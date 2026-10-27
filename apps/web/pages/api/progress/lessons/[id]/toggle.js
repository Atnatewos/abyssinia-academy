/**
 * @fileoverview Toggle Lesson Completion API Route
 * Works with config-based string lesson IDs (e.g., "p1-w1-l1")
 * ENHANCED: Server-side access control validation prevents progress tracking
 * on locked lessons — even if a malicious request is crafted.
 * 
 * Path: apps/web/pages/api/progress/lessons/[id]/toggle.js
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

/**
 * Server-side access validation — the final authority on what a student can access
 * Mirrors the logic from access/check.js to ensure consistency
 * 
 * @param {string} userId - The authenticated user's ID
 * @param {string} lessonId - The lesson being toggled
 * @returns {Promise<boolean>} Whether the user has access to this lesson
 */
const validateLessonAccess = async (userId, lessonId) => {
  const enrollmentResult = await pool.query(
    `SELECT purchase_mode, selected_phases
     FROM enrollments
     WHERE user_id = $1
     ORDER BY enrolled_at DESC
     LIMIT 1`,
    [userId]
  );

  const enrollment = enrollmentResult.rows[0];

  if (!enrollment) return false;

  const isFullCourse = enrollment.purchase_mode === 'full-course' || !enrollment.selected_phases;

  if (isFullCourse) return true;

  /*
   * For individual phase purchases, verify the lesson belongs to a purchased phase
   * Parse the lesson ID format: p{phase}-w{week}-l{lesson}
   */
  const phaseMatch = lessonId.match(/^p(\d+)-/);
  if (!phaseMatch) return false;

  const lessonPhase = `phase-${phaseMatch[1]}`;
  const selectedPhases = enrollment.selected_phases || [];

  return selectedPhases.includes(lessonPhase);
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    /*
     * Authenticate the request
     */
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }

    const userId = decoded.userId;
    const { id: lessonId } = req.query;

    /*
     * Validate the lesson ID format to prevent injection
     * Only allow alphanumeric characters, hyphens, and underscores
     */
    if (!lessonId || !/^[a-zA-Z0-9_-]+$/.test(lessonId)) {
      return res.status(400).json({ success: false, message: 'Invalid lesson ID format.' });
    }

    /*
     * Verify user exists and is enrolled
     */
    const userResult = await pool.query(
      'SELECT id, is_enrolled FROM users WHERE id = $1',
      [userId]
    );

    if (!userResult.rows[0]) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    if (!userResult.rows[0].is_enrolled) {
      return res.status(403).json({ success: false, message: 'Enrollment required.' });
    }

    /*
     * SERVER-SIDE ACCESS CONTROL:
     * Verify the student actually has access to this lesson's phase
     * before allowing progress tracking
     */
    const hasAccess = await validateLessonAccess(userId, lessonId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This lesson belongs to a phase you have not purchased.',
      });
    }

    /*
     * Toggle the lesson completion state
     */
    const existing = await pool.query(
      'SELECT id FROM completed_lessons WHERE user_id = $1 AND lesson_id::text = $2',
      [userId, lessonId]
    );

    let completed;
    if (existing.rows.length > 0) {
      await pool.query(
        'DELETE FROM completed_lessons WHERE user_id = $1 AND lesson_id::text = $2',
        [userId, lessonId]
      );
      completed = false;
    } else {
      await pool.query(
        'INSERT INTO completed_lessons (user_id, lesson_id) VALUES ($1, $2)',
        [userId, lessonId]
      );
      completed = true;
    }

    res.json({
      success: true,
      message: completed ? 'Lesson marked as complete.' : 'Lesson marked as incomplete.',
      data: { completed },
    });

  } catch (error) {
    console.error('Toggle progress error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update progress.' });
  }
}