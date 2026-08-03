/**
 * @fileoverview Referral System Configuration
 * Controls the entire referral program — tiers, credit caps, commissions,
 * sharing options, registration flow, and dashboard settings.
 * ALL values are configurable — zero hardcoded logic in components.
 * Path: packages/shared/config/referrals.config.js
 */

const referralsConfig = {

  /*
   * Master switch — set to false to disable the entire referral system
   */
  enabled: true,

  /*
   * Referral code generation settings
   * Codes are generated automatically when a user registers
   */
  codeGeneration: {

    /*
     * Number of characters in the generated referral code
     */
    length: 8,

    /*
     * Optional prefix prepended to all codes
     * Example: 'ABY' + random chars = 'ABY3XK9M'
     * Set to empty string '' for no prefix
     */
    prefix: 'ABY',

    /*
     * Character set used to generate random codes
     * Excludes easily confused characters if excludeSimilar is true
     */
    charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',

    /*
     * Exclude characters that look similar across fonts
     * 0 (zero) vs O (letter), 1 vs I vs L, etc.
     */
    excludeSimilar: true,
  },

  /*
   * Referral reward tiers
   * Determines what percentage the referrer earns per successful referral
   * Higher tiers = higher credit percentage
   * The referred student's discount can match the referrer's tier
   */
  referrerTiers: [

    {
      name: 'Bronze',
      nameAm: 'ብሮንዝ',
      minReferrals: 1,
      maxReferrals: 2,
      creditPercent: 10,
      color: '#cd7f32',
      icon: 'Medal',
    },

    {
      name: 'Silver',
      nameAm: 'ብር',
      minReferrals: 3,
      maxReferrals: 5,
      creditPercent: 15,
      color: '#c0c0c0',
      icon: 'Medal',
    },

    {
      name: 'Gold',
      nameAm: 'ወርቅ',
      minReferrals: 6,
      maxReferrals: 10,
      creditPercent: 20,
      color: '#ffd700',
      icon: 'Trophy',
    },

    {
      name: 'Platinum',
      nameAm: 'ፕላቲነም',
      minReferrals: 11,
      maxReferrals: 20,
      creditPercent: 25,
      color: '#e5e4e2',
      icon: 'Crown',
    },

    {
      name: 'Diamond',
      nameAm: 'አልማዝ',
      minReferrals: 21,
      maxReferrals: 999,
      creditPercent: 30,
      color: '#b9f2ff',
      icon: 'Gem',
    },
  ],

  /*
   * Credit cap configuration
   * Controls what happens when a referrer's accumulated credit
   * reaches or exceeds their course price
   */
  creditCap: {

    /*
     * Maximum percentage of the referrer's course price
     * that can be accumulated as credit
     * 100 = can earn up to full course price in credit
     */
    maxPercent: 100,

    /*
     * What happens after the credit cap is reached:
     * 'commission' = additional referrals earn cash commission
     * 'stop' = no more rewards after cap
     */
    behavior: 'commission',
  },

  /*
   * Commission settings
   * Cash payout earned when credit cap is exceeded
   */
  commission: {

    /*
     * Whether cash commission is enabled
     */
    enabled: true,

    /*
     * Percentage of the referred student's payment
     * that the referrer earns as cash commission
     * 20 = 20% of the referred student's payment
     */
    percentOfPayment: 20,

    /*
     * Minimum amount in ETB before a payout can be requested
     * Prevents processing very small payouts
     */
    minimumPayout: 500,

    /*
     * Available payout methods for commission
     */
    payoutMethods: ['telebirr', 'cbe-birr', 'bank-transfer'],
  },

  /*
   * Referred student discount
   * Controls what discount the person being referred receives
   */
  referredDiscount: {

    /*
     * How the discount percentage is determined:
     * 'match_referrer' = same percentage as the referrer's tier
     * 'fixed' = always use fixedPercent regardless of referrer tier
     */
    mode: 'match_referrer',

    /*
     * When mode is 'match_referrer', this controls how much of the
     * referrer's tier percentage the referred student gets
     * 100 = same as referrer, 50 = half of referrer's percent
     */
    matchPercent: 100,

    /*
     * When mode is 'fixed', this is the percentage used
     */
    fixedPercent: 10,

    /*
     * Minimum discount a referred student always receives
     * Even if the referrer has a very low tier
     */
    minimumDiscount: 5,

    /*
     * Maximum discount a referred student can receive
     * Prevents excessive discounts for high-tier referrers
     */
    maximumDiscount: 40,
  },

  /*
   * Registration flow settings
   * Controls how the referral code is handled during signup
   */
  registration: {

    /*
     * Show a banner on the registration page
     * "You've been invited by [Name]!"
     */
    showReferralBanner: true,

    /*
     * Automatically fill and lock the referral code field
     * when a ?ref= parameter is in the URL
     */
    autoApplyCode: true,

    /*
     * Allow users to change the referral code during registration
     * false = code is locked once applied from URL
     */
    allowCodeChange: false,

    /*
     * Number of days to remember the referral code in a cookie
     * If someone visits with ?ref=ABY3XK9M and doesn't register immediately,
     * the code is remembered for this many days
     */
    cookieDurationDays: 30,
  },

  /*
   * Sharing options
   * Controls which platforms are available for sharing referral links
   */
  sharing: {

    /*
     * Available sharing platforms
     * Each platform has an icon name (matching lucide-react icons),
     * label in English and Amharic, and a URL template
     * {link} is replaced with the actual referral link
     * {message} is replaced with the share message
     */
    platforms: [
      {
        id: 'copy',
        icon: 'Copy',
        label: 'Copy Link',
        labelAm: 'ሊንክ ቅዳ',
      },
      {
        id: 'telegram',
        icon: 'Send',
        label: 'Telegram',
        labelAm: 'ቴሌግራም',
        url: 'https://t.me/share/url?url={link}&text={message}',
      },
      {
        id: 'whatsapp',
        icon: 'MessageCircle',
        label: 'WhatsApp',
        labelAm: 'ዋትስአፕ',
        url: 'https://wa.me/?text={message}%20{link}',
      },
      {
        id: 'facebook',
        icon: 'Facebook',
        label: 'Facebook',
        labelAm: 'ፌስቡክ',
        url: 'https://www.facebook.com/sharer/sharer.php?u={link}',
      },
    ],

    /*
     * Default message text when sharing
     * {discount} is replaced with the current discount percentage
     */
    shareMessage: '🚀 Join me at Abyssinia Academy and get {discount}% off your enrollment! Learn Full-Stack Web Development: ',
    shareMessageAm: '🚀 በአቢሲኒያ አካዳሚ ይቀላቀሉና {discount}% ቅናሽ ያግኙ! ፉል-ስታክ ዌብ ዴቨሎፕመንት ይማሩ: ',
  },

  /*
   * Dashboard display settings
   * Controls which sections are visible on the referral dashboard
   */
  dashboard: {

    /*
     * Show the tier progress bar
     */
    showTierProgress: true,

    /*
     * Show the earnings breakdown (credit vs commission)
     */
    showEarningsBreakdown: true,

    /*
     * Show the referral history table
     */
    showReferralHistory: true,

    /*
     * Show the "How It Works" explainer section
     */
    showHowItWorks: true,

    /*
     * Number of referral history items per page
     */
    historyPerPage: 10,
  },
};

module.exports = referralsConfig;