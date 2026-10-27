/**
 * @fileoverview Admin Announcement Broadcast Endpoint
 *
 * POST /api/admin/notifications/broadcast
 *
 * Fans out an admin announcement to a targeted audience and persists the
 * broadcast to the announcements history table so admins can review what
 * was sent later.
 *
 * Audiences:
 *   - 'all'       → every user (INSERT...SELECT)
 *   - 'enrolled'  → only users with is_enrolled = true (INSERT...SELECT)
 *   - 'targeted'  → specific users picked by ID array (INSERT...SELECT WHERE id = ANY)
 *   - 'single'    → legacy: one user resolved by phone/email string
 *
 * Security:
 *   - Bearer admin JWT required (JWT_ADMIN_SECRET)
 *   - Per-admin rate limit (config-driven) via announcements table
 *   - Server-side validation of title/body/severity/audience
 *   - target_user_ids sanitized: non-UUID values rejected, deduped
 *   - Every dispatch inserted into announcements + admin_audit_logs
 *
 * Path: apps/web/pages/api/admin/notifications/broadcast.js
 */
import jwt from 'jsonwebtoken';
import { query } from '../../../../lib/db';
import notificationService from '../../../../../../packages/shared/notifications';
import notificationsConfig from '../../../../../../packages/shared/config/notifications.config';

const ALLOWED_SEVERITIES = ['info', 'success', 'warning', 'critical'];
const ALLOWED_AUDIENCES = ['all', 'enrolled', 'targeted', 'single'];
const TITLE_MIN_LENGTH = 3;
const TITLE_MAX_LENGTH = 120;
const BODY_MIN_LENGTH = 10;
const BODY_MAX_LENGTH = 500;

/* Hard ceiling on how many users a single targeted broadcast can hit —
   protects against accidental "select all 50,000 users" mistakes */
const MAX_TARGETED_USERS = 500;

/* UUID regex — validates every targeted user ID before it hits the DB */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const RATE_LIMIT_SECONDS = notificationsConfig.broadcastRateLimitSeconds || 60;

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

/**
 * Validate the announcement payload server-side.
 * @param {object} body - Request body
 * @returns {object} Normalized payload with sanitized target_user_ids
 * @throws {Error} With .status = 400 on any violation
 */
const validatePayload = (body) => {
  const title = String(body?.title || '').trim();
  const bodyText = String(body?.body || '').trim();
  const severity = String(body?.severity || '').toLowerCase();
  const audience = String(body?.audience || '').toLowerCase();
  const link = body?.link ? String(body.link).slice(0, 255) : null;

  /* Legacy single-audience identifier (phone or email) */
  const singleIdentifier = body?.singleIdentifier
    ? String(body.singleIdentifier).trim()
    : null;

  /* New targeted-audience: array of user IDs */
  const rawUserIds = Array.isArray(body?.userIds) ? body.userIds : [];

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

  /* Audience-specific validation */
  if (audience === 'single' && !singleIdentifier) {
    const err = new Error('singleIdentifier is required when audience is "single".');
    err.status = 400;
    throw err;
  }

  if (audience === 'targeted') {
    if (rawUserIds.length === 0) {
      const err = new Error('At least one user must be selected when audience is "targeted".');
      err.status = 400;
      throw err;
    }
    if (rawUserIds.length > MAX_TARGETED_USERS) {
      const err = new Error(`Cannot target more than ${MAX_TARGETED_USERS} users in a single broadcast.`);
      err.status = 400;
      throw err;
    }

    /* Validate every ID is a real UUID and dedupe */
    const validIds = [...new Set(
      rawUserIds
        .map((id) => String(id).trim().toLowerCase())
        .filter((id) => UUID_REGEX.test(id))
    )];

    if (validIds.length === 0) {
      const err = new Error('No valid user IDs provided.');
      err.status = 400;
      throw err;
    }

    return {
      title,
      body: bodyText,
      severity,
      audience,
      link,
      singleIdentifier: null,
      targetUserIds: validIds,
    };
  }

  return {
    title,
    body: bodyText,
    severity,
    audience,
    link,
    singleIdentifier,
    targetUserIds: null,
  };
};

/**
 * Per-admin rate limit via the most recent broadcast in announcements table.
 * @param {string} adminId - Admin identifier from the JWT
 * @returns {Promise<boolean>} True when allowed to send
 */
