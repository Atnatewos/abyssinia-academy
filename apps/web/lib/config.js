/**
 * @fileoverview Config Bridge
 *
 * Bridges shared package config to the Next.js frontend. Every accessor
 * resolves through the chain: shared config → defaults config → safe
 * inline fallback. Zero hardcoded business values live in this file.
 *
 * The shared config lives at packages/shared/config (three levels up from
 * the lib/ directory). If it cannot be resolved, the defaults module is
 * used; if that also fails, minimal inline fallbacks keep the UI functional.
 *
 * Path: apps/web/lib/config.js
 */

/* ─────────────────────────────────────────────────────────────
 * CONFIG LOADERS — Cached, defensive
 * ───────────────────────────────────────────────────────────── */

let cachedConfig = null;
let cachedConfigAttempted = false;

let cachedDefaults = null;
let cachedDefaultsAttempted = false;

/**
 * Load the full shared configuration from packages/shared/config.
 * Resolves from apps/web/lib/ → repo root → packages/shared/config.
 *
 * Path resolution: '../../../' from lib/ → 'abyssinia-academy/' (repo root)
 *
 * @returns {object|null} Shared config object, or null when unreachable
 */
const loadConfig = () => {
  if (cachedConfigAttempted) return cachedConfig;
  cachedConfigAttempted = true;

  try {
    /* Three levels up: lib → web → apps → repo root */
    cachedConfig = require('../../../packages/shared/config');
  } catch (primaryError) {
    try {
      /* Alias fallback via jsconfig @shared/* → ../../packages/shared/* */
      cachedConfig = require('@shared/config');
    } catch {
      cachedConfig = null;
    }
  }
  return cachedConfig;
};

/**
 * Load the defaults configuration — the always-available safety net.
 * Resolves from apps/web/lib/ → repo root → packages/shared/config.
 *
 * @returns {object} Defaults config object (never null)
 */
const loadDefaults = () => {
  if (cachedDefaultsAttempted) return cachedDefaults;
  cachedDefaultsAttempted = true;

  try {
    /* Three levels up: lib → web → apps → repo root */
    cachedDefaults = require('../../../packages/shared/config/defaults.config');
  } catch {
    cachedDefaults = buildInlineDefaults();
  }
  return cachedDefaults;
};

/**
 * Minimal inline fallbacks used only when both the shared config and the
 * defaults module are unreachable. These exist purely to prevent a total
 * UI crash — they should never be the actual source of truth.
 *
 * @returns {object} Minimal config shape
 */
const buildInlineDefaults = () => ({
  agents: buildAgentFallback(),
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
      bulkDiscounts: [],
    },
    purchaseModes: {},
    countdownTimer: {},
    checkoutModal: {},
    profile: { avatar: {}, sections: {}, quickActions: [] },
    approval: {},
    screenshotUpload: {},
    methods: [],
  },
  phases: { individuallyPurchasable: true, phases: [] },
  platform: {
    name: 'Abyssinia Academy',
    brand: {},
    frontendUrl: '',
    supportEmail: '',
  },
  landing: {
    hero: {},
    heroVisual: {},
    stats: [],
    features: {},
    howItWorks: {},
    faq: {},
    cta: {},
    earn: { enabled: false, anchorId: 'earn' },
    incomeBand: { enabled: false, cards: [] },
    socialProof: { enabled: false, topCount: 3 },
    trustRules: {},
  },
  i18n: { defaultLanguage: 'en' },
  referrals: {},
  discounts: {},
  notifications: {},
});

/**
 * Agent-system fallback shape. Mirrors packages/shared/config/agents.config.js
 * so consumers get a consistent contract even when the shared config is
 * unreachable.
 *
 * @returns {object} Agent config
 */
const buildAgentFallback = () => ({
  enabled: true,
  defaultCommission: {
    type: 'fixed',
    value: 500,
    currency: 'ETB',
  },
  codeGeneration: {
    prefix: 'AGT-',
    length: 12,
    charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    excludeSimilar: true,
  },
  overrideRules: {
    agentOverridesMLM: true,
    agentOverridesDiscount: true,
    allowBothAgentAndMLM: false,
  },
  adminLimits: {
    maxFixedAmountETB: 10000,
    maxPercentageRate: 50,
    minFixedAmountETB: 100,
    minPercentageRate: 1,
  },
  calculation: {
    applyAfterDiscounts: false,
    roundToNearestETB: true,
  },
  payout: {
    lockWindowDays: 0,
    minimumWithdrawalETB: 500,
  },
  dashboard: {
    showAgentSection: true,
    showMLMSection: true,
    defaultTab: 'agent',
  },
});

