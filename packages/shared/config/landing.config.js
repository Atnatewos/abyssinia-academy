/**
 * @fileoverview Landing Page Configuration
 *
 * Language-agnostic structural data for the landing page.
 * Display text lives in i18n modules (en/landing.js, am/landing.js).
 *
 * The earn calculator is a compact cockpit: presets replace per-level
 * chips, the chain strip is opt-in, and the reference rail is tabbed.
 *
 * Path: packages/shared/config/landing.config.js
 */
const landingConfig = {
  hero: {
    badgeIcon: 'Flame',
    earnBadgeIcon: 'Coins',
    highlightedWord: 'ABYSSiNIA',
    cta: {
      exploreCourses: { href: '/courses', icon: 'ArrowRight' },
      unlockAccess: { href: '/pricing', icon: 'Zap' },
      earn: { href: '/#earn', icon: 'ArrowDown' },
    },
    incomeChips: [
      { amountKey: 'level1Rate', labelKey: 'incomeChipLevel1', position: 'top-left' },
      { amountKey: 'directBonus5', labelKey: 'incomeChip5Directs', position: 'top-right' },
      { amountKey: 'payoutHours', labelKey: 'incomeChipPayout', position: 'bottom-right' },
    ],
  },

  heroVisual: {
    filename: 'Abyssinia_Masterclass.tsx',
    previewImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    previewDuration: '45:10',
    showIncomeChips: false,
    sessions: [
      { time: '00:00', isActive: true },
      { time: '14:20', isActive: false },
      { time: '30:15', isActive: false },
    ],
  },

  stats: [
    { value: '5 Phases' },
    { value: '20+ Weeks' },
    { value: '100%' },
    { source: 'referrals.totalPerSale' },
    { source: 'referrals.processingTimeHours' },
  ],

  features: {
    cards: [
      { icon: 'Video' },
      { icon: 'Code2' },
      { icon: 'MessageSquare' },
      { icon: 'Award' },
    ],
  },

  howItWorks: {
    steps: [
      { step: '01' },
      { step: '02' },
      { step: '03' },
      { step: '04' },
      { step: '05' },
    ],
  },

  faq: {
    totalItems: 9,
  },

  cta: {
    button: { href: '/pricing' },
    earnButton: { href: '/#earn' },
  },

  incomeBand: {
    enabled: true,
    anchorId: 'income-opportunity',
    cards: [
      { icon: 'Coins', amountKey: 'totalPerSale', unitSuffix: 'ETB', copyKey: 'card1' },
      { icon: 'TrendingUp', amountKey: 'maxMilestoneBonus', unitSuffix: 'ETB', copyKey: 'card2' },
      { icon: 'Zap', amountKey: 'payoutHours', unitSuffix: 'h', copyKey: 'card3' },
    ],
  },

  earn: {
    enabled: true,
    anchorId: 'earn',
    stepIcons: ['BookOpen', 'Share2', 'Wallet'],
    trustIcons: ['ShoppingCart', 'ShieldCheck', 'BarChart3', 'UserX'],
    cta: {
      authed: '/profile/referrals',
      guest: '/auth/register',
    },
    calculator: {
      step: 1,
      maxSliderLevel: 100,
      sanityCeiling: 10000,
      defaultLevelCounts: [5, 10, 20, 20],
      showChainStrip: false,
      detailsOpenByDefault: true,
      presets: [
        { key: 'starter', levels: [5, 5, 5, 5] },
        { key: 'builder', levels: [10, 20, 20, 20] },
        { key: 'pro', levels: [25, 50, 50, 50] },
        { key: 'army', levels: [100, 200, 200, 200] },
      ],
    },
    rail: {
      payoutStepIcons: ['ShoppingBag', 'Lock', 'CircleDollarSign'],
      tabs: ['ladder', 'next', 'payouts'],
      defaultTab: 'next',
    },
  },

  socialProof: {
    enabled: true,
    topCount: 3,
  },

  trustRules: {
    payoutIcon: 'Banknote',
  },

  discussionVideos: [
    { youtubeId: 'https://www.youtube.com/watch?v=vx4tXeIBTNY', title: 'ለ2030 እንዴት እንዘጋጅ? - EPS I', duration: '02:42:00', thumbnail: '' },
    { youtubeId: 'https://www.youtube.com/watch?v=baLf033SUkg', title: '2030 በAI ላለመተካት እንዴት እንዘጅ? - EPS II', duration: '02:12:16', thumbnail: '' },
    { youtubeId: 'https://www.youtube.com/watch?v=jRU0VJXJdZg', title: 'ከየት ጀምር? 99%ቱ ተመልካች ማለፍ ተው ቴ', duration: '13:28', thumbnail: '' },
    { youtubeId: 'https://www.youtube.com/watch?v=atnhAVi3cOc', title: 'Coding ግን ለ አይከደኝም?', duration: '11:48', thumbnail: '' },
  ],
};

module.exports = landingConfig;