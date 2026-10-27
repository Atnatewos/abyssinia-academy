/**
 * @fileoverview Notifications API — Unread Count
 *
 * GET /api/notifications/unread-count
 *
 * Returns the number of unread notifications for badge display.
 * Lightweight endpoint called on route change + visibility-based polling.
 *
 * Security:
 *   - Bearer JWT authentication required
 *   - userId from token prevents cross-user access
 *
 * Path: apps/web/pages/api/notifications/unread-count.js
 */
import jwt from 'jsonwebtoken';
import { query } from '../../../lib/db';
import notificationService from '../../../../../packages/shared/notifications';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
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
    const count = await notificationService.unreadCount(query, userId);
    return res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    console.error('Unread count error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch unread count.' });
  }
}