const checkRateLimit = async (adminId) => {
  const result = await query(
    `SELECT MAX(created_at) AS last_broadcast
     FROM announcements
     WHERE admin_id = $1`,
    [adminId]
  );
  if (!result.rows[0]?.last_broadcast) return true;
  const last = new Date(result.rows[0].last_broadcast).getTime();
  return Date.now() - last >= RATE_LIMIT_SECONDS * 1000;
};

/**
 * Resolve a single-audience target by phone OR email.
 * @param {string} identifier - Phone number or email address
 * @returns {Promise<string|null>} Target user id or null
 */
const resolveSingleUser = async (identifier) => {
  const result = await query(
    `SELECT id FROM users WHERE phone = $1 OR email = $1 LIMIT 1`,
    [identifier]
  );
  return result.rows[0]?.id || null;
};

/**
 * Verify which of the targeted user IDs actually exist in the database.
 * Returns only the valid ones — silently drops deleted/invalid IDs so the
 * broadcast still sends to whoever is left.
 *
 * @param {string[]} userIds - Candidate user IDs
 * @returns {Promise<string[]>} Verified user IDs that exist
 */
const verifyTargetedUsers = async (userIds) => {
  const result = await query(
    `SELECT id FROM users WHERE id = ANY($1::uuid[])`,
    [userIds]
  );
  return result.rows.map((r) => r.id);
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
    return res.status(err.status || 401).json({ success: false, message: err.message });
  }

  let payload;
  try {
    payload = validatePayload(req.body);
  } catch (err) {
    return res.status(err.status || 400).json({ success: false, message: err.message });
  }

  try {
    const allowed = await checkRateLimit(adminId);
    if (!allowed) {
      return res.status(429).json({
        success: false,
        message: `Rate limited. Please wait ${RATE_LIMIT_SECONDS} seconds between broadcasts.`,
      });
    }

    const typeConfig = notificationService.getTypeConfig('admin_announcement');
    if (!typeConfig) {
      return res.status(500).json({
        success: false,
        message: 'admin_announcement type is not configured.',
      });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + notificationsConfig.retentionDays);

    const tokens = JSON.stringify({ title: payload.title, body: payload.body });

    let recipientCount = 0;
    let finalTargetUserIds = null;

    if (payload.audience === 'single') {
      /* Legacy path: one user resolved by identifier */
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
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
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
      finalTargetUserIds = [targetUserId];
    } else if (payload.audience === 'targeted') {
      /* New multi-target path: fan out to verified user IDs */
      const verifiedIds = await verifyTargetedUsers(payload.targetUserIds);
      if (verifiedIds.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'None of the selected users exist. Please pick different users.',
        });
      }

      const insertResult = await query(
        `INSERT INTO notifications (
           user_id, type, title_key, title_tokens, body_key, body_tokens,
           link, icon, severity, expires_at
         )
         SELECT id, $1, $2, $3, $4, $5, $6, $7, $8, $9
         FROM users
         WHERE id = ANY($10::uuid[])`,
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
          verifiedIds,
        ]
      );
      recipientCount = insertResult.rowCount || 0;
      finalTargetUserIds = verifiedIds;
    } else {
      /* Bulk fan-out: one INSERT...SELECT regardless of audience size */
      const filterClause = payload.audience === 'enrolled' ? 'WHERE is_enrolled = true' : '';

      const insertResult = await query(
        `INSERT INTO notifications (
           user_id, type, title_key, title_tokens, body_key, body_tokens,
           link, icon, severity, expires_at
         )
         SELECT id, $1, $2, $3, $4, $5, $6, $7, $8, $9
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

    /* Persist to announcements history table */
    await query(
      `INSERT INTO announcements (
         admin_id, audience, severity, title, body, recipient_count, target_user_ids
       ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        adminId,
        payload.audience,
        payload.severity,
        payload.title,
        payload.body,
        recipientCount,
        finalTargetUserIds,
      ]
    );

    /* Legacy audit log entry (kept for backwards compatibility with
       existing rate-limit and audit queries elsewhere in the system) */
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
          targetUserIds: finalTargetUserIds,
        }),
        req.headers['x-forwarded-for'] || req.socket.remoteAddress || null,
        req.headers['user-agent'] || null,
      ]
    );

    return res.status(200).json({
      success: true,
      message: `Broadcast sent to ${recipientCount} recipient(s).`,
      data: { recipientCount, audience: payload.audience },
    });
  } catch (error) {
    console.error('[admin/notifications/broadcast] Error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to send broadcast.' });
  }
}