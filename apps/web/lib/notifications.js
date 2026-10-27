/**
 * @fileoverview Notification Adapter (Next.js)
 *
 * Binds the shared notification service to the Next.js database pool
 * (lib/db). Exports ready-to-call functions for API routes and triggers.
 *
 * Usage in API routes:
 *   import { notify, list, unreadCount } from '../../lib/notifications';
 *   await notify(userId, 'payment_approved', { amount: 1000 }, '/profile/payments');
 *
 * Path: apps/web/lib/notifications.js
 */

import { query } from './db';
import notificationService from '../../../packages/shared/notifications';

/**
 * Insert a new notification for a user.
 * @param {string} userId - Recipient user ID
 * @param {string} type - Notification type enum key
 * @param {object} tokens - Template variables
 * @param {string|null} link - Optional deep-link URL
 * @returns {Promise<{id: string}>}
 */
export const notify = (userId, type, tokens = {}, link = null) =>
  notificationService.notify(query, userId, type, tokens, link);

/**
 * List notifications with pagination and filtering.
 * @param {string} userId - User ID
 * @param {object} options - { unreadOnly, page, pageSize, category }
 * @returns {Promise<{notifications: Array, total: number, page: number, pageSize: number}>}
 */
export const list = (userId, options = {}) =>
  notificationService.list(query, userId, options);

/**
 * Get unread notification count.
 * @param {string} userId - User ID
 * @returns {Promise<number>}
 */
export const unreadCount = (userId) =>
  notificationService.unreadCount(query, userId);

/**
 * Mark a single notification as read.
 * @param {string} userId - User ID
 * @param {string} notificationId - Notification ID
 * @returns {Promise<boolean>}
 */
export const markRead = (userId, notificationId) =>
  notificationService.markRead(query, userId, notificationId);

/**
 * Mark all notifications as read.
 * @param {string} userId - User ID
 * @returns {Promise<number>}
 */
export const markAllRead = (userId) =>
  notificationService.markAllRead(query, userId);

/**
 * Delete all read notifications.
 * @param {string} userId - User ID
 * @returns {Promise<number>}
 */
export const deleteRead = (userId) =>
  notificationService.deleteRead(query, userId);

/**
 * Purge expired notifications.
 * @returns {Promise<number>}
 */
export const purgeExpired = () => notificationService.purgeExpired(query);

export default {
  notify,
  list,
  unreadCount,
  markRead,
  markAllRead,
  deleteRead,
  purgeExpired,
};