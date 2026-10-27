/**
 * @fileoverview Notifications API — Mark Single Read
 *
 * PATCH /api/notifications/:id/read
 *
 * Marks a single notification as read.
 *
 * Security:
 *   - Bearer JWT authentication required
 *   - userId from token + notificationId from URL prevents cross-user writes
 *
 * Path: apps/web/pages/api/notifications/[id]/read.js
 */
import jwt from 'jsonwebtoken';
import { query } from '../../../../lib/db';
import notificationService from '../../../../../../packages/shared/notifications';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
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
    const marked = await notificationService.markRead(query, userId, notificationId);
    if (!marked) {
      return res.status(404).json({ success: false, message: 'Notification not found or already read.' });
    }
    return res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Mark read error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to mark as read.' });
  }
}