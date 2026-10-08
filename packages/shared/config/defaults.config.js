/**
 * @fileoverview Default Configuration Values
 *
 * Single source of truth for all fallback values. Every section mirrors
 * the shape of its corresponding live config file so the config bridge
 * never encounters a missing key.
 *
 * Path: packages/shared/config/defaults.config.js
 */

const defaultsConfig = {
  payments: {
    pricing: {
      fullCourse: {
        amountETB: 1000,
        originalAmountETB: 1000,
        referredAmountETB: 900,
        referredDiscountPercent: 10,
        currency: 'ETB',
      },
      perPhase: {
        amountETB: 500,
        originalAmountETB: 500,
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
      accessControl: {
        lockedPhaseTitle: 'Phase {phase} is Locked',
        lockedPhaseTitleAm: 'ደረጃ {phase} ተቆልፏል',
        lockedPhaseDescription: 'Purchase Phase {phase}{title} to unlock this content and continue your learning journey.',
        lockedPhaseDescriptionAm: 'ይህን ይዘት ለመክፈት እና የትምህርት ጉዞዎን ለመቀጠል ደረጃ {phase}{title} ይግዙ።',
        unlockPhase: 'Unlock Phase {phase}',
        unlockPhaseAm: 'ደረጃ {phase} ይክፈቱ',
      },
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

  phases: {
    individuallyPurchasable: true,
    phases: [],
  },

  platform: {
    brand: {
      name: 'ABYSSiNIA',
      suffix: 'Tech Academy',
      tagline: 'Master Full-Stack Engineering from Ethiopia to the World',
    },
    frontendUrl: 'http://localhost:3000',
  },

  landing: {
    hero: {
      badgeIcon: 'Flame',
      earnBadgeIcon: 'Coins',
      highlightedWord: 'ABYSSiNIA',
      cta: {
        exploreCourses: { href: '/courses', icon: 'ArrowRight' },
        unlockAccess: { href: '/pricing', icon: 'Zap' },
        earn: { href: '/#earn', icon: 'ArrowDown' },
      },
    },
    heroVisual: {
      filename: 'Abyssinia_Masterclass.jsx',
      previewImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      previewDuration: '45:10',
      showIncomeChips: false,
      sessions: [],
    },
    stats: [],
    features: { cards: [] },
    howItWorks: { steps: [] },
    faq: { totalItems: 0 },
    cta: {
      button: { href: '/pricing' },
      earnButton: { href: '/#earn' },
    },
    earn: {
      enabled: true,
      anchorId: 'earn',
      stepIcons: ['BookOpen', 'Share2', 'Wallet'],
      trustIcons: ['ShoppingCart', 'ShieldCheck', 'BarChart3', 'UserX'],
      cta: { authed: '/profile/referrals', guest: '/auth/register' },
      calculator: {
        step: 1,
        maxSliderLevel: 100,
        sanityCeiling: 10000,
        defaultLevelCounts: [5, 10, 20, 20],
        showChainStrip: false,
        detailsOpenByDefault: true,
        presets: [
          { key: 'starter', levels: [5, 5, 5, 5] },
          { key: 'builder', levels: [10, 20, 20, 20] },
          { key: 'pro', levels: [25, 50, 50, 50] },
          { key: 'army', levels: [100, 200, 200, 200] },
        ],
      },
      rail: {
        payoutStepIcons: ['ShoppingBag', 'Lock', 'CircleDollarSign'],
        tabs: ['ladder', 'next', 'payouts'],
        defaultTab: 'next',
      },
    },
    socialProof: { enabled: true, topCount: 3 },
    trustRules: { payoutIcon: 'Banknote' },
  },

  i18n: {
    defaultLanguage: 'en',
  },

  referrals: {
    enabled: true,
    codeGeneration: {
      length: 8,
      prefix: 'ABY',
      charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      excludeSimilar: true,
    },
    commissionStructure: {
      maxLevels: 4,
      levelAmounts: [200, 150, 100, 50],
      totalPerSale: 500,
      maxTotalPerSaleETB: 500,
      currency: 'ETB',
      unlockDelayDays: 7,
    },
    referredDiscount: { percent: 10 },
    bonuses: {
      payingGate: true,
      directReferral: {
        category: 'direct_referral',
        gate: 'paying_direct',
        period: null,
        tiers: [
          { requirement: 5, amountETB: 1000, name: 'Direct Referral — 5' },
          { requirement: 10, amountETB: 2500, name: 'Direct Referral — 10' },
          { requirement: 20, amountETB: 5000, name: 'Direct Referral — 20' },
        ],
      },
      milestone: {
        category: 'milestone',
        gate: 'paying_team',
        period: null,
        tiers: [
          { requirement: 50, amountETB: 10000, name: 'Milestone — 50 Team' },
          { requirement: 100, amountETB: 20000, name: 'Milestone — 100 Team' },
          { requirement: 200, amountETB: 40000, name: 'Milestone — 200 Team' },
        ],
      },
      rank: {
        category: 'rank',
        gate: 'paying_team',
        period: null,
        tiers: [
          { requirement: 50, amountETB: 5000, name: 'Silver' },
          { requirement: 200, amountETB: 15000, name: 'Gold' },
          { requirement: 500, amountETB: 50000, name: 'Platinum' },
        ],
      },
      teamBonus: {
        category: 'team_bonus',
        gate: 'paying_team',
        period: null,
        tiers: [
          { requirement: 50, amountETB: 2500, name: 'Team Growth — 50' },
          { requirement: 100, amountETB: 5000, name: 'Team Growth — 100' },
          { requirement: 200, amountETB: 10000, name: 'Team Growth — 200' },
        ],
      },
      speedBonus: {
        category: 'speed_bonus',
        gate: 'paying_direct',
        period: 'monthly',
        tiers: [{ requirement: 10, amountETB: 1500, name: 'Speed Bonus — 10/Month' }],
      },
    },
    caps: {
      maxTotalPerSaleETB: 500,
      maxBonusPerUserPerMonthETB: 10000,
      maxTotalPayoutPerUserPerMonthETB: 25000,
      maxTotalPayoutPlatformPerMonthETB: 500000,
    },
    withdrawal: {
      minimumAmountETB: 500,
      maximumAmountETB: 100000,
      methods: ['telebirr', 'cbe-birr', 'bank-transfer'],
      requiresAdminApproval: true,
      maxPendingRequests: 1,
      processingTimeHours: 48,
    },
    registration: {
      showReferralBanner: true,
      autoApplyCode: true,
      allowCodeChange: false,
      cookieDurationDays: 30,
    },
    sharing: {
      platforms: [],
      shareMessage: '',
      shareMessageAm: '',
    },
    dashboard: {
      showTierProgress: true,
      showEarningsBreakdown: true,
      showReferralHistory: true,
      showHowItWorks: true,
      historyPerPage: 10,
    },
    publicListing: {
      enabled: false,
      topCount: 3,
      minReferralsToShow: 3,
      minTotalPaidETB: 1000,
      cacheSeconds: 300,
      rateLimitPerMinute: 30,
    },
  },

  discounts: {
    enabled: true,
    combinedDiscounts: {
      maxCombinedPercent: 60,
      applicationOrder: ['referral', 'discount_code', 'credit'],
      capBehavior: 'proportional',
    },
    codes: {
      codeValidation: {
        minLength: 4,
        maxLength: 20,
        allowedChars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        autoUppercase: true,
        trimWhitespace: true,
      },
      defaults: {
        maxTotalUses: 100,
        maxUsesPerUser: 1,
        minPurchaseAmount: 0,
      },
      adminLimits: {
        maxDiscountPercent: 100,
        maxDiscountFixed: 10000,
        maxTotalUses: 10000,
      },
    },
    rateLimiting: {
      perIP: {
        validatePerMinute: 10,
        applyPerMinute: 3,
        totalPerDay: 20,
      },
      perUser: {
        validatePerMinute: 5,
        applyPerMinute: 3,
      },
    },
    antiAbuse: {
      enabled: true,
      riskThresholds: {
        normal: 20,
        suspicious: 50,
        high: 75,
        critical: 100,
      },
      actions: {
        suspicious: 'log',
        high: 'flag_for_review',
        critical: 'block_and_notify',
      },
      autoDisableThreshold: 5,
    },
    publicListing: {
      enabled: false,
      showOnPricingPage: true,
    },
  },
};

module.exports = defaultsConfig;