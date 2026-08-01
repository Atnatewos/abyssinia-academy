/**
 * @fileoverview Get Course Progress API Route
 * Path: apps/web/pages/api/progress/courses/[courseId].js
 */

import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const isNeon = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isNeon ? { rejectUnauthorized: false } : false,
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

    const userResult = await pool.query(
      'SELECT id, is_enrolled FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (!userResult.rows[0]) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    if (!userResult.rows[0].is_enrolled) {
      return res.status(403).json({ success: false, message: 'Enrollment required.' });
    }

    const { courseId } = req.query;
    const userId = decoded.userId;

    const totalResult = await pool.query(
      `SELECT COUNT(l.id) as total
       FROM lessons l
       JOIN weeks w ON l.week_id = w.id
       JOIN phases p ON w.phase_id = p.id
       WHERE p.course_id = $1`,
      [courseId]
    );

    const completedResult = await pool.query(
      `SELECT COUNT(cl.id) as completed
       FROM completed_lessons cl
       JOIN lessons l ON cl.lesson_id = l.id
       JOIN weeks w ON l.week_id = w.id
       JOIN phases p ON w.phase_id = p.id
       WHERE cl.user_id = $1 AND p.course_id = $2`,
      [userId, courseId]
    );

    const total = parseInt(totalResult.rows[0].total, 10);
    const completed = parseInt(completedResult.rows[0].completed, 10);
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({ success: true, data: { progress } });
  } catch (error) {
    console.error('Course progress error:', error);
    res.status(500).json({ success: false, message: 'Failed to calculate progress.' });
  }
}