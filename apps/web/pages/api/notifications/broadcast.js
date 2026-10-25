/**
 * @fileoverview Admin Announcement Broadcast Endpoint
 *
 * POST /api/admin/notifications/broadcast
 *
 * Fans out an admin announcement to a targeted audience.
 * Fixed the relative path to the shared notifications package.
 *
 * Path: apps/web/pages/api/notifications/broadcast.js
 */
import jwt from 'jsonwebtoken';
import { query } from '../../../lib/db';

/* 
 * The shared notification service provides type configs and i18n keys.
 * Path resolution: broadcast.js -> notifications -> api -> pages -> web -> apps -> root
 * (6 levels up to reach the monorepo root).
 */
let notificationService = null;
try {
  notificationService = require('../../../../../../packages/shared/notifications').default;
} catch {
  notificationService = null;
}

const ALLOWED_SEVERITIES = ['info', 'success', 'warning', 'critical'];
const ALLOWED_AUDIENCES = ['all', 'enrolled', 'single'];

/* Configuration sourced from environment variables with safe fallbacks */
const TITLE_MIN_LENGTH = parseInt(process.env.NOTIF_TITLE_MIN_LENGTH, 10) || 3;
const TITLE_MAX_LENGTH = parseInt(process.env.NOTIF_TITLE_MAX_LENGTH, 10) || 120;
const BODY_MIN_LENGTH = parseInt(process.env.NOTIF_BODY_MIN_LENGTH, 10) || 10;
const BODY_MAX_LENGTH = parseInt(process.env.NOTIF_BODY_MAX_LENGTH, 10) || 500;
const RATE_LIMIT_SECONDS = parseInt(process.env.NOTIF_RATE_LIMIT_SECONDS, 10) || 60;
const EXPIRY_DAYS = parseInt(process.env.NOTIF_EXPIRY_DAYS, 10) || 30;

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

const validatePayload = (body) => {
  const title = String(body?.title || '').trim().replace(/\0/g, '');
  const bodyText = String(body?.body || '').trim().replace(/\0/g, '');
  const severity = String(body?.severity || '').toLowerCase();
  const audience = String(body?.audience || '').toLowerCase();
  const link = body?.link ? String(body.link).slice(0, 255) : null;
  const singleIdentifier = body?.singleIdentifier
    ? String(body.singleIdentifier).trim()
    : null;

  if (!title || title.length < TITLE_MIN_LENGTH || title.length > TITLE_MAX_LENGTH) {
    const err = new Error(`Title must be between ${TITLE_MIN_LENGTH} and ${TITLE_MAX_LENGTH} characters.`);
    err.status = 400;
    throw err;
  }
  
  if (!bodyText || bodyText.length < BODY_MIN_LENGTH || bodyText.length > BODY_MAX_LENGTH) {
    const err = new Error(`Body must be between ${BODY_MIN_LENGTH} and ${BODY_MAX_LENGTH} characters.`);
    err.status = 400;
    throw err;
  }
  
  if (!ALLOWED_SEVERITIES.includes(severity)) {
    const err = new Error(`Invalid severity. Allowed: ${ALLOWED_SEVERITIES.join(', ')}.`);
    err.status = 400;
    throw err;
  }
  
  if (!ALLOWED_AUDIENCES.includes(audience)) {
    const err = new Error(`Invalid audience. Allowed: ${ALLOWED_AUDIENCES.join(', ')}.`);
    err.status = 400;
    throw err;
  }
  
  if (audience === 'single' && !singleIdentifier) {
    const err = new Error('singleIdentifier is required when audience is "single".');
    err.status = 400;
    throw err;
  }

  return { title, body: bodyText, severity, audience, link, singleIdentifier };
};

