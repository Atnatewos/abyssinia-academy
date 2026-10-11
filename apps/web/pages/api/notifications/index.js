/**
 * @fileoverview Notifications API — List + Lazy Purge
 *
 * GET /api/notifications?page=1&pageSize=20&category=payments&unread_only=true
 *
 * Returns paginated notification list with optional filtering.
 * Performs lazy purge of expired rows on every read (retention policy).
 *
 * Security:
 *   - Bearer JWT authentication required
 *   - userId from token prevents cross-user access
 *   - Input validation on page/pageSize/category
 *
 * Path: apps/web/pages/api/notifications/index.js
 */
import jwt from 'jsonwebtoken';
import { query } from '../../../lib/db';
import notificationService from '../../../../../packages/shared/notifications';
import { getNotificationsConfig } from '../../../lib/config';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  /* Authenticate via JWT Bearer token */
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
    const config = getNotificationsConfig();
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const pageSize = Math.min(
      config.pageSize || 20,
      Math.max(1, parseInt(req.query.pageSize || '20', 10))
    );
    const category = req.query.category || 'all';
    const unreadOnly = req.query.unread_only === 'true';

    const result = await notificationService.list(query, userId, {
      page,
      pageSize,
      category,
      unreadOnly,
    });

    const unreadCountResult = await notificationService.unreadCount(query, userId);

    return res.status(200).json({
      success: true,
      data: {
        notifications: result.notifications,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        unreadCount: unreadCountResult,
      },
    });
  } catch (error) {
    console.error('Notifications list error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to load notifications.' });
  }
}