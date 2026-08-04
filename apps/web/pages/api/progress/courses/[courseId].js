/**
 * @fileoverview Get Course Progress API Route
 * Calculates overall course progress by comparing completed lessons
 * against the total lesson count from the config-driven course definition.
 * 
 * ACCESS-CONTROLLED: Only counts accessible lessons for individual-phase students.
 * Full-course students get progress across all phases.
 * 
 * Path: apps/web/pages/api/progress/courses/[courseId].js
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
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    /*
     * Authenticate via JWT Bearer token
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
    const { courseId } = req.query;

    /*
     * Validate courseId parameter to prevent injection
     */
    if (!courseId || !/^[a-zA-Z0-9_-]+$/.test(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID.' });
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
     * Load course definition from shared config to get all lesson IDs
     * This matches the config-driven architecture — no DB lesson table dependency
     */
    const CourseLoader = require('../../../../../../packages/shared/courses/index');
    const course = CourseLoader.getById(courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    /*
     * Build the full list of lesson IDs from the course config
     * Each lesson ID follows the format: p{phase}-w{week}-l{lesson}
     */
    let allLessonIds = [];
    let accessibleLessonIds = [];

    for (const phase of course.phases) {
      if (phase.weeks) {
        for (const week of phase.weeks) {
          if (week.lessons) {
            for (const lesson of week.lessons) {
              if (lesson.id) {
                allLessonIds.push(lesson.id);
              }
            }
          }
        }
      }
    }

    /*
     * Fetch enrollment to determine which lessons are accessible
     * Individual-phase students only see progress for their purchased phases
     */
    const enrollmentResult = await pool.query(
      `SELECT purchase_mode, selected_phases
       FROM enrollments
       WHERE user_id = $1
       ORDER BY enrolled_at DESC
       LIMIT 1`,
      [userId]
    );

    const enrollment = enrollmentResult.rows[0];

    if (enrollment) {
      const isFullCourse = enrollment.purchase_mode === 'full-course' || !enrollment.selected_phases;

      if (isFullCourse) {
        accessibleLessonIds = allLessonIds;
      } else {
        /*
         * Filter to only lessons belonging to purchased phases
         * Parse lesson ID format: p{phase}-w{week}-l{lesson}
         */
        const purchasedPhases = enrollment.selected_phases || [];
        accessibleLessonIds = allLessonIds.filter((lessonId) => {
          const phaseMatch = lessonId.match(/^p(\d+)-/);
          if (!phaseMatch) return false;
          const phaseId = `phase-${phaseMatch[1]}`;
          return purchasedPhases.includes(phaseId);
        });
      }
    } else {
      accessibleLessonIds = [];
    }

    /*
     * Count completed lessons from the database
     * Only counts lessons that are within the accessible set
     */
    const totalAccessible = accessibleLessonIds.length;
    let completedCount = 0;

    if (totalAccessible > 0) {
      const completedResult = await pool.query(
        `SELECT COUNT(*) AS count
         FROM completed_lessons
         WHERE user_id = $1
         AND lesson_id::text = ANY($2::text[])`,
        [userId, accessibleLessonIds]
      );
      completedCount = parseInt(completedResult.rows[0]?.count || 0, 10);
    }

    const progressPercentage = totalAccessible > 0
      ? Math.round((completedCount / totalAccessible) * 100)
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        progress: progressPercentage,
        totalLessons: totalAccessible,
        completedLessons: completedCount,
        isFullCourse: enrollment?.purchase_mode === 'full-course' || !enrollment?.selected_phases,
      },
    });

  } catch (error) {
    console.error('Course progress error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to calculate progress.' });
  }
}