/**
 * @fileoverview God Mode Configuration
 * 
 * Centralizes all admin God Mode actions, labels, danger levels, and 
 * validation rules. The UI reads this to render buttons; the API reads 
 * this to enforce limits.
 * 
 * Path: packages/shared/config/godmode.config.js
 */

module.exports = {
  enabled: true,

  /* Magic Link settings (Option A — Admin generates a secure URL) */
  impersonation: {
    tokenExpiryMinutes: 5,
    allowSuperadminOnly: true,
  },

  /* Force Password Reset settings */
  passwordReset: {
    tokenExpiryMinutes: 15,
    minLength: 8,
  },

  /* Manual wallet adjustments */
  walletAdjustment: {
    maxPerActionETB: 50000,
    minPerActionETB: -50000, // Allow negative to claw back
    requireReason: true,
    reasonMinLength: 5,
  },

  /* Agent rate override limits */
  agentOverride: {
    maxFixedAmountETB: 10000,
    maxPercentageRate: 50,
    minFixedAmountETB: 100,
    minPercentageRate: 1,
  },

  /* The full catalog of God Mode actions available in the UI */
  actions: {
    impersonate: {
      id: 'impersonate',
      label: 'Impersonate User',
      description: 'Generate a 5-minute magic link to log in as this user.',
      dangerLevel: 'high',
      requiresReason: false,
    },
    forcePasswordReset: {
      id: 'forcePasswordReset',
      label: 'Force Password Reset',
      description: 'Generate a one-time reset link for the user.',
      dangerLevel: 'medium',
      requiresReason: false,
    },
    manualWalletAdjustment: {
      id: 'manualWalletAdjustment',
      label: 'Adjust Wallet Balance',
      description: 'Add or subtract ETB directly from the user\'s wallet.',
      dangerLevel: 'high',
      requiresReason: true,
    },
    agentOverride: {
      id: 'agentOverride',
      label: 'Override Agent Commission',
      description: 'Change the user\'s agent commission rate.',
      dangerLevel: 'medium',
      requiresReason: false,
    },
    manualEnrollment: {
      id: 'manualEnrollment',
      label: 'Manual Enrollment',
      description: 'Grant course access without a payment record.',
      dangerLevel: 'high',
      requiresReason: true,
    },
    banUser: {
      id: 'banUser',
      label: 'Ban User',
      description: 'Suspend the account permanently.',
      dangerLevel: 'critical',
      requiresReason: true,
    },
  },
};