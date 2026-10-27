/**
 * @fileoverview Payment Configuration
 *
 * Single source of truth for tuition pricing, payment methods, checkout
 * modal behavior, countdown timer, and profile display preferences.
 *
 * Pricing is admin-overridable via the admin_settings table (DB-first).
 * The values here are the fallback defaults.
 *
 * Approval SLA: approval.slaMinutes is consumed by every checkout +
 * pending-message surface that promises an approval time. Change this
 * one value to update the entire platform.
 *
 * Path: packages/shared/config/payments.config.js
 */

const paymentsConfig = {

  /*
   * Pricing structure.
   *
   * fullCourse:           1000 ETB standard price
   * fullCourse.referred:   900 ETB after 10% referral discount
   * perPhase:              500 ETB per individual phase
   */
  pricing: {
    fullCourse: {
      amountETB: 1000,
      originalAmountETB: 1000,
      referredAmountETB: 900,
      referredDiscountPercent: 10,
      currency: 'ETB',
      description: 'Full Academy Access Pass — All 5 Phases',
      descriptionAm: 'ሙሉ የአካዳሚ መዳረሻ — ሁሉም 5ቱ ደረጃዎች',
      savingsLabel: 'Complete curriculum, lifetime access',
      savingsLabelAm: 'ሙሉ ሥርዓተ ትምህርት፣ የዕድሜ ልክ መዳረሻ',
    },
    perPhase: {
      amountETB: 500,
      originalAmountETB: 500,
      currency: 'ETB',
      description: 'Single Phase Access Pass',
      descriptionAm: 'የአንድ ደረጃ መዳረሻ ፓስ',
      minPhases: 1,
      maxPhases: 5,
    },
    bulkDiscounts: [
      { phases: 2, discountPercent: 0 },
      { phases: 3, discountPercent: 0 },
      { phases: 4, discountPercent: 0 },
      { phases: 5, discountPercent: 0 },
    ],
  },

  /*
   * Purchase modes — full course vs individual phases.
   */
  purchaseModes: {
    fullCourse: {
      enabled: true,
      id: 'full-course',
      label: 'Full Course',
      labelAm: 'ሙሉ ኮርስ',
      description: 'All 5 phases — best value',
      descriptionAm: 'ሁሉም 5ቱ ደረጃዎች — ምርጥ ዋጋ',
      icon: 'BookOpen',
      badge: 'Best Value',
      badgeAm: 'ምርጥ ዋጋ',
    },
    individualPhases: {
      enabled: true,
      id: 'individual-phases',
      label: 'Individual Phases',
      labelAm: 'የተለያዩ ደረጃዎች',
      description: 'Pick specific phases you need',
      descriptionAm: 'የሚፈልጉትን ደረጃ ብቻ ይምረጡ',
      icon: 'Layers',
    },
  },

  /*
   * Countdown timer — urgency banner on the pricing page.
   */
  countdownTimer: {
    enabled: true,
    durationMinutes: 15,
    messages: {
      pricingBanner: '⚡ Launch offer expires in {minutes}:{seconds}',
      pricingBannerAm: '⚡ የማስተዋወቂያ ቅናሽ በ {minutes}:{seconds} ያበቃል',
      checkoutBanner: '⏰ Complete payment within {minutes}:{seconds} to secure this price',
      checkoutBannerAm: '⏰ ይህን ዋጋ ለማስጠበቅ ክፍያውን በ {minutes}:{seconds} ውስጥ ያጠናቅቁ',
      expiredText: 'Offer expired',
      expiredTextAm: 'ቅናሹ አልቋል',
    },
    colors: {
      normal: '#f59e0b',
      warning: '#fbbf24',
      danger: '#ef4444',
      expired: '#6b7280',
    },
    warningThresholdPercent: 30,
    dangerThresholdPercent: 10,
  },

  /*
   * Checkout modal — display options.
   */
  checkoutModal: {
    title: 'Complete Your Enrollment',
    titleAm: 'ምዝገባዎን ያጠናቅቁ',
    showPurchaseSummary: true,
    showUpgradeNudge: true,
    upgradeNudgeThresholdPercent: 70,
  },

  /*
   * Profile page configuration.
   */
  profile: {
    avatar: {
      maxSize: 2 * 1024 * 1024,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxWidth: 512,
      maxHeight: 512,
    },
    sections: {
      enrollmentCard: true,
      overallProgress: true,
      phaseProgress: true,
      paymentHistory: true,
      quickActions: true,
      accountSettings: true,
    },
    quickActions: [
      { id: 'portal', label: 'Go to Classroom Portal', labelAm: 'ወደ መማሪያ ክፍል ይሂዱ', href: '/portal', icon: 'BookOpen' },
      { id: 'courses', label: 'Browse Courses', labelAm: 'ኮርሶችን ይመልከቱ', href: '/courses', icon: 'Grid' },
      { id: 'telegram', label: 'Join Telegram Community', labelAm: 'ቴሌግራም ይቀላቀሉ', href: 'https://t.me/AbyssiniaAcademy', icon: 'MessageCircle', external: true },
      { id: 'support', label: 'Contact Support', labelAm: 'ድጋፍ ያግኙ', href: '/support', icon: 'HelpCircle' },
    ],
  },

  /*
   * Payment methods — manual Ethiopian payment rails.
   * Account details are admin-overridable via the DB.
   */
  methods: [
    {
      id: 'telebirr',
      name: 'Telebirr',
      nameAm: 'ቴሌብር',
      icon: '📱',
      accountNumber: '0920944941',
      accountName: 'ATNATEWOS GETASEW SAHILU',
      instructions: 'Send payment to the Telebirr number above and submit the transaction ID',
      instructionsAm: 'ከላይ በተጠቀሰው የቴሌብር ቁጥር ገንዘብ ይላኩ እና የተላከለትን ቁጥር ያስገቡ',
      isActive: true,
    },
    {
      id: 'cbe-birr',
      name: 'CBE Birr',
      nameAm: 'ሲቢኢ ብር',
      icon: '🏦',
      accountNumber: '0920944941',
      accountName: 'ATNATEWOS GETASEW SAHILU',
      instructions: 'Transfer to the CBE Birr account and submit the reference number',
      instructionsAm: 'በሲቢኢ ብር አካውንት ገንዘብ ያስተላልፉ እና የተላከለትን ቁጥር ያስገቡ',
      isActive: true,
    },
    {
      id: 'bank-transfer',
      name: 'Bank Transfer',
      nameAm: 'የባንክ ትራንስፈር',
      icon: '🏛️',
      accountNumber: '1000428407567',
      accountName: 'ATNATEWOS GETASEW SAHILU',
      bankName: 'Commercial Bank of Ethiopia - (CBE)',
      instructions: 'Transfer to the bank account and upload the receipt screenshot',
      instructionsAm: 'በባንክ አካውንት ገንዘብ ያስተላልፉ እና የተከፈለበትን ማስረጃ ፎቶ ያስገቡ',
      isActive: true,
    },
  ],

  /*
   * Approval flow — manual review by admin.
   *
   * slaMinutes is the platform promise for approval time. Consumed by
   * checkout pending messages, i18n templates, and admin SLA displays.
   */
  approval: {
    isManual: true,
    adminReviewRequired: true,
    autoApproveAfterHours: null,
    /* Approval SLA: admin verifies within 15 minutes */
    slaMinutes: 15,
    pendingMessage: 'Your payment is being verified. You will get access within {minutes} minutes after confirmation.',
    pendingMessageAm: 'ክፍያዎ እየተረጋገጠ ነው። ከተረጋገጠ በ{minutes} ደቂቃዎች ውስጥ መዳረሻ ያገኛሉ።',
    approvedMessage: 'Payment approved! Welcome to Abyssinia Academy!',
    approvedMessageAm: 'ክፍያዎ ተቀባይነት አግኝቷል! እንኳን ወደ አቢሲኒያ አካዳሚ በደህና መጡ!',
    rejectedMessage: 'Payment could not be verified. Please contact support.',
    rejectedMessageAm: 'ክፍያዎን ማረጋገጥ አልተቻለም። እባክዎ የደንበኛ ድጋፍ ያግኙ።',
  },

  /*
   * Payment status enum — used by client + server.
   */
  statuses: {
    NONE: 'none',
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
  },

  /*
   * Required fields for payment submission.
   */
  requiredFields: {
    fullName: true,
    phone: true,
    paymentMethod: true,
    transactionRef: true,
    screenshot: false,
  },

  /*
   * Screenshot upload limits.
   */
  screenshotUpload: {
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxWidth: 1920,
    maxHeight: 1920,
  },
};

module.exports = paymentsConfig;