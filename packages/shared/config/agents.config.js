/**
 * @fileoverview Agent System Configuration (Money Model v2.5)
 *
 * Single source of truth for the agent commission system:
 *   - Default commission type (fixed vs percentage)
 *   - Default commission value (ETB or %)
 *   - Code generation rules
 *   - Attribution capture rules (registration → checkout flow)
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
    maxCollisionAttempts: 10,
  },

  /* Attribution capture — how agent codes travel from URL → user → payment */
  attribution: {
    /* Query param name on the /auth/register page (?agent=AGT-XXXX) */
    queryParam: 'agent',

    /* localStorage keys used to persist the code across refreshes */
    storageKey: 'abyssinia_agent_code',
    storageExpiryKey: 'abyssinia_agent_expiry',

    /* How long the localStorage attribution survives (in days) */
    cookieDurationDays: 30,

    /*
     * When true, the pending_agent_id captured at registration is consumed
     * on the first payment submit and cleared from the user row.
     * Prevents double-attribution across multiple purchases.
     */
    consumeOnFirstPayment: true,
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