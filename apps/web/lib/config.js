/**
 * @fileoverview Config Bridge
 * Bridges shared package config to Next.js frontend.
 * ALL fallback values sourced from defaults.config.js — zero hardcoded values.
 * Provides typed accessor functions for every config section across the platform.
 * Path: apps/web/lib/config.js
 */

let cachedConfig = null;
let cachedDefaults = null;

/**
 * Load the full shared configuration from packages/shared/config
 * Falls back through multiple require paths for different environments
 * @returns {object|null} Shared config object or null if unavailable
 */
const loadConfig = () => {
  if (cachedConfig !== null) return cachedConfig;

  try {
    cachedConfig = require('../../../packages/shared/config');
  } catch {
    try {
      cachedConfig = require('@shared/config');
    } catch {
      cachedConfig = null;
    }
  }

  return cachedConfig;
};

/**
 * Load the defaults configuration — always available as a safety net
 * @returns {object} Defaults config object
 */
const loadDefaults = () => {
  if (cachedDefaults !== null) return cachedDefaults;

  try {
    cachedDefaults = require('../../../packages/shared/config/defaults.config');
  } catch {

    /*
     * Ultimate hard fallback — minimal structure to prevent crashes
     * This should never be reached if defaults.config.js exists
     */
    cachedDefaults = {
      payments: {
        pricing: { fullCourse: {}, perPhase: {}, bulkDiscounts: [] },
        purchaseModes: {},
        countdownTimer: {},
        checkoutModal: {},
        profile: { avatar: {}, sections: {}, quickActions: [] },
        approval: {},
        screenshotUpload: {},
        methods: [],
      },
      phases: { individuallyPurchasable: true, phases: [] },
      platform: { brand: {}, frontendUrl: '' },
      landing: { hero: {}, heroVisual: {}, stats: [], features: {}, howItWorks: {}, faq: {}, cta: {} },
      i18n: { defaultLanguage: 'en' },
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
  }

  return cachedDefaults;
};

/**
 * Resolve a dot-notation path on an object
 * Example: resolvePath({ a: { b: 'hello' } }, 'a.b') → 'hello'
 * @param {object} obj - The object to traverse
 * @param {string} path - Dot-notation path string
 * @returns {*} Value at the path or undefined
 */
const resolvePath = (obj, path) => {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
};

/**
 * Get a value from config with a fallback chain:
 * Shared Config → Defaults Config → Hard Fallback
 * @param {string} configPath - Dot-notation path to the config value
 * @param {*} finalFallback - Ultimate fallback if nothing else works
 * @returns {*} The resolved value
 */
const getValue = (configPath, finalFallback = null) => {
  const config = loadConfig();
  const defaults = loadDefaults();

  /*
   * Try the shared config first
   */
  if (config) {
    const configValue = resolvePath(config, configPath);
    if (configValue !== undefined && configValue !== null) return configValue;
  }

  /*
   * Try the defaults config next
   */
  const defaultVal = resolvePath(defaults, configPath);
  if (defaultVal !== undefined && defaultVal !== null) return defaultVal;

  /*
   * Final hard fallback
   */
  return finalFallback;
};

/* ================================================================
   GENERAL ACCESSORS
   ================================================================ */

export const getConfig = () => loadConfig() || loadDefaults();
export const getPlatform = () => getValue('platform', {});
export const getPaymentConfig = () => getValue('payments', {});

/* ================================================================
   LANDING PAGE ACCESSORS
   ================================================================ */

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

/* ================================================================
   PAYMENT ACCESSORS
   ================================================================ */

export const getPricing = () => {
  const defaults = loadDefaults();
  return getValue('payments.pricing', defaults.payments.pricing);
};

export const getActivePaymentMethods = () => {
  const paymentConfig = getPaymentConfig();
  const defaults = loadDefaults();
  const allMethods = paymentConfig?.methods || defaults.payments.methods;
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

/* ================================================================
   PHASE PURCHASE ACCESSORS
   ================================================================ */

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
 * All pricing values sourced from config via getPricing() and getBulkDiscounts().
 * Zero hardcoded numbers — everything flows from config files.
 *
 * @param {Array} selectedPhaseIds - Array of phase ID strings
 * @returns {object} Calculated pricing breakdown
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

/* ================================================================
   PROFILE ACCESSORS
   ================================================================ */

/**
 * Get profile configuration
 * @returns {object} Profile config with avatar limits, section visibility, quick actions
 */
export const getProfileConfig = () => {
  const defaults = loadDefaults();
  return getValue('payments.profile', defaults.payments.profile);
};

/**
 * Get avatar upload configuration
 * @returns {object} Avatar upload limits
 */
export const getAvatarConfig = () => {
  const profileConfig = getProfileConfig();
  return profileConfig?.avatar || {
    maxSize: 2 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxWidth: 512,
    maxHeight: 512,
  };
};

/* ================================================================
   REFERRAL SYSTEM ACCESSORS
   ================================================================ */

/**
 * Get the full referral system configuration
 * @returns {object} Referral config with tiers, credit caps, commissions, sharing
 */
export const getReferralConfig = () => {
  const defaults = loadDefaults();
  return getValue('referrals', defaults.referrals);
};

/**
 * Get referral code generation settings
 * @returns {object} Code generation config (length, prefix, charset)
 */
export const getReferralCodeGenConfig = () => {
  const referralConfig = getReferralConfig();
  return referralConfig?.codeGeneration || loadDefaults().referrals.codeGeneration;
};

/**
 * Get referral reward tiers
 * @returns {Array} Array of tier objects sorted by minReferrals
 */
export const getReferralTiers = () => {
  const referralConfig = getReferralConfig();
  return referralConfig?.referrerTiers || loadDefaults().referrals.referrerTiers;
};

/**
 * Get the tier for a given number of successful referrals
 * @param {number} successfulReferrals - Number of completed referrals
 * @returns {object} The matching tier object
 */
export const getReferralTierByCount = (successfulReferrals = 0) => {
  const tiers = getReferralTiers();
  const sorted = [...tiers].sort((a, b) => b.minReferrals - a.minReferrals);
  return sorted.find((tier) => successfulReferrals >= tier.minReferrals) || tiers[0];
};

/**
 * Get referred student discount configuration
 * @returns {object} Discount config (mode, percentages, min/max)
 */
export const getReferredDiscountConfig = () => {
  const referralConfig = getReferralConfig();
  return referralConfig?.referredDiscount || loadDefaults().referrals.referredDiscount;
};

/**
 * Calculate the discount percentage for a referred student
 * based on the referrer's tier
 * @param {number} referrerSuccessfulReferrals - How many referrals the referrer has completed
 * @returns {number} Discount percentage for the referred student
 */
export const calculateReferredDiscount = (referrerSuccessfulReferrals = 0) => {
  const tier = getReferralTierByCount(referrerSuccessfulReferrals);
  const discountConfig = getReferredDiscountConfig();

  let discountPercent = tier.creditPercent;

  if (discountConfig.mode === 'fixed') {
    discountPercent = discountConfig.fixedPercent;
  } else if (discountConfig.mode === 'match_referrer') {
    discountPercent = Math.round(tier.creditPercent * (discountConfig.matchPercent / 100));
  }

  discountPercent = Math.max(discountPercent, discountConfig.minimumDiscount || 5);
  discountPercent = Math.min(discountPercent, discountConfig.maximumDiscount || 40);

  return discountPercent;
};

/**
 * Get credit cap configuration
 * @returns {object} Credit cap config
 */
export const getCreditCapConfig = () => {
  const referralConfig = getReferralConfig();
  return referralConfig?.creditCap || loadDefaults().referrals.creditCap;
};

/**
 * Get commission configuration
 * @returns {object} Commission config
 */
export const getCommissionConfig = () => {
  const referralConfig = getReferralConfig();
  return referralConfig?.commission || loadDefaults().referrals.commission;
};

/**
 * Get sharing platform configuration
 * @returns {Array} Array of sharing platform objects
 */
export const getSharingPlatforms = () => {
  const referralConfig = getReferralConfig();
  return referralConfig?.sharing?.platforms || loadDefaults().referrals.sharing.platforms;
};

/**
 * Get referral dashboard configuration
 * @returns {object} Dashboard display settings
 */
export const getReferralDashboardConfig = () => {
  const referralConfig = getReferralConfig();
  return referralConfig?.dashboard || loadDefaults().referrals.dashboard;
};

/* ================================================================
   DISCOUNT CODE SYSTEM ACCESSORS
   ================================================================ */

/**
 * Get the full discount code system configuration
 * @returns {object} Discount config with combined limits, validation, rate limiting
 */
export const getDiscountConfig = () => {
  const defaults = loadDefaults();
  return getValue('discounts', defaults.discounts);
};

/**
 * Get combined discount stacking configuration
 * @returns {object} Combined discount limits and order
 */
export const getCombinedDiscountConfig = () => {
  const discountConfig = getDiscountConfig();
  return discountConfig?.combinedDiscounts || loadDefaults().discounts.combinedDiscounts;
};

/**
 * Get discount code validation rules
 * @returns {object} Code format validation rules
 */
export const getDiscountCodeValidation = () => {
  const discountConfig = getDiscountConfig();
  return discountConfig?.codes?.codeValidation || loadDefaults().discounts.codes.codeValidation;
};

/**
 * Get rate limiting configuration for discount codes
 * @returns {object} Rate limit settings
 */
export const getDiscountRateLimits = () => {
  const discountConfig = getDiscountConfig();
  return discountConfig?.rateLimiting || loadDefaults().discounts.rateLimiting;
};

/**
 * Get anti-abuse configuration
 * @returns {object} Anti-abuse settings
 */
export const getDiscountAntiAbuseConfig = () => {
  const discountConfig = getDiscountConfig();
  return discountConfig?.antiAbuse || loadDefaults().discounts.antiAbuse;
};

/**
 * Calculate the final price after applying all discounts in order.
 * Respects the maximum combined discount cap from config.
 *
 * @param {object} params
 * @param {number} params.basePrice - Original price before any discounts
 * @param {number} params.referralDiscountPercent - Referral discount percentage (0-100)
 * @param {number} params.discountCodePercent - Discount code percentage (0-100)
 * @param {number} params.discountCodeFixed - Discount code fixed amount in ETB
 * @param {number} params.creditAmount - Credit amount to apply in ETB
 * @returns {object} Detailed discount breakdown with all line items
 */
export const calculateCombinedDiscount = ({
  basePrice = 0,
  referralDiscountPercent = 0,
  discountCodePercent = 0,
  discountCodeFixed = 0,
  creditAmount = 0,
}) => {
  const combinedConfig = getCombinedDiscountConfig();
  const maxPercent = combinedConfig.maxCombinedPercent || 60;
  const order = combinedConfig.applicationOrder || ['referral', 'discount_code', 'credit'];

  let remainingPrice = basePrice;
  let totalDiscount = 0;

  const breakdown = {
    referralDiscount: 0,
    discountCodeDiscount: 0,
    creditApplied: 0,
    finalPrice: basePrice,
    totalDiscountPercent: 0,
    wasCapped: false,
  };

  /*
   * Apply each discount in the configured order.
   * Each subsequent discount is calculated on the remaining price
   * after the previous discount has been applied.
   */
  for (const discountType of order) {

    if (discountType === 'referral' && referralDiscountPercent > 0) {
      const amount = Math.round(remainingPrice * (referralDiscountPercent / 100));
      breakdown.referralDiscount = amount;
      remainingPrice -= amount;
      totalDiscount += amount;
    }

    if (discountType === 'discount_code') {
      if (discountCodePercent > 0) {
        const amount = Math.round(remainingPrice * (discountCodePercent / 100));
        breakdown.discountCodeDiscount = amount;
        remainingPrice -= amount;
        totalDiscount += amount;
      } else if (discountCodeFixed > 0) {
        const amount = Math.min(discountCodeFixed, remainingPrice);
        breakdown.discountCodeDiscount = amount;
        remainingPrice -= amount;
        totalDiscount += amount;
      }
    }

    if (discountType === 'credit' && creditAmount > 0) {
      const amount = Math.min(creditAmount, remainingPrice);
      breakdown.creditApplied = amount;
      remainingPrice -= amount;
      totalDiscount += amount;
    }
  }

  /*
   * Check if the combined discount exceeds the maximum allowed cap.
   * If so, scale all discounts down proportionally to stay within the cap.
   */
  const totalDiscountPercent = basePrice > 0
    ? Math.round((totalDiscount / basePrice) * 100)
    : 0;

  if (totalDiscountPercent > maxPercent) {
    breakdown.wasCapped = true;

    const maxDiscountAmount = Math.round(basePrice * (maxPercent / 100));
    const scaleFactor = totalDiscount > 0
      ? maxDiscountAmount / totalDiscount
      : 1;

    breakdown.referralDiscount = Math.round(breakdown.referralDiscount * scaleFactor);
    breakdown.discountCodeDiscount = Math.round(breakdown.discountCodeDiscount * scaleFactor);
    breakdown.creditApplied = Math.round(breakdown.creditApplied * scaleFactor);

    totalDiscount = maxDiscountAmount;
    remainingPrice = basePrice - totalDiscount;
  }

  breakdown.finalPrice = Math.max(remainingPrice, 0);
  breakdown.totalDiscountPercent = Math.min(totalDiscountPercent, maxPercent);

  return breakdown;
};

/* ================================================================
   BACKWARD COMPATIBILITY ALIASES
   These maintain compatibility with older code that uses the
   original function names. New code should use the full accessors.
   ================================================================ */

export const platform = () => getPlatform();
export const i18n = () => getValue('i18n', loadDefaults().i18n);
export const payments = () => getPaymentConfig();