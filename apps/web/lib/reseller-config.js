/**
 * @fileoverview Reseller Config Bridge
 *
 * Bridges the reseller configuration from packages/shared/config to the
 * Next.js frontend. Uses the same pattern as lib/config.js — shared config
 * first, defaults second, inline fallback third.
 *
 * Path: apps/web/lib/reseller-config.js
 */

let cachedResellerConfig = null;
let cachedAttempted = false;

/**
 * Load the full reseller config from the shared package.
 * Falls back to safe inline defaults if the shared package is unreachable.
 *
 * @returns {object} Reseller config
 */
export const getResellerConfig = () => {
  if (cachedAttempted) return cachedResellerConfig;
  cachedAttempted = true;

  try {
    cachedResellerConfig = require('../../../packages/shared/config/reseller.config');
  } catch {
    try {
      cachedResellerConfig = require('@shared/config/reseller.config');
    } catch {
      cachedResellerConfig = buildResellerFallback();
    }
  }
  return cachedResellerConfig;
};

/**
 * Minimal reseller config fallback. Kept in sync with
 * packages/shared/config/reseller.config.defaults.js.
 *
 * @returns {object}
 */
const buildResellerFallback = () => ({
  enabled: true,
  pricing: {
    defaultRetailPriceETB: 1000,
    minRetailPriceETB: 800,
    maxRetailPriceETB: 5000,
  },
  commission: {
    platformFeePercent: 30,
    subReseller: {
      enabled: true,
      maxDepth: 1,
      defaultSubSharePercent: 30,
      minSubSharePercent: 10,
      maxSubSharePercent: 70,
      maxSubResellersPerParent: 50,
    },
  },
  payout: {
    lockDays: 7,
    minimumWithdrawalETB: 500,
    maximumWithdrawalETB: 100000,
    methods: ['telebirr', 'cbe-birr', 'bank-transfer'],
  },
  ux: {
    showResellerNameAtCheckout: true,
    requireTermsOfService: true,
    termsVersion: '1.0.0',
    showIncomeDisclosure: true,
    showEarningsCalculator: true,
  },
});

/**
 * Shortcut accessor for the reseller system enabled flag.
 *
 * @returns {boolean}
 */
export const isResellerEnabled = () => {
  return getResellerConfig().enabled === true;
};

/**
 * Shortcut accessor for pricing bounds.
 *
 * @returns {{ minPrice: number, maxPrice: number, defaultPrice: number }}
 */
export const getResellerPricingBounds = () => {
  const pricing = getResellerConfig().pricing || {};
  return {
    minPrice: pricing.minRetailPriceETB ?? 800,
    maxPrice: pricing.maxRetailPriceETB ?? 5000,
    defaultPrice: pricing.defaultRetailPriceETB ?? 1000,
  };
};