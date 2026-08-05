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
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Admin authentication required.' });
  }
  try { jwt.verify(authHeader.split(' ')[1], process.env.JWT_ADMIN_SECRET); }
  catch { return res.status(401).json({ success: false, message: 'Invalid admin token.' }); }

  if (req.method === 'GET') {
    try {
      const result = await pool.query(
        `SELECT id, youtube_id, title, duration, thumbnail, sort_order, is_active, created_at
         FROM course_videos WHERE is_active = true ORDER BY sort_order ASC, created_at DESC`
      );
      return res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
      console.error('Course videos fetch error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to load course videos.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { youtubeId, title, duration, thumbnail } = req.body;
      if (!youtubeId || !youtubeId.trim()) return res.status(400).json({ success: false, message: 'YouTube URL or ID is required.' });
      if (!title || !title.trim()) return res.status(400).json({ success: false, message: 'Title is required.' });
      await pool.query('UPDATE course_videos SET sort_order = sort_order + 1');
      const result = await pool.query(
        `INSERT INTO course_videos (youtube_id, title, duration, thumbnail, sort_order)
         VALUES ($1, $2, $3, $4, 0) RETURNING id, youtube_id, title, duration, thumbnail, sort_order, is_active, created_at`,
        [youtubeId.trim(), title.trim(), duration?.trim() || '', thumbnail?.trim() || '']
      );
      return res.status(201).json({ success: true, message: 'Course video created.', data: result.rows[0] });
    } catch (error) {
      console.error('Course video create error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to create course video.' });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed.' });
}
