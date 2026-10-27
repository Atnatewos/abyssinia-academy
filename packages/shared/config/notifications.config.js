/**
 * @fileoverview Notifications Configuration
 *
 * Single source of truth for the in-app notification system:
 *   - 13 notification types with icon + severity + i18n keys + channel flags
 *   - Retention policy (30 days default, 200 max per user)
 *   - Broadcast rate limit + history page size (admin-only)
 *   - Grouping rules (today, yesterday, thisWeek, older)
 *   - Filter categories (All, Unread, Payments, Referrals, etc.)
 *   - Refresh interval (60s when tab is active, paused when backgrounded)
 *
 * Adding a new notification type:
 *   1. Add entry to types object below
 *   2. Add i18n keys to en/notifications.js + am/notifications.js
 *   3. Call notify() from the trigger point with type + tokens + link
 *
 * Path: packages/shared/config/notifications.config.js
 */

const notificationsConfig = {
  /* Retention policy — config-driven, no hardcoded magic numbers */
  retentionDays: 30,
  maxPerUser: 200,
  readArchiveDays: 14,

  /* Refresh cadence — only polls when tab is active (visibility-based) */
  refreshIntervalMs: 60000,
  pageSize: 20,

  /* Admin broadcast controls */
  broadcastRateLimitSeconds: 60,
  broadcastHistoryPageSize: 20,

  /*
   * Notification types — each entry defines:
   *   - icon: Lucide icon name (rendered by NotificationBell)
   *   - severity: info | success | warning | critical (default severity)
   *   - category: payments | referrals | enrollment | security | admin
   *   - titleKey: i18n key for title (resolved at render time)
   *   - bodyKey: i18n key for body (resolved at render time)
   *   - channels: { inApp: bool, telegram: bool } — delivery routing flags
   */
  types: {
    payment_approved: {
      icon: 'CheckCircle',
      severity: 'success',
      category: 'payments',
      titleKey: 'notification.paymentApproved.title',
      bodyKey: 'notification.paymentApproved.body',
      channels: { inApp: true, telegram: false },
    },
    payment_rejected: {
      icon: 'XCircle',
      severity: 'critical',
      category: 'payments',
      titleKey: 'notification.paymentRejected.title',
      bodyKey: 'notification.paymentRejected.body',
      channels: { inApp: true, telegram: true },
    },
    commission_unlocked: {
      icon: 'Unlock',
      severity: 'success',
      category: 'referrals',
      titleKey: 'notification.commissionUnlocked.title',
      bodyKey: 'notification.commissionUnlocked.body',
      channels: { inApp: true, telegram: false },
    },
    bonus_awarded: {
      icon: 'Trophy',
      severity: 'success',
      category: 'referrals',
      titleKey: 'notification.bonusAwarded.title',
      bodyKey: 'notification.bonusAwarded.body',
      channels: { inApp: true, telegram: false },
    },
    referral_signed_up: {
      icon: 'UserPlus',
      severity: 'info',
      category: 'referrals',
      titleKey: 'notification.referralSignedUp.title',
      bodyKey: 'notification.referralSignedUp.body',
      channels: { inApp: true, telegram: false },
    },
    referral_purchased: {
      icon: 'ShoppingCart',
      severity: 'success',
      category: 'referrals',
      titleKey: 'notification.referralPurchased.title',
      bodyKey: 'notification.referralPurchased.body',
      channels: { inApp: true, telegram: false },
    },
    withdrawal_approved: {
      icon: 'Banknote',
      severity: 'success',
      category: 'payments',
      titleKey: 'notification.withdrawalApproved.title',
      bodyKey: 'notification.withdrawalApproved.body',
      channels: { inApp: true, telegram: true },
    },
    withdrawal_rejected: {
      icon: 'AlertTriangle',
      severity: 'critical',
      category: 'payments',
      titleKey: 'notification.withdrawalRejected.title',
      bodyKey: 'notification.withdrawalRejected.body',
      channels: { inApp: true, telegram: true },
    },
    password_changed: {
      icon: 'Key',
      severity: 'warning',
      category: 'security',
      titleKey: 'notification.passwordChanged.title',
      bodyKey: 'notification.passwordChanged.body',
      channels: { inApp: true, telegram: false },
    },
    enrollment_granted: {
      icon: 'GraduationCap',
      severity: 'success',
      category: 'enrollment',
      titleKey: 'notification.enrollmentGranted.title',
      bodyKey: 'notification.enrollmentGranted.body',
      channels: { inApp: true, telegram: false },
    },
    phase_unlocked: {
      icon: 'BookOpen',
      severity: 'success',
      category: 'enrollment',
      titleKey: 'notification.phaseUnlocked.title',
      bodyKey: 'notification.phaseUnlocked.body',
      channels: { inApp: true, telegram: false },
    },
    suspension_warning: {
      icon: 'ShieldOff',
      severity: 'critical',
      category: 'security',
      titleKey: 'notification.suspensionWarning.title',
      bodyKey: 'notification.suspensionWarning.body',
      channels: { inApp: true, telegram: true },
    },
    admin_announcement: {
      icon: 'Megaphone',
      severity: 'info',
      category: 'admin',
      titleKey: 'notification.adminAnnouncement.title',
      bodyKey: 'notification.adminAnnouncement.body',
      channels: { inApp: true, telegram: false },
    },
  },

  /* Grouping rules — how notifications are bucketed by date */
  groupingRules: ['today', 'yesterday', 'thisWeek', 'older'],

  /* Filter categories — shown as chips in the notification center */
  categories: [
    { id: 'all', labelKey: 'notification.filter.all' },
    { id: 'unread', labelKey: 'notification.filter.unread' },
    { id: 'payments', labelKey: 'notification.filter.payments' },
    { id: 'referrals', labelKey: 'notification.filter.referrals' },
    { id: 'enrollment', labelKey: 'notification.filter.enrollment' },
    { id: 'security', labelKey: 'notification.filter.security' },
    { id: 'admin', labelKey: 'notification.filter.admin' },
  ],
};

module.exports = notificationsConfig;