import { Pool } from 'pg';

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
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  try {
    const result = await pool.query(
      `SELECT id, youtube_id, title, duration, thumbnail
       FROM course_videos
       WHERE is_active = true
       ORDER BY sort_order ASC, created_at DESC`
    );
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Public course videos error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to load videos.' });
  }
}
