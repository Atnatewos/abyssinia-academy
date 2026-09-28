/**
 * @fileoverview Amharic Translations — Namespace Aggregator
 *
 * Merges all Amharic translation namespaces into a single object.
 * Key structure must mirror en/index.js exactly.
 *
 * Path: packages/shared/config/i18n/am/index.js
 */

const common = require('./common');
const landing = require('./landing');
const courses = require('./courses');
const portal = require('./portal');
const pricing = require('./pricing');
const checkout = require('./checkout');
const checkoutModal = require('./checkoutModal');
const auth = require('./auth');
const admin = require('./admin');
const phasePurchase = require('./phasePurchase');
const profile = require('./profile');
const referrals = require('./referrals');
const discounts = require('./discounts');
const contact = require('./contact');

module.exports = {
  ...common,
  ...landing,
  ...courses,
  ...portal,
  ...pricing,
  ...checkout,
  ...checkoutModal,
  ...auth,
  ...admin,
  ...phasePurchase,
  ...profile,
  ...referrals,
  ...discounts,
  ...contact,
};