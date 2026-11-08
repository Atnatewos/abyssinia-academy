/**
 * @fileoverview Reseller Anti-Fraud Checks
 *
 * Pre-flight validation before a reseller sale is finalized. Each check is
 * individually togglable via config, so admins can adjust strictness without
 * code changes.
 *
 * Checks:
 *   1. Self-purchase    — reseller cannot buy their own course
 *   2. Team purchase    — parent and sub-reseller cannot buy from each other
 *   3. Same IP          — buyer and reseller cannot share IP
 *   4. Same phone       — buyer and reseller cannot share phone number
 *
 * Path: packages/shared/reseller/anti-fraud.js
 */

const { ResellerForbiddenError } = require('./errors');

/**
 * Check 1: Block self-purchase (reseller buying through their own code).
 *
 * @param {string} buyerUserId - UUID of the buyer
 * @param {string} resellerUserId - UUID of the reseller
 * @param {object} config - Merged reseller config
 * @throws {ResellerForbiddenError}
 */
const checkSelfPurchase = (buyerUserId, resellerUserId, config) => {
  if (!config.antiFraud.blockSelfPurchase) return;
  if (buyerUserId === resellerUserId) {
    throw new ResellerForbiddenError(
      'You cannot purchase the course through your own reseller code.',
      'SELF_PURCHASE_FORBIDDEN'
    );
  }
};

/**
 * Check 2: Block team purchases.
 * - A parent cannot buy through their sub-reseller.
 * - A sub-reseller cannot buy through their parent.
 *
 * @param {string} buyerUserId - UUID of the buyer
 * @param {object} resellerProfile - The reseller profile whose code was used
 * @param {object} parentProfile - The reseller's parent profile (or null)
 * @param {object} config - Merged reseller config
 * @throws {ResellerForbiddenError}
 */
const checkTeamPurchase = (buyerUserId, resellerProfile, parentProfile, config) => {
  if (!config.antiFraud.blockTeamPurchase) return;

  /* Buyer is the parent of the reseller */
  if (parentProfile && buyerUserId === parentProfile.user_id) {
    throw new ResellerForbiddenError(
      'You cannot purchase through your sub-reseller.',
      'PARENT_PURCHASE_FORBIDDEN'
    );
  }

  /* Buyer is a sub-reseller of the reseller */
  /* (This requires a query; caller must pass sub-reseller user IDs) */
  /* Handled in caller via a subquery — see docs on processApprovedPayment */
};

/**
 * Check 3: Block same-IP purchases.
 *
 * @param {string|null} buyerIp - Buyer's IP address
 * @param {string|null} resellerLastIp - Reseller's last known IP
 * @param {object} config - Merged reseller config
 * @throws {ResellerForbiddenError}
 */
const checkSameIp = (buyerIp, resellerLastIp, config) => {
  if (!config.antiFraud.blockSameIpPurchase) return;
  if (!buyerIp || !resellerLastIp) return;

  /* Normalize IPv4-mapped IPv6 addresses */
  const normalize = (ip) => (ip || '').replace(/^::ffff:/, '').trim();

  if (normalize(buyerIp) === normalize(resellerLastIp)) {
    throw new ResellerForbiddenError(
      'Suspicious activity detected. Contact support if this is an error.',
      'SAME_IP_FORBIDDEN'
    );
  }
};

/**
 * Check 4: Block same-phone purchases.
 *
 * @param {string|null} buyerPhone - Buyer's phone number
 * @param {string|null} resellerPhone - Reseller's phone number
 * @param {object} config - Merged reseller config
 * @throws {ResellerForbiddenError}
 */
const checkSamePhone = (buyerPhone, resellerPhone, config) => {
  if (!config.antiFraud.blockSamePhonePurchase) return;
  if (!buyerPhone || !resellerPhone) return;

  const normalize = (p) => String(p).replace(/\D/g, '');

  if (normalize(buyerPhone) === normalize(resellerPhone)) {
    throw new ResellerForbiddenError(
      'You cannot use a phone number that matches the reseller.',
      'SAME_PHONE_FORBIDDEN'
    );
  }
};

module.exports = {
  checkSelfPurchase,
  checkTeamPurchase,
  checkSameIp,
  checkSamePhone,
};