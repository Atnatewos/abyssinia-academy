/**
 * @fileoverview English — Agent System Namespace
 *
 * Contains all UI copy for the agent commission system:
 *   - Agent dashboard labels
 *   - Agent share section
 *   - Agent commission table
 *   - Agent stats cards
 *   - Agent code input (checkout)
 *   - Admin agent management
 *
 * All copy is config-driven — no hardcoded strings in JSX components.
 *
 * Path: packages/shared/config/i18n/en/agents.js
 */
module.exports = {
  agents: {
    /* Dashboard */
    dashboardTitle: 'Agent Dashboard',
    dashboardSubtitle: 'Earn instant commissions on every sale you drive.',
    yourAgentCode: 'Your Agent Code',
    yourAgentLink: 'Your Agent Link',
    instantPayout: 'Instant Payout',
    instantPayoutDesc: 'No waiting period — commissions are available immediately.',

    /* Stats */
    totalAgentSales: 'Total Agent Sales',
    totalAgentEarned: 'Total Agent Earned',
    agentCommissionRate: 'Commission Rate',
    pendingAgentCommissions: 'Pending Commissions',

    /* Share section */
    shareTitle: 'Share Your Agent Link',
    shareSubtitle: 'Earn instant commissions when friends purchase through your link.',
    copyCode: 'Copy code',
    copyLink: 'Copy link',
    copied: 'Copied to clipboard',
    copyFailed: 'Failed to copy',

    /* Commission table */
    commissionHistory: 'Agent Commission History',
    allCommissions: 'All',
    date: 'Date',
    source: 'From',
    type: 'Type',
    amount: 'Amount',
    status: 'Status',
    paid: 'Paid',
    reversed: 'Reversed',
    empty: 'No agent commissions yet. Share your link to start earning!',
    page: 'Page',

    /* Commission types */
    fixedCommission: '{amount} ETB per sale',
    percentageCommission: '{percent}% per sale',

    /* Agent code input (checkout) */
    haveAgentCode: 'Have an agent code?',
    enterAgentCode: 'Enter Agent Code',
    agentCodeApplied: 'Agent code applied: {code}',
    agentDiscount: 'Agent Discount',
    invalidAgentCode: 'Invalid agent code.',
    selfAgentCode: 'You cannot use your own agent code.',
    agentCodeAlreadyUsed: 'This agent code has already been used for your account.',
    agentOverridesMLM: 'Agent code overrides referral discount.',
    agentOverridesDiscount: 'Agent code overrides promotional discount.',

    /* Admin */
    adminTitle: 'Agent Management',
    adminSubtitle: 'Configure agent commission rates and view performance.',
    adminCommissionType: 'Commission Type',
    adminCommissionValue: 'Commission Value',
    adminFixed: 'Fixed (ETB)',
    adminPercentage: 'Percentage (%)',
    adminSave: 'Save Agent Settings',
    adminSaved: 'Agent settings saved successfully.',
    adminSaveFailed: 'Failed to save agent settings.',
    adminActiveAgents: 'Active Agents',
    adminTotalAgentCommissions: 'Total Agent Commissions Paid',
    adminAgentPerformance: 'Agent Performance',

    /* How it works */
    howItWorks: 'How Agent Commissions Work',
    step1Title: 'Share Your Agent Link',
    step1Desc: 'Copy your unique agent link and share it with friends.',
    step2Title: 'They Purchase',
    step2Desc: 'When someone buys through your link, the sale is attributed to you.',
    step3Title: 'Instant Commission',
    step3Desc: 'Once admin approves the payment, your commission is immediately available.',
    step4Title: 'Withdraw Anytime',
    step4Desc: 'No lock period — withdraw your earnings whenever you want.',

    /* Errors */
    loadError: 'Failed to load agent dashboard.',
    loadCommissionsError: 'Failed to load agent commissions.',
    validateError: 'Failed to validate agent code.',
  },
};