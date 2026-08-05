/**
 * @fileoverview Admin Discussion Videos Bulk Reorder API
 * POST: updates sort_order for all videos at once (drag-and-drop).
 * Body: { videos: [{ id, sortOrder }, ...] }
 * Path: apps/web/pages/api/admin/discussions/reorder-bulk.js
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
    const { videos } = req.body;

    if (!videos || !Array.isArray(videos) || videos.length === 0) {
      return res.status(400).json({ success: false, message: 'videos array is required.' });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const video of videos) {
        await client.query(
          'UPDATE discussion_videos SET sort_order = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [video.sortOrder, video.id]
        );
      }

      await client.query('COMMIT');

      return res.status(200).json({ success: true, message: 'Order saved.' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Bulk reorder error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to reorder videos.' });
  }
}
