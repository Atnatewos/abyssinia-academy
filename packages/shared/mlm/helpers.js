/**
 * @fileoverview MLM Shared Helpers
 *
 * Pure functions with no database access. Used by the tree builder,
 * commission distributor, and bonus awarder. Kept separate so they can
 * be unit-tested without mocking a database.
 *
 * Path: packages/shared/mlm/helpers.js
 */

/**
 * Format a Date as 'YYYY-MM' for monthly aggregations.
 * Uses UTC to avoid timezone drift across environments.
 *
 * @param {Date} [date=new Date()] - Date to format
 * @returns {string} Month key like '2026-09'
 */
const formatMonthKey = (date = new Date()) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Compute the user's effective commission tier.
 * Reserved for future tiered rates — currently returns tier 1 for all.
 * Kept pure so the model can evolve without touching distribution logic.
 *
 * @returns {{ tier: number, percent: number }}
 */
const computeUserTier = () => {
  return { tier: 1, percent: 0 };
};

/**
 * Determine the next bonus threshold (if any) that should be awarded
 * given the current count and the highest requirement already credited.
 *
 * Uses the DELTA approach: crossing a new threshold credits only the
 * difference to reach the new total. The user's cumulative bonus in
 * a category always equals the highest achieved tier amount.
 *
 * @param {number} currentCount - Current count (referrals or team size)
 * @param {Array<{requirement: number, amountETB: number, name?: string}>} tiers
 * @param {number} lastAwardedRequirement - Highest requirement already credited
 * @returns {{ newRequirement: number, deltaAmount: number, tierName: string }|null}
 */
const selectBonusDelta = (currentCount, tiers, lastAwardedRequirement) => {
  if (!Array.isArray(tiers) || tiers.length === 0) return null;

  /*
   * Find the highest tier the user currently qualifies for.
   * Tiers in config are ordered ascending by requirement.
   */
  let qualifying = null;
  for (const tier of tiers) {
    if (currentCount >= tier.requirement) qualifying = tier;
  }

  if (!qualifying) return null;
  if (qualifying.requirement <= lastAwardedRequirement) return null;

  /*
   * Delta = new tier amount − previously credited amount (0 if none).
   */
  const previousAmount = tiers
    .filter((t) => t.requirement <= lastAwardedRequirement)
    .reduce((max, t) => Math.max(max, t.amountETB), 0);

  const deltaAmount = qualifying.amountETB - previousAmount;

  return {
    newRequirement: qualifying.requirement,
    deltaAmount,
    tierName: qualifying.name || `Requirement ${qualifying.requirement}`,
  };
};

module.exports = {
  formatMonthKey,
  computeUserTier,
  selectBonusDelta,
};