/**
 * Resolve a dot-notation path on an object.
 *
 * @param {object} obj - Object to traverse
 * @param {string} path - Dot-notation path
 * @returns {*} Value at path, or undefined
 */
const resolvePath = (obj, path) => {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((current, key) => {
    if (current === null || current === undefined) return undefined;
    return current[key];
  }, obj);
};

/**
 * Resolve a config value with the standard fallback chain:
 * shared config → defaults → final fallback.
 *
 * @param {string} configPath - Dot-notation path
 * @param {*} finalFallback - Ultimate fallback
 * @returns {*} Resolved value
 */
const getValue = (configPath, finalFallback = null) => {
  const config = loadConfig();
  if (config) {
    const configValue = resolvePath(config, configPath);
    if (configValue !== undefined && configValue !== null) return configValue;
  }

  const defaults = loadDefaults();
  const defaultVal = resolvePath(defaults, configPath);
  if (defaultVal !== undefined && defaultVal !== null) return defaultVal;

  return finalFallback;
};

/* ─────────────────────────────────────────────────────────────
 * FEATURE FLAGS — Environment-driven kill switches
 * ───────────────────────────────────────────────────────────── */

/**
 * Whether the agent system is enabled platform-wide.
 * Set AGENTS_ENABLED=false in the environment to disable instantly.
 *
 * @returns {boolean}
 */
export const isAgentsEnabled = () => {
  const raw = typeof process !== 'undefined' ? process.env.AGENTS_ENABLED : undefined;
  if (raw === undefined || raw === null || raw === '') return true;
  return String(raw).toLowerCase() !== 'false';
};

/* ─────────────────────────────────────────────────────────────
 * GENERAL ACCESSORS
 * ───────────────────────────────────────────────────────────── */

export const getConfig = () => loadConfig() || loadDefaults();
export const getPlatform = () => getValue('platform', {});
export const getPaymentConfig = () => getValue('payments', {});

/* ─────────────────────────────────────────────────────────────
 * LANDING PAGE ACCESSORS
 * ───────────────────────────────────────────────────────────── */

export const getLandingConfig = () => getValue('landing', {});

export const getHeroConfig = () => {
  const landing = getLandingConfig();
  return landing?.hero || loadDefaults().landing.hero;
};

export const getHeroVisualConfig = () => {
  const landing = getLandingConfig();
  return landing?.heroVisual || loadDefaults().landing.heroVisual;
};

export const getStatsConfig = () => {
  const landing = getLandingConfig();
  return landing?.stats || loadDefaults().landing.stats;
};

export const getFeaturesConfig = () => {
  const landing = getLandingConfig();
  return landing?.features || loadDefaults().landing.features;
};

export const getHowItWorksConfig = () => {
  const landing = getLandingConfig();
  return landing?.howItWorks || loadDefaults().landing.howItWorks;
};

export const getFAQConfig = () => {
  const landing = getLandingConfig();
  return landing?.faq || loadDefaults().landing.faq;
};

export const getCTAConfig = () => {
  const landing = getLandingConfig();
  return landing?.cta || loadDefaults().landing.cta;
};

/**
 * Learn & Earn engine structure (anchor, icons, calculator bounds).
 * @returns {object} Earn section config
 */
export const getLandingEarnConfig = () => {
  const landing = getLandingConfig();
  const defaults = loadDefaults();
  return (
    landing?.earn ||
    defaults.landing?.earn ||
    { enabled: false, anchorId: 'earn' }
  );
};

/**
 * Income opportunity band (3-card strip between hero and pricing).
 * @returns {object} Income band config
 */
export const getLandingIncomeBandConfig = () => {
  const landing = getLandingConfig();
  const defaults = loadDefaults();
  return (
    landing?.incomeBand ||
    defaults.landing?.incomeBand ||
    { enabled: false, anchorId: 'income-opportunity', cards: [] }
  );
};

