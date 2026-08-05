/**
 * @fileoverview Admin Discussion Videos API — List + Create
 * GET: returns all videos ordered by sort_order
 * POST: creates a new video with sort_order = 0 (appears first)
 * Path: apps/web/pages/api/admin/discussions/index.js
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
  /*
   * Authenticate admin
   */
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Admin authentication required.' });
  }

  try {
    jwt.verify(authHeader.split(' ')[1], process.env.JWT_ADMIN_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid admin token.' });
  }

  /*
   * GET — List all discussion videos ordered by sort_order
   */
  if (req.method === 'GET') {
    try {
      const result = await pool.query(
        `SELECT id, youtube_id, title, duration, thumbnail, sort_order, is_active, created_at
         FROM discussion_videos
         WHERE is_active = true
         ORDER BY sort_order ASC, created_at DESC`
      );

      return res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
      console.error('Discussion videos fetch error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to load discussion videos.' });
    }
  }

  /*
   * POST — Create a new discussion video
   * New videos get sort_order = 0 so they appear first.
   * Existing videos get bumped up by 1.
   */
  if (req.method === 'POST') {
    try {
      const { youtubeId, title, duration, thumbnail } = req.body;

      if (!youtubeId || !youtubeId.trim()) {
        return res.status(400).json({ success: false, message: 'YouTube URL or ID is required.' });
      }

      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, message: 'Title is required.' });
      }

      /*
       * Bump all existing sort_order values by 1 so the new video gets position 0
       */
      await pool.query('UPDATE discussion_videos SET sort_order = sort_order + 1');

      const result = await pool.query(
        `INSERT INTO discussion_videos (youtube_id, title, duration, thumbnail, sort_order)
         VALUES ($1, $2, $3, $4, 0)
         RETURNING id, youtube_id, title, duration, thumbnail, sort_order, is_active, created_at`,
        [youtubeId.trim(), title.trim(), duration?.trim() || '', thumbnail?.trim() || '']
      );

      return res.status(201).json({
        success: true,
        message: 'Discussion video created.',
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Discussion video create error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to create discussion video.' });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed.' });
}