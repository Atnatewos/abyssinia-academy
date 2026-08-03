/**
 * @fileoverview Landing Page Configuration
 * Contains ONLY language-agnostic structured data (icons, URLs, IDs, numbers)
 * All display text lives in i18n translation files (en.config.js, am.config.js, etc.)
 * To add a language: create a new translation file with the same keys — zero config changes
 * Path: packages/shared/config/landing.config.js
 */

const landingConfig = {
  /*
   * Hero Section — Visual structure and links
   * Display text: i18n → landing.hero.*
   */
  hero: {
    badgeIcon: 'Flame',
    highlightedWord: 'ABYSSiNIA',
    cta: {
      exploreCourses: {
        href: '/courses',
        icon: 'ArrowRight',
      },
      unlockAccess: {
        href: '/pricing',
        icon: 'Zap',
      },
    },
  },

  /*
   * Hero Visual Card — Preview image and session list
   * Display text: i18n → landing.heroVisual.*
   */
  heroVisual: {
    filename: 'Abyssinia_Masterclass.jsx',
    previewImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    previewDuration: '45:10',
    sessions: [
      { time: '00:00', isActive: true },
      { time: '14:20', isActive: false },
      { time: '30:15', isActive: false },
    ],
  },

  /*
   * Stats Counter — Each stat has a value (number/string that stays same across languages)
   * Display text: i18n → landing.stats.items[].label
   */
  stats: [
    { value: '5 Phases' },
    { value: '20+ Weeks' },
    { value: '100%' },
  ],

  /*
   * Features Grid — Card structure with icon identifiers
   * Display text: i18n → landing.features.*
   */
  features: {
    cards: [
      { icon: 'Video' },
      { icon: 'Code2' },
      { icon: 'MessageSquare' },
      { icon: 'Award' },
    ],
  },

  /*
   * How It Works — Step structure with step numbers
   * Display text: i18n → landing.howItWorks.*
   */
  howItWorks: {
    steps: [
      { step: '01' },
      { step: '02' },
      { step: '03' },
      { step: '04' },
    ],
  },

  /*
   * FAQ Accordion — Question/answer pairs as translation keys
   * Display text: i18n → landing.faq.items[].*
   */
  faq: {
    totalItems: 4,
  },

  /*
   * CTA Banner — Visual structure and links
   * Display text: i18n → landing.cta.*
   */
  cta: {
    button: {
      href: '/pricing',
    },
  },
};

module.exports = landingConfig;