/**
 * Social proof strip settings for the landing page.
 * @returns {object} Social proof config
 */
export const getSocialProofConfig = () => {
  const landing = getLandingConfig();
  const defaults = loadDefaults();
  return (
    landing?.socialProof ||
    defaults.landing?.socialProof ||
    { enabled: false, topCount: 3 }
  );
};

/**
 * Trust rules icon configuration for the earn section footer.
 * @returns {object} Trust rules config
 */
export const getTrustRulesConfig = () => {
  const landing = getLandingConfig();
  const defaults = loadDefaults();
  return landing?.trustRules || defaults.landing?.trustRules || {};
};

/* ─────────────────────────────────────────────────────────────
 * PAYMENT ACCESSORS
 * ───────────────────────────────────────────────────────────── */

export const getPricing = () => {
  const defaults = loadDefaults();
  return getValue('payments.pricing', defaults.payments.pricing);
};

export const getActivePaymentMethods = () => {
  const paymentConfig = getPaymentConfig();
  const defaults = loadDefaults();
  const allMethods = paymentConfig?.methods || defaults.payments.methods || [];
  return allMethods.filter((method) => method.isActive !== false);
};

export const getPaymentMethodById = (methodId) => {
  if (!methodId) return null;
  const methods = getActivePaymentMethods();
  return methods.find((m) => m.id === methodId) || null;
};

export const getApprovalConfig = () => {
  const defaults = loadDefaults();
  return getValue('payments.approval', defaults.payments.approval);
};

export const getScreenshotUploadConfig = () => {
  const defaults = loadDefaults();
  return getValue('payments.screenshotUpload', defaults.payments.screenshotUpload);
};

export const getPurchaseModes = () => {
  const defaults = loadDefaults();
  return getValue('payments.purchaseModes', defaults.payments.purchaseModes);
};

export const getBulkDiscounts = () => {
  const pricing = getPricing();
  const defaults = loadDefaults();
  return pricing?.bulkDiscounts || defaults.payments.pricing.bulkDiscounts;
};

export const getCountdownTimerConfig = () => {
  const defaults = loadDefaults();
  return getValue('payments.countdownTimer', defaults.payments.countdownTimer);
};

export const getCheckoutModalConfig = () => {
  const defaults = loadDefaults();
  return getValue('payments.checkoutModal', defaults.payments.checkoutModal);
};

/* ─────────────────────────────────────────────────────────────
 * PHASE PURCHASE ACCESSORS
 * ───────────────────────────────────────────────────────────── */

export const getPhasePurchaseConfig = () => {
  const defaults = loadDefaults();
  return getValue('phases', defaults.phases);
};

export const getPurchasablePhases = () => {
  const phaseConfig = getPhasePurchaseConfig();
  const defaults = loadDefaults();
  return phaseConfig?.phases || defaults.phases.phases;
};

/**
 * Calculate pricing for selected phases including bulk discounts.
 *
 * @param {Array<string>} selectedPhaseIds - Selected phase identifiers
 * @returns {object} Pricing breakdown
 */
export const calculatePhasePricing = (selectedPhaseIds = []) => {
  const pricing = getPricing();
  const defaults = loadDefaults();
  const perPhase = pricing.perPhase || defaults.payments.pricing.perPhase;
  const fullCourse = pricing.fullCourse || defaults.payments.pricing.fullCourse;
  const bulkDiscounts = getBulkDiscounts();
  const phaseCount = selectedPhaseIds.length;

  if (phaseCount === 0) {
    return {
      phaseCount: 0,
      baseTotal: 0,
      discountPercent: 0,
      discountAmount: 0,
      finalTotal: 0,
      fullCoursePrice: fullCourse.amountETB,
      perPhasePrice: perPhase.amountETB,
      currency: perPhase.currency,
    };
  }

  const baseTotal = perPhase.amountETB * phaseCount;
  const applicableDiscount = [...bulkDiscounts]
    .sort((a, b) => b.phases - a.phases)
    .find((tier) => phaseCount >= tier.phases);
  const discountPercent = applicableDiscount?.discountPercent || 0;
  const discountAmount = Math.round(baseTotal * (discountPercent / 100));
  const finalTotal = baseTotal - discountAmount;

  return {
    phaseCount,
    baseTotal,
    discountPercent,
    discountAmount,
    finalTotal,
    fullCoursePrice: fullCourse.amountETB,
    perPhasePrice: perPhase.amountETB,
    currency: perPhase.currency,
    isFullCourseCheaper: fullCourse.amountETB < finalTotal,
    savingsWithFullCourse: finalTotal - fullCourse.amountETB,
  };
};

