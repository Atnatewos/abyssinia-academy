/**
 * @fileoverview Default Configuration Values
 *
 * Single source of truth for all fallback values. Every section mirrors
 * the shape of its corresponding live config file so the config bridge
 * never encounters a missing key.
 *
 * SLA mirrors:
 *   - withdrawal.processingTimeHours: 24 (payout SLA)
 *   - approval.slaMinutes: 15 (approval SLA)
 *
 * Path: packages/shared/config/defaults.config.js
 */

const defaultsConfig = {
  notifications: {
    retentionDays: parseInt(process.env.NOTIFICATION_RETENTION_DAYS, 10) || 30,
    maxPerUser: parseInt(process.env.NOTIFICATION_MAX_PER_USER, 10) || 200,
    readArchiveDays: parseInt(process.env.NOTIFICATION_READ_ARCHIVE_DAYS, 10) || 14,
    refreshIntervalMs: parseInt(process.env.NOTIFICATION_REFRESH_INTERVAL_MS, 10) || 60000,
    pageSize: parseInt(process.env.NOTIFICATION_PAGE_SIZE, 10) || 20,
    types: {
      payment_approved: {
        icon: 'CheckCircle',
        severity: 'success',
        category: 'payments',
        titleKey: 'notification.paymentApproved.title',
        bodyKey: 'notification.paymentApproved.body',
      },
      payment_rejected: {
        icon: 'XCircle',
        severity: 'critical',
        category: 'payments',
        titleKey: 'notification.paymentRejected.title',
        bodyKey: 'notification.paymentRejected.body',
      },
      commission_unlocked: {
        icon: 'Unlock',
        severity: 'success',
        category: 'referrals',
        titleKey: 'notification.commissionUnlocked.title',
        bodyKey: 'notification.commissionUnlocked.body',
      },
      bonus_awarded: {
        icon: 'Trophy',
        severity: 'success',
        category: 'referrals',
        titleKey: 'notification.bonusAwarded.title',
        bodyKey: 'notification.bonusAwarded.body',
      },
      referral_signed_up: {
        icon: 'UserPlus',
        severity: 'info',
        category: 'referrals',
        titleKey: 'notification.referralSignedUp.title',
        bodyKey: 'notification.referralSignedUp.body',
      },
      referral_purchased: {
        icon: 'ShoppingCart',
        severity: 'success',
        category: 'referrals',
        titleKey: 'notification.referralPurchased.title',
        bodyKey: 'notification.referralPurchased.body',
      },
      withdrawal_approved: {
        icon: 'Banknote',
        severity: 'success',
        category: 'payments',
        titleKey: 'notification.withdrawalApproved.title',
        bodyKey: 'notification.withdrawalApproved.body',
      },
      withdrawal_rejected: {
        icon: 'AlertTriangle',
        severity: 'critical',
        category: 'payments',
        titleKey: 'notification.withdrawalRejected.title',
        bodyKey: 'notification.withdrawalRejected.body',
      },
      password_changed: {
        icon: 'Key',
        severity: 'warning',
        category: 'security',
        titleKey: 'notification.passwordChanged.title',
        bodyKey: 'notification.passwordChanged.body',
      },
      enrollment_granted: {
        icon: 'GraduationCap',
        severity: 'success',
        category: 'enrollment',
        titleKey: 'notification.enrollmentGranted.title',
        bodyKey: 'notification.enrollmentGranted.body',
      },
      phase_unlocked: {
        icon: 'BookOpen',
        severity: 'success',
        category: 'enrollment',
        titleKey: 'notification.phaseUnlocked.title',
        bodyKey: 'notification.phaseUnlocked.body',
      },
      suspension_warning: {
        icon: 'ShieldOff',
        severity: 'critical',
        category: 'security',
        titleKey: 'notification.suspensionWarning.title',
        bodyKey: 'notification.suspensionWarning.body',
      },
    },
    groupingRules: ['today', 'yesterday', 'thisWeek', 'older'],
    categories: [
      { id: 'all', labelKey: 'notification.filter.all' },
      { id: 'unread', labelKey: 'notification.filter.unread' },
      { id: 'payments', labelKey: 'notification.filter.payments' },
      { id: 'referrals', labelKey: 'notification.filter.referrals' },
      { id: 'enrollment', labelKey: 'notification.filter.enrollment' },
      { id: 'security', labelKey: 'notification.filter.security' },
    ],
  },

  payments: {
    pricing: {
      fullCourse: {
        amountETB: parseInt(process.env.PRICING_FULL_COURSE_AMOUNT, 10) || 1000,
        originalAmountETB: parseInt(process.env.PRICING_FULL_COURSE_ORIGINAL, 10) || 1000,
        referredAmountETB: parseInt(process.env.PRICING_FULL_COURSE_REFERRED, 10) || 900,
        referredDiscountPercent: parseInt(process.env.PRICING_REFERRAL_DISCOUNT_PERCENT, 10) || 10,
        currency: process.env.CURRENCY_CODE || 'ETB',
      },
      perPhase: {
        amountETB: parseInt(process.env.PRICING_PER_PHASE_AMOUNT, 10) || 500,
        originalAmountETB: parseInt(process.env.PRICING_PER_PHASE_ORIGINAL, 10) || 500,
        currency: process.env.CURRENCY_CODE || 'ETB',
        minPhases: parseInt(process.env.PRICING_MIN_PHASES, 10) || 1,
        maxPhases: parseInt(process.env.PRICING_MAX_PHASES, 10) || 5,
      },
      bulkDiscounts: [
        { phases: 2, discountPercent: parseInt(process.env.BULK_DISCOUNT_2_PHASES, 10) || 0 },
        { phases: 3, discountPercent: parseInt(process.env.BULK_DISCOUNT_3_PHASES, 10) || 0 },
        { phases: 4, discountPercent: parseInt(process.env.BULK_DISCOUNT_4_PHASES, 10) || 0 },
        { phases: 5, discountPercent: parseInt(process.env.BULK_DISCOUNT_5_PHASES, 10) || 0 },
      ],
    },
    purchaseModes: {
      fullCourse: { enabled: process.env.PURCHASE_MODE_FULL_COURSE !== 'false', id: 'full-course' },
      individualPhases: { enabled: process.env.PURCHASE_MODE_INDIVIDUAL !== 'false', id: 'individual-phases' },
    },
    countdownTimer: {
      enabled: process.env.COUNTDOWN_TIMER_ENABLED !== 'false',
      durationMinutes: parseInt(process.env.COUNTDOWN_TIMER_DURATION, 10) || 15,
      messages: {
        pricingBanner: '⚡ Launch offer expires in {minutes}:{seconds}',
        pricingBannerAm: ' የማስተዋወቂያ ቅናሽ በ {minutes}:{seconds} በቃል',
        checkoutBanner: '⏰ Complete payment within {minutes}:{seconds} to secure this price',
        checkoutBannerAm: '⏰ ይህን ዋጋ ለማስበቅ ክፍያውን በ {minutes}:{seconds} ውስ ያጠናቅቁ',
        expiredText: 'Offer expired',
        expiredTextAm: 'ቅናሹ አልቋል',
      },
      colors: {
        normal: process.env.COUNTDOWN_COLOR_NORMAL || '#f59e0b',
        warning: process.env.COUNTDOWN_COLOR_WARNING || '#fbbf24',
        danger: process.env.COUNTDOWN_COLOR_DANGER || '#ef4444',
        expired: process.env.COUNTDOWN_COLOR_EXPIRED || '#6b7280',
      },
      warningThresholdPercent: parseInt(process.env.COUNTDOWN_WARNING_THRESHOLD, 10) || 30,
      dangerThresholdPercent: parseInt(process.env.COUNTDOWN_DANGER_THRESHOLD, 10) || 10,
    },
    checkoutModal: {
      title: 'Complete Your Enrollment',
      titleAm: 'ምዝባዎን ያጠናቅቁ',
      showPurchaseSummary: process.env.CHECKOUT_SHOW_SUMMARY !== 'false',
      showUpgradeNudge: process.env.CHECKOUT_SHOW_UPGRADE !== 'false',
      upgradeNudgeThresholdPercent: parseInt(process.env.CHECKOUT_UPGRADE_THRESHOLD, 10) || 70,
    },
    profile: {
      avatar: {
        maxSize: parseInt(process.env.AVATAR_MAX_SIZE, 10) || 2 * 1024 * 1024,
        allowedTypes: (process.env.AVATAR_ALLOWED_TYPES || 'image/jpeg,image/png,image/webp').split(','),
        maxWidth: parseInt(process.env.AVATAR_MAX_WIDTH, 10) || 512,
        maxHeight: parseInt(process.env.AVATAR_MAX_HEIGHT, 10) || 512,
      },
      sections: {
        enrollmentCard: process.env.PROFILE_SHOW_ENROLLMENT !== 'false',
        overallProgress: process.env.PROFILE_SHOW_PROGRESS !== 'false',
        phaseProgress: process.env.PROFILE_SHOW_PHASE_PROGRESS !== 'false',
        paymentHistory: process.env.PROFILE_SHOW_PAYMENTS !== 'false',
        quickActions: process.env.PROFILE_SHOW_QUICK_ACTIONS !== 'false',
        accountSettings: process.env.PROFILE_SHOW_SETTINGS !== 'false',
      },
      quickActions: [
        { id: 'portal', label: 'Go to Classroom Portal', labelAm: 'ደ መማሪያ ክል ይሂዱ', href: '/portal', icon: 'BookOpen' },
        { id: 'courses', label: 'Browse Courses', labelAm: 'ርሶችን ይመልከቱ', href: '/courses', icon: 'Grid' },
        { id: 'telegram', label: 'Join Telegram Community', labelAm: 'ሌግራም ይቀላቀሉ', href: process.env.TELEGRAM_COMMUNITY_URL || 'https://t.me/AbyssiniaAcademy', icon: 'MessageCircle', external: true },
        { id: 'support', label: 'Contact Support', labelAm: 'ድጋ ያግኙ', href: '/contact', icon: 'HelpCircle' },
      ],
      accessControl: {
        lockedPhaseTitle: 'Phase {phase} is Locked',
        lockedPhaseTitleAm: 'ደረ {phase} ተቆልፏል',
        lockedPhaseDescription: 'Purchase Phase {phase}{title} to unlock this content and continue your learning journey.',
        lockedPhaseDescriptionAm: 'ይህን ይዘት መክፈት እና የትምህርት ጉዞዎን ለመቀጠል ደጃ {phase}{title} ይዙ።',
        unlockPhase: 'Unlock Phase {phase}',
        unlockPhaseAm: 'ደረጃ {phase} ይክፈቱ',
      },
    },
    approval: {
      /* Approval SLA mirror: 15 minutes */
      slaMinutes: parseInt(process.env.APPROVAL_SLA_MINUTES, 10) || 15,
      pendingMessage: 'Your payment is being verified. You will get access within {minutes} minutes.',
      pendingMessageAm: 'ክፍያዎ እየተረጋገጠ ው። በ{minutes} ቂቃዎች ውስጥ መዳረሻ ገኛሉ።',
    },
    screenshotUpload: {
      maxSize: parseInt(process.env.SCREENSHOT_MAX_SIZE, 10) || 5 * 1024 * 1024,
      allowedTypes: (process.env.SCREENSHOT_ALLOWED_TYPES || 'image/jpeg,image/png,image/webp').split(','),
      maxWidth: parseInt(process.env.SCREENSHOT_MAX_WIDTH, 10) || 1920,
      maxHeight: parseInt(process.env.SCREENSHOT_MAX_HEIGHT, 10) || 1920,
    },
    methods: [],
  },

  phases: {
    individuallyPurchasable: process.env.PHASES_INDIVIDUAL_PURCHASE !== 'false',
    phases: [],
  },

  platform: {
    brand: {
      name: process.env.PLATFORM_NAME || 'ABYSSiNIA',
      suffix: process.env.PLATFORM_SUFFIX || 'Tech Academy',
      tagline: process.env.PLATFORM_TAGLINE || 'Master Full-Stack Engineering from Ethiopia to the World',
    },
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
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
      previewImage: process.env.HERO_PREVIEW_IMAGE || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      previewDuration: '45:10',
      showIncomeChips: process.env.HERO_SHOW_INCOME_CHIPS === 'true',
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
      enabled: process.env.EARN_SECTION_ENABLED !== 'false',
      anchorId: process.env.EARN_ANCHOR_ID || 'earn',
      stepIcons: ['BookOpen', 'Share2', 'Wallet'],
      trustIcons: ['ShoppingCart', 'ShieldCheck', 'BarChart3', 'UserX'],
      cta: { authed: '/profile/referrals', guest: '/auth/register' },
      calculator: {
        step: 1,
        maxSliderLevel: parseInt(process.env.EARN_CALC_MAX_SLIDER, 10) || 100,
        sanityCeiling: parseInt(process.env.EARN_CALC_SANITY_CEILING, 10) || 10000,
        defaultLevelCounts: [5, 10, 20, 20],
        showChainStrip: process.env.EARN_SHOW_CHAIN_STRIP === 'true',
        detailsOpenByDefault: process.env.EARN_DETAILS_OPEN_DEFAULT !== 'false',
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
        defaultTab: process.env.EARN_RAIL_DEFAULT_TAB || 'next',
      },
    },
    socialProof: { enabled: process.env.SOCIAL_PROOF_ENABLED !== 'false', topCount: parseInt(process.env.SOCIAL_PROOF_TOP_COUNT, 10) || 3 },
    trustRules: { payoutIcon: 'Banknote' },
  },

  i18n: {
    defaultLanguage: process.env.DEFAULT_LANGUAGE || 'en',
  },

  referrals: {
    enabled: process.env.REFERRALS_ENABLED !== 'false',
    codeGeneration: {
      length: parseInt(process.env.REFERRAL_CODE_LENGTH, 10) || 8,
      prefix: process.env.REFERRAL_CODE_PREFIX || 'ABY',
      charset: process.env.REFERRAL_CODE_CHARSET || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      excludeSimilar: process.env.REFERRAL_CODE_EXCLUDE_SIMILAR !== 'false',
    },
    commissionStructure: {
      maxLevels: parseInt(process.env.MLM_MAX_LEVELS, 10) || 4,
      levelAmounts: (process.env.MLM_LEVEL_AMOUNTS || '200,150,100,50').split(',').map(Number),
      totalPerSale: parseInt(process.env.MLM_TOTAL_PER_SALE, 10) || 500,
      maxTotalPerSaleETB: parseInt(process.env.MLM_MAX_TOTAL_PER_SALE, 10) || 500,
      currency: process.env.CURRENCY_CODE || 'ETB',
      unlockDelayDays: parseInt(process.env.MLM_UNLOCK_DELAY_DAYS, 10) || 7,
    },
    referredDiscount: { percent: parseInt(process.env.REFERRAL_DISCOUNT_PERCENT, 10) || 10 },
    bonuses: {
      payingGate: process.env.BONUS_PAYING_GATE !== 'false',
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
      maxTotalPerSaleETB: parseInt(process.env.MLM_CAP_PER_SALE, 10) || 500,
      maxBonusPerUserPerMonthETB: parseInt(process.env.MLM_CAP_BONUS_MONTHLY, 10) || 10000,
      maxTotalPayoutPerUserPerMonthETB: parseInt(process.env.MLM_CAP_PAYOUT_USER_MONTHLY, 10) || 25000,
      maxTotalPayoutPlatformPerMonthETB: parseInt(process.env.MLM_CAP_PAYOUT_PLATFORM_MONTHLY, 10) || 500000,
    },
    withdrawal: {
      minimumAmountETB: parseInt(process.env.WITHDRAWAL_MIN_AMOUNT, 10) || 500,
      maximumAmountETB: parseInt(process.env.WITHDRAWAL_MAX_AMOUNT, 10) || 100000,
      methods: (process.env.WITHDRAWAL_METHODS || 'telebirr,cbe-birr,bank-transfer').split(','),
      requiresAdminApproval: process.env.WITHDRAWAL_REQUIRES_ADMIN !== 'false',
      maxPendingRequests: parseInt(process.env.WITHDRAWAL_MAX_PENDING, 10) || 1,
      /* Payout SLA mirror: 24 hours */
      processingTimeHours: parseInt(process.env.WITHDRAWAL_PROCESSING_HOURS, 10) || 24,
    },
    registration: {
      showReferralBanner: process.env.REFERRAL_SHOW_BANNER !== 'false',
      autoApplyCode: process.env.REFERRAL_AUTO_APPLY !== 'false',
      allowCodeChange: process.env.REFERRAL_ALLOW_CODE_CHANGE !== 'false',
      cookieDurationDays: parseInt(process.env.REFERRAL_COOKIE_DURATION, 10) || 30,
    },
    sharing: {
      platforms: {},
      shareMessage: '',
      shareMessageAm: '',
    },
    dashboard: {
      showTierProgress: process.env.REFERRAL_DASHBOARD_SHOW_TIER !== 'false',
      showEarningsBreakdown: process.env.REFERRAL_DASHBOARD_SHOW_EARNINGS !== 'false',
      showReferralHistory: process.env.REFERRAL_DASHBOARD_SHOW_HISTORY !== 'false',
      showHowItWorks: process.env.REFERRAL_DASHBOARD_SHOW_HOW_IT_WORKS !== 'false',
      historyPerPage: parseInt(process.env.REFERRAL_DASHBOARD_HISTORY_PER_PAGE, 10) || 10,
    },
    publicListing: {
      enabled: process.env.REFERRAL_PUBLIC_LISTING_ENABLED === 'true',
      topCount: parseInt(process.env.REFERRAL_PUBLIC_TOP_COUNT, 10) || 3,
      minReferralsToShow: parseInt(process.env.REFERRAL_PUBLIC_MIN_REFERRALS, 10) || 3,
      minTotalPaidETB: parseInt(process.env.REFERRAL_PUBLIC_MIN_PAID, 10) || 1000,
      cacheSeconds: parseInt(process.env.REFERRAL_PUBLIC_CACHE_SECONDS, 10) || 300,
      rateLimitPerMinute: parseInt(process.env.REFERRAL_PUBLIC_RATE_LIMIT, 10) || 30,
    },
  },

  discounts: {
    enabled: process.env.DISCOUNTS_ENABLED !== 'false',
    combinedDiscounts: {
      maxCombinedPercent: parseInt(process.env.DISCOUNT_MAX_COMBINED_PERCENT, 10) || 60,
      applicationOrder: (process.env.DISCOUNT_APPLICATION_ORDER || 'referral,discount_code,credit').split(','),
      capBehavior: process.env.DISCOUNT_CAP_BEHAVIOR || 'proportional',
    },
    codes: {
      codeValidation: {
        minLength: parseInt(process.env.DISCOUNT_CODE_MIN_LENGTH, 10) || 4,
        maxLength: parseInt(process.env.DISCOUNT_CODE_MAX_LENGTH, 10) || 20,
        allowedChars: process.env.DISCOUNT_CODE_ALLOWED_CHARS || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        autoUppercase: process.env.DISCOUNT_CODE_AUTO_UPPERCASE !== 'false',
        trimWhitespace: process.env.DISCOUNT_CODE_TRIM_WHITESPACE !== 'false',
      },
      defaults: {
        maxTotalUses: parseInt(process.env.DISCOUNT_CODE_MAX_USES, 10) || 100,
        maxUsesPerUser: parseInt(process.env.DISCOUNT_CODE_MAX_USES_PER_USER, 10) || 1,
        minPurchaseAmount: parseInt(process.env.DISCOUNT_CODE_MIN_PURCHASE, 10) || 0,
      },
      adminLimits: {
        maxDiscountPercent: parseInt(process.env.DISCOUNT_ADMIN_MAX_PERCENT, 10) || 100,
        maxDiscountFixed: parseInt(process.env.DISCOUNT_ADMIN_MAX_FIXED, 10) || 10000,
        maxTotalUses: parseInt(process.env.DISCOUNT_ADMIN_MAX_USES, 10) || 10000,
      },
    },
    rateLimiting: {
      perIP: {
        validatePerMinute: parseInt(process.env.DISCOUNT_RATE_IP_VALIDATE, 10) || 10,
        applyPerMinute: parseInt(process.env.DISCOUNT_RATE_IP_APPLY, 10) || 3,
        totalPerDay: parseInt(process.env.DISCOUNT_RATE_IP_TOTAL_DAY, 10) || 20,
      },
      perUser: {
        validatePerMinute: parseInt(process.env.DISCOUNT_RATE_USER_VALIDATE, 10) || 5,
        applyPerMinute: parseInt(process.env.DISCOUNT_RATE_USER_APPLY, 10) || 3,
      },
    },
    antiAbuse: {
      enabled: process.env.DISCOUNT_ANTI_ABUSE_ENABLED !== 'false',
      riskThresholds: {
        normal: parseInt(process.env.DISCOUNT_RISK_NORMAL, 10) || 20,
        suspicious: parseInt(process.env.DISCOUNT_RISK_SUSPICIOUS, 10) || 50,
        high: parseInt(process.env.DISCOUNT_RISK_HIGH, 10) || 75,
        critical: parseInt(process.env.DISCOUNT_RISK_CRITICAL, 10) || 100,
      },
      actions: {
        suspicious: process.env.DISCOUNT_ACTION_SUSPICIOUS || 'log',
        high: process.env.DISCOUNT_ACTION_HIGH || 'flag_for_review',
        critical: process.env.DISCOUNT_ACTION_CRITICAL || 'block_and_notify',
      },
      autoDisableThreshold: parseInt(process.env.DISCOUNT_AUTO_DISABLE_THRESHOLD, 10) || 5,
    },
    publicListing: {
      enabled: process.env.DISCOUNT_PUBLIC_LISTING_ENABLED === 'true',
      showOnPricingPage: process.env.DISCOUNT_SHOW_ON_PRICING !== 'false',
    },
  },
};

module.exports = defaultsConfig;