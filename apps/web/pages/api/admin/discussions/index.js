/**
 * @fileoverview Admin Discussions List API
 *
 * discussion_videos schema: id, youtube_id, title, duration, thumbnail,
 * sort_order, is_active, created_at, updated_at.
 *
 * There is no status, view_count, description, or published_at column.
 * Status is derived from is_active → 'published' | 'draft'.
 *
 * Path: apps/web/pages/api/admin/discussions/index.js
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
 * Extract an 11-character YouTube video ID.
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
    const statusFilter = req.query.status || 'all';
    const searchPattern = search ? `%${search}%` : '%';

    /**
     * Derived status: is_active TRUE → 'published', else 'draft'.
     * Filter by status maps 'published' → is_active = TRUE,
     * 'draft' → is_active IS NULL OR FALSE, 'archived' → excluded.
     */
    const sql = `
      SELECT
        d.id,
        d.youtube_id,
        d.title,
        d.duration,
        d.thumbnail,
        d.sort_order,
        d.is_active,
        CASE WHEN d.is_active = TRUE THEN 'published' ELSE 'draft' END AS status,
        d.created_at,
        d.updated_at
      FROM discussion_videos d
      WHERE ($1 = '%' OR d.title ILIKE $1 OR d.youtube_id ILIKE $1)
        AND ($2 = 'all'
             OR ($2 = 'published' AND d.is_active = TRUE)
             OR ($2 = 'draft' AND (d.is_active IS NULL OR d.is_active = FALSE)))
      ORDER BY d.sort_order ASC NULLS LAST, d.created_at DESC
    `;

    const result = await pool.query(sql, [searchPattern, statusFilter]);

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
      message: error.message || 'Failed to load discussions.',
    });
  }
}