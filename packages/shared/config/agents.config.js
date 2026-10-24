/**
 * @fileoverview Agent System Configuration (Money Model v2.5)
 *
 * Single source of truth for the agent commission system:
 *   - Default commission type (fixed vs percentage)
 *   - Default commission value (ETB or %)
 *   - Code generation rules
 *   - Override rules (agent vs MLM vs discount)
 *   - Admin limits for commission rates
 *
 * Agent commissions pay INSTANTLY on admin approval — no 7-day lock window.
 * Agent codes OVERRIDE both MLM referral codes and discount codes at checkout.
 *
 * Path: packages/shared/config/agents.config.js
 */
const agentsConfig = {
  enabled: true,

  /* Default commission structure for new agents */
  defaultCommission: {
    type: 'fixed', // 'fixed' | 'percentage'
    value: 500, // ETB for fixed, % for percentage
    currency: 'ETB',
  },

  /* Code generation rules */
  codeGeneration: {
    prefix: 'AGT-',
    length: 12, // Total length including prefix
    charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    excludeSimilar: true,
  },

  /* Override rules — agent code takes priority */
  overrideRules: {
    agentOverridesMLM: true,
    agentOverridesDiscount: true,
    allowBothAgentAndMLM: false, // If false, agent code blocks MLM discount
  },

  /* Admin limits for commission rates */
  adminLimits: {
    maxFixedAmountETB: 10000,
    maxPercentageRate: 50, // 50%
    minFixedAmountETB: 100,
    minPercentageRate: 1,
  },

  /* Commission calculation rules */
  calculation: {
    /* For percentage type: calculate on final amount after discounts? */
    applyAfterDiscounts: false,
    /* For percentage type: round to nearest ETB? */
    roundToNearestETB: true,
  },

  /* Payout rules */
  payout: {
    /* Agent commissions are instantly withdrawable (no lock) */
    lockWindowDays: 0,
    /* Minimum withdrawal amount (shared with MLM) */
    minimumWithdrawalETB: 500,
  },

  /* Dashboard display */
  dashboard: {
    showAgentSection: true,
    showMLMSection: true,
    defaultTab: 'agent', // 'agent' | 'network'
  },
};

module.exports = agentsConfig;