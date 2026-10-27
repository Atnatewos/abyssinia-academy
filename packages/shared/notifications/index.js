/**
 * @fileoverview Notification Service (Shared, Framework-Agnostic)
 *
 * Pure business logic for the notification system. Receives a `query`
 * function via dependency injection so it works with both Next.js (lib/db)
 * and Express (apps/api pool). Zero framework-specific imports.
 *
 * Exports:
 *   - notify(query, userId, type, tokens, link) — insert a notification
 *   - list(query, userId, { unreadOnly, page, pageSize }) — paginated list
 *   - unreadCount(query, userId) — badge count
 *   - markRead(query, userId, notificationId) — mark single as read
 *   - markAllRead(query, userId) — mark all as read
 *   - deleteRead(query, userId) — delete all read (cleanup)
 *   - purgeExpired(query) — delete expired rows (retention policy)
 *
 * All functions are async and throw on DB errors (caller handles).
 *
 * Path: packages/shared/notifications/index.js
 */

const config = require('../config/notifications.config');

/**
 * Resolve the notification type config entry.
 * @param {string} type - Notification type enum key
 * @returns {object|null} Config entry or null if type not found
 */
const getTypeConfig = (type) => config.types[type] || null;

/**
 * Insert a new notification for a user.
 *
 * @param {Function} query - DB query function (pool.query signature)
 * @param {string} userId - Recipient user ID
 * @param {string} type - Notification type enum key
 * @param {object} tokens - Template variables for title/body
 * @param {string|null} link - Optional deep-link URL
 * @returns {Promise<{id: string}>} Inserted notification ID
 * @throws {Error} If type not found in config or DB insert fails
 */
const notify = async (query, userId, type, tokens = {}, link = null) => {
  const typeConfig = getTypeConfig(type);
  if (!typeConfig) {
    throw new Error(`Unknown notification type: ${type}`);
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + config.retentionDays);

  const result = await query(
    `INSERT INTO notifications (
       user_id, type, title_key, title_tokens, body_key, body_tokens,
       link, icon, severity, expires_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id`,
    [
      userId,
      type,
      typeConfig.titleKey,
      JSON.stringify(tokens),
      typeConfig.bodyKey,
      JSON.stringify(tokens),
      link,
      typeConfig.icon,
      typeConfig.severity,
      expiresAt,
    ]
  );

  /* Enforce max-per-user cap: evict oldest if over limit */
  await query(
    `DELETE FROM notifications
     WHERE id IN (
       SELECT id FROM notifications
       WHERE user_id = $1
       ORDER BY created_at ASC
       OFFSET $2
     )`,
    [userId, config.maxPerUser]
  );

  return { id: result.rows[0].id };
};

/**
 * List notifications for a user with pagination and optional filtering.
 *
 * @param {Function} query - DB query function
 * @param {string} userId - User ID
 * @param {object} options - { unreadOnly, page, pageSize, category }
 * @returns {Promise<{notifications: Array, total: number, page: number, pageSize: number}>}
 */
const list = async (query, userId, options = {}) => {
  const {
    unreadOnly = false,
    page = 1,
    pageSize = config.pageSize,
    category = null,
  } = options;

  const offset = (page - 1) * pageSize;
  const conditions = ['user_id = $1'];
  const params = [userId];

  if (unreadOnly) {
    conditions.push('is_read = false');
  }

  if (category && category !== 'all') {
    if (category === 'unread') {
      conditions.push('is_read = false');
    } else {
      /* Map category to type prefix or explicit types */
      const categoryTypes = Object.entries(config.types)
        .filter(([, cfg]) => cfg.category === category)
        .map(([type]) => type);
      if (categoryTypes.length > 0) {
        conditions.push(`type = ANY($${params.length + 1})`);
        params.push(categoryTypes);
      }
    }
  }

  const whereClause = conditions.join(' AND ');
  params.push(pageSize, offset);

  const result = await query(
    `SELECT id, type, title_key, title_tokens, body_key, body_tokens,
            link, icon, severity, is_read, read_at, created_at
     FROM notifications
     WHERE ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const countResult = await query(
    `SELECT COUNT(*) AS total FROM notifications WHERE ${whereClause}`,
    params.slice(0, -2)
  );

  /* Lazy purge: delete expired rows on every read */
  await query(
    `DELETE FROM notifications WHERE user_id = $1 AND expires_at < NOW()`,
    [userId]
  );

  return {
    notifications: result.rows,
    total: parseInt(countResult.rows[0].total, 10),
    page,
    pageSize,
  };
};

/**
 * Get unread notification count for badge display.
 *
 * @param {Function} query - DB query function
 * @param {string} userId - User ID
 * @returns {Promise<number>} Unread count
 */
const unreadCount = async (query, userId) => {
  const result = await query(
    `SELECT COUNT(*) AS count FROM notifications
     WHERE user_id = $1 AND is_read = false`,
    [userId]
  );
  return parseInt(result.rows[0].count, 10);
};

/**
 * Mark a single notification as read.
 *
 * @param {Function} query - DB query function
 * @param {string} userId - User ID (security: prevents cross-user writes)
 * @param {string} notificationId - Notification ID
 * @returns {Promise<boolean>} True if marked, false if not found
 */
const markRead = async (query, userId, notificationId) => {
  const result = await query(
    `UPDATE notifications
     SET is_read = true, read_at = NOW()
     WHERE id = $1 AND user_id = $2 AND is_read = false`,
    [notificationId, userId]
  );
  return result.rowCount > 0;
};

/**
 * Mark all notifications as read for a user.
 *
 * @param {Function} query - DB query function
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of notifications marked
 */
const markAllRead = async (query, userId) => {
  const result = await query(
    `UPDATE notifications
     SET is_read = true, read_at = NOW()
     WHERE user_id = $1 AND is_read = false`,
    [userId]
  );
  return result.rowCount;
};

/**
 * Delete all read notifications for a user (cleanup).
 *
 * @param {Function} query - DB query function
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of notifications deleted
 */
const deleteRead = async (query, userId) => {
  const result = await query(
    `DELETE FROM notifications WHERE user_id = $1 AND is_read = true`,
    [userId]
  );
  return result.rowCount;
};

/**
 * Purge expired notifications across all users (retention policy).
 * Typically called by a cron job or lazy on read.
 *
 * @param {Function} query - DB query function
 * @returns {Promise<number>} Number of notifications purged
 */
const purgeExpired = async (query) => {
  const result = await query(
    `DELETE FROM notifications WHERE expires_at < NOW()`
  );
  return result.rowCount;
};

module.exports = {
  notify,
  list,
  unreadCount,
  markRead,
  markAllRead,
  deleteRead,
  purgeExpired,
  getTypeConfig,
};