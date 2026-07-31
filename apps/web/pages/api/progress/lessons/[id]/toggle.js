/**
 * @fileoverview Toggle Lesson Completion API Route
 * Marks a lesson as complete or incomplete for the authenticated user
 * Path: apps/web/pages/api/progress/lessons/[id]/toggle.js
 */
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
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
      return res.status(403).json({ success: false, message: 'Enrollment required to update progress.' });
    }

    const { id: lessonId } = req.query;
    const userId = decoded.userId;

    // Check if lesson is already marked as complete
    const existing = await pool.query(
      'SELECT id FROM completed_lessons WHERE user_id = $1 AND lesson_id = $2',
      [userId, lessonId]
    );

    let completed = false;
    if (existing.rows.length > 0) {
      // Unmark lesson
      await pool.query(
        'DELETE FROM completed_lessons WHERE user_id = $1 AND lesson_id = $2',
        [userId, lessonId]
      );
      completed = false;
    } else {
      // Mark lesson
      await pool.query(
        'INSERT INTO completed_lessons (user_id, lesson_id) VALUES ($1, $2)',
        [userId, lessonId]
      );
      completed = true;
    }

    res.json({
      success: true,
      message: completed ? 'Lesson marked as complete.' : 'Lesson marked as incomplete.',
      data: { completed }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
    console.error('Error toggling lesson completion:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}