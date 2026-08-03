/**
 * @fileoverview Default Configuration Values
 * Single source of truth for ALL fallback values used across the platform.
 * When shared config fails to load, these defaults keep the app functional.
 * Path: packages/shared/config/defaults.config.js
 */

const defaultsConfig = {

  /*
   * Payment defaults — used when payments.config.js is unavailable
   */
  payments: {

    pricing: {

      fullCourse: {
        amountETB: 2499,
        originalAmountETB: 9500,
        currency: 'ETB',
        discountPercentage: 47,
      },

      perPhase: {
        amountETB: 750,
        originalAmountETB: 2500,
        currency: 'ETB',
        minPhases: 1,
        maxPhases: 5,
      },

      bulkDiscounts: [
        { phases: 2, discountPercent: 0 },
        { phases: 3, discountPercent: 0 },
        { phases: 4, discountPercent: 0 },
        { phases: 5, discountPercent: 0 },
      ],
    },

    purchaseModes: {
      fullCourse: { enabled: true, id: 'full-course' },
      individualPhases: { enabled: true, id: 'individual-phases' },
    },

    countdownTimer: {
      enabled: true,
      durationMinutes: 15,
      messages: {
        pricingBanner: '⚡ Launch offer expires in {minutes}:{seconds}',
        pricingBannerAm: '⚡ የማስተዋወቂያ ቅናሽ በ {minutes}:{seconds} ያበቃል',
        checkoutBanner: '⏰ Complete payment within {minutes}:{seconds} to secure this price',
        checkoutBannerAm: '⏰ ይህን ዋጋ ለማስጠበቅ ክፍያውን በ {minutes}:{seconds} ውስጥ ያጠናቅቁ',
        expiredText: 'Offer expired',
        expiredTextAm: 'ቅናሹ አልቋል',
      },
      colors: {
        normal: '#f59e0b',
        warning: '#fbbf24',
        danger: '#ef4444',
        expired: '#6b7280',
      },
      warningThresholdPercent: 30,
      dangerThresholdPercent: 10,
    },

    checkoutModal: {
      title: 'Complete Your Enrollment',
      titleAm: 'ምዝገባዎን ያጠናቅቁ',
      showPurchaseSummary: true,
      showUpgradeNudge: true,
      upgradeNudgeThresholdPercent: 70,
    },

    profile: {
      avatar: {
        maxSize: 2 * 1024 * 1024,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxWidth: 512,
        maxHeight: 512,
      },
      sections: {
        enrollmentCard: true,
        overallProgress: true,
        phaseProgress: true,
        paymentHistory: true,
        quickActions: true,
        accountSettings: true,
      },
      quickActions: [
        { id: 'portal', label: 'Go to Classroom Portal', labelAm: 'ወደ መማሪያ ክፍል ይሂዱ', href: '/portal', icon: 'BookOpen' },
        { id: 'courses', label: 'Browse Courses', labelAm: 'ኮርሶችን ይመልከቱ', href: '/courses', icon: 'Grid' },
        { id: 'telegram', label: 'Join Telegram Community', labelAm: 'ቴሌግራም ይቀላቀሉ', href: 'https://t.me/AbyssiniaAcademy', icon: 'MessageCircle', external: true },
        { id: 'support', label: 'Contact Support', labelAm: 'ድጋፍ ያግኙ', href: '/support', icon: 'HelpCircle' },
      ],
    },

    approval: {
      pendingMessage: 'Your payment is being verified.',
      pendingMessageAm: 'ክፍያዎ እየተረጋገጠ ነው።',
    },

    screenshotUpload: {
      maxSize: 5 * 1024 * 1024,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxWidth: 1920,
      maxHeight: 1920,
    },

    methods: [],
  },

  /*
   * Phase purchase defaults
   */
  phases: {
    individuallyPurchasable: true,
    phases: [],
  },

  /*
   * Platform defaults
   */
  platform: {
    brand: {
      name: 'ABYSSiNIA',
      suffix: 'Tech Academy',
      tagline: 'Master Full-Stack Engineering from Ethiopia to the World',
    },
    frontendUrl: 'http://localhost:3000',
  },

  /*
   * Landing defaults
   */
  landing: {
    hero: {
      badgeIcon: 'Flame',
      highlightedWord: 'ABYSSiNIA',
      cta: {
        exploreCourses: { href: '/courses', icon: 'ArrowRight' },
        unlockAccess: { href: '/pricing', icon: 'Zap' },
      },
    },
    heroVisual: {
      filename: 'Abyssinia_Masterclass.jsx',
      previewImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      previewDuration: '45:10',
      sessions: [],
    },
    stats: [],
    features: { cards: [] },
    howItWorks: { steps: [] },
    faq: { totalItems: 0 },
    cta: { button: { href: '/pricing' } },
  },

  /*
   * i18n defaults
   */
  i18n: {
    defaultLanguage: 'en',
  },

    /*
   * Referral system defaults
   */
  referrals: {
    enabled: true,
    codeGeneration: { length: 8, prefix: 'ABY', charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', excludeSimilar: true },
    referrerTiers: [
      { name: 'Bronze', nameAm: 'ብሮንዝ', minReferrals: 1, maxReferrals: 2, creditPercent: 10, color: '#cd7f32', icon: 'Medal' },
      { name: 'Silver', nameAm: 'ብር', minReferrals: 3, maxReferrals: 5, creditPercent: 15, color: '#c0c0c0', icon: 'Medal' },
      { name: 'Gold', nameAm: 'ወርቅ', minReferrals: 6, maxReferrals: 10, creditPercent: 20, color: '#ffd700', icon: 'Trophy' },
    ],
    creditCap: { maxPercent: 100, behavior: 'commission' },
    commission: { enabled: true, percentOfPayment: 20, minimumPayout: 500, payoutMethods: ['telebirr', 'cbe-birr', 'bank-transfer'] },
    referredDiscount: { mode: 'match_referrer', matchPercent: 100, fixedPercent: 10, minimumDiscount: 5, maximumDiscount: 40 },
    registration: { showReferralBanner: true, autoApplyCode: true, allowCodeChange: false, cookieDurationDays: 30 },
    sharing: { platforms: [], shareMessage: '', shareMessageAm: '' },
    dashboard: { showTierProgress: true, showEarningsBreakdown: true, showReferralHistory: true, showHowItWorks: true, historyPerPage: 10 },
  },

  /*
   * Discount code system defaults
   */
  discounts: {
    enabled: true,
    combinedDiscounts: { maxCombinedPercent: 60, applicationOrder: ['referral', 'discount_code', 'credit'], capBehavior: 'proportional' },
    codes: {
      codeValidation: { minLength: 4, maxLength: 20, allowedChars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', autoUppercase: true, trimWhitespace: true },
      defaults: { maxTotalUses: 100, maxUsesPerUser: 1, minPurchaseAmount: 0 },
      adminLimits: { maxDiscountPercent: 100, maxDiscountFixed: 10000, maxTotalUses: 10000 },
    },
    rateLimiting: {
      perIP: { validatePerMinute: 10, applyPerMinute: 3, totalPerDay: 20 },
      perUser: { validatePerMinute: 5, applyPerMinute: 3 },
    },
    antiAbuse: {
      enabled: true,
      riskThresholds: { normal: 20, suspicious: 50, high: 75, critical: 100 },
      actions: { suspicious: 'log', high: 'flag_for_review', critical: 'block_and_notify' },
      autoDisableThreshold: 5,
    },
    publicListing: { enabled: false, showOnPricingPage: true },
  },
};

module.exports = defaultsConfig;