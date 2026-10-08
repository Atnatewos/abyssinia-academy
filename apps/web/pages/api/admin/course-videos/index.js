/**
 * @fileoverview Admin Course Videos List API
 *
 * course_videos schema: id, youtube_id, title, duration, thumbnail,
 * sort_order, is_active, created_at, updated_at.
 *
 * There is no phase_number, week_number, class_number, or is_published
 * column. Status is derived from is_active → 'published' | 'draft'.
 * YouTube IDs may contain full URLs; the API normalizes to the 11-char ID.
 *
 * Path: apps/web/pages/api/admin/course-videos/index.js
 */
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
});

/**
 * Extract an 11-character YouTube video ID from various input formats.
 * Handles: raw IDs, youtu.be short links, youtube.com/watch?v= URLs,
 * youtube.com/embed/ URLs, and /shorts/ URLs.
 *
 * @param {string} raw - Raw youtube_id value from DB
 * @returns {string} Clean 11-char ID or the original string
 */
const extractYouTubeId = (raw) => {
  if (!raw) return '';
  const match = raw.match(/(?:v=|\/embed\/|youtu\.be\/|\/shorts\/|\/watch\?v=)([a-zA-Z0-9_-]{11})/);
  if (match && match[1]) return match[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;
  return raw;
};

/**
 * Validate admin JWT.
 */
const verifyAdmin = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Missing or malformed Authorization header');
    err.status = 401;
    throw err;
  }
  const token = authHeader.slice(7);
  const adminSecret = process.env.JWT_ADMIN_SECRET;
  if (!adminSecret) {
    const err = new Error('JWT_ADMIN_SECRET is not configured');
    err.status = 500;
    throw err;
  }
  try {
    return jwt.verify(token, adminSecret);
  } catch {
    const err = new Error('Invalid or expired admin token');
    err.status = 401;
    throw err;
  }
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  try {
    verifyAdmin(req.headers.authorization);

    const search = (req.query.search || '').trim();
    const searchPattern = search ? `%${search}%` : '%';

    const sql = `
      SELECT
        v.id,
        v.youtube_id,
        v.title,
        v.duration,
        v.thumbnail,
        v.sort_order,
        v.is_active,
        CASE WHEN v.is_active = TRUE THEN 'published' ELSE 'draft' END AS status,
        v.created_at,
        v.updated_at
      FROM course_videos v
      WHERE ($1 = '%' OR v.title ILIKE $1 OR v.youtube_id ILIKE $1)
      ORDER BY v.sort_order ASC NULLS LAST, v.created_at DESC
    `;

    const result = await pool.query(sql, [searchPattern]);

    const normalized = result.rows.map((row) => ({
      ...row,
      youtube_id_clean: extractYouTubeId(row.youtube_id),
    }));

    return res.status(200).json({
      success: true,
      data: normalized,
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to load course videos.',
    });
  }
}