/* ─────────────────────────────────────────────────────────────
 * PROFILE ACCESSORS
 * ───────────────────────────────────────────────────────────── */

export const getProfileConfig = () => {
  const defaults = loadDefaults();
  return getValue('payments.profile', defaults.payments.profile);
};

export const getAvatarConfig = () => {
  const profileConfig = getProfileConfig();
  return (
    profileConfig?.avatar || {
      maxSize: 2 * 1024 * 1024,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxWidth: 512,
      maxHeight: 512,
    }
  );
};

/* ─────────────────────────────────────────────────────────────
 * PLATFORM ACCESSORS
 * ───────────────────────────────────────────────────────────── */

export const getPlatformConfig = () => {
  const defaults = loadDefaults();
  return getValue(
    'platform',
    defaults.platform || {
      name: 'Abyssinia Academy',
      brand: {},
      frontendUrl: '',
      supportEmail: '',
    }
  );
};

/* ─────────────────────────────────────────────────────────────
 * REFERRAL SYSTEM ACCESSORS (MLM)
 * ───────────────────────────────────────────────────────────── */

export const getReferralConfig = () => {
  const defaults = loadDefaults();
  return getValue('referrals', defaults.referrals);
};

export const getReferralCodeGenConfig = () => {
  const referralConfig = getReferralConfig();
  return referralConfig?.codeGeneration || loadDefaults().referrals.codeGeneration;
};

export const getCommissionStructure = () => {
  const referralConfig = getReferralConfig();
  const defaults = loadDefaults();
  return (
    referralConfig?.commissionStructure ||
    defaults.referrals?.commissionStructure ||
    {
      maxLevels: 4,
      levelAmounts: [200, 150, 100, 50],
      totalPerSale: 500,
      currency: 'ETB',
      unlockDelayDays: 7,
    }
  );
};

export const getBonusConfig = () => {
  const referralConfig = getReferralConfig();
  const defaults = loadDefaults();
  return referralConfig?.bonuses || defaults.referrals?.bonuses || {};
};

export const getMLMCaps = () => {
  const referralConfig = getReferralConfig();
  const defaults = loadDefaults();
  return (
    referralConfig?.caps ||
    defaults.referrals?.caps || {
      maxTotalPerSaleETB: 500,
      maxBonusPerUserPerMonthETB: 10000,
      maxTotalPayoutPerUserPerMonthETB: 25000,
      maxTotalPayoutPlatformPerMonthETB: 500000,
    }
  );
};

export const getWithdrawalConfig = () => {
  const referralConfig = getReferralConfig();
  const defaults = loadDefaults();
  return (
    referralConfig?.withdrawal ||
    defaults.referrals?.withdrawal || {
      minimumAmountETB: 500,
      maximumAmountETB: 100000,
      methods: ['telebirr', 'cbe-birr', 'bank-transfer'],
      requiresAdminApproval: true,
      maxPendingRequests: 1,
      processingTimeHours: 24,
    }
  );
};

export const getReferredDiscountPercent = () => {
  const referralConfig = getReferralConfig();
  const defaults = loadDefaults();
  const referred = referralConfig?.referredDiscount || defaults.referrals?.referredDiscount;
  return referred?.percent ?? 10;
};

export const getReferralShareConfig = () => {
  const referralConfig = getReferralConfig();
  const defaults = loadDefaults();
  const sharing = referralConfig?.sharing || defaults.referrals?.sharing || {};
  return {
    shareMessageTemplate:
      sharing.shareMessageTemplate ||
      'Join me at {name} and learn Full-Stack Web Development! Use my referral link: {link}',
    shareMessageTemplateAm:
      sharing.shareMessageTemplateAm ||
      'በ{name} ይቀቀ እና ፉል-ስታ ብ ዴሎፕመንት ይማሩ! የማጣቀሻ ንን ይጠቀ: {link}',
    platforms: sharing.platforms || {
      telegram: 'https://t.me/share/url',
      whatsapp: 'https://wa.me',
      facebook: 'https://www.facebook.com/sharer/sharer.php',
    },
  };
};

