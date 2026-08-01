/**
 * @fileoverview Toggle Lesson Completion API Route
 * Works with config-based string lesson IDs (e.g., "p1-w1-l1")
 * Path: apps/web/pages/api/progress/lessons/[id]/toggle.js
 */

import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const isNeon = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isNeon ? { rejectUnauthorized: false } : false,
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

    const { id: lessonId } = req.query;
    const userId = decoded.userId;

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