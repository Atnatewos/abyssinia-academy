/**
 * @fileoverview Admin Discussion Video API — Update + Delete
 * PUT: update a video's details
 * DELETE: soft-delete a video (sets is_active = false)
 * Path: apps/web/pages/api/admin/discussions/[id].js
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

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, message: 'Video ID is required.' });
  }

  /*
   * PUT — Update a discussion video
   */
  if (req.method === 'PUT') {
    try {
      const { youtubeId, title, duration, thumbnail, isActive } = req.body;

      const result = await pool.query(
        `UPDATE discussion_videos
         SET youtube_id = COALESCE($1, youtube_id),
             title = COALESCE($2, title),
             duration = COALESCE($3, duration),
             thumbnail = COALESCE($4, thumbnail),
             is_active = COALESCE($5, is_active),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $6 AND is_active = true
         RETURNING id, youtube_id, title, duration, thumbnail, sort_order, is_active, created_at`,
        [
          youtubeId?.trim() || null,
          title?.trim() || null,
          duration?.trim() || null,
          thumbnail?.trim() || null,
          isActive !== undefined ? isActive : null,
          id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Discussion video not found.' });
      }

      return res.status(200).json({
        success: true,
        message: 'Discussion video updated.',
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Discussion video update error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to update discussion video.' });
    }
  }

  /*
   * DELETE — Soft delete a discussion video
   */
  if (req.method === 'DELETE') {
    try {
      await pool.query(
        'UPDATE discussion_videos SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      );

      return res.status(200).json({ success: true, message: 'Discussion video deleted.' });
    } catch (error) {
      console.error('Discussion video delete error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to delete discussion video.' });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed.' });
}