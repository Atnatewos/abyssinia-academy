/**
 * @fileoverview Shared Pricing Engine
 * 
 * Single source of truth for price and discount calculations across
 * Next.js API routes, frontend components, and backend services.
 * 
 * Handles stacking order, agent buyer overrides, and rounding.
 * 
 * Path: packages/shared/utils/pricing.js
 */
const discountsConfig = require('../config/discounts.config');

/**
 * Calculate combined discounts including referral, discount codes, agent
 * buyer discount, and MLM credits.
 *
 * @param {object} params
 * @param {number} params.basePrice - Original price before any discounts
 * @param {number} [params.referralDiscountPercent=0] - MLM referral % (usually 10)
 * @param {number} [params.discountCodePercent=0] - Promo code %
 * @param {number} [params.discountCodeFixed=0] - Promo code flat amount
 * @param {number} [params.creditAmount=0] - Bonus credits applied
 * @param {boolean} [params.isAgentBuyer=false] - True if user registered via agent link
 * @returns {object} Detailed discount breakdown
 */
const calculateCombinedDiscount = ({
  basePrice = 0,
  referralDiscountPercent = 0,
  discountCodePercent = 0,
  discountCodeFixed = 0,
  creditAmount = 0,
  isAgentBuyer = false,
}) => {
  let currentPrice = Math.max(0, basePrice);
  const breakdown = {
    basePrice,
    agentDiscount: 0,
    referralDiscount: 0,
    discountCodeDiscount: 0,
    creditDiscount: 0,
    totalDiscount: 0,
    totalDiscountPercent: 0,
    finalPrice: basePrice,
    appliedAgentDiscount: false,
    appliedReferral: false,
  };

  const agentConfig = discountsConfig.agentBuyerDiscount;

  /* 1. Agent Buyer Discount (e.g., 10% off, overrides referral) */
  if (isAgentBuyer && agentConfig?.enabled) {
    const agentDiscountAmount = Math.round(currentPrice * (agentConfig.percent / 100));
    breakdown.agentDiscount = agentDiscountAmount;
    breakdown.appliedAgentDiscount = true;
    currentPrice -= agentDiscountAmount;
  } 
  /* 2. Standard Referral Discount (e.g., 10% off) */
  else if (referralDiscountPercent > 0) {
    const refDiscount = Math.round(currentPrice * (referralDiscountPercent / 100));
    breakdown.referralDiscount = refDiscount;
    breakdown.appliedReferral = true;
    currentPrice -= refDiscount;
  }

  /* 3. Promo Code */
  if (discountCodePercent > 0) {
    const codeDiscount = Math.round(currentPrice * (discountCodePercent / 100));
    breakdown.discountCodeDiscount = codeDiscount;
    currentPrice -= codeDiscount;
  } else if (discountCodeFixed > 0) {
    const codeDiscount = Math.min(currentPrice, discountCodeFixed);
    breakdown.discountCodeDiscount = codeDiscount;
    currentPrice -= codeDiscount;
  }

  /* 4. MLM Credit */
  if (creditAmount > 0) {
    const creditDiscount = Math.min(currentPrice, creditAmount);
    breakdown.creditDiscount = creditDiscount;
    currentPrice -= creditDiscount;
  }

  /* 5. Final caps and summary */
  const totalDiscountAmount = basePrice - currentPrice;
  breakdown.totalDiscount = totalDiscountAmount;
  breakdown.totalDiscountPercent = basePrice > 0 ? Math.round((totalDiscountAmount / basePrice) * 100) : 0;
  breakdown.finalPrice = Math.max(0, currentPrice);

  return breakdown;
};

module.exports = {
  calculateCombinedDiscount,
};