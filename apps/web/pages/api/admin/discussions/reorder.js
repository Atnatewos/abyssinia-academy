/**
 * @fileoverview Admin Discussion Videos Reorder API
 * POST: swaps the sort_order of two videos
 * Body: { videoId, direction: 'up' | 'down' }
 * Path: apps/web/pages/api/admin/discussions/reorder.js
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
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Admin authentication required.' });
  }

  try {
    jwt.verify(authHeader.split(' ')[1], process.env.JWT_ADMIN_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid admin token.' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  try {
    const { videoId, direction } = req.body;

    if (!videoId || !direction || !['up', 'down'].includes(direction)) {
      return res.status(400).json({ success: false, message: 'videoId and direction (up/down) are required.' });
    }

    /*
     * Fetch the current video's sort_order
     */
    const currentResult = await pool.query(
      'SELECT id, sort_order FROM discussion_videos WHERE id = $1 AND is_active = true',
      [videoId]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Video not found.' });
    }

    const current = currentResult.rows[0];

    /*
     * Find the adjacent video to swap with
     */
    let adjacentResult;

    if (direction === 'up') {
      adjacentResult = await pool.query(
        `SELECT id, sort_order FROM discussion_videos
         WHERE is_active = true AND sort_order < $1
         ORDER BY sort_order DESC LIMIT 1`,
        [current.sort_order]
      );
    } else {
      adjacentResult = await pool.query(
        `SELECT id, sort_order FROM discussion_videos
         WHERE is_active = true AND sort_order > $1
         ORDER BY sort_order ASC LIMIT 1`,
        [current.sort_order]
      );
    }

    if (adjacentResult.rows.length === 0) {
      return res.status(200).json({ success: true, message: 'Already at the boundary.' });
    }

    const adjacent = adjacentResult.rows[0];

    /*
     * Swap the sort_order values
     */
    await pool.query('UPDATE discussion_videos SET sort_order = $1 WHERE id = $2', [adjacent.sort_order, current.id]);
    await pool.query('UPDATE discussion_videos SET sort_order = $1 WHERE id = $2', [current.sort_order, adjacent.id]);

    return res.status(200).json({ success: true, message: `Video moved ${direction}.` });
  } catch (error) {
    console.error('Discussion reorder error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to reorder videos.' });
  }
}