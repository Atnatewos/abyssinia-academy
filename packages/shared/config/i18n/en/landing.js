/**
 * @fileoverview English — Landing Page Namespace
 * Hero, stats, features, how-it-works, FAQ, CTA, pricing overview,
 * phase timeline, discussions, rewards.
 * Path: packages/shared/config/i18n/en/landing.js
 */

module.exports = {
  hero: {
    badge: 'Pre Recorded videos Masterclass Learning System',
    title: 'Master Full Stack Web Application Development at',
    subtitle: 'A step-by-step 5-phase engineering curriculum. Access high-definition pre-recorded live masterclasses, session breakdowns, raw coding exercises, and production project repositories.',
    exploreCourses: 'Explore Courses',
    unlockAccess: 'Unlock Full Pass',
  },

  stats: {
    phases: '5 Phases',
    phasesSub: 'Structured System',
    weeks: '20+ Weeks',
    weeksSub: 'Live Video Sessions',
    access: '100%',
    accessSub: 'Lifetime YouTube Access',
  },

  landing: {
    heroVisual: {
      freePreviewLabel: 'FREE PREVIEW',
      previewDetail: 'Phase 1 · Week 1 · Class 01',
      sessions: [
        '01. Client-Server Architecture Overview',
        '02. HTML5 Semantic Elements Demystified',
        '03. Accessibility (a11y) Best Practices',
      ],
    },

    features: {
      sectionTag: 'Why Abyssinia Academy?',
      heading: 'Designed for Practical Software Engineering',
      subtitle: 'Everything you need to transform from zero coding knowledge into a job-ready full-stack engineer.',
      cards: [
        {
          title: 'HD Video Sessions',
          description: 'Stream crisp HD pre-recorded live coding sessions anytime. Rewind, speed up, or rewatch complex topics at your own pace.',
        },
        {
          title: 'Real Code Repositories',
          description: 'Access GitHub repositories for every single week, including boilerplate setups, solution branches, and assignment starters.',
        },
        {
          title: 'Private Mentorship Community',
          description: 'Connect directly with instructors and fellow engineering peers in our private Telegram technical discussion group.',
        },
        {
          title: 'Verified Skill Certification',
          description: 'Earn an official Abyssinia Academy Engineering Certificate upon successful completion and review of your 5-phase capstone project.',
        },
      ],
    },

    howItWorks: {
      sectionTag: 'How It Works',
      heading: 'Your 4-Step Path to Software Mastery',
      steps: [
        {
          title: 'Register & Pay Tuition',
          description: 'Choose your preferred local payment method (Telebirr, CBE Birr, Bank Transfer) and complete enrollment in 60 seconds.',
        },
        {
          title: 'Unlock Course Classroom',
          description: 'Gain instant access to the course materials & masterclasses, timestamped breakdowns, and structured study notes.',
        },
        {
          title: 'Build Weekly Projects',
          description: 'Follow raw coding demonstrations, download starter assets, and build portfolio-grade projects week by week.',
        },
        {
          title: 'Graduate & Launch Career',
          description: 'Deploy your full-stack capstone project to cloud servers, showcase your GitHub portfolio, and land global software jobs.',
        },
      ],
    },

    faq: {
      sectionTag: 'Got Questions?',
      heading: 'Frequently Asked Questions',
      items: [
        {
          question: 'Do I need prior programming experience to enroll?',
          answer: 'No! Phase 1 starts from total scratch—covering web mechanics, HTML5, CSS3 layout architecture, and Git basics step-by-step.',
        },
        {
          question: 'How do The course materials work?',
          answer: 'Once enrolled, your student account unlocks our private video portal embed links. You can stream high-definition recorded live sessions 24/7 on any desktop or mobile device.',
        },
        {
          question: 'How can we pay?',
          answer: 'We accept Telebirr, CBE Birr, and Bank Transfer. Please provide a screenshot of your payment confirmation or transaction number. Once we have verified your payment, you will receive full access to the course.',
        },
        {
          question: 'How long do I have access to the learning portal?',
          answer: 'You receive lifetime access! You can review past recorded sessions, download code templates, and access future course updates at no extra charge.',
        },
      ],
    },

    statsLabels: [
      'Structured System',
      'Live Video Sessions',
      'Lifetime YouTube Access',
    ],

    cta: {
      heading: 'Ready to Start Your Software Career?',
      subtitle: 'Enroll today to unlock all courses, 5 structured phases, downloadable project code repositories, and our private Telegram developer mentorship group.',
      buttonText: 'Enroll Today & Start Learning',
    },
  },

  pricingOverview: {
    eyebrow: 'Tuition',
    title: 'Simple, Transparent Pricing',
    subtitle: 'One price. Lifetime access. No hidden fees.',
    bestValue: 'BEST VALUE',
    fullCourseTitle: 'Full Academy Pass',
    perPhaseTitle: 'Build Your Own Path',
    perPhase: 'phase',
    savePercent: 'Save {percent}%',
    featureAllPhases: 'All 5 structured phases',
    featureLifetime: 'Lifetime access',
    featureCertificate: 'Completion certificate',
    featureCommunity: 'Private Telegram community',
    enrollCta: 'Enroll Now',
    browsePhases: 'Browse Phases',
    bulkDiscounts: 'Bulk Discounts',
    phases: 'phases',
    off: 'off',
  },

  phaseTimeline: {
    eyebrow: 'Curriculum',
    title: 'Your Engineering Journey',
    subtitle: '5 phases. Zero to deployed full-stack engineer.',
    classes: 'classes',
    viewDetails: 'View Phase Details',
    enrollCta: 'Enroll in Full Course',
  },

  discussions: {
    eyebrow: 'Inside the Classroom',
    title: 'Live Discussions & Q&A',
    subtitle: 'Real discussions. Real mentorship. Real community.',
  },

  rewards: {
    eyebrow: 'Save & Earn',
    title: 'Save More, Earn More',
    subtitle: 'Multiple ways to reduce your tuition and earn rewards.',
    discountTitle: 'Discount Codes',
    discountDesc: 'Apply promo codes at checkout for instant savings on your enrollment.',
    discountCta: 'Learn More',
    referralTitle: 'Referral Rewards',
    referralDesc: 'Share your link, friends get {percent}% off, you earn credit toward your courses.',
    referralCta: 'Start Referring',
    commissionTitle: 'Cash Commission',
    commissionDesc: 'Earn real cash when your referrals exceed your course price.',
    commissionCta: 'View Tiers',
  },
};