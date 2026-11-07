/**
 * @fileoverview Notifications Configuration
 *
 * Single source of truth for the in-app notification system.
 *
 * Adding a new notification type:
 *   1. Add entry to `types` below
 *   2. Add i18n keys to en/notifications.js + am/notifications.js
 *   3. Call notify() from the trigger point
 *
 * Scholarship notifications use the SAME infrastructure as payments,
 * referrals, etc. There is no separate scholarship notification engine —
 * every notification flows through `notify(userId, type, tokens, link)`.
 *
 * Path: packages/shared/config/notifications.config.js
 */

const notificationsConfig = {
  retentionDays: 30,
  maxPerUser: 200,
  readArchiveDays: 14,

  refreshIntervalMs: 60000,
  pageSize: 20,

  broadcastRateLimitSeconds: 60,
  broadcastHistoryPageSize: 20,

  types: {
    /* ── Payments ── */
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

    /* ── Referrals ── */
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

    /* ── Withdrawals ── */
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

    /* ── Security ── */
    password_changed: {
      icon: 'Key',
      severity: 'warning',
      category: 'security',
      titleKey: 'notification.passwordChanged.title',
      bodyKey: 'notification.passwordChanged.body',
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

    /* ── Enrollment ── */
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

    /* ── Admin announcements ── */
    admin_announcement: {
      icon: 'Megaphone',
      severity: 'info',
      category: 'admin',
      titleKey: 'notification.adminAnnouncement.title',
      bodyKey: 'notification.adminAnnouncement.body',
      channels: { inApp: true, telegram: false },
    },

    /* ════════════════════════════════════════════════════════════════
       SCHOLARSHIP NOTIFICATIONS
       ════════════════════════════════════════════════════════════════
       Every type fires from the scholarship service layer. The `category`
       is 'scholarships' so they appear under the scholarships filter chip
       in the notification center. Titles + bodies resolve from
       scholarships.notifications.<key> in the scholarship i18n file.
       ════════════════════════════════════════════════════════════════ */

    /* Student submitted an application */
    scholarship_applied: {
      icon: 'GraduationCap',
      severity: 'info',
      category: 'scholarships',
      titleKey: 'scholarships.notifications.applied.title',
      bodyKey: 'scholarships.notifications.applied.body',
      channels: { inApp: true, telegram: false },
    },

    /* Admin approved application (fee=0 path) — enrollment granted */
    scholarship_approved: {
      icon: 'CheckCircle',
      severity: 'success',
      category: 'scholarships',
      titleKey: 'scholarships.notifications.approved.title',
      bodyKey: 'scholarships.notifications.approved.body',
      channels: { inApp: true, telegram: true },
    },

    /* Approved but fee required (legacy deferred-payment flow) */
    scholarship_fee_due: {
      icon: 'Wallet',
      severity: 'info',
      category: 'scholarships',
      titleKey: 'scholarships.notifications.feeDue.title',
      bodyKey: 'scholarships.notifications.feeDue.body',
      channels: { inApp: true, telegram: true },
    },

    /* Fee payment approved — enrollment finalized */
    scholarship_fee_paid: {
      icon: 'CheckCircle',
      severity: 'success',
      category: 'scholarships',
      titleKey: 'scholarships.notifications.feePaid.title',
      bodyKey: 'scholarships.notifications.feePaid.body',
      channels: { inApp: true, telegram: true },
    },

    /* Application rejected */
    scholarship_rejected: {
      icon: 'XCircle',
      severity: 'critical',
      category: 'scholarships',
      titleKey: 'scholarships.notifications.rejected.title',
      bodyKey: 'scholarships.notifications.rejected.body',
      channels: { inApp: true, telegram: true },
    },

    /* Previously approved, now revoked */
    scholarship_revoked: {
      icon: 'Ban',
      severity: 'warning',
      category: 'scholarships',
      titleKey: 'scholarships.notifications.revoked.title',
      bodyKey: 'scholarships.notifications.revoked.body',
      channels: { inApp: true, telegram: true },
    },

    /* Applicant withdrew their own application */
    scholarship_withdrawn: {
      icon: 'RotateCcw',
      severity: 'info',
      category: 'scholarships',
      titleKey: 'scholarships.notifications.withdrawn.title',
      bodyKey: 'scholarships.notifications.withdrawn.body',
      channels: { inApp: true, telegram: false },
    },

    /* Admin notification — new application arrived */
    scholarship_app_received: {
      icon: 'Inbox',
      severity: 'info',
      category: 'scholarships',
      titleKey: 'scholarships.notifications.appReceived.title',
      bodyKey: 'scholarships.notifications.appReceived.body',
      channels: { inApp: true, telegram: false },
    },

    /* Fee deadline reminder */
    scholarship_fee_deadline: {
      icon: 'Clock',
      severity: 'warning',
      category: 'scholarships',
      titleKey: 'scholarships.notifications.feeDeadline.title',
      bodyKey: 'scholarships.notifications.feeDeadline.body',
      channels: { inApp: true, telegram: true },
    },

    /* Payment verified (pay-at-apply flow) — application moved to review */
    scholarship_payment_verified: {
      icon: 'ShieldCheck',
      severity: 'success',
      category: 'scholarships',
      titleKey: 'scholarships.notifications.paymentVerified.title',
      bodyKey: 'scholarships.notifications.paymentVerified.body',
      channels: { inApp: true, telegram: false },
    },

    /* Refund queued after rejection */
    scholarship_refund_initiated: {
      icon: 'RotateCcw',
      severity: 'info',
      category: 'scholarships',
      titleKey: 'scholarships.notifications.refundInitiated.title',
      bodyKey: 'scholarships.notifications.refundInitiated.body',
      channels: { inApp: true, telegram: true },
    },

    /* Refund completed */
    scholarship_refund_completed: {
      icon: 'Banknote',
      severity: 'success',
      category: 'scholarships',
      titleKey: 'scholarships.notifications.refundCompleted.title',
      bodyKey: 'scholarships.notifications.refundCompleted.body',
      channels: { inApp: true, telegram: true },
    },
  },

  groupingRules: ['today', 'yesterday', 'thisWeek', 'older'],

  categories: [
    { id: 'all', labelKey: 'notification.filter.all' },
    { id: 'unread', labelKey: 'notification.filter.unread' },
    { id: 'payments', labelKey: 'notification.filter.payments' },
    { id: 'referrals', labelKey: 'notification.filter.referrals' },
    { id: 'enrollment', labelKey: 'notification.filter.enrollment' },
    { id: 'scholarships', labelKey: 'notification.filter.scholarships' },
    { id: 'security', labelKey: 'notification.filter.security' },
    { id: 'admin', labelKey: 'notification.filter.admin' },
  ],
};

module.exports = notificationsConfig;