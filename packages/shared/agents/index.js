/**
 * @fileoverview Shared Agent Module — Entry Point (Money Model v2.5)
 *
 * Database-agnostic agent operations. Consumers inject a `db` object that
 * provides `query(text, params)` and `getClient()`. This lets the same
 * logic run on the Express server and inside Next.js API routes.
 *
 * Key difference from MLM:
 *   - Agent commissions pay INSTANTLY on admin approval (no 7-day lock)
 *   - Agent codes OVERRIDE both MLM referral codes and discount codes
 *   - Commission rates are per-agent (fixed cash OR percentage)
 *
 * Usage:
 *   const agents = require('@shared/agents');
 *   await agents.distributeAgentCommission(db, config, paymentId, agentUserId, buyerUserId, saleAmount);
 *
 * Path: packages/shared/agents/index.js
 */
const {
  calculateAgentCommission,
  distributeAgentCommission,
} = require('./commissions');
const { normalizeAgentCode, toSqlLookupValue } = require('./code-helpers');

module.exports = {
  /* Commissions */
  calculateAgentCommission,
  distributeAgentCommission,

  /* Code helpers */
  normalizeAgentCode,
  toSqlLookupValue,
};
