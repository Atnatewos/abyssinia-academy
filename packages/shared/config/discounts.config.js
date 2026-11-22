/**
 * @fileoverview Discount Code System Configuration
 * 
 * Controls admin-created promotional discount codes, combined discount
 * stacking logic, rate limiting, anti-abuse detection, and the new
 * automatic agent buyer discount.
 * 
 * ALL values are configurable — zero hardcoded logic in components.
 * 
 * Path: packages/shared/config/discounts.config.js
 */

const discountsConfig = {

  /*
   * Master switch — set to false to disable the entire discount code system
   */
  enabled: true,

  /*
   * Agent Buyer Discount
   * Automatically applied if the user registered via an agent link.
   * If enabled, this overrides the standard referral discount.
   */
  agentBuyerDiscount: {
    enabled: true,
    percent: 10,
    /*
     * When true, users who registered via an agent code get this discount
     * INSTEAD of the MLM referral discount (preventing double-dipping).
     */
    overridesReferral: true,
  },

  /*
   * Combined discount limits
   * Controls how referral discounts, discount codes, and credits
   * stack together and enforces maximum total discount caps
   */
  combinedDiscounts: {

    /*
     * Maximum total discount percentage any student can receive
     * Combines referral discount + discount code + credit
     * 60 = cannot exceed 60% total discount
     * This prevents 100% off scenarios
     */
    maxCombinedPercent: 60,

    /*
     * The order in which discounts are applied
     * Order matters because each subsequent discount is calculated
     * on the remaining amount after previous discounts
     */
    applicationOrder: [
      'referral',
      'discount_code',
      'credit',
    ],

    /*
     * What happens when the combined discount would exceed the cap:
     * 'proportional' = scale all discounts down proportionally
     * 'reduce_last' = reduce only the last applied discount
     * 'block' = reject the transaction entirely
     */
    capBehavior: 'proportional',
  },

  /*
   * Discount code validation rules
   */
  codes: {
    /*
     * Format rules for discount codes
     */
    codeValidation: {
      minLength: 4,
      maxLength: 20,
      allowedChars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      autoUppercase: true,
      trimWhitespace: true,
    },

    /*
     * Default values for newly created discount codes
     */
    defaults: {
      maxTotalUses: 100,
      maxUsesPerUser: 1,
      minPurchaseAmount: 0,
    },

    /*
     * Maximum values admins can set when creating codes
     */
    adminLimits: {
      maxDiscountPercent: 100,
      maxDiscountFixed: 10000,
      maxTotalUses: 10000,
    },
  },

  /*
   * Rate limiting configuration
   * Prevents brute-force attacks and abuse
   */
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

  /*
   * Anti-abuse detection settings
   */
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

  /*
   * Public discount code listing
   */
  publicListing: {
    enabled: false,
    showOnPricingPage: true,
  },
};

module.exports = discountsConfig;