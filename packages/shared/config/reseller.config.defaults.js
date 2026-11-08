/**
 * @fileoverview Reseller System — Default Configuration
 *
 * This file defines SAFE DEFAULTS for every reseller config key. It serves
 * as the immutable base that every other config source (file override, env
 * vars, DB overrides) is merged on top of.
 *
 * Why have a separate defaults file?
 *   - `reseller.config.js` is meant to be edited by humans with intent.
 *   - This file is the safety net: if a key is missing or invalid, we fall
 *     back to a known-good value here.
 *   - This file should NEVER be edited after initial release. It's the
 *     reference point for "what does the system expect."
 *
 * Path: packages/shared/config/reseller.config.defaults.js
 */

const resellerConfigDefaults = {
  /* Master switch: when false, reseller system is completely disabled */
  enabled: true,

  /* ═══════════════════════════════════════════════════════════════════════
   * PRICING
   * ═══════════════════════════════════════════════════════════════════════
   * Every reseller sets their own price. These bounds define the
   * acceptable range.
   */
  pricing: {
    /* What non-reseller buyers pay (when no reseller code is present) */
    defaultRetailPriceETB: 1000,

    /* Lower bound: prevents race-to-the-bottom undercutting */
    minRetailPriceETB: 300,

    /* Upper bound: prevents scam-pricing and legal risk */
    maxRetailPriceETB: 5000,
  },

  /* ═══════════════════════════════════════════════════════════════════════
   * COMMISSION
   * ═══════════════════════════════════════════════════════════════════════
   * How a sale's price is split between platform, reseller, and parent.
   */
  commission: {
    /* Platform's cut of every sale (percentage) */
    platformFeePercent: 30,

    /* Sub-reseller configuration */
    subReseller: {
      /* Master switch for sub-reselling feature */
      enabled: true,

      /*
       * Maximum depth in the reseller tree.
       * 1 = one level of sub-resellers (parent → sub).
       * Larger values enable deeper trees (not recommended; keep at 1).
       */
      maxDepth: 1,

      /* Default share for new sub-resellers (percentage of the reseller pool) */
      defaultSubSharePercent: 30,

      /* Range the parent can choose from */
      minSubSharePercent: 10,
      maxSubSharePercent: 70,

      /* Maximum sub-resellers a parent can have */
      maxSubResellersPerParent: 50,
    },
  },

  /* ═══════════════════════════════════════════════════════════════════════
   * PAYOUT
   * ═══════════════════════════════════════════════════════════════════════
   */
  payout: {
    /* Days before new earnings become withdrawable (fraud protection) */
    lockDays: 7,

    /* Minimum withdrawal amount */
    minimumWithdrawalETB: 500,

    /* Maximum single withdrawal amount */
    maximumWithdrawalETB: 100000,

    /* Allowed withdrawal methods */
    methods: ['telebirr', 'cbe-birr', 'bank-transfer'],
  },

  /* ═══════════════════════════════════════════════════════════════════════
   * CAPS
   * ═══════════════════════════════════════════════════════════════════════
   */
  caps: {
    /* Per-reseller monthly earnings cap */
    maxEarningsPerResellerPerMonthETB: 100000,

    /* Platform-wide monthly reseller payout cap */
    maxPlatformPayoutPerMonthETB: 2000000,
  },

  /* ═══════════════════════════════════════════════════════════════════════
   * REFUNDS
   * ═══════════════════════════════════════════════════════════════════════
   */
  refunds: {
    /* Days after purchase during which a refund is allowed */
    allowedWithinDays: 7,

    /* Who bears the loss: 'split' | 'platform' | 'reseller' */
    lossBearing: 'split',
  },

  /* ═══════════════════════════════════════════════════════════════════════
   * ANTI-FRAUD
   * ═══════════════════════════════════════════════════════════════════════
   */
  antiFraud: {
    blockSelfPurchase: true,
    blockTeamPurchase: true,
    blockSameIpPurchase: true,
    blockSamePhonePurchase: true,
    minAccountAgeDaysForRecruiting: 0,
  },

  /* ═══════════════════════════════════════════════════════════════════════
   * USER EXPERIENCE
   * ═══════════════════════════════════════════════════════════════════════
   */
  ux: {
    showResellerNameAtCheckout: true,
    requireTermsOfService: true,
    termsVersion: '1.0.0',
    showIncomeDisclosure: true,
    showEarningsCalculator: true,
  },

  /* ═══════════════════════════════════════════════════════════════════════
   * ROLLOUT
   * ═══════════════════════════════════════════════════════════════════════
   */
  rollout: {
    openToAll: true,
    subResellingEnabled: true,
    betaInviteOnly: false,
    betaInviteCodes: [],
  },
};

module.exports = resellerConfigDefaults;