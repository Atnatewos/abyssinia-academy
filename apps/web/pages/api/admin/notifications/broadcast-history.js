/**
 * @fileoverview Admin Broadcast History Endpoint
 *
 * GET /api/admin/notifications/broadcast-history?page=1&pageSize=20
 *
 * Returns a paginated list of past announcements from the announcements
 * table, ordered most-recent-first. Each row includes the admin who
 * sent it (resolved via admins.username) so the history shows a clear
 * "sent by" attribution.
 *
 * Security:
 *   - Bearer admin JWT required (JWT_ADMIN_SECRET)
 *   - No cross-admin data leakage — every admin sees the full history
 *     (this is intentional: broadcast transparency across the admin team)
 *
 * Path: apps/web/pages/api/admin/notifications/broadcast-history.js
 */
import jwt from 'jsonwebtoken';
import { query } from '../../../../lib/db';
import notificationsConfig from '../../../../../../packages/shared/config/notifications.config';

const MAX_PAGE_SIZE = 100;

/**
 * Decode and verify an admin Bearer token.
 * @param {string} authHeader - Authorization header value
 * @returns {object} Decoded admin payload
 * @throws {Error} With .status attached
 */
const verifyAdmin = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Missing or malformed Authorization header');
    err.status = 401;
    throw err;
  }
  const adminSecret = process.env.JWT_ADMIN_SECRET;
  if (!adminSecret) {
    const err = new Error('JWT_ADMIN_SECRET is not configured');
    err.status = 500;
    throw err;
  }
  try {
    return jwt.verify(authHeader.slice(7), adminSecret);
  } catch {
    const err = new Error('Invalid or expired admin token');
    err.status = 401;
    throw err;
  }
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  try {
    verifyAdmin(req.headers.authorization);
  } catch (err) {
    return res.status(err.status || 401).json({ success: false, message: err.message });
  }

  try {
    const configPageSize = notificationsConfig.broadcastHistoryPageSize || 20;
    const requestedPage = Math.max(1, parseInt(req.query.page || '1', 10));
    const requestedSize = parseInt(req.query.pageSize || String(configPageSize), 10);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, requestedSize || configPageSize));
    const offset = (requestedPage - 1) * pageSize;

    const [announcementsResult, countResult] = await Promise.all([
      query(
        `SELECT
           a.id,
           a.admin_id,
           a.audience,
           a.severity,
           a.title,
           a.body,
           a.recipient_count,
           a.target_user_ids,
           a.created_at,
           COALESCE(ad.username, ad.email, 'Unknown admin') AS sent_by
         FROM announcements a
         LEFT JOIN admins ad ON ad.id = a.admin_id
         ORDER BY a.created_at DESC
         LIMIT $1 OFFSET $2`,
        [pageSize, offset]
      ),
      query(`SELECT COUNT(*)::int AS total FROM announcements`),
    ]);

    const total = countResult.rows[0]?.total || 0;

    return res.status(200).json({
      success: true,
      data: {
        announcements: announcementsResult.rows,
        total,
        page: requestedPage,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (error) {
    console.error('[admin/notifications/broadcast-history] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to load broadcast history.',
    });
  }
}