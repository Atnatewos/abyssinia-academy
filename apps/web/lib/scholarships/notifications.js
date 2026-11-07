/**
 * @fileoverview Scholarship Notification Wrappers
 *
 * Thin wrappers over lib/notifications.notify() that pre-fill the
 * scholarship-specific templates. Keeps the i18n key paths in one place
 * so any change to the notification templates is a one-file edit.
 *
 * Every notification function is best-effort: failures are logged but
 * never thrown to the caller. The core scholarship action MUST succeed
 * even if the notification delivery fails.
 *
 * Path: apps/web/lib/scholarships/notifications.js
 */

import { notify } from '../notifications';

const deepLink = {
  application: '/profile/scholarships',
  checkout: (applicationId) =>
    `/checkout?scholarship=${encodeURIComponent(applicationId)}`,
  adminQueue: (campaignId) =>
    `/admin/scholarships/${encodeURIComponent(campaignId)}/applications`,
};

/**
 * Safely invoke notify() and swallow errors so scholarship actions are
 * never blocked by notification delivery.
 *
 * @param {string} userId - Recipient UUID
 * @param {string} type - Notification type key
 * @param {object} tokens - Template variables
 * @param {string|null} link - Deep link URL
 * @returns {Promise<void>}
 */
const safeNotify = async (userId, type, tokens, link) => {
  try {
    await notify(userId, type, tokens, link);
  } catch (error) {
    console.error('[scholarships/notifications] notify failed:', {
      userId,
      type,
      error: error?.message,
    });
  }
};

/* ============================================================================
 * APPLICANT-FACING NOTIFICATIONS
 * ========================================================================== */

/**
 * Sent when an applicant successfully submits an application.
 *
 * @param {string} userId
 * @param {{ campaignName: string, applicationId: string }} ctx
 */
export const notifyApplied = (userId, ctx) =>
  safeNotify(
    userId,
    'scholarship_applied',
    { campaign: ctx.campaignName },
    deepLink.application
  );

/**
 * Sent when an admin approves an application AND the registration fee
 * is zero (immediate grant).
 *
 * @param {string} userId
 * @param {{ campaignName: string }} ctx
 */
export const notifyApproved = (userId, ctx) =>
  safeNotify(
    userId,
    'scholarship_approved',
    { campaign: ctx.campaignName },
    deepLink.application
  );

/**
 * Sent when an admin approves an application with a registration fee > 0.
 * Includes the amount and a checkout deep link.
 *
 * @param {string} userId
 * @param {{ campaignName: string, amount: number, applicationId: string }} ctx
 */
export const notifyFeeDue = (userId, ctx) =>
  safeNotify(
    userId,
    'scholarship_fee_due',
    {
      campaign: ctx.campaignName,
      amount: ctx.amount,
    },
    deepLink.checkout(ctx.applicationId)
  );

/**
 * Sent when the registration fee payment is approved.
 *
 * @param {string} userId
 * @param {{ campaignName: string }} ctx
 */
export const notifyFeePaid = (userId, ctx) =>
  safeNotify(
    userId,
    'scholarship_fee_paid',
    { campaign: ctx.campaignName },
    deepLink.application
  );

/**
 * Sent when an admin rejects an application.
 * The reason is required by the admin panel and included in the body.
 *
 * @param {string} userId
 * @param {{ campaignName: string, reason: string }} ctx
 */
export const notifyRejected = (userId, ctx) =>
  safeNotify(
    userId,
    'scholarship_rejected',
    { campaign: ctx.campaignName, reason: ctx.reason },
    deepLink.application
  );

/**
 * Sent when an admin revokes an approved scholarship.
 *
 * @param {string} userId
 * @param {{ campaignName: string, reason: string }} ctx
 */
export const notifyRevoked = (userId, ctx) =>
  safeNotify(
    userId,
    'scholarship_revoked',
    { campaign: ctx.campaignName, reason: ctx.reason },
    deepLink.application
  );

/**
 * Sent when a user withdraws their own application.
 *
 * @param {string} userId
 * @param {{ campaignName: string }} ctx
 */
export const notifyWithdrawn = (userId, ctx) =>
  safeNotify(
    userId,
    'scholarship_withdrawn',
    { campaign: ctx.campaignName },
    deepLink.application
  );

/* ============================================================================
 * ADMIN-FACING NOTIFICATIONS
 * ========================================================================== */

/**
 * Sent to all admins when a new application arrives. The caller passes
 * the list of admin user IDs to notify.
 *
 * @param {string[]} adminUserIds
 * @param {{ applicantName: string, campaignName: string, campaignId: string }} ctx
 */
export const notifyAdminNewApplication = async (adminUserIds, ctx) => {
  const link = deepLink.adminQueue(ctx.campaignId);
  await Promise.all(
    adminUserIds.map((adminId) =>
      safeNotify(
        adminId,
        'scholarship_app_received',
        {
          applicant: ctx.applicantName,
          campaign: ctx.campaignName,
        },
        link
      )
    )
  );
};