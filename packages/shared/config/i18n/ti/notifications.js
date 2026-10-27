/**
 * @fileoverview Tigrinya — Notifications Namespace
 *
 * Complete display text for the in-app notification system:
 *   - 13 notification types (title + body templates)
 *   - Filter labels (All, Unread, Payments, Referrals, Enrollment, Security, Admin)
 *   - Group headers (Today, Yesterday, This Week, Older)
 *   - Time formatting (Just now, Xm ago, Xh ago, etc.)
 *   - Management actions (dismiss, clear read, mark all read)
 *   - Toast templates for refresh + cleanup feedback
 *   - Empty states and UI chrome
 *
 * Template variables ({count}, {amount}, {method}, {title}, {body}, etc.)
 * are injected at render time from notification tokens.
 *
 * Path: packages/shared/config/i18n/ti/notifications.js
 */

module.exports = {
  notification: {
    /* ── UI chrome ── */
    bell: 'ምልክታት',
    markAllRead: 'ኩሎም ከም ዝተነበቡ ምልክት ግበር',
    refresh: 'ኣሓድስ',
    viewAll: 'ኩሎም ምልክታት ተመልከት',
    backToProfile: 'ናብ መግለጺ ተመለስ',
    empty: 'ኩሉ ተነቢቡ!',
    emptySubtitle: 'ሓደስቲ ምልክታት ኣብዚ ክርከቡ እዮም',

    /* ── Management actions ── */
    dismiss: 'ኣወግድ',
    clearRead: 'ዝተነበቡ ኣጽሪ',
    dismissedToast: 'ምልክታ ተወጊዱ',
    clearedReadToast: '{count} ዝተነበበ ምልክታ ተወጊዱ',
    newNotificationsToast: '{count} ሓድሽ ምልክታ',
    dismissFailed: 'ምልክታ ምውጋድ ኣይተኻእለን',
    clearReadFailed: 'ዝተነበቡ ምልክታት ምጽራይ ኣይተኻእለን',

    /* ── Filter chips ── */
    filter: {
      all: 'ኩሉ',
      unread: 'ዘይተነበበ',
      payments: 'ክፍሊታት',
      referrals: 'ሪፈራላት',
      enrollment: 'ምዝገባ',
      security: 'ድሕንነት',
      admin: 'ኣማሓዳሪ',
    },

    /* ── Date grouping headers ── */
    groupToday: 'ሎሚ',
    groupYesterday: 'ትማሊ',
    groupThisWeek: 'እዚ ሰሙን',
    groupOlder: 'ዝሓለፈ',

    /* ── Relative time formatting ── */
    timeAgo: {
      justNow: 'ሕጂ',
      minutesAgo: 'ቅድሚ {count} ደቒቕ',
      hoursAgo: 'ቅድሚ {count} ሰዓት',
      yesterday: 'ትማሊ',
      daysAgo: 'ቅድሚ {count} መዓልቲ',
    },

    /* ── Notification types — title + body templates ── */
    paymentApproved: {
      title: 'ክፍሊት ተረጋጊጹ',
      body: 'ክፍሊትካ {amount} ብር ብ {method} ተረጋጊጹ። ኣብ አቢሲኒያ ኣካዳሚ እንቋዕ ብደሓን መጻእካ!',
    },
    paymentRejected: {
      title: 'ክፍሊት ተነጺጉ',
      body: 'ክፍሊትካ {amount} ብር ተነጺጉ። ምኽንያት፦ {reason}',
    },
    commissionUnlocked: {
      title: 'ኮሚሽን ተኸፊቱ',
      body: 'ኮሚሽን {amount} ብር ሕጂ ንምውጻእ ተዳልዩ',
    },
    bonusAwarded: {
      title: 'ሽልማት ተዋሂቡ',
      body: 'ሽልማት {bonusName} ረኺብካ፦ {amount} ብር',
    },
    referralSignedUp: {
      title: 'ሓድሽ ሪፈራል',
      body: '{name} ብሊንክ ሪፈራልካ ተጸምቢሩ',
    },
    referralPurchased: {
      title: 'ሪፈራል ገዲሱ',
      body: '{name} ትምህርቲ ገዲሱ — ትኣታዊ {amount} ብር',
    },
    withdrawalApproved: {
      title: 'ምውጻእ ተላኢኹ',
      body: 'ምውጻእካ {amount} ብር ብ {method} ተላኢኹ',
    },
    withdrawalRejected: {
      title: 'ምውጻእ ተነጺጉ',
      body: 'ምውጻእካ {amount} ብር ተነጺጉ። ምኽንያት፦ {reason}',
    },
    passwordChanged: {
      title: 'መሕለፊ ቃል ተቐይሩ',
      body: 'መሕለፊ ቃልካ ኣብ {date} ተቐይሩ',
    },
    enrollmentGranted: {
      title: 'ምዝገባ ተዋሂቡ',
      body: 'ኣብ {courseName} ተመዝጊብካ',
    },
    phaseUnlocked: {
      title: 'ምዕራፍ ተኸፊቱ',
      body: 'ምዕራፍ {phase} ሕጂ ይርከብ',
    },
    suspensionWarning: {
      title: 'ሕሳብ ተኣጊዱ',
      body: 'ሕሳብካ ተኣጊዱ። ምኽንያት፦ {reason}',
    },
    adminAnnouncement: {
      /*
       * Broadcast template — admin writes raw {title} and {body} tokens
       * at compose time; they are injected verbatim from the broadcast
       * endpoint payload.
       */
      title: '{title}',
      body: '{body}',
    },
  },
};