/**
 * @fileoverview Referral System Configuration (Money Model v2)
 *
 * Single source of truth for the 4-level MLM business model:
 * commission chain, paying-gated bonuses, caps, withdrawal rules,
 * sharing platforms, and the public earn-stats listing gate.
 *
 * Payout SLA: withdrawal.processingTimeHours is consumed by every
 * landing + dashboard + referral surface that promises a payout time.
 * Change this one value to update the entire platform.
 *
 * Path: packages/shared/config/referrals.config.js
 */
const referralsConfig = {
  enabled: true,
  codeGeneration: {
    length: 8,
    prefix: 'ABY',
    charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    excludeSimilar: true,
  },
  commissionStructure: {
    maxLevels: 4,
    levelAmounts: [300, 150, 100, 50],
    totalPerSale: 500,
    maxTotalPerSaleETB: 500,
    currency: 'ETB',
    unlockDelayDays: 7,
  },
  referredDiscount: {
    percent: 10,
  },
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
    /* Payout SLA: admin processes within 24 hours */
    processingTimeHours: 24,
  },
  registration: {
    showReferralBanner: true,
    autoApplyCode: true,
    allowCodeChange: false,
    cookieDurationDays: 30,
  },
  sharing: {
    shareMessageTemplate:
      '🚀 Join me at {name} and get {discount}% off your enrollment! Learn Full-Stack Web Development: {link}',
    shareMessageTemplateAm:
      '🚀 በ{name} ይቀላቀሉ እና {discount}% ቅናሽ ያግኙ! ፉል-ስታክ ዌብ ዴቨሎፕመንት ይማሩ: {link}',
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
  publicListing: {
    enabled: true,
    topCount: 3,
    minReferralsToShow: 3,
    minTotalPaidETB: 1000,
    cacheSeconds: 300,
    rateLimitPerMinute: 30,
  },
};

module.exports = referralsConfig;