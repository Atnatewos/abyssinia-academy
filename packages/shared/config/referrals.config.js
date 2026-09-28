/**
 * @fileoverview Referral System Configuration (Money Model v2)
 *
 * Single source of truth for the 4-level MLM business model:
 *   - Commission structure (fixed amounts per level, 7-day unlock)
 *   - Paying-gated bonus categories (registration farms earn nothing)
 *   - Per-user and platform-wide monthly caps
 *   - Withdrawal rules and payout methods
 *
 * All values are read by packages/shared/mlm/* and apps/web/lib/config.js
 * at runtime. Zero hardcoded values anywhere else in the codebase.
 *
 * Path: packages/shared/config/referrals.config.js
 */

const referralsConfig = {
  /* Master switch — false disables distribution and bonus awarding. */
  enabled: true,

  /* Referral code generation settings. */
  codeGeneration: {
    length: 8,
    prefix: 'ABY',
    charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    excludeSimilar: true,
  },

  /*
   * 4-level commission chain: 200 / 150 / 100 / 50 ETB per sale.
   * unlockDelayDays is the shared refund/lock window for commissions
   * AND bonuses (Money Model v2 unified lock).
   */
  commissionStructure: {
    maxLevels: 4,
    levelAmounts: [200, 150, 100, 50],
    totalPerSale: 500,
    maxTotalPerSaleETB: 500,
    currency: 'ETB',
    unlockDelayDays: 7,
  },

  /* Flat percentage discount for referred students. */
  referredDiscount: {
    percent: 10,
  },

  /*
   * Bonus categories — 5 independent families with tier ladders.
   *
   * payingGate (master): when true, eligibility counts only PAYING
   * descendants (approved payment exists). Registration farms earn 0.
   *
   * gate (per category): which paying counter feeds the category:
   *   'paying_direct' → paying_direct_count (depth-1 payers)
   *   'paying_team'   → paying_team_size (depth 2-4 payers)
   */
  bonuses: {
    payingGate: true,

    directReferral: {
      category: 'direct_referral',
      gate: 'paying_direct',
      tiers: [
        { requirement: 5, amountETB: 1000, name: 'Direct Referral — 5' },
        { requirement: 10, amountETB: 2500, name: 'Direct Referral — 10' },
        { requirement: 20, amountETB: 5000, name: 'Direct Referral — 20' },
      ],
    },

    milestone: {
      category: 'milestone',
      gate: 'paying_team',
      tiers: [
        { requirement: 50, amountETB: 10000, name: 'Milestone — 50 Team' },
        { requirement: 100, amountETB: 20000, name: 'Milestone — 100 Team' },
        { requirement: 200, amountETB: 40000, name: 'Milestone — 200 Team' },
      ],
    },

    rank: {
      category: 'rank',
      gate: 'paying_team',
      tiers: [
        { requirement: 50, amountETB: 5000, name: 'Silver' },
        { requirement: 200, amountETB: 15000, name: 'Gold' },
        { requirement: 500, amountETB: 50000, name: 'Platinum' },
      ],
    },

    teamBonus: {
      category: 'team_bonus',
      gate: 'paying_team',
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
      tiers: [
        { requirement: 10, amountETB: 1500, name: 'Speed Bonus — 10/Month' },
      ],
    },
  },

  /* Payout caps enforced by the shared engine. */
  caps: {
    maxTotalPerSaleETB: 500,
    maxBonusPerUserPerMonthETB: 10000,
    maxTotalPayoutPerUserPerMonthETB: 25000,
    maxTotalPayoutPlatformPerMonthETB: 500000,
  },

  /* Withdrawal rules and payout methods. */
  withdrawal: {
    minimumAmountETB: 500,
    maximumAmountETB: 100000,
    methods: ['telebirr', 'cbe-birr', 'bank-transfer'],
    requiresAdminApproval: true,
    maxPendingRequests: 1,
    processingTimeHours: 48,
  },

  /* Registration flow referral-code behavior. */
  registration: {
    showReferralBanner: true,
    autoApplyCode: true,
    allowCodeChange: false,
    cookieDurationDays: 30,
  },

  /*
   * Sharing platforms — base URLs only; query params are appended
   * dynamically by MLMShareSection. Templates support {name},
   * {link}, and {discount} placeholders.
   */
  sharing: {
    shareMessageTemplate:
      '🚀 Join me at {name} and get {discount}% off your enrollment! Learn Full-Stack Web Development: {link}',
    shareMessageTemplateAm:
      '🚀 በ{name} ይላቀሉ እና {discount}% ቅናሽ ያግኙ! ፉል-ስታክ ዌ ዴቨሎፕመንት ይማሩ: {link}',
    platforms: {
      telegram: 'https://t.me/share/url',
      whatsapp: 'https://wa.me',
      facebook: 'https://www.facebook.com/sharer/sharer.php',
    },
  },

  /* Dashboard section visibility toggles. */
  dashboard: {
    showTierProgress: true,
    showEarningsBreakdown: true,
    showReferralHistory: true,
    showHowItWorks: true,
    historyPerPage: 10,
  },
};

module.exports = referralsConfig;