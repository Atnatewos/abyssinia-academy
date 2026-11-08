/**
 * @fileoverview Reseller Shared Module — Public API
 *
 * Entry point for all reseller business logic. Consumers (Express services,
 * Next.js API routes, backfill scripts) import from this file rather than
 * reaching into internal modules.
 *
 * Path: packages/shared/reseller/index.js
 */

const errors = require('./errors');
const { loadResellerConfig } = require('./config-loader');
const { validateRetailPrice, computePriceSplit } = require('./price-validator');
const {
  checkSelfPurchase,
  checkTeamPurchase,
  checkSameIp,
  checkSamePhone,
} = require('./anti-fraud');
const {
  generateResellerCode,
  generateUniqueResellerCode,
  ensureResellerProfile,
  findByUserId,
  findByCode,
  getParentProfile,
  countSubResellers,
  updatePrice,
  updateSubShare,
} = require('./profile-helpers');
const { computeSplit, recordSale } = require('./commissions');
const {
  currentMonthKey,
  getMonthlyEarnings,
  getPlatformMonthlyPayout,
  checkCaps,
} = require('./caps');
const {
  processApprovedPayment,
  processResellerPayment,
  determineRoute,
  lockPayment,
} = require('./orchestrator');
const {
  reverseResellerSale,
  reverseResellerSaleTx,
  debitWallet,
} = require('./refunds');

module.exports = {
  /* Errors */
  ...errors,

  /* Config */
  loadResellerConfig,

  /* Price */
  validateRetailPrice,
  computePriceSplit,

  /* Anti-fraud */
  checkSelfPurchase,
  checkTeamPurchase,
  checkSameIp,
  checkSamePhone,

  /* Profile */
  generateResellerCode,
  generateUniqueResellerCode,
  ensureResellerProfile,
  findByUserId,
  findByCode,
  getParentProfile,
  countSubResellers,
  updatePrice,
  updateSubShare,

  /* Commissions */
  computeSplit,
  recordSale,

  /* Caps */
  currentMonthKey,
  getMonthlyEarnings,
  getPlatformMonthlyPayout,
  checkCaps,

  /* Orchestrator */
  processApprovedPayment,
  processResellerPayment,
  determineRoute,
  lockPayment,

  /* Refunds */
  reverseResellerSale,
  reverseResellerSaleTx,
  debitWallet,
};