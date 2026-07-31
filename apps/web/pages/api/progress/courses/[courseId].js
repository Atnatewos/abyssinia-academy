/**
 * @fileoverview Get Course Progress API Route
 * Calculates the percentage of completed lessons for a specific course
 * Path: apps/web/pages/api/progress/courses/[courseId].js
 */
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify user exists and is enrolled
    const userResult = await pool.query(
      'SELECT id, is_enrolled FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    if (!userResult.rows[0].is_enrolled) {
      return res.status(403).json({ success: false, message: 'Enrollment required to access progress.' });
    }

    const { courseId } = req.query;
    const userId = decoded.userId;

    // Get total lessons for the course
    const totalLessonsResult = await pool.query(
      `SELECT COUNT(l.id) as total
       FROM lessons l
       JOIN weeks w ON l.week_id = w.id
       JOIN phases p ON w.phase_id = p.id
       WHERE p.course_id = $1`,
      [courseId]
    );

    const totalLessons = parseInt(totalLessonsResult.rows[0].total, 10);

    if (totalLessons === 0) {
      return res.json({ success: true, data: { progress: 0 } });
    }

    // Get completed lessons for the course
    const completedLessonsResult = await pool.query(
      `SELECT COUNT(cl.id) as completed
       FROM completed_lessons cl
       JOIN lessons l ON cl.lesson_id = l.id
       JOIN weeks w ON l.week_id = w.id
       JOIN phases p ON w.phase_id = p.id
       WHERE cl.user_id = $1 AND p.course_id = $2`,
      [userId, courseId]
    );

    const completedLessons = parseInt(completedLessonsResult.rows[0].completed, 10);
    const progress = Math.round((completedLessons / totalLessons) * 100);

    res.json({ success: true, data: { progress } });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
    console.error('Error fetching course progress:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}