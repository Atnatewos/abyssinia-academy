/**
 * @fileoverview English — Landing Page Namespace
 *
 * Complete display text for the landing page including the new
 * income-opportunity narrative surfaced in the hero and the
 * income band between hero and pricing.
 *
 * Template variables ({amount}, {total}, {hours}, {percent}, {days}, {count})
 * are resolved at render time from referrals/payments config — never
 * hardcoded into the string.
 *
 * Path: packages/shared/config/i18n/en/landing.js
 */
module.exports = {
  nav: {
    overview: 'Overview',
    courses: 'Courses',
    earn: 'Earn',
    tuition: 'Tuition',
    contact: 'Contact',
    portal: 'Classroom Portal',
    signIn: 'Sign In',
    enroll: 'Enroll Now',
    logout: 'Logout',
    myProfile: 'My Profile',
    referralDashboard: 'Referral Dashboard',
  },
  hero: {
    badge: 'Pre-Recorded Video Masterclass Learning System',
    earnBadge: '💰 Learn & Earn - Get Paid While You Study',
    title: 'Master Full Stack Web Application Development at',
    subtitle: 'A step-by-step 5-phase engineering curriculum. Access high-definition pre-recorded live masterclasses, session breakdowns, raw coding exercises, and production project repositories.',
    /* Income-focused subline: numbers injected from referrals config */
    incomeSubline:
      'Every approved sale in your network pays you up to {total} ETB across 4 levels — cash out via Telebirr in {hours}h.',
    exploreCourses: 'Explore Courses',
    unlockAccess: 'Unlock Full Pass',
    earnCta: 'See How You Earn',
    /* Labels for the floating chips over the IDE card. {amount} is injected. */
    incomeChipLevel1: '+{amount} ETB · Level 1',
    incomeChip5Directs: '+{amount} ETB · 5 directs',
    incomeChipPayout: '{amount}h payout',
  },
  stats: {
    phases: '5 Phases',
    phasesSub: 'Structured System',
    weeks: '20+ Weeks',
    weeksSub: 'Live Video Sessions',
    access: '100%',
    accessSub: 'Lifetime YouTube Access',
  },
  statsLabels: [
    'Structured System',
    'Live Video Sessions',
    'Lifetime YouTube Access',
    'Shared per sale',
    'Payout processing',
  ],
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
      heading: 'Your 5-Step Path to Software Mastery',
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
        {
          title: 'Share & Earn',
          description: 'Invite friends with your personal link — they save on tuition while you earn commissions and bonuses on every approved sale.',
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
          question: 'How do the course materials work?',
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
        {
          question: 'Is this a pyramid scheme?',
          answer: 'No. Commissions are paid only on real, approved course sales — never on recruitment alone. The chain is capped at 4 levels and every payout is bounded by monthly caps.',
        },
        {
          question: 'When can I withdraw my earnings?',
          answer: 'Commissions and bonuses unlock 7 days after the qualifying payment. Once unlocked, request a withdrawal (minimum 500 ETB) and admin processes it within 48 hours via Telebirr, CBE Birr, or bank transfer.',
        },
        {
          question: 'Do I need to be a student to earn?',
          answer: 'Yes. Every referrer is a registered student with a personal code. This keeps the network built on real learners, not empty signups.',
        },
        {
          question: 'What happens if a referred purchase is refunded?',
          answer: 'If a refund occurs inside the 7-day lock window, the related commissions and bonuses are reversed automatically. After unlock, earnings are final.',
        },
        {
          question: 'Does joining the referral program cost anything?',
          answer: 'No. It is free for every enrolled student. Your code is generated automatically the first time you open your Referral Dashboard.',
        },
      ],
    },
    cta: {
      heading: 'Ready to Start Your Software Career?',
      subtitle: 'Enroll today to unlock all courses, 5 structured phases, downloadable project code repositories, and our private Telegram developer mentorship group.',
      buttonText: 'Enroll Today & Start Learning',
      earnButtonText: 'See How You Earn',
    },
    earn: {
      eyebrow: 'Learn & Earn',
      title: 'Your Knowledge Pays. Literally.',
      subtitle: 'Share your link — friends get {percent}% off their enrollment, and you earn real cash on every approved sale.',
      step1Title: 'Learn',
      step1Desc: 'Enroll and master the 5-phase full-stack curriculum.',
      step2Title: 'Share',
      step2Desc: 'Your personal link gives friends an instant tuition discount.',
      step3Title: 'Earn',
      step3Desc: 'Cash out via Telebirr or CBE Birr within {hours} hours of approval.',
      chainTitle: 'When one friend buys, 4 people earn',
      chainYou: 'YOU',
      chainNote: '{total} ETB shared per sale · unlocks in {days} days',
      calcTitle: 'Estimate your earnings',
      calcDirect: 'Direct invites',
      calcTeam: 'Their invites',
      calcBreakdownTitle: 'Commission breakdown',
      calcLevelRow: 'Level {level}',
      calcBonusesTitle: 'Bonuses unlocked',
      calcNoBonuses: 'No bonus tiers reached yet at this size.',
      calcSpeedNote: 'Speed bonus (monthly): up to {amount} ETB if {count} directs pay in one month.',
      calcCommissions: 'Commissions',
      calcBonuses: 'Bonuses',
      calcTotal: 'Total income',
      calcCta: 'Get My Referral Link',
      calcDisclaimer: 'Commissions apply to approved course sales only.',
      calcPresetsTitle: 'Quick presets',
      calcPresetStarter: 'Starter',
      calcPresetBuilder: 'Builder',
      calcPresetPro: 'Pro',
      calcPresetArmy: 'Army',
      calcNetworkChip: 'network: {count}',
      calcDetailsToggle: 'Show full math',
      calcDetailsToggleOpen: 'Hide full math',
      bonusChipsTitle: 'Bonus ladder',
      trustTitle: 'Fair Play. Full Transparency.',
      trust1Title: 'Real sales only',
      trust1Desc: 'Commissions trigger on approved course payments, never on signups.',
      trust2Title: '7-day protection',
      trust2Desc: 'Every earning locks for 7 days — refund-safe by design.',
      trust3Title: 'Monthly caps',
      trust3Desc: 'Per-user and platform-wide limits keep the system sustainable.',
      trust4Title: 'No self-referral',
      trust4Desc: 'One person, one code. Gaming the network is blocked.',
      payoutTitle: 'Payouts',
      payoutNote: 'processed ≤ {hours}h',
      rail: {
        ariaLabel: 'Earnings side panel',
        nextTierTitle: 'Next bonus within reach',
        nextTierEmpty: 'All lifetime bonuses reached — grow your network for speed bonuses.',
        nextTierRemaining: '{n} more',
        payoutTitle: 'How payouts flow',
        payoutStep1: 'Friend enrolls',
        payoutStep1Desc: 'Sale approved via Telebirr, CBE Birr, or bank transfer.',
        payoutStep2: 'Locked {days} days',
        payoutStep2Desc: 'Refund-safe window — reversed automatically if refunded.',
        payoutStep3: 'Cash out',
        payoutStep3Desc: 'Request withdrawal — admin processes within {hours}h.',
      },
    },
    socialProof: {
      paid: 'paid to students',
      referrers: 'active referrers',
      refs: 'refs',
    },
    /* ── Income Band — 3-card opportunity strip ──
     * Unit labels are resolved per card; titles/descriptions use
     * {amount} placeholders injected from referrals config.
     */
    income: {
      eyebrow: 'The Opportunity',
      title: 'Your Education Is An Income Stream',
      subtitle: 'From the moment you enroll, the platform pays you for every friend you bring in — while you study.',
      card1Title: 'Earn per sale',
      card1Desc: 'Every approved course sale pays up to {amount} ETB, split across your 4-level network.',
      card1Unit: 'per approved sale',
      card2Title: 'Stack bonuses',
      card2Desc: 'Hit milestones, climb ranks, grow your team — earn up to {amount} ETB per milestone bonus.',
      card2Unit: 'top milestone bonus',
      card3Title: 'Cash out fast',
      card3Desc: 'Withdraw unlocked earnings to Telebirr or CBE Birr in {amount}h — admin-verified, no middlemen.',
      card3Unit: 'payout processing',
      cta: 'See the Full Earnings Engine',
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
    referralHint: "Have a friend's code? Save {percent}% at checkout.",
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
    subtitle: 'Your tuition drops and your income rises — every time someone joins through your link.',
    discountTitle: 'Instant Discounts',
    discountDesc: 'Apply promo codes at checkout for instant savings on your enrollment.',
    discountCta: 'Learn More',
    referralTitle: 'Cash Referrals',
    referralDesc: 'Share your link — friends save {percent}%, you earn real ETB on every approved sale.',
    referralCta: 'Start Earning',
    commissionTitle: '4-Level Commissions',
    commissionDesc: 'Earn up to {amount} ETB shared across 4 levels on every course sale in your network.',
    commissionCta: 'View Tiers',
  },
};