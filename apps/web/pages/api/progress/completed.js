/**
 * @fileoverview Get Completed Lessons API Route
 * Fetches all lesson IDs marked as complete for the authenticated user
 * Path: apps/web/pages/api/progress/completed.js
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

    // Fetch completed lesson IDs
    const result = await pool.query(
      'SELECT lesson_id FROM completed_lessons WHERE user_id = $1',
      [decoded.userId]
    );

    const completedLessons = result.rows.map(row => row.lesson_id);

    res.json({ success: true, data: { completedLessons } });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
    console.error('Error fetching completed lessons:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}