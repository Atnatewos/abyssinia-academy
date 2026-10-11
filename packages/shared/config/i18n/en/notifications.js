/**
 * @fileoverview English — Notifications Namespace
 *
 * Complete display text for the in-app notification system:
 *   - 12 notification types (title + body templates)
 *   - Filter labels (All, Unread, Payments, etc.)
 *   - Group headers (Today, Yesterday, This Week, Older)
 *   - Time formatting (Just now, Xm ago, Xh ago, etc.)
 *   - Empty states, actions, and UI chrome
 *
 * Template variables ({count}, {amount}, {method}, etc.) are injected
 * at render time from notification tokens.
 *
 * Path: packages/shared/config/i18n/en/notifications.js
 */

module.exports = {
  notification: {
    /* ── UI chrome ── */
    bell: 'Notifications',
    markAllRead: 'Mark all as read',
    refresh: 'Refresh',
    viewAll: 'View all notifications',
    backToProfile: 'Back to Profile',
    empty: "You're all caught up!",
    emptySubtitle: 'New notifications will appear here',

    /* ── Filter chips ── */
    filter: {
      all: 'All',
      unread: 'Unread',
      payments: 'Payments',
      referrals: 'Referrals',
      enrollment: 'Enrollment',
      security: 'Security',
    },

    /* ── Date grouping headers ── */
    groupToday: 'Today',
    groupYesterday: 'Yesterday',
    groupThisWeek: 'This Week',
    groupOlder: 'Older',

    /* ── Relative time formatting ── */
    timeAgo: {
      justNow: 'Just now',
      minutesAgo: '{count}m ago',
      hoursAgo: '{count}h ago',
      yesterday: 'Yesterday',
      daysAgo: '{count}d ago',
    },

    /* ── Notification types — title + body templates ── */
    paymentApproved: {
      title: 'Payment approved',
      body: 'Your payment of {amount} ETB via {method} has been approved. Welcome to Abyssinia Academy!',
    },
    paymentRejected: {
      title: 'Payment rejected',
      body: 'Your payment of {amount} ETB was rejected. Reason: {reason}',
    },
    commissionUnlocked: {
      title: 'Commission unlocked',
      body: '{amount} ETB commission is now available to withdraw',
    },
    bonusAwarded: {
      title: 'Bonus awarded',
      body: 'You earned {bonusName} bonus: {amount} ETB',
    },
    referralSignedUp: {
      title: 'New referral',
      body: '{name} joined using your referral link',
    },
    referralPurchased: {
      title: 'Referral purchased',
      body: '{name} purchased a course — you earned {amount} ETB',
    },
    withdrawalApproved: {
      title: 'Withdrawal sent',
      body: 'Your withdrawal of {amount} ETB has been sent via {method}',
    },
    withdrawalRejected: {
      title: 'Withdrawal rejected',
      body: 'Your withdrawal of {amount} ETB was rejected. Reason: {reason}',
    },
    passwordChanged: {
      title: 'Password changed',
      body: 'Your password was changed on {date}',
    },
    enrollmentGranted: {
      title: 'Enrollment granted',
      body: "You've been enrolled in {courseName}",
    },
    phaseUnlocked: {
      title: 'Phase unlocked',
      body: 'Phase {phase} is now available',
    },
    suspensionWarning: {
      title: 'Account suspended',
      body: 'Your account was suspended. Reason: {reason}',
    },
  },
};