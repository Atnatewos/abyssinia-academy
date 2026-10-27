/**
 * @fileoverview Admin Analytics API
 * Returns visitor stats: total, today, this week, top pages.
 * Path: apps/web/pages/api/admin/analytics/visitors.js
 */

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
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Admin authentication required.' });
  }

  try {
    jwt.verify(authHeader.split(' ')[1], process.env.JWT_ADMIN_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid admin token.' });
  }

  try {
    /*
     * Total unique visitors (all time)
     */
    const totalResult = await pool.query(
      'SELECT COUNT(DISTINCT visitor_hash) AS count FROM page_views'
    );

    /*
     * Today's unique visitors
     */
    const todayResult = await pool.query(
      `SELECT COUNT(DISTINCT visitor_hash) AS count
       FROM page_views
       WHERE created_at >= CURRENT_DATE`
    );

    /*
     * Total page views (all time)
     */
    const viewsResult = await pool.query(
      'SELECT COUNT(*) AS count FROM page_views'
    );

    /*
     * This week's unique visitors
     */
    const weekResult = await pool.query(
      `SELECT COUNT(DISTINCT visitor_hash) AS count
       FROM page_views
       WHERE created_at >= date_trunc('week', CURRENT_DATE)`
    );

    /*
     * Top 10 most visited pages
     */
    const pagesResult = await pool.query(
      `SELECT path, COUNT(*) AS views
       FROM page_views
       GROUP BY path
       ORDER BY views DESC
       LIMIT 10`
    );

    return res.status(200).json({
      success: true,
      data: {
        totalVisitors: parseInt(totalResult.rows[0].count, 10),
        todayVisitors: parseInt(todayResult.rows[0].count, 10),
        totalViews: parseInt(viewsResult.rows[0].count, 10),
        weekVisitors: parseInt(weekResult.rows[0].count, 10),
        topPages: pagesResult.rows,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to load analytics.' });
  }
}