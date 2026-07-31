/**
 * @fileoverview Get All Courses API Route
 * Path: apps/web/pages/api/courses/index.js
 */

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const result = await pool.query(
      `SELECT id, slug, title, title_am, description, description_am, level, duration, badge, icon, thumbnail_url
       FROM courses WHERE is_published = true ORDER BY order_index ASC, created_at DESC`
    );

    res.json({ success: true, data: { courses: result.rows } });
  } catch (error) {
    console.error('Courses error:', error);
    res.status(500).json({ success: false, message: 'Failed to load courses.' });
  }
}