/**
 * @fileoverview English Translations
 * All user-facing English text for the entire Abyssinia Academy platform.
 * Each section is namespaced by feature area — nav, hero, pricing, checkout, etc.
 * To add a new language: copy this file, translate all values, keep keys identical.
 * Path: packages/shared/config/i18n/en.config.js
 */

const en = {

  /*
   * Navigation Bar
   * Labels for the main site navigation header
   */
  nav: {
    overview: 'Overview',
    courses: 'Courses',
    portal: 'Classroom Portal',
    tuition: 'Tuition',
    enrollNow: 'Enroll Now',
    claimDiscount: 'Claim Discount →',
  },

  /*
   * Top Promotional Banner
   * Displayed site-wide above the navigation bar
   */
  banner: {
    text: '🚀 Next Cohort Enrolling! Master Full-Stack Engineering with Masterclasses.',
  },

  /*
   * Hero Section — Landing Page
   * Main headline, badge, subtitle, and call-to-action buttons
   */
  hero: {
    badge: '#1 Pre Recorded videos Masterclass Learning System',
    title: 'Master Full Stack Web Application Development at',
    subtitle: 'A step-by-step 5-phase engineering curriculum. Access high-definition pre-recorded live masterclasses, session breakdowns, raw coding exercises, and production project repositories.',
    exploreCourses: 'Explore Courses',
    unlockAccess: 'Unlock Full Pass',
  },

  /*
   * Stats Counter — Landing Page
   * Horizontal stat bar below the hero section
   */
  stats: {
    phases: '5 Phases',
    phasesSub: 'Structured System',
    weeks: '20+ Weeks',
    weeksSub: 'Live Video Sessions',
    access: '100%',
    accessSub: 'Lifetime YouTube Access',
  },

  /*
   * Courses Section
   * Course catalog, phase drilldown, and related labels
   */
  courses: {
    sectionTitle: 'Academy Catalog',
    heading: 'Industry-Ready Engineering Programs',
    subheading: 'Select a course program to explore its 5 structured learning phases.',
    backToCourses: '← Back to All Courses',
    phasesInCourse: 'Course Roadmap & Phases',
    phasesHeading: '5 Structured Phases to Mastery',
    phasesSubheading: 'Comprehensive phase breakdown designed to take you from core basics to cloud deployment.',
    watchClass: 'Open Classroom',
    unlockVideo: 'Unlock Access',
    freePreview: 'FREE PREVIEW',
    unlistedClass: 'UNLISTED CLASS',
    viewPhases: 'View Course Phases',
    phaseOutcomes: 'Key Learning Focus',
  },

  /*
   * Learning Portal
   * Student classroom interface labels
   */
  portal: {
    title: 'Abyssinia Student Classroom',
    subtitle: 'Pre-recorded Live Sessions & Timestamped Video Player',
    progressLabel: 'Your Learning Progress',
    currentlyPlaying: 'Currently Playing',
    markComplete: 'Mark as Complete',
    completed: 'Completed',
    sessionBreakdown: 'Session Breakdown',
    codeResources: 'Code & Assets',
    instructorNotes: 'Instructor Notes',
    download: 'Download Asset',
    classroomCurriculum: 'Classroom Curriculum',
    lockedTitle: 'This Class is Locked',
    lockedDescription: 'Complete your enrollment to unlock all courses, class recordings, source code repositories, and weekly project feedback.',
  },

  /*
   * Pricing Page
   * Tuition display, purchase mode selection, phase timeline, cart
   */
  pricing: {
    heading: 'Simple & Transparent Tuition',
    subheading: 'Choose the learning path that fits your goals.',
    fullPass: 'Full Academy Access Pass',
    masterclass: 'Full-Stack Software Masterclass',
    instantAccess: 'Instant access to all 5 phases & course modules',
    hdPlaylists: ' HD pre-recorded video masterclasses',
    timestampsNotes: 'Timestamped session breakdowns & lecture notes',
    githubAssets: 'GitHub source code repositories & starter kits',
    telegramCommunity: 'Private Telegram developer mentorship community',
    enrollToday: 'Enroll Today & Start Learning',
    goToPortal: 'Go to Classroom Portal',
    selectPhasesToContinue: 'Select phases to continue',
    selectAtLeastOne: 'Select at least one phase to continue',
    tuitionEyebrow: 'Tuition',
    allPhasesValue: 'All 5 phases',
    completeCurriculum: 'Complete curriculum',
    valueLabel: 'value',
    bestValue: 'Best Value',
    selected: 'Selected',
    selectFullCourse: 'Select Full Course',
    savePercent: 'Save {percent}%',
    objectives: 'objectives',
    weeksUnit: 'weeks',
    phaseLabel: 'Phase',
    orBuildYourOwn: 'Or Build Your Own Path',
    selectIndividualPhases: 'Select individual phases at {price} {currency} each. Bulk discounts applied automatically.',
    customModeActive: 'Custom Mode Active',
    switchToCustom: 'Switch to Custom',
    addToCart: 'Add to Cart — {price} {currency}',
    removeFromCart: 'Remove from Cart',
    prerequisitesRequired: 'Prerequisites Required',
    lockedPrerequisiteMsg: 'Complete {prerequisites} first to unlock this phase.',
    andLabel: ' & Phase ',
    phaseUnit: 'phase',
    phasesUnit: 'phases',
    offLabel: 'off',
    totalLabel: 'Total',
  },

  /*
   * Checkout Flow
   * Payment submission form, validation messages, status display
   */
  checkout: {
    title: 'Enroll in Abyssinia Academy',
    subtitle: 'Pay securely to unlock all courses & course material',
    fullName: 'Full Name',
    phone: 'Phone Number',
    transactionRef: 'Transaction Reference Number',
    paymentMethod: 'Payment Method',
    tuitionFee: 'Tuition Fee',
    verifying: 'Verifying Payment...',
    completeEnrollment: 'Complete Enrollment & Unlock Portal',
    uploadScreenshot: 'Upload Payment Screenshot (Optional)',
    pendingTitle: 'Payment Under Review',
    pendingMessage: 'Your payment is being verified. You will get access within 24 hours after confirmation.',
    approvedTitle: 'Payment Approved!',
    approvedMessage: 'Your payment has been verified. Welcome to Abyssinia Academy!',
    rejectedTitle: 'Payment Not Verified',
    rejectedMessage: 'Your payment could not be verified. Please contact support.',
    noPaymentTitle: 'No Payment Found',
    noPaymentMessage: 'You have not submitted a payment yet.',
    goToPortal: 'Go to Classroom Portal',
    viewPricing: 'View Pricing',
    noPaymentMethods: 'No payment methods available.',
    copyToClipboard: 'Copy to clipboard',
    copied: 'Copied!',
    copy: 'Copy',
    invalidFileType: 'Please upload a JPEG, PNG, or WebP image.',
    fileTooLarge: 'File size must be under {size}MB.',
    fullNameRequired: 'Full name is required.',
    phoneRequired: 'Phone number is required.',
    transactionRefRequired: 'Transaction reference is required.',
    paymentMethodRequired: 'Please select a payment method.',
    clickToUpload: 'Click to upload screenshot',
    uploadHint: 'JPEG, PNG, or WebP (max {size}MB)',
    accountLabel: 'Account',
    bankLabel: 'Bank: {bankName}',
    accountNameLabel: 'Account Name:',
    payVia: 'Pay via {method}',
    purchaseSummaryTitle: 'Purchase',
    purchaseFullCourse: 'Full Course — All 5 Phases',
    purchasePhasesSelected: '{count} phase(s) selected',
  },

  /*
   * Checkout Modal
   * Popup overlay for completing enrollment from the pricing page
   */
  checkoutModal: {
    title: 'Complete Your Enrollment',
    purchaseSummaryTitle: 'What You\'re Buying',
    upgradeNudgeFullCourse: '💡 Get the full course for just {price} ETB — same price, all 5 phases!',
    submitError: 'Payment submission failed. Please try again.',
  },

  /*
   * Authentication
   * Login, register, logout, and related form labels
   */
  auth: {
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email Address',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
  },

  /*
   * Admin Panel
   * Dashboard, payment management, student management
   */
  admin: {
    dashboard: 'Dashboard',
    payments: 'Payments',
    students: 'Students',
    courses: 'Courses',
    settings: 'Settings',
    approve: 'Approve',
    reject: 'Reject',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    totalStudents: 'Total Students',
    totalRevenue: 'Total Revenue',
    pendingPayments: 'Pending Payments',
    viewScreenshot: 'View Screenshot',
    confirmApprove: 'Are you sure you want to approve this payment?',
    confirmReject: 'Are you sure you want to reject this payment?',
  },

  /*
   * Theme Toggle
   * Light/dark mode and language display names
   */
  theme: {
    light: 'Light Mode',
    dark: 'Dark Mode',
    languageName: 'English',
  },

  /*
   * Footer
   * Site-wide footer copyright and info
   */
  footer: {
    rights: 'All rights reserved.',
  },

  /*
   * Landing Page Sections
   * Hero visual card, features grid, how-it-works steps, FAQ, stats, CTA
   */
  landing: {

    /*
     * Hero Visual Card — Floating IDE preview on the landing page
     */
    heroVisual: {
      freePreviewLabel: 'FREE PREVIEW',
      previewDetail: 'Phase 1 · Week 1 · Class 01',
      sessions: [
        '01. Client-Server Architecture Overview',
        '02. HTML5 Semantic Elements Demystified',
        '03. Accessibility (a11y) Best Practices',
      ],
    },

    /*
     * Features Grid — Four key platform feature cards
     */
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

    /*
     * How It Works — Four step process cards
     */
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

    /*
     * FAQ Accordion — Frequently asked questions with answers
     */
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

    /*
     * Stats Counter Labels — Labels for the three stat items
     */
    statsLabels: [
      'Structured System',
      'Live Video Sessions',
      'Lifetime YouTube Access',
    ],

    /*
     * CTA Banner — Bottom enrollment call-to-action
     */
    cta: {
      heading: 'Ready to Start Your Software Career?',
      subtitle: 'Enroll today to unlock all courses, 5 structured phases, downloadable project code repositories, and our private Telegram developer mentorship group.',
      buttonText: 'Enroll Today & Start Learning',
    },
  },
      /*
     * Pricing Overview — Landing page pricing section
     */
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

    /*
     * Phase Timeline — Curriculum roadmap
     */
    phaseTimeline: {
      eyebrow: 'Curriculum',
      title: 'Your Engineering Journey',
      subtitle: '5 phases. Zero to deployed full-stack engineer.',
      classes: 'classes',
      viewDetails: 'View Phase Details',
      enrollCta: 'Enroll in Full Course',
    },

    /*
     * Discussion Videos — Q&A recordings
     */
    discussions: {
      eyebrow: 'Inside the Classroom',
      title: 'Live Discussions & Q&A',
      subtitle: 'Real discussions. Real mentorship. Real community.',
    },

    /*
     * Rewards — Discounts & Referrals
     */
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

  /*
   * Phase Purchase Flow
   * Purchase mode selection, phase selector, cart summary
   */
  phasePurchase: {

    /*
     * Purchase Mode Selection
     */
    selectMode: 'Choose Your Learning Path',
    selectModeSub: 'Buy the full course for maximum savings, or pick individual phases.',

    fullCourseOption: {
      label: 'Full Course',
      description: 'All 5 phases — best value',
    },

    individualPhasesOption: {
      label: 'Individual Phases',
      description: 'Pick specific phases you need',
    },

    /*
     * Phase Selector — Checkbox list with prerequisite validation
     */
    phaseSelector: {
      title: 'Select Phases to Purchase',
      subtitle: 'Choose the phases you want to enroll in. You can always add more later.',
      noPrerequisites: 'No prerequisites',
      requiresLabel: 'Requires',
      prerequisiteLabel: 'Prerequisite',
      selectPhase: 'Select Phase',
      deselectPhase: 'Deselect Phase',
      lockedPhase: 'Locked — select prerequisites first',
    },

    /*
     * Cart Summary — Pricing breakdown with bulk discounts
     */
    cartSummary: {
      phasesSelected: '{count} phase(s) selected',
      baseTotal: 'Subtotal',
      bulkDiscount: 'Bulk Discount ({percent}%)',
      total: 'Total',
      perPhase: 'per phase',
      fullCourseNudge: 'Buy the full course for {price} ETB and save more!',
      fullCourseNudgeShort: 'Full course is only {price} ETB',
    },
  },

  /*
   * Student Profile
   * Profile header, enrollment status, progress, payment history, settings
   */
  profile: {

    /*
     * Profile Header & Tabs
     */
    title: 'My Profile',
    enrolledSince: 'Member since',
    notEnrolled: 'Not Enrolled',
    editProfile: 'Edit Profile',
    changePassword: 'Change Password',
    tabOverview: 'Overview',
    tabEdit: 'Edit Profile',
    tabPassword: 'Change Password',
    tabPayments: 'Payment History',
    tabProgress: 'Learning Progress',

    /*
     * Enrollment Status Card
     */
    enrollmentStatus: 'Enrollment Status',
    enrolled: 'Enrolled',
    notEnrolledStatus: 'You are not currently enrolled in any course.',
    plan: 'Plan',
    fullCourse: 'Full Course',
    individualPhases: '{count} Phase(s)',
    purchasedOn: 'Purchased on',
    accessType: 'Access',
    lifetime: 'Lifetime',

    /*
     * Progress Section
     */
    overallProgress: 'Overall Progress',
    weeksCompleted: '{completed} of {total} weeks completed',
    lessonsCompleted: '{completed} of {total} lessons done',
    phaseProgress: 'Phase Progress',
    completed: 'Completed',
    inProgress: 'In Progress',
    locked: 'Locked',

    /*
     * Payment History
     */
    paymentHistory: 'Payment History',
    noPayments: 'No payment history yet.',
    paymentStatus: 'Status',
    paymentAmount: 'Amount',
    paymentDate: 'Date',
    paymentMethod: 'Method',
    viewAllPayments: 'View All Payments',

    /*
     * Quick Actions
     */
    quickActions: 'Quick Actions',

    /*
     * Account Settings
     */
    accountSettings: 'Account Settings',
    language: 'Language',
    notifications: 'Notification Preferences',
    deleteAccount: 'Delete Account',

    /*
     * Edit Profile Form
     */
    editProfileTitle: 'Edit Profile',
    fullName: 'Full Name',
    phone: 'Phone Number',
    email: 'Email Address',
    uploadAvatar: 'Upload Avatar',
    removeAvatar: 'Remove Avatar',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    profileUpdated: 'Profile updated successfully!',

    /*
     * Change Password Form
     */
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    passwordChanged: 'Password changed successfully!',
    passwordMismatch: 'Passwords do not match.',
    passwordTooShort: 'Password must be at least 8 characters.',

    /*
     * Error Messages
     */
    loadError: 'Failed to load profile. Please try again.',
    updateError: 'Failed to update profile. Please try again.',
  },

    /*
   * Referral System
   * Dashboard, sharing, registration banner, checkout integration
   */
  referrals: {

    /*
     * Referral Dashboard
     */
    dashboardTitle: 'Referral Dashboard',
    dashboardSubtitle: 'Share Abyssinia Academy and earn rewards!',
    yourCode: 'Your Referral Code',
    yourLink: 'Your Referral Link',
    copied: 'Copied!',

    /*
     * Stats Cards
     */
    totalReferrals: 'Total Referrals',
    creditBalance: 'Credit Balance',
    cashEarned: 'Cash Earned',
    currentTier: 'Current Tier',
    perReferral: 'per referral',

    /*
     * Tier Names
     */
    tierBronze: 'Bronze',
    tierSilver: 'Silver',
    tierGold: 'Gold',
    tierPlatinum: 'Platinum',
    tierDiamond: 'Diamond',

    /*
     * Tier Progress
     */
    tierProgress: 'Tier Progress',
    referralsNeeded: '{count} more referral(s) needed for {tier}',
    nextTier: 'Next: {tier}',
    currentTierLabel: 'Current: {tier}',

    /*
     * Earnings Breakdown
     */
    earningsBreakdown: 'Earnings Breakdown',
    creditEarned: 'Credit Earned',
    creditUsed: 'Credit Used',
    availableCredit: 'Available Credit',
    commissionEarned: 'Commission Earned',
    pendingPayout: 'Pending Payout',
    totalValueEarned: 'Total Value Earned',
    creditCapReached: 'Credit cap reached, earning cash commission!',

    /*
     * Referral History
     */
    referralHistory: 'Referral History',
    noReferrals: 'You haven\'t referred anyone yet. Share your link to start earning!',
    name: 'Name',
    status: 'Status',
    discount: 'Discount',
    credit: 'Credit',
    date: 'Date',

    /*
     * Referral Statuses
     */
    statusRegistered: 'Registered',
    statusEnrolled: 'Enrolled',
    statusCompleted: 'Completed',
    statusExpired: 'Expired',
    statusRefunded: 'Refunded',

    /*
     * How It Works
     */
    howItWorks: 'How It Works',
    step1Title: 'Share Your Link',
    step1Desc: 'Copy your unique referral link and share it with friends on Telegram, WhatsApp, or anywhere.',
    step2Title: 'They Register & Enroll',
    step2Desc: 'When someone uses your link to register and completes their enrollment, you earn credit.',
    step3Title: 'Earn Credit',
    step3Desc: 'Accumulate credit toward your own purchases. The more you refer, the higher your tier and rewards.',
    step4Title: 'Earn Cash Commission',
    step4Desc: 'Once your credit reaches 100% of your course price, additional referrals earn you cash commission!',

    /*
     * Registration Banner (for referred users)
     */
    invitedBy: 'You\'ve been invited by {name}!',
    discountApplied: 'You\'ll receive {percent}% off your enrollment.',
    referralCodeApplied: 'Referral code applied: {code}',

    /*
     * Checkout Integration
     */
    referralDiscount: 'Referral Discount ({percent}%)',
    creditApplied: 'Credit Applied',
    applyCredit: 'Apply Credit',
    availableCreditLabel: 'Available: {amount} ETB',
    creditAppliedLabel: 'Credit Applied: {amount} ETB',
    youPay: 'You Pay',
    youSaved: 'You saved {amount} ETB ({percent}% off!)',

    /*
     * Share Section
     */
    shareTitle: 'Share & Earn',
    shareSubtitle: 'Share your link to earn {percent}% credit per referral!',
    shareMessage: '🚀 Join me at Abyssinia Academy and get {discount}% off your enrollment! Learn Full-Stack Web Development: ',
    shareMessageAm: '🚀 በአቢሲኒያ አካዳሚ ይቀላቀሉና {discount}% ቅናሽ ያግኙ! ፉል-ስታክ ዌብ ዴቨሎፕመንት ይማሩ: ',

    /*
     * Share Platform Labels
     */
    shareCopyLink: 'Copy Link',
    shareTelegram: 'Telegram',
    shareWhatsApp: 'WhatsApp',
    shareFacebook: 'Facebook',

    /*
     * Errors
     */
    invalidCode: 'Invalid referral code.',
    selfReferral: 'You cannot use your own referral code.',
    codeAlreadyUsed: 'This referral code has already been used for your account.',
    loadError: 'Failed to load referral data. Please try again.',
  },

    /*
   * Discount Code System
   * Code input, validation messages, checkout integration, admin labels
   */
  discounts: {

    /*
     * Discount Code Input
     */
    enterCode: 'Enter discount code',
    applyCode: 'Apply',
    applyingCode: 'Applying...',
    removeCode: 'Remove',
    codeApplied: 'Code applied!',
    codeRemoved: 'Code removed.',

    /*
     * Validation Messages
     */
    invalidCode: 'Invalid discount code. Please check and try again.',
    codeExpired: 'This discount code has expired.',
    codeNotYetValid: 'This discount code is not yet valid.',
    codeUsageLimitReached: 'This discount code has reached its maximum usage limit.',
    codeAlreadyUsed: 'You have already used this discount code.',
    codePaused: 'This discount code is currently paused.',
    codeDisabled: 'This discount code is no longer active.',
    minPurchaseNotMet: 'Minimum purchase of {amount} ETB required for this code.',
    notEligibleForCourse: 'This code cannot be used for the selected course or phases.',
    firstTimeOnly: 'This code is only available for first-time enrollees.',
    rateLimited: 'Too many attempts. Please wait a moment and try again.',
    suspiciousActivity: 'This action has been flagged for security review.',

    /*
     * Checkout Integration
     */
    discountCodeLabel: 'Discount Code',
    discountCodeLineItem: 'Discount Code ({code})',
    youSave: 'You save',
    availableCodes: 'Available Discount Codes',
    noActiveCodes: 'No active discount codes at this time.',

    /*
     * Admin — Discount Code Management
     */
    adminTitle: 'Discount Codes',
    adminCreate: 'Create Discount Code',
    adminEdit: 'Edit Discount Code',
    adminDelete: 'Delete',
    adminDeleteConfirm: 'Are you sure you want to delete this discount code?',
    adminCode: 'Code',
    adminType: 'Type',
    adminValue: 'Value',
    adminUses: 'Used',
    adminMaxUses: 'Max Uses',
    adminStatus: 'Status',
    adminExpires: 'Expires',
    adminActions: 'Actions',
    adminActive: 'Active',
    adminPaused: 'Paused',
    adminDisabled: 'Disabled',
    adminPercentage: 'Percentage',
    adminFixedAmount: 'Fixed Amount',
    adminUnlimited: 'Unlimited',
    adminNoExpiration: 'Never',
    adminUsageHistory: 'Usage History',
    adminStats: 'Statistics',
    adminTotalCodes: 'Total Codes',
    adminTotalUses: 'Total Uses',
    adminTotalDiscounts: 'Total Discounts Given',
    adminAbuseLog: 'Abuse Log',
    adminAbuseLogEmpty: 'No abuse events recorded.',

    /*
     * Admin — Create/Edit Form
     */
    formCode: 'Discount Code',
    formCodePlaceholder: 'e.g., LAUNCH2026',
    formType: 'Discount Type',
    formValue: 'Discount Value',
    formValuePercent: 'Percentage (%)',
    formValueFixed: 'Amount (ETB)',
    formMaxUses: 'Maximum Total Uses',
    formMaxUsesPerUser: 'Maximum Uses Per User',
    formMinPurchase: 'Minimum Purchase Amount (ETB)',
    formEligibleFor: 'Eligible For',
    formFullCourse: 'Full Course',
    formSpecificPhases: 'Specific Phases',
    formFirstTimeOnly: 'First-Time Enrollees Only',
    formValidFrom: 'Valid From',
    formValidUntil: 'Valid Until',
    formDescription: 'Description (Internal Notes)',
    formStatus: 'Status',
    formSave: 'Save Discount Code',
    formSaving: 'Saving...',
    formCreated: 'Discount code created successfully!',
    formUpdated: 'Discount code updated successfully!',
    formDeleted: 'Discount code deleted successfully.',

    /*
     * Admin — Validation Errors
     */
    codeRequired: 'Discount code is required.',
    codeTooShort: 'Code must be at least {min} characters.',
    codeTooLong: 'Code must be at most {max} characters.',
    codeInvalidChars: 'Code can only contain letters and numbers.',
    valueRequired: 'Discount value is required.',
    valueTooHigh: 'Maximum discount is {max}%.',
    valueTooHighFixed: 'Maximum fixed discount is {max} ETB.',
  },

    /*
   * Contact Page
   */
  contact: {
    title: 'Contact Us',
    subtitle: 'We are here to help. Choose the best way to reach us.',
    telegramTitle: 'Telegram Community',
    telegramDesc: 'Join our private Telegram group for direct mentorship and peer support.',
    faqTitle: 'Frequently Asked Questions',
    faqDesc: 'Find instant answers to common questions about enrollment and courses.',
    coursesTitle: 'Course Information',
    coursesDesc: 'Browse our full course catalog and 5-phase curriculum.',
    directTitle: 'Prefer Direct Contact?',
    directDesc: 'Reach out to our team anytime. We typically respond within a few hours.',
    telegramSupport: 'Telegram Support',
  },

  /*
   * Referral Code Input (Register Page)
   */
  referrals: {
    // ... existing keys ...
    haveReferralCode: 'Have a referral code?',
    enterReferralCode: 'Enter Referral Code',
    // ... rest remains ...
  },

};

module.exports = en;