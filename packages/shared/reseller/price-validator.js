/**
 * @fileoverview Reseller Price Validator
 *
 * Validates prices against the config-defined bounds. All price writes
 * (from the price-editor UI or admin panel) must go through this module.
 *
 * Why centralize validation?
 *   - Single source of truth for price rules
 *   - Prevents "someone forgot to check the ceiling" bugs
 *   - Easy to add new rules (e.g., prevent certain round numbers)
 *
 * Path: packages/shared/reseller/price-validator.js
 */

const { ResellerValidationError } = require('./errors');

/**
 * Validate a proposed retail price against the config bounds.
 *
 * @param {number} price - The proposed price in ETB
 * @param {object} config - The merged reseller config
 * @returns {number} The validated price (normalized to 2 decimal places)
 * @throws {ResellerValidationError} If price is invalid
 */
const validateRetailPrice = (price, config) => {
  if (typeof price !== 'number' && typeof price !== 'string') {
    throw new ResellerValidationError('Price must be a number.', 'INVALID_PRICE_TYPE');
  }

  const numeric = Number(price);

  if (!Number.isFinite(numeric)) {
    throw new ResellerValidationError('Price must be a finite number.', 'INVALID_PRICE');
  }

  if (numeric <= 0) {
    throw new ResellerValidationError('Price must be greater than zero.', 'PRICE_NOT_POSITIVE');
  }

  const { minRetailPriceETB, maxRetailPriceETB } = config.pricing;

  if (numeric < minRetailPriceETB) {
    throw new ResellerValidationError(
      `Price must be at least ${minRetailPriceETB} ETB.`,
      'PRICE_BELOW_MIN'
    );
  }

  if (numeric > maxRetailPriceETB) {
    throw new ResellerValidationError(
      `Price must be at most ${maxRetailPriceETB} ETB.`,
      'PRICE_ABOVE_MAX'
    );
  }

  /* Round to 2 decimal places (financial precision) */
  return Math.round(numeric * 100) / 100;
};

/**
 * Compute the platform fee and reseller pool for a given price.
 * Pure function; safe for unit tests.
 *
 * @param {number} retailPrice - The validated retail price
 * @param {object} config - The merged reseller config
 * @returns {{ platformFee: number, resellerPool: number, platformFeePercent: number }}
 */
const computePriceSplit = (retailPrice, config) => {
  const platformFeePercent = config.commission.platformFeePercent;
  const platformFee = Math.round(retailPrice * (platformFeePercent / 100) * 100) / 100;
  const resellerPool = Math.round((retailPrice - platformFee) * 100) / 100;

  return { platformFee, resellerPool, platformFeePercent };
};

module.exports = {
  validateRetailPrice,
  computePriceSplit,
};