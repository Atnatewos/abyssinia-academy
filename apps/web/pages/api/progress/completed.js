/**
 * @fileoverview Get Completed Lessons API Route
 * Path: apps/web/pages/api/progress/completed.js
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

    const result = await pool.query(
      'SELECT lesson_id FROM completed_lessons WHERE user_id = $1',
      [decoded.userId]
    );

    const completedLessons = result.rows.map((r) => {
      const id = r.lesson_id;
      return typeof id === 'string' ? id : String(id);
    });

    res.json({
      success: true,
      data: { completedLessons },
    });
  } catch (error) {
    console.error('Progress error:', error);
    res.status(500).json({ success: false, message: 'Failed to load progress.' });
  }
}