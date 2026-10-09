/**
 * @fileoverview English — Checkout Flow Namespace
 *
 * Template variable {minutes} resolved from payments.approval.slaMinutes —
 * never hardcoded.
 *
 * Path: packages/shared/config/i18n/en/checkout.js
 */

module.exports = {
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
    /* Template variable {minutes} injected from payments config */
    pendingMessage: 'Your payment is being verified. You will get access within {minutes} minutes after confirmation.',
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
};