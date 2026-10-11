/**
 * @fileoverview Notifications API — Delete Single
 *
 * DELETE /api/notifications/:id
 *
 * Deletes a single notification (dismiss × button).
 *
 * Security:
 *   - Bearer JWT authentication required
 *   - userId from token + notificationId from URL prevents cross-user deletes
 *
 * Path: apps/web/pages/api/notifications/[id]/index.js
 */
import jwt from 'jsonwebtoken';
import { query } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  let userId;
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    userId = decoded.userId || decoded.id;
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }

  const notificationId = req.query.id;
  if (!notificationId) {
    return res.status(400).json({ success: false, message: 'Notification ID required.' });
  }

  try {
    const result = await query(
      `DELETE FROM notifications WHERE id = $1 AND user_id = $2`,
      [notificationId, userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }
    return res.status(200).json({ success: true, message: 'Notification deleted.' });
  } catch (error) {
    console.error('Delete notification error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to delete notification.' });
  }
}