export const getSharingPlatforms = () => {
  const referralConfig = getReferralConfig();
  return (
    referralConfig?.sharing?.platforms ||
    loadDefaults().referrals.sharing.platforms
  );
};

export const getReferralDashboardConfig = () => {
  const referralConfig = getReferralConfig();
  return referralConfig?.dashboard || loadDefaults().referrals.dashboard;
};

/**
 * Public earn-stats listing gate for the landing social proof strip.
 * @returns {object} Public listing config
 */
export const getReferralPublicListingConfig = () => {
  const referralConfig = getReferralConfig();
  const defaults = loadDefaults();
  return (
    referralConfig?.publicListing ||
    defaults.referrals?.publicListing || {
      enabled: false,
      topCount: 3,
      minReferralsToShow: 3,
      minTotalPaidETB: 1000,
      cacheSeconds: 300,
      rateLimitPerMinute: 30,
    }
  );
};

/* ─────────────────────────────────────────────────────────────
 * AGENT SYSTEM ACCESSORS
 * ───────────────────────────────────────────────────────────── */

/**
 * Full agent-system configuration.
 * Mirrors packages/shared/config/agents.config.js shape.
 *
 * @returns {object} Agent config
 */
export const getAgentConfig = () => {
  const fallback = buildAgentFallback();
  return getValue('agents', fallback) || fallback;
};

/**
 * Default commission settings used when provisioning new agents.
 *
 * @returns {{ type: 'fixed'|'percentage', value: number, currency: string }}
 */
export const getAgentDefaultCommission = () => {
  const agentConfig = getAgentConfig();
  return (
    agentConfig?.defaultCommission || {
      type: 'fixed',
      value: 500,
      currency: 'ETB',
    }
  );
};

/**
 * Rules for generating agent codes.
 *
 * @returns {{ prefix: string, length: number, charset: string, excludeSimilar: boolean }}
 */
export const getAgentCodeGeneration = () => {
  const agentConfig = getAgentConfig();
  return (
    agentConfig?.codeGeneration || {
      prefix: 'AGT-',
      length: 12,
      charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      excludeSimilar: true,
    }
  );
};

/**
 * Admin-imposed limits on commission rates.
 *
 * @returns {{ maxFixedAmountETB: number, maxPercentageRate: number, minFixedAmountETB: number, minPercentageRate: number }}
 */
export const getAgentAdminLimits = () => {
  const agentConfig = getAgentConfig();
  return (
    agentConfig?.adminLimits || {
      maxFixedAmountETB: 10000,
      maxPercentageRate: 50,
      minFixedAmountETB: 100,
      minPercentageRate: 1,
    }
  );
};

/**
 * Whether an agent code overrides a referral code at checkout.
 *
 * @returns {boolean}
 */
export const getAgentOverrideRules = () => {
  const agentConfig = getAgentConfig();
  return (
    agentConfig?.overrideRules || {
      agentOverridesMLM: true,
      agentOverridesDiscount: true,
      allowBothAgentAndMLM: false,
    }
  );
};

/* ─────────────────────────────────────────────────────────────
 * NOTIFICATIONS SYSTEM ACCESSORS
 * ───────────────────────────────────────────────────────────── */

/**
 * Notifications system configuration accessor.
 *
 * @returns {object} Notifications config
 */
export const getNotificationsConfig = () => {
  const defaults = loadDefaults();
  return getValue(
    'notifications',
    defaults.notifications || {
      retentionDays: 30,
      maxPerUser: 200,
      readArchiveDays: 14,
      refreshIntervalMs: 60000,
      pageSize: 20,
      types: {},
      groupingRules: ['today', 'yesterday', 'thisWeek', 'older'],
      categories: [
        { id: 'all', labelKey: 'notification.filter.all' },
        { id: 'unread', labelKey: 'notification.filter.unread' },
      ],
    }
  );
};

/* ─────────────────────────────────────────────────────────────
 * BACKWARD COMPATIBILITY — LEGACY REFERRAL STUBS
 * ───────────────────────────────────────────────────────────── */

