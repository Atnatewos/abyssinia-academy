/**
 * @fileoverview Oromo — Notifications Namespace
 *
 * Complete display text for the in-app notification system.
 *
 * Template variables ({count}, {amount}, {method}, {title}, {body}, etc.)
 * are injected at render time from notification tokens.
 *
 * Path: packages/shared/config/i18n/om/notifications.js
 */

module.exports = {
  notification: {
    /* ── UI chrome ── */
    bell: 'Beeksisawwan',
    markAllRead: 'Hunda akka dubbifamaniitti mallattoo godhi',
    refresh: 'Haaromsi',
    viewAll: 'Beeksisawwan hunda ilaali',
    backToProfile: 'Gara Piroofaayiliitti Deebi\'i',
    empty: 'Hunduu hordofteetta!',
    emptySubtitle: 'Beeksisawwan haaraan asitti mul\'atu',

    /* ── Management actions ── */
    dismiss: 'Haqi',
    clearRead: 'Kan dubbifame qulqulleessi',
    dismissedToast: 'Beeksisni haqame',
    clearedReadToast: 'Beeksisni {count} dubbifame haqame',
    newNotificationsToast: 'Beeksisni haaraa {count}',
    dismissFailed: 'Beeksisa haquu hin dandeenye',
    clearReadFailed: 'Beeksisawwan dubbifaman qulqulleessuu hin dandeenye',

    /* ── Filter chips ── */
    filter: {
      all: 'Hunda',
      unread: 'Kan hin dubbifamne',
      payments: 'Kaffaltiiwwan',
      referrals: 'Ergaawwan',
      enrollment: 'Galmee',
      security: 'Nageenya',
      admin: 'Bulchiinsa',
    },

    /* ── Date grouping headers ── */
    groupToday: 'Har\'a',
    groupYesterday: 'Kaleessa',
    groupThisWeek: 'Torban Kana',
    groupOlder: 'Kan Duraa',

    /* ── Relative time formatting ── */
    timeAgo: {
      justNow: 'Amma',
      minutesAgo: 'daqiiqaa {count} dura',
      hoursAgo: 'sa\'aatii {count} dura',
      yesterday: 'Kaleessa',
      daysAgo: 'guyyaa {count} dura',
    },

    /* ── Notification types — title + body templates ── */
    paymentApproved: {
      title: 'Kaffaltiin mirkanaa\'e',
      body: 'Kaffaltiin kee {amount} Birrii {method} keessatti mirkanaa\'e. Baga gara Akademii Abisiiniyaa dhuftu!',
    },
    paymentRejected: {
      title: 'Kaffaltiin kuffifame',
      body: 'Kaffaltiin kee {amount} Birrii kuffifame. Sababa: {reason}',
    },
    commissionUnlocked: {
      title: 'Komiishiniin baname',
      body: 'Komiishiinii {amount} Birrii amma ba\'uuf jira',
    },
    bonusAwarded: {
      title: 'Boonasiin kenname',
      body: 'Boonasii {bonusName} argatte: {amount} Birrii',
    },
    referralSignedUp: {
      title: 'Ergaa haaraa',
      body: '{name} liinkii ergaa keetiin makame',
    },
    referralPurchased: {
      title: 'Ergaan bite',
      body: '{name} koorsii bite — ati {amount} Birrii argatte',
    },
    withdrawalApproved: {
      title: 'Ba\'iinsi ergame',
      body: 'Ba\'iinsi kee {amount} Birrii {method} keessatti ergame',
    },
    withdrawalRejected: {
      title: 'Ba\'iinsi kuffifame',
      body: 'Ba\'iinsi kee {amount} Birrii kuffifame. Sababa: {reason}',
    },
    passwordChanged: {
      title: 'Jechi darbii jijjiirame',
      body: 'Jechi darbii kee guyyaa {date} jijjiirame',
    },
    enrollmentGranted: {
      title: 'Galmeen kenname',
      body: 'Koorsii {courseName} keessatti galmaa\'eetta',
    },
    phaseUnlocked: {
      title: 'Kutaan barnootaa baname',
      body: 'Kutaan barnootaa {phase} amma jira',
    },
    suspensionWarning: {
      title: 'Herregni dhaabbate',
      body: 'Herregni kee dhaabbate. Sababa: {reason}',
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