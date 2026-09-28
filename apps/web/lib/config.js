/**
 * @fileoverview Config Bridge
 *
 * Bridges shared package config to Next.js frontend. Provides typed
 * accessor functions for every config section. ALL fallback values are
 * sourced from defaults.config.js — zero hardcoded values in this file.
 *
 * Resolution order for every accessor:
 *   1. Shared config (packages/shared/config)
 *   2. Defaults config (packages/shared/config/defaults.config)
 *   3. Inline hard fallback (last resort)
 *
 * Path: apps/web/lib/config.js
 */

let cachedConfig = null;
let cachedDefaults = null;

/**
 * Load the full shared configuration from packages/shared/config.
 * Falls back through multiple require paths for different environments.
 *
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
 * Load the defaults configuration — always available as a safety net.
 * Every config section gets a fallback shape here so the UI never crashes.
 *
 * @returns {object} Defaults config object
 */
const loadDefaults = () => {
  if (cachedDefaults !== null) return cachedDefaults;

  try {
    cachedDefaults = require('../../../packages/shared/config/defaults.config');
  } catch {
    cachedDefaults = {
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
      landing: { hero: {}, heroVisual: {}, stats: [], features: {}, howItWorks: {}, faq: {}, cta: {} },
      i18n: { defaultLanguage: 'en' },
      referrals: {
        enabled: true,
        codeGeneration: { length: 8, prefix: 'ABY', charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', excludeSimilar: true },
        commissionStructure: {
          maxLevels: 4,
          levelAmounts: [200, 150, 100, 50],
          totalPerSale: 500,
          currency: 'ETB',
          unlockDelayDays: 7,
        },
        referredDiscount: { percent: 10 },
        bonuses: {
          directReferral: { category: 'direct_referral', tiers: [
            { requirement: 5, amountETB: 1000, name: 'Direct Referral — 5' },
            { requirement: 10, amountETB: 2500, name: 'Direct Referral — 10' },
            { requirement: 20, amountETB: 5000, name: 'Direct Referral — 20' },
          ]},
          milestone: { category: 'milestone', tiers: [
            { requirement: 50, amountETB: 10000, name: 'Milestone — 50 Team' },
            { requirement: 100, amountETB: 20000, name: 'Milestone — 100 Team' },
            { requirement: 200, amountETB: 40000, name: 'Milestone — 200 Team' },
          ]},
          rank: { category: 'rank', tiers: [
            { requirement: 50, amountETB: 5000, name: 'Silver' },
            { requirement: 200, amountETB: 15000, name: 'Gold' },
            { requirement: 500, amountETB: 50000, name: 'Platinum' },
          ]},
          teamBonus: { category: 'team_bonus', tiers: [
            { requirement: 50, amountETB: 2500, name: 'Team Growth — 50' },
            { requirement: 100, amountETB: 5000, name: 'Team Growth — 100' },
            { requirement: 200, amountETB: 10000, name: 'Team Growth — 200' },
          ]},
          speedBonus: { category: 'speed_bonus', period: 'monthly', tiers: [
            { requirement: 10, amountETB: 1500, name: 'Speed Bonus — 10/Month' },
          ]},
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
        registration: { showReferralBanner: true, autoApplyCode: true, allowCodeChange: false, cookieDurationDays: 30 },
        sharing: {
          shareMessageTemplate: 'Join me at {name} and learn Full-Stack Web Development! Use my referral link: {link}',
          shareMessageTemplateAm: 'በ{name} ይቀላቀሉ እና ፉል-ስታክ ዌብ ዴቨሎፕመንት ይማሩ! የማጣቀሻ ሊንኬን ይጠቀሙ: {link}',
          platforms: {
            telegram: 'https://t.me/share/url',
            whatsapp: 'https://wa.me',
            facebook: 'https://www.facebook.com/sharer/sharer.php',
          },
        },
        dashboard: {
          showTierProgress: true,
          showEarningsBreakdown: true,
          showReferralHistory: true,
          showHowItWorks: true,
          historyPerPage: 10,
        },
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
 * Resolve a dot-notation path on an object.
 * Example: resolvePath({ a: { b: 'hello' } }, 'a.b') → 'hello'
 *
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
 * Shared Config → Defaults Config → Final Fallback
 *
 * @param {string} configPath - Dot-notation path to the config value
 * @param {*} finalFallback - Ultimate fallback if nothing else works
 * @returns {*} The resolved value
 */
const getValue = (configPath, finalFallback = null) => {
  const config = loadConfig();
  const defaults = loadDefaults();

  if (config) {
    const configValue = resolvePath(config, configPath);
    if (configValue !== undefined && configValue !== null) return configValue;
  }

  const defaultVal = resolvePath(defaults, configPath);
  if (defaultVal !== undefined && defaultVal !== null) return defaultVal;

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
 * All pricing values sourced from config — zero hardcoded numbers.
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

export const getProfileConfig = () => {
  const defaults = loadDefaults();
  return getValue('payments.profile', defaults.payments.profile);
};

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
   PLATFORM ACCESSORS
   ================================================================ */

/**
 * Get platform-level configuration (name, brand, URLs, support).
 *
 * @returns {object} { name, brand, frontendUrl, supportEmail }
 */
export const getPlatformConfig = () => {
  const defaults = loadDefaults();
  return getValue('platform', defaults.platform || {
    name: 'Abyssinia Academy',
    brand: {},
    frontendUrl: '',
    supportEmail: '',
  });
};

/* ================================================================
   REFERRAL SYSTEM ACCESSORS (MLM)
   ================================================================ */

/**
 * Get the full MLM referral configuration.
 *
 * @returns {object} { commissionStructure, referredDiscount, bonuses, caps, withdrawal, ... }
 */
export const getReferralConfig = () => {
  const defaults = loadDefaults();
  return getValue('referrals', defaults.referrals);
};

/**
 * Get referral code generation settings.
 *
 * @returns {object} { length, prefix, charset, excludeSimilar }
 */
export const getReferralCodeGenConfig = () => {
  const referralConfig = getReferralConfig();
  return referralConfig?.codeGeneration || loadDefaults().referrals.codeGeneration;
};

/**
 * Get the 4-level commission structure.
 * Level amounts indexed by depth - 1 (depth 1 → levelAmounts[0]).
 *
 * @returns {object} { maxLevels, levelAmounts, totalPerSale, currency, unlockDelayDays }
 */
export const getCommissionStructure = () => {
  const referralConfig = getReferralConfig();
  const defaults = loadDefaults();
  return (
    referralConfig?.commissionStructure ||
    defaults.referrals?.commissionStructure || {
      maxLevels: 4,
      levelAmounts: [200, 150, 100, 50],
      totalPerSale: 500,
      currency: 'ETB',
      unlockDelayDays: 7,
    }
  );
};

/**
 * Get the 5 bonus categories with their tier ladders.
 *
 * @returns {object} { directReferral, milestone, rank, teamBonus, speedBonus }
 */
export const getBonusConfig = () => {
  const referralConfig = getReferralConfig();
  const defaults = loadDefaults();
  return referralConfig?.bonuses || defaults.referrals?.bonuses || {};
};

/**
 * Get the payout caps.
 *
 * @returns {object} { maxTotalPerSaleETB, maxBonusPerUserPerMonthETB, maxTotalPayoutPerUserPerMonthETB, maxTotalPayoutPlatformPerMonthETB }
 */
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

/**
 * Get the withdrawal rules.
 *
 * @returns {object} { minimumAmountETB, maximumAmountETB, methods, requiresAdminApproval, maxPendingRequests, processingTimeHours }
 */
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
      processingTimeHours: 48,
    }
  );
};

/**
 * Get the flat referred-student discount percentage.
 *
 * @returns {number} Discount percent (e.g., 10)
 */
export const getReferredDiscountPercent = () => {
  const referralConfig = getReferralConfig();
  const defaults = loadDefaults();
  const referred = referralConfig?.referredDiscount || defaults.referrals?.referredDiscount;
  return referred?.percent ?? 10;
};

/**
 * Get sharing platform URLs and message templates.
 * Used by MLMShareSection to build social share links.
 *
 * @returns {object} { shareMessageTemplate, shareMessageTemplateAm, platforms: { telegram, whatsapp, facebook } }
 */
export const getReferralShareConfig = () => {
  const referralConfig = getReferralConfig();
  const defaults = loadDefaults();
  const sharing = referralConfig?.sharing || defaults.referrals?.sharing || {};

  return {
    shareMessageTemplate: sharing.shareMessageTemplate || 'Join me at {name} and learn Full-Stack Web Development! Use my referral link: {link}',
    shareMessageTemplateAm: sharing.shareMessageTemplateAm || 'በ{name} ይቀላቀሉ እና ፉል-ስታክ ዌብ ዴቨሎፕመንት ይማሩ! የማጣቀሻ ሊንኬን ይጠቀሙ: {link}',
    platforms: sharing.platforms || {
      telegram: 'https://t.me/share/url',
      whatsapp: 'https://wa.me',
      facebook: 'https://www.facebook.com/sharer/sharer.php',
    },
  };
};

/**
 * Get sharing platform configuration.
 *
 * @returns {Array} Array of sharing platform objects
 */
export const getSharingPlatforms = () => {
  const referralConfig = getReferralConfig();
  return referralConfig?.sharing?.platforms || loadDefaults().referrals.sharing.platforms;
};

/**
 * Get referral dashboard display settings.
 *
 * @returns {object} Dashboard visibility configuration
 */
export const getReferralDashboardConfig = () => {
  const referralConfig = getReferralConfig();
  return referralConfig?.dashboard || loadDefaults().referrals.dashboard;
};

/* ================================================================
   BACKWARD COMPATIBILITY — LEGACY REFERRAL SYSTEM STUBS
   These exist so legacy components and API routes that reference
   the old single-tier referral system don't crash. They return
   empty/safe defaults. Can be removed once all legacy code is
   migrated to the new MLM system.
   ================================================================ */

/**
 * Legacy stub: returns the old tier ladder (Bronze → Diamond).
 * Used by legacy ReferralTierProgress component and old dashboard API.
 *
 * @returns {Array} Array of legacy tier objects
 */
export const getReferralTiers = () => {
  return [
    {
      name: 'Bronze',
      nameAm: 'ብሮንዝ',
      minReferrals: 0,
      creditPercent: 10,
      color: '#cd7f32',
      icon: 'Medal',
    },
    {
      name: 'Silver',
      nameAm: 'ብር',
      minReferrals: 3,
      creditPercent: 15,
      color: '#c0c0c0',
      icon: 'Award',
    },
    {
      name: 'Gold',
      nameAm: 'ወርቅ',
      minReferrals: 6,
      creditPercent: 20,
      color: '#ffd700',
      icon: 'Trophy',
    },
    {
      name: 'Platinum',
      nameAm: 'ፕላቲነም',
      minReferrals: 11,
      creditPercent: 25,
      color: '#e5e4e2',
      icon: 'Crown',
    },
    {
      name: 'Diamond',
      nameAm: 'አልማዝ',
      minReferrals: 21,
      creditPercent: 30,
      color: '#b9f2ff',
      icon: 'Gem',
    },
  ];
};

/**
 * Legacy stub: finds the tier that matches a given referral count.
 * Used by legacy dashboard API.
 *
 * @param {number} successfulCount - Number of successful referrals
 * @returns {object|null} Matching tier object or null
 */
export const getReferralTierByCount = (successfulCount = 0) => {
  const tiers = getReferralTiers();
  const sorted = [...tiers].sort((a, b) => b.minReferrals - a.minReferrals);
  return sorted.find((tier) => successfulCount >= tier.minReferrals) || tiers[0] || null;
};

/**
 * Legacy stub: returns credit cap configuration.
 *
 * @returns {object} Credit cap configuration
 */
export const getCreditCapConfig = () => {
  return {
    maxPercent: 100,
    overflowToCash: true,
  };
};

/**
 * Legacy stub: returns single-tier commission configuration.
 *
 * @returns {object} Commission configuration
 */
export const getCommissionConfig = () => {
  return {
    percentOfPayment: 20,
    minimumPayout: 500,
    paymentMethods: ['telebirr', 'cbe-birr', 'bank-transfer'],
  };
};

/* ================================================================
   DISCOUNT CODE SYSTEM ACCESSORS
   ================================================================ */

export const getDiscountConfig = () => {
  const defaults = loadDefaults();
  return getValue('discounts', defaults.discounts);
};

export const getCombinedDiscountConfig = () => {
  const discountConfig = getDiscountConfig();
  return discountConfig?.combinedDiscounts || loadDefaults().discounts.combinedDiscounts;
};

export const getDiscountCodeValidation = () => {
  const discountConfig = getDiscountConfig();
  return discountConfig?.codes?.codeValidation || loadDefaults().discounts.codes.codeValidation;
};

export const getDiscountRateLimits = () => {
  const discountConfig = getDiscountConfig();
  return discountConfig?.rateLimiting || loadDefaults().discounts.rateLimiting;
};

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

  const totalDiscountPercent = basePrice > 0
    ? Math.round((totalDiscount / basePrice) * 100)
    : 0;

  if (totalDiscountPercent > maxPercent) {
    breakdown.wasCapped = true;

    const maxDiscountAmount = Math.round(basePrice * (maxPercent / 100));
    const scaleFactor = totalDiscount > 0 ? maxDiscountAmount / totalDiscount : 1;

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
   ================================================================ */

export const platform = () => getPlatform();
export const i18n = () => getValue('i18n', loadDefaults().i18n);
export const payments = () => getPaymentConfig();