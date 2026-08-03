/**
 * @fileoverview Discount Code System Configuration
 * Controls admin-created promotional discount codes, combined discount
 * stacking logic, rate limiting, and anti-abuse detection.
 * ALL values are configurable — zero hardcoded logic in components.
 * Path: packages/shared/config/discounts.config.js
 */

const discountsConfig = {

  /*
   * Master switch — set to false to disable the entire discount code system
   */
  enabled: true,

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

      /*
       * Minimum length of a discount code
       */
      minLength: 4,

      /*
       * Maximum length of a discount code
       */
      maxLength: 20,

      /*
       * Allowed characters in discount codes
       * Only uppercase letters and numbers by default
       */
      allowedChars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',

      /*
       * Automatically convert entered codes to uppercase
       */
      autoUppercase: true,

      /*
       * Automatically trim whitespace from entered codes
       */
      trimWhitespace: true,
    },

    /*
     * Default values for newly created discount codes
     */
    defaults: {

      /*
       * Default maximum number of times a code can be used
       * 0 = unlimited
       */
      maxTotalUses: 100,

      /*
       * Default maximum number of times a single user can use a code
       * 0 = unlimited
       */
      maxUsesPerUser: 1,

      /*
       * Default minimum purchase amount required to use the code
       * 0 = no minimum
       */
      minPurchaseAmount: 0,
    },

    /*
     * Maximum values admins can set when creating codes
     * Prevents accidental or malicious extreme values
     */
    adminLimits: {

      /*
       * Maximum discount percentage an admin can set
       */
      maxDiscountPercent: 100,

      /*
       * Maximum fixed discount amount in ETB
       */
      maxDiscountFixed: 10000,

      /*
       * Maximum total uses an admin can set
       */
      maxTotalUses: 10000,
    },
  },

  /*
   * Rate limiting configuration
   * Prevents brute-force attacks and abuse
   */
  rateLimiting: {

    /*
     * Per-IP address limits
     */
    perIP: {

      /*
       * Maximum code validation attempts per minute from one IP
       */
      validatePerMinute: 10,

      /*
       * Maximum code application attempts per minute from one IP
       */
      applyPerMinute: 3,

      /*
       * Maximum total discount code uses per day from one IP
       */
      totalPerDay: 20,
    },

    /*
     * Per-user limits
     */
    perUser: {

      /*
       * Maximum code validation attempts per minute for one user
       */
      validatePerMinute: 5,

      /*
       * Maximum code application attempts per minute for one user
       */
      applyPerMinute: 3,
    },
  },

  /*
   * Anti-abuse detection settings
   * Automatically flags and blocks suspicious activity
   */
  antiAbuse: {

    /*
     * Master switch for anti-abuse detection
     */
    enabled: true,

    /*
     * Risk score thresholds
     * Each usage attempt is scored 0-100 based on multiple factors
     */
    riskThresholds: {

      /*
       * Scores 0-20: Normal usage, allow
       */
      normal: 20,

      /*
       * Scores 21-50: Suspicious, allow but log for review
       */
      suspicious: 50,

      /*
       * Scores 51-75: High risk, flag for admin review
       */
      high: 75,

      /*
       * Scores 76-100: Critical, block immediately
       */
      critical: 100,
    },

    /*
     * Actions taken at each risk level
     */
    actions: {

      /*
       * Action for suspicious activity
       */
      suspicious: 'log',

      /*
       * Action for high-risk activity
       */
      high: 'flag_for_review',

      /*
       * Action for critical activity
       */
      critical: 'block_and_notify',
    },

    /*
     * Number of critical flags before a code is automatically disabled
     */
    autoDisableThreshold: 5,
  },

  /*
   * Public discount code listing
   * Optionally show active codes on a public page
   */
  publicListing: {

    /*
     * Whether to show a public list of active discount codes
     */
    enabled: false,

    /*
     * Whether to show available codes on the pricing page
     */
    showOnPricingPage: true,
  },
};

module.exports = discountsConfig;