/**
 * @fileoverview Admin Courses List API
 *
 * Returns courses with search + level filter support. Includes price_etb
 * so the admin list can show each course's own price (or fallback label).
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
    return res
      .status(405)
      .json({ success: false, message: 'Method not allowed.' });
  }

  try {
    verifyAdmin(req.headers.authorization);

    const search = (req.query.search || '').trim();
    const level = (req.query.level || '').trim();

    const params = [];
    const where = [];

    if (search) {
      params.push(`%${search}%`);
      where.push(
        `(c.title ILIKE $${params.length} OR c.description ILIKE $${params.length} OR c.slug ILIKE $${params.length})`
      );
    }

    if (level && level !== 'all') {
      params.push(level);
      where.push(`c.level = $${params.length}`);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

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
        c.price_etb,
        c.is_published,
        c.order_index,
        c.thumbnail_url,
        c.created_at,
        c.updated_at
      FROM courses c
      ${whereClause}
      ORDER BY c.order_index ASC NULLS LAST, c.created_at DESC
    `;

    const result = await pool.query(sql, params);

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