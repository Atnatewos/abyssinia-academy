/**
 * @fileoverview Pricing Utilities
 * Payment calculations and formatting
 * Path: packages/shared/utils/pricing.js
 */

const { payments } = require('../config/payments.config');

/**
 * Get current pricing info
 * @returns {object} Pricing details
 */
const getPricing = () => {
  return {
    amountETB: payments.pricing.amountETB,
    originalAmountETB: payments.pricing.originalAmountETB,
    amountUSD: payments.pricing.amountUSD,
    discountPercentage: payments.pricing.discountPercentage,
    savings: payments.pricing.originalAmountETB - payments.pricing.amountETB,
  };
};

/**
 * Get active payment methods
 * @returns {Array} Active payment methods
 */
const getActivePaymentMethods = () => {
  return payments.methods.filter((method) => method.isActive);
};

/**
 * Get payment method by ID
 * @param {string} id - Payment method ID
 * @returns {object|null} Payment method
 */
const getPaymentMethodById = (id) => {
  return payments.methods.find((method) => method.id === id) || null;
};

module.exports = {
  getPricing,
  getActivePaymentMethods,
  getPaymentMethodById,
};