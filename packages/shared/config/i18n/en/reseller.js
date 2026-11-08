/**
 * @fileoverview Reseller i18n Strings (English)
 *
 * All user-facing strings for the reseller system. Translated versions
 * (am, om, ti) follow the exact same structure — copy this file and
 * translate the values, keeping the keys identical.
 *
 * Naming convention:
 *   - Keys are camelCase
 *   - Nested by feature area (dashboard, price, subResellers, etc.)
 *   - Placeholders use {curlyBraces} for interpolation
 *
 * Path: packages/shared/config/i18n/en/reseller.js
 */

const reseller = {
  /* ═══════════════════════════════════════════════════════════════════════
   * GENERAL
   * ═══════════════════════════════════════════════════════════════════════ */
  title: 'Reseller Dashboard',
  subtitle: 'Sell Abyssinia Academy. Set your price. Keep 70%.',
  loading: 'Loading...',
  saving: 'Saving...',
  saved: 'Saved',
  error: 'Something went wrong. Please try again.',
  retry: 'Retry',
  cancel: 'Cancel',
  confirm: 'Confirm',
  close: 'Close',

  /* ═══════════════════════════════════════════════════════════════════════
   * DASHBOARD TABS
   * ═══════════════════════════════════════════════════════════════════════ */
  tabs: {
    overview: 'Overview',
    sales: 'My Sales',
    subResellers: 'Sub-Resellers',
    withdrawals: 'Withdrawals',
  },

  /* ═══════════════════════════════════════════════════════════════════════
   * STATS CARDS
   * ═══════════════════════════════════════════════════════════════════════ */
  stats: {
    totalEarned: 'Total Earned',
    availableBalance: 'Available Balance',
    lockedAmount: 'Locked (7 days)',
    totalSales: 'Total Sales',
    thisMonth: 'This Month',
    nextUnlock: 'Next Unlock',
    daysRemaining: '{days} days remaining',
  },

  /* ═══════════════════════════════════════════════════════════════════════
   * STORE / PRICE
   * ═══════════════════════════════════════════════════════════════════════ */
  store: {
    title: 'Your Store',
    priceLabel: 'Your Price',
    priceHint: 'Set your own price for the Abyssinia Academy course.',
    priceMin: 'Minimum: {min} ETB',
    priceMax: 'Maximum: {max} ETB',
    priceSaved: 'Price updated successfully.',
    priceError: 'Could not update price. Please try again.',
    earnPerSale: 'You earn {amount} ETB per sale',
    linkLabel: 'Your Reseller Link',
    copyLink: 'Copy Link',
    copied: 'Copied!',
    shareLink: 'Share Link',
  },

  /* ═══════════════════════════════════════════════════════════════════════
   * EARNINGS PREVIEW
   * ═══════════════════════════════════════════════════════════════════════ */
  earnings: {
    title: 'At {price} ETB, you earn:',
    platformFee: 'Platform fee',
    yourShare: 'Your share',
    parentShare: 'Parent share',
    noParentShare: 'You keep the full reseller pool.',
    example: 'Example at {price} ETB sale',
  },

  /* ═══════════════════════════════════════════════════════════════════════
   * SALES
   * ═══════════════════════════════════════════════════════════════════════ */
  sales: {
    title: 'Your Sales',
    empty: 'No sales yet. Share your link to start earning!',
    date: 'Date',
    buyer: 'Buyer',
    price: 'Price',
    yourEarnings: 'You Earned',
    status: 'Status',
    statusPaid: 'Paid',
    statusLocked: 'Locked',
    statusRefunded: 'Refunded',
    statusPending: 'Pending',
    totalSales: 'Total Sales',
    totalEarned: 'Total Earned',
  },

  /* ═══════════════════════════════════════════════════════════════════════
   * SUB-RESELLERS
   * ═══════════════════════════════════════════════════════════════════════ */
  subResellers: {
    title: 'Your Sub-Resellers',
    empty: 'You have no sub-resellers yet.',
    emptyHint: 'Invite someone to sell for you. You decide how much of your share they get.',
    inviteButton: 'Invite Sub-Reseller',
    limitReached: 'You have reached the maximum of {max} sub-resellers.',
    listTitle: 'Your Sub-Resellers',
    youKeep: 'You keep',
    theyEarn: 'They earn',
    statusActive: 'Active',
    statusInactive: 'Inactive',
    statusPending: 'Pending acceptance',
    remove: 'Remove',
    removeConfirm: 'Are you sure you want to remove this sub-reseller? They will no longer be able to sell under you.',
    removed: 'Sub-reseller removed.',
    inviteSent: 'Invitation sent successfully.',
    inviteFailed: 'Could not send invitation. Please try again.',
  },

  /* ═══════════════════════════════════════════════════════════════════════
   * INVITE FORM
   * ═══════════════════════════════════════════════════════════════════════ */
  invite: {
    title: 'Invite a Sub-Reseller',
    intro: 'How much of your earnings will you share with your sub-reseller?',
    explanation: 'Your sub-reseller will earn this % of the reseller pool. You keep the rest.',
    sliderLabel: 'Their share',
    sliderMin: 'Minimum: {min}%',
    sliderMax: 'Maximum: {max}%',
    defaultHint: 'Default: {default}%',
    previewTitle: 'Preview at {price} ETB sale',
    salePrice: 'Sale price',
    platformFee: 'Platform fee',
    resellerPool: 'Reseller pool',
    yourShare: 'Your share',
    theirShare: 'Their share',
    identifierLabel: 'Sub-reseller email or phone',
    identifierPlaceholder: 'Enter email or phone number',
    identifierHint: 'We will send them an invitation link.',
    submitButton: 'Send Invitation',
    success: 'Invitation sent to {identifier}.',
    error: 'Could not send invitation. Please check the identifier and try again.',
  },

  /* ═══════════════════════════════════════════════════════════════════════
   * WITHDRAWALS
   * ═══════════════════════════════════════════════════════════════════════ */
  withdrawals: {
    title: 'Withdrawals',
    requestButton: 'Request Withdrawal',
    available: 'Available to withdraw',
    minimum: 'Minimum withdrawal: {min} ETB',
    amountLabel: 'Amount (ETB)',
    methodLabel: 'Method',
    accountLabel: 'Account number',
    accountNameLabel: 'Account name',
    bankNameLabel: 'Bank name (for bank transfer)',
    submit: 'Submit Request',
    success: 'Withdrawal request submitted. Admin will process shortly.',
    error: 'Could not submit withdrawal. Please try again.',
    pendingNote: 'You already have a pending withdrawal request.',
    debtNote: 'You have an outstanding debt. Contact support.',
    breakdownTitle: 'Balance Breakdown',
    breakdownDirect: 'Direct sales',
    breakdownTeam: 'Team bonuses',
    breakdownMlm: 'MLM commissions',
    breakdownLocked: 'Locked (7 days)',
  },

  /* ═══════════════════════════════════════════════════════════════════════
   * TERMS OF SERVICE
   * ═══════════════════════════════════════════════════════════════════════ */
  terms: {
    title: 'Reseller Terms of Service',
    intro: 'Before you can start selling, please review and accept the reseller terms.',
    acceptButton: 'I Accept the Terms',
    accepted: 'Terms accepted. You can now start selling!',
    error: 'Could not record your acceptance. Please try again.',
    version: 'Version {version}',
    keyPoints: {
      independent: 'You are an independent reseller, not an employee of Abyssinia Academy.',
      accurate: 'You must accurately represent the course and not make false promises.',
      refunds: 'If a customer requests a refund within the allowed window, your earnings will be reversed.',
      platform: 'All sales go through the Abyssinia Academy checkout.',
      noGuarantees: 'You cannot promise guaranteed income, jobs, or specific outcomes.',
    },
  },

  /* ═══════════════════════════════════════════════════════════════════════
   * ONBOARDING
   * ═══════════════════════════════════════════════════════════════════════ */
  onboarding: {
    title: 'Become a Reseller',
    subtitle: 'Set your own price. Share your link. Earn 70% on every sale.',
    step1Title: 'Set your price',
    step1Desc: 'Choose how much to charge. You keep 70% of every sale.',
    step2Title: 'Share your link',
    step2Desc: 'Share your unique reseller link with your network.',
    step3Title: 'Earn 70%',
    step3Desc: 'When someone buys through your link, you earn 70% of the price.',
    step4Title: 'Optional: Invite sub-resellers',
    step4Desc: 'Let others sell for you. You decide how much of your share they get.',
    ctaButton: 'Start Selling',
  },

  /* ═══════════════════════════════════════════════════════════════════════
   * CHECKOUT (buyer-facing)
   * ═══════════════════════════════════════════════════════════════════════ */
  checkout: {
    soldBy: 'Sold by {name}',
    poweredBy: 'Powered by Abyssinia Academy',
    price: 'Price',
  },

  /* ═══════════════════════════════════════════════════════════════════════
   * ERRORS
   * ═══════════════════════════════════════════════════════════════════════ */
  errors: {
    notReseller: 'You are not registered as a reseller.',
    notFound: 'Reseller not found.',
    suspended: 'Your reseller account is suspended. Contact support.',
    priceBelowMin: 'Price is below the minimum allowed.',
    priceAboveMax: 'Price is above the maximum allowed.',
    selfPurchase: 'You cannot buy through your own code.',
    teamPurchase: 'You cannot buy through a team member.',
    sameIp: 'Suspicious activity detected.',
    samePhone: 'Phone number matches the reseller.',
    limitReached: 'You have reached the maximum allowed.',
    capReached: 'You have reached your monthly earnings cap.',
    platformCapReached: 'The platform has reached its monthly payout cap.',
    notParent: 'You are not the parent of this reseller.',
    termsRequired: 'You must accept the terms of service to continue.',
    inviteLimitReached: 'You have reached the maximum number of sub-resellers.',
  },
};

module.exports = reseller;