const checkRateLimit = async (adminId) => {
  const result = await query(
    `SELECT MAX(created_at) AS last_broadcast
     FROM admin_audit_logs
     WHERE admin_id = $1 AND action = 'announcement.broadcast'`,
    [adminId]
  );
  
  const lastBroadcast = result.rows[0]?.last_broadcast;
  if (!lastBroadcast) return true;
  
  const lastTime = new Date(lastBroadcast).getTime();
  return Date.now() - lastTime >= RATE_LIMIT_SECONDS * 1000;
};

const resolveSingleUser = async (identifier) => {
  const result = await query(
    `SELECT id FROM users WHERE phone = $1 OR email = $1 LIMIT 1`,
    [identifier]
  );
  return result.rows[0]?.id || null;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  let adminId;
  try {
    const decoded = verifyAdmin(req.headers.authorization);
    adminId = decoded.adminId || decoded.id;
  } catch (err) {
    return res.status(err.status || 401).json({
      success: false,
      message: err.message,
    });
  }

  let payload;
  try {
    payload = validatePayload(req.body);
  } catch (err) {
    return res.status(err.status || 400).json({
      success: false,
      message: err.message,
    });
  }

  try {
    const allowed = await checkRateLimit(adminId);
    if (!allowed) {
      return res.status(429).json({
        success: false,
        message: `Rate limited. Please wait ${RATE_LIMIT_SECONDS} seconds between broadcasts.`,
      });
    }

    const typeConfig = notificationService?.getTypeConfig?.('admin_announcement') || {
      titleKey: 'admin.announcement.title',
      bodyKey: 'admin.announcement.body',
      icon: 'Megaphone',
    };

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS);

    const tokens = JSON.stringify({
      title: payload.title,
      body: payload.body,
    });

    let recipientCount = 0;

    if (payload.audience === 'single') {
      const targetUserId = await resolveSingleUser(payload.singleIdentifier);
      if (!targetUserId) {
        return res.status(404).json({
          success: false,
          message: 'No user found matching that phone or email.',
        });
      }

      await query(
        `INSERT INTO notifications (
           user_id, type, title_key, title_tokens, body_key, body_tokens,
           link, icon, severity, expires_at
         ) VALUES ($1, $2, $3, $4::jsonb, $5, $6::jsonb, $7, $8, $9, $10)`,
        [
          targetUserId,
          'admin_announcement',
          typeConfig.titleKey,
          tokens,
          typeConfig.bodyKey,
          tokens,
          payload.link,
          typeConfig.icon,
          payload.severity,
          expiresAt,
        ]
      );
      recipientCount = 1;
    } else {
      const filterClause = payload.audience === 'enrolled'
        ? 'WHERE is_enrolled = true'
        : '';

      const insertResult = await query(
        `INSERT INTO notifications (
           user_id, type, title_key, title_tokens, body_key, body_tokens,
           link, icon, severity, expires_at
         )
         SELECT id, $1, $2, $3::jsonb, $4, $5::jsonb, $6, $7, $8, $9
         FROM users ${filterClause}`,
        [
          'admin_announcement',
          typeConfig.titleKey,
          tokens,
          typeConfig.bodyKey,
          tokens,
          payload.link,
          typeConfig.icon,
          payload.severity,
          expiresAt,
        ]
      );
      recipientCount = insertResult.rowCount || 0;
    }

    await query(
      `INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details, ip_address, user_agent)
       VALUES ($1, 'announcement.broadcast', 'announcement', NULL, $2, $3, $4)`,
      [
        adminId,
        JSON.stringify({
          audience: payload.audience,
          severity: payload.severity,
          recipientCount,
          title: payload.title,
          singleIdentifier: payload.singleIdentifier || null,
        }),
        req.headers['x-forwarded-for'] || req.socket.remoteAddress || null,
        req.headers['user-agent'] || null,
      ]
    );

    return res.status(200).json({
      success: true,
      message: `Broadcast sent to ${recipientCount} recipient(s).`,
      data: { recipientCount },
    });
  } catch (error) {
    console.error('[admin/notifications/broadcast] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to send broadcast.',
    });
  }
}