export const getReferralTiers = () => {
  return [
    { name: 'Bronze', nameAm: 'ብንዝ', minReferrals: 0, creditPercent: 10, color: '#cd7f32', icon: 'Medal' },
    { name: 'Silver', nameAm: 'ብር', minReferrals: 3, creditPercent: 15, color: '#c0c0c0', icon: 'Award' },
    { name: 'Gold', nameAm: 'ወርቅ', minReferrals: 6, creditPercent: 20, color: '#ffd700', icon: 'Trophy' },
    { name: 'Platinum', nameAm: 'ፕላቲነም', minReferrals: 11, creditPercent: 25, color: '#e5e4e2', icon: 'Crown' },
    { name: 'Diamond', nameAm: 'አልማዝ', minReferrals: 21, creditPercent: 30, color: '#b9f2ff', icon: 'Gem' },
  ];
};

export const getReferralTierByCount = (successfulCount = 0) => {
  const tiers = getReferralTiers();
  const sorted = [...tiers].sort((a, b) => b.minReferrals - a.minReferrals);
  return sorted.find((tier) => successfulCount >= tier.minReferrals) || tiers[0] || null;
};

export const getCreditCapConfig = () => {
  return { maxPercent: 100, overflowToCash: true };
};

export const getCommissionConfig = () => {
  return {
    percentOfPayment: 20,
    minimumPayout: 500,
    paymentMethods: ['telebirr', 'cbe-birr', 'bank-transfer'],
  };
};

/* ─────────────────────────────────────────────────────────────
 * DISCOUNT CODE SYSTEM ACCESSORS
 * ───────────────────────────────────────────────────────────── */

export const getDiscountConfig = () => {
  const defaults = loadDefaults();
  return getValue('discounts', defaults.discounts);
};

export const getCombinedDiscountConfig = () => {
  const discountConfig = getDiscountConfig();
  return (
    discountConfig?.combinedDiscounts ||
    loadDefaults().discounts.combinedDiscounts
  );
};

/**
 * Agent buyer discount config — resolves from packages/shared/config/discounts.config.js
 *
 * @returns {{ enabled: boolean, percent: number, overridesReferral: boolean }}
 */
export const getAgentBuyerDiscountConfig = () => {
  const discountConfig = getDiscountConfig();
  const fromConfig = discountConfig?.agentBuyerDiscount;
  if (fromConfig && typeof fromConfig === 'object') {
    return {
      enabled: fromConfig.enabled !== false,
      percent: typeof fromConfig.percent === 'number' ? fromConfig.percent : 10,
      overridesReferral: fromConfig.overridesReferral !== false,
    };
  }
  /* Safe defaults when the shared config is unreachable */
  return { enabled: true, percent: 10, overridesReferral: true };
};

export const getDiscountCodeValidation = () => {
  const discountConfig = getDiscountConfig();
  return (
    discountConfig?.codes?.codeValidation ||
    loadDefaults().discounts.codes.codeValidation
  );
};

export const getDiscountRateLimits = () => {
  const discountConfig = getDiscountConfig();
  return (
    discountConfig?.rateLimiting || loadDefaults().discounts.rateLimiting
  );
};

export const getDiscountAntiAbuseConfig = () => {
  const discountConfig = getDiscountConfig();
  return (
    discountConfig?.antiAbuse || loadDefaults().discounts.antiAbuse
  );
};

/**
 * Calculate the final price after applying all discounts in order,
 * respecting the maximum combined discount cap from config.
 *
 * Agent buyer discount (if enabled) is applied FIRST and OVERRIDES the
 * referral discount — matching the business rule that agent attribution
 * wins over MLM referral attribution (agents.config.js →
 * overrideRules.agentOverridesMLM = true).
 *
 * @param {object} params
 * @param {number} params.basePrice
 * @param {number} [params.referralDiscountPercent=0]
 * @param {number} [params.discountCodePercent=0]
 * @param {number} [params.discountCodeFixed=0]
 * @param {number} [params.creditAmount=0]
 * @param {boolean} [params.isAgentBuyer=false]
 * @returns {object} Detailed discount breakdown
 */
