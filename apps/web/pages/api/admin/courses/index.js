/**
 * @fileoverview Admin Courses List API
 *
 * Returns courses with verified schema-only fields (probe 2026-10-08):
 *
 *   courses columns used:
 *     id, slug, title, title_am, description, description_am, level,
 *     duration, badge, icon, is_published, order_index, thumbnail_url,
 *     created_at, updated_at
 *
 *   NOT in schema (never referenced):
 *     is_active, phase_number, price_etb, class_count, week_count
 *
 * Status is DERIVED from is_published → 'published' | 'draft'.
 *
 * Path: apps/web/pages/api/admin/courses/index.js
 */
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
      ? { rejectUnauthorized: false }
      : false,
});

/**
 * Validate admin JWT.
 * @param {string} authHeader - Authorization header
 * @returns {object} Decoded payload
 * @throws {Error} On auth failure with status attached
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

    /**
     * Schema-verified SELECT. is_published is the only status-like column.
     * Order by order_index first (NULLS LAST so unordered items fall below),
     * then by created_at DESC as secondary sort.
     */
    const sql = `
      SELECT
        c.id,
        c.slug,
        c.title,
        c.title_am,
        c.description,
        c.description_am,
        c.level,
        c.duration,
        c.badge,
        c.icon,
        c.is_published,
        c.order_index,
        c.thumbnail_url,
        c.created_at,
        c.updated_at,
        CASE WHEN c.is_published = TRUE THEN 'published' ELSE 'draft' END AS status
      FROM courses c
      WHERE (
              $1 = '%'
              OR c.title ILIKE $1
              OR c.description ILIKE $1
              OR c.slug ILIKE $1
            )
      ORDER BY c.order_index ASC NULLS LAST, c.created_at DESC
    `;

    const result = await pool.query(sql, [searchPattern]);

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('[admin/courses] Error:', error.message);
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to load courses.',
    });
  }
}