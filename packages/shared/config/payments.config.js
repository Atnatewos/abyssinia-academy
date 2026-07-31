/**
 * @fileoverview Payment Configuration
 * Controls payment methods, pricing, and manual approval flow
 * Path: packages/shared/config/payments.config.js
 */

const paymentsConfig = {
  // Pricing Structure
  pricing: {
    amountETB: 4999,
    originalAmountETB: 9500,
    amountUSD: 49,
    discountPercentage: 47,
    currency: 'ETB',
    description: 'Full Academy Access Pass - All 5 Phases',
  },

  // Payment Methods Available
  methods: [
    {
      id: 'telebirr',
      name: 'Telebirr',
      nameAm: 'ቴሌብር',
      icon: '📱',
      accountNumber: '0911234567',
      accountName: 'Abyssinia Academy',
      instructions: 'Send payment to the Telebirr number above and submit the transaction ID',
      instructionsAm: 'ከላይ በተጠቀሰው የቴሌብር ቁጥር ገንዘብ ይላኩ እና የተላከለትን ቁጥር ያስገቡ',
      isActive: true,
    },
    {
      id: 'cbe-birr',
      name: 'CBE Birr',
      nameAm: 'ሲቢኢ ብር',
      icon: '🏦',
      accountNumber: '1000123456789',
      accountName: 'Abyssinia Academy',
      instructions: 'Transfer to the CBE Birr account and submit the reference number',
      instructionsAm: 'በሲቢኢ ብር አካውንት ገንዘብ ያስተላልፉ እና የተላከለትን ቁጥር ያስገቡ',
      isActive: true,
    },
    {
      id: 'bank-transfer',
      name: 'Bank Transfer',
      nameAm: 'የባንክ ትራንስፈር',
      icon: '🏛️',
      accountNumber: '1000123456789',
      accountName: 'Abyssinia Academy',
      bankName: 'Commercial Bank of Ethiopia',
      instructions: 'Transfer to the bank account and upload the receipt screenshot',
      instructionsAm: 'በባንክ አካውንት ገንዘብ ያስተላልፉ እና የተከፈለበትን ማስረጃ ፎቶ ያስገቡ',
      isActive: true,
    },
  ],

  // Manual Approval Flow
  approval: {
    isManual: true,
    adminReviewRequired: true,
    autoApproveAfterHours: null, // null = never auto-approve, set number for auto
    pendingMessage: 'Your payment is being verified. You will get access within 24 hours after confirmation.',
    pendingMessageAm: 'ክፍያዎ እየተረጋገጠ ነው። ከተረጋገጠ በ24 ሰዓት ውስጥ መዳረሻ ያገኛሉ።',
    approvedMessage: 'Payment approved! Welcome to Abyssinia Academy!',
    approvedMessageAm: 'ክፍያዎ ተቀባይነት አግኝቷል! እንኳን ወደ አቢሲኒያ አካዳሚ በደህና መጡ!',
    rejectedMessage: 'Payment could not be verified. Please contact support.',
    rejectedMessageAm: 'ክፍያዎን ማረጋገጥ አልተቻለም። እባክዎ የደንበኛ ድጋፍ ያግኙ።',
  },

  // Payment Status Types
  statuses: {
    NONE: 'none',
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
  },

  // Required Fields for Payment Submission
  requiredFields: {
    fullName: true,
    phone: true,
    paymentMethod: true,
    transactionRef: true,
    screenshot: false, // Optional but recommended
  },

  // Screenshot Upload Config
  screenshotUpload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxWidth: 1920,
    maxHeight: 1920,
  },
};

module.exports = paymentsConfig;