export const calculateCombinedDiscount = ({
  basePrice = 0,
  referralDiscountPercent = 0,
  discountCodePercent = 0,
  discountCodeFixed = 0,
  creditAmount = 0,
  isAgentBuyer = false,
}) => {
  const combinedConfig = getCombinedDiscountConfig();
  const maxPercent = combinedConfig.maxCombinedPercent || 60;

  const breakdown = {
    basePrice,
    agentDiscount: 0,
    referralDiscount: 0,
    discountCodeDiscount: 0,
    creditApplied: 0,
    totalDiscount: 0,
    totalDiscountPercent: 0,
    finalPrice: basePrice,
    wasCapped: false,
    appliedAgentDiscount: false,
    appliedReferral: false,
  };

  let remainingPrice = Math.max(0, basePrice);
  let totalDiscount = 0;

  /*
   * 1. Agent Buyer Discount — applied FIRST when isAgentBuyer is true.
   *    Per agents.config.js → overrideRules.agentOverridesMLM = true,
   *    this discount blocks the referral discount entirely.
   */
  if (isAgentBuyer) {
    const agentDiscountConfig = getAgentBuyerDiscountConfig();
    if (agentDiscountConfig.enabled && agentDiscountConfig.percent > 0) {
      const agentAmount = Math.round(
        remainingPrice * (agentDiscountConfig.percent / 100)
      );
      breakdown.agentDiscount = agentAmount;
      breakdown.appliedAgentDiscount = true;
      remainingPrice -= agentAmount;
      totalDiscount += agentAmount;
    }
  }
  /*
   * 2. Referral Discount — SKIPPED when agent buyer, per override rules.
   */
  else if (referralDiscountPercent > 0) {
    const amount = Math.round(
      remainingPrice * (referralDiscountPercent / 100)
    );
    breakdown.referralDiscount = amount;
    breakdown.appliedReferral = true;
    remainingPrice -= amount;
    totalDiscount += amount;
  }

  /* 3. Discount Code */
  if (discountCodePercent > 0) {
    const amount = Math.round(
      remainingPrice * (discountCodePercent / 100)
    );
    breakdown.discountCodeDiscount = amount;
    remainingPrice -= amount;
    totalDiscount += amount;
  } else if (discountCodeFixed > 0) {
    const amount = Math.min(discountCodeFixed, remainingPrice);
    breakdown.discountCodeDiscount = amount;
    remainingPrice -= amount;
    totalDiscount += amount;
  }

  /* 4. Credit */
  if (creditAmount > 0) {
    const amount = Math.min(creditAmount, remainingPrice);
    breakdown.creditApplied = amount;
    remainingPrice -= amount;
    totalDiscount += amount;
  }

  /* 5. Cap enforcement — proportionally scale if total exceeds max */
  const totalDiscountPercent =
    basePrice > 0 ? Math.round((totalDiscount / basePrice) * 100) : 0;

  if (totalDiscountPercent > maxPercent) {
    breakdown.wasCapped = true;
    const maxDiscountAmount = Math.round(basePrice * (maxPercent / 100));
    const scaleFactor = totalDiscount > 0 ? maxDiscountAmount / totalDiscount : 1;
    breakdown.agentDiscount = Math.round(breakdown.agentDiscount * scaleFactor);
    breakdown.referralDiscount = Math.round(
      breakdown.referralDiscount * scaleFactor
    );
    breakdown.discountCodeDiscount = Math.round(
      breakdown.discountCodeDiscount * scaleFactor
    );
    breakdown.creditApplied = Math.round(
      breakdown.creditApplied * scaleFactor
    );
    totalDiscount = maxDiscountAmount;
    remainingPrice = basePrice - totalDiscount;
  }

  breakdown.totalDiscount = totalDiscount;
  breakdown.finalPrice = Math.max(remainingPrice, 0);
  breakdown.totalDiscountPercent = Math.min(totalDiscountPercent, maxPercent);

  return breakdown;
};

/* ─────────────────────────────────────────────────────────────
 * BACKWARD COMPATIBILITY ALIASES
 * ───────────────────────────────────────────────────────────── */

export const platform = () => getPlatform();
export const i18n = () => getValue('i18n', loadDefaults().i18n);
export const payments = () => getPaymentConfig();