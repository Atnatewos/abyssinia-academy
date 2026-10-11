/**
 * @fileoverview Notifications API — Mark All Read
 *
 * POST /api/notifications/read-all
 *
 * Marks all unread notifications as read for the authenticated user.
 *
 * Security:
 *   - Bearer JWT authentication required
 *   - userId from token prevents cross-user writes
 *
 * Path: apps/web/pages/api/notifications/read-all.js
 */
import jwt from 'jsonwebtoken';
import { query } from '../../../lib/db';
import notificationService from '../../../../../packages/shared/notifications';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
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

  try {
    const markedCount = await notificationService.markAllRead(query, userId);
    return res.status(200).json({
      success: true,
      message: `${markedCount} notification(s) marked as read.`,
      data: { markedCount },
    });
  } catch (error) {
    console.error('Mark all read error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to mark all as read.' });
  }
}