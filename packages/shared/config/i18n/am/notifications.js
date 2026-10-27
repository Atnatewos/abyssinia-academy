/**
 * @fileoverview Amharic — Notifications Namespace
 *
 * Full AM parity with the English notifications namespace.
 * Covers all 13 notification types + UI chrome + management actions
 * + time formatting + toast templates.
 *
 * Path: packages/shared/config/i18n/am/notifications.js
 */

module.exports = {
  notification: {
    bell: 'ማሳወቂያዎች',
    markAllRead: 'ሁሉንም እንደተነበቡ ምልክት ያድርጉ',
    refresh: 'አድስ',
    viewAll: 'ሁሉንም ማሳቂያዎች ይመልከቱ',
    backToProfile: 'ወደ መገለጫ ተመለስ',
    empty: 'ሁሉም ተይዘዋል!',
    emptySubtitle: 'አዳዲስ ማሳወያዎች እህ ይያሉ',

    dismiss: 'አጥፋ',
    clearRead: 'የተነበቡን አጽዳ',
    dismissedToast: 'ማሳወቂያው ተወግዷል',
    clearedReadToast: '{count} የተነበቡ ማሳቂያዎች ተወደዋል',
    newNotificationsToast: '{count} አዲስ ማሳወቂያዎች',
    dismissFailed: 'ማሳወቂያን ማጥፋት አልተሳካም',
    clearReadFailed: 'የተነበቡትን ማጽዳት አልተሳካም',

    filter: {
      all: 'ሁሉም',
      unread: 'ያልተነበቡ',
      payments: 'ክፍያዎች',
      referrals: 'ማጣቀሻዎች',
      enrollment: 'ምዝገባ',
      security: 'ደህንነት',
      admin: 'አስተዳዳሪ',
    },

    groupToday: 'ዛሬ',
    groupYesterday: 'ትናንት',
    groupThisWeek: 'በዚህ ሳምንት',
    groupOlder: 'ከዚያ በፊት',

    timeAgo: {
      justNow: 'አሁን',
      minutesAgo: 'ከ{count} ደቂቃ በፊት',
      hoursAgo: 'ከ{count} ሰዓት በፊት',
      yesterday: 'ትናንት',
      daysAgo: 'ከ{count} ቀን በፊት',
    },

    paymentApproved: {
      title: 'ክፍያ ተቀባይነት አግኝቷል',
      body: 'የ{amount} ብር ክፍያዎ በ{method} ተቀባይነት አግኝቷል። እንኳን ወደ አቢሲኒያ አካዳሚ በደህና መጡ!',
    },
    paymentRejected: {
      title: 'ክፍያ ተቀባይነት አላገኘም',
      body: 'የ{amount} ብር ክፍያዎ ተቀባይነት አላገኘም። ምክንያት: {reason}',
    },
    commissionUnlocked: {
      title: 'ኮሚሽን ተከፍቷል',
      body: 'የ{amount} ብር ኮሚሽን አሁን ለማውጣት ዝግጁ ነው',
    },
    bonusAwarded: {
      title: 'ቦነስ ተሰጥቷል',
      body: '{bonusName} ቦነስ አግኝተዋል: {amount} ብር',
    },
    referralSignedUp: {
      title: 'አዲስ ማጣቀሻ',
      body: '{name} የማጣቀሻ ሊንክዎን በመጠቀም ተቀላቅለዋል',
    },
    referralPurchased: {
      title: 'ማጣቀሻ ገዝቷል',
      body: '{name} ኮርስ ገዝቷል — {amount} ብር አግኝተዋል',
    },
    withdrawalApproved: {
      title: 'ገንዘብ ተልኳል',
      body: 'የ{amount} ብር ገንዘብዎ በ{method} ተልኳል',
    },
    withdrawalRejected: {
      title: 'ገንዘብ ማውጣት ተቀባይነት አላገኘም',
      body: 'የ{amount} ብር ገንዘብ ማውጣትዎ ተቀባይነት አላገኘም። ምክንያት: {reason}',
    },
    passwordChanged: {
      title: 'የይለፍ ቃል ተቀይሯል',
      body: 'የይለፍ ቃልዎ በ{date} ተቀይሯል',
    },
    enrollmentGranted: {
      title: 'ምዝገባ ተሰጥቷል',
      body: 'በ{courseName} ተመዝግበዋል',
    },
    phaseUnlocked: {
      title: 'ደረጃ ተከፍቷል',
      body: 'ደረጃ {phase} አሁን ይገኛል',
    },
    suspensionWarning: {
      title: 'መለያ ታግዷል',
      body: 'መለያዎ ታግዷል። ምክንያት: {reason}',
    },
    adminAnnouncement: {
      title: '{title}',
      body: '{body}',
    },
  },
};