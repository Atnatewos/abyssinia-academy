/**
 * @fileoverview English Translations — Namespace Aggregator
 *
 * Merges all English translation namespaces into a single object.
 * The public shape matches the legacy en.config.js exactly, so no
 * consumer code needs to change.
 *
 * To add a new namespace:
 *   1. Create the file in this folder (e.g., notifications.js)
 *   2. require it below
 *   3. Spread it into the exported object
 *
 * Path: packages/shared/config/i18n/en/index.js
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