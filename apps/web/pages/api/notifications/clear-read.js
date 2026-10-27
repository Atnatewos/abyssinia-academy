/**
 * @fileoverview Notifications API — Clear Read
 *
 * POST /api/notifications/clear-read
 *
 * Deletes all READ notifications for the authenticated user. Unread
 * notifications are never touched. Used by the "Clear read" cleanup
 * button in the dropdown header and the full notification center.
 *
 * Security:
 *   - Bearer JWT authentication required
 *   - userId from token prevents cross-user deletes
 *   - DELETE scope limited to is_read = true rows
 *
 * Path: apps/web/pages/api/notifications/clear-read.js
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
    const deletedCount = await notificationService.deleteRead(query, userId);
    return res.status(200).json({
      success: true,
      message: `${deletedCount} read notification(s) removed.`,
      data: { deletedCount },
    });
  } catch (error) {
    console.error('Clear read error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to clear read notifications.' });
  }
}