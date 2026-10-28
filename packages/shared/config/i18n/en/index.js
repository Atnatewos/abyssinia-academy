/**
 * @fileoverview English Translations — Namespace Aggregator
 *
 * Merges all English translation namespaces into a single object.
 * The public shape matches the legacy en.config.js exactly, so no
 * consumer code needs to change.
 *
 * To add a new namespace:
 *   1. Create the file in this folder (e.g., agents.js)
 *   2. require it below
 *   3. Spread it into the exported object
 *
/**
 * @fileoverview English — i18n Aggregator
 *
 * Path: packages/shared/config/i18n/en/index.js
 */

const common = require('./common');
const landing = require('./landing');
const courses = require('./courses');
const pricing = require('./pricing');
const checkout = require('./checkout');
const checkoutModal = require('./checkoutModal');
const portal = require('./portal');
const profile = require('./profile');
const referrals = require('./referrals');
const discounts = require('./discounts');
const admin = require('./admin');
const agents = require('./agents');
const auth = require('./auth');
const contact = require('./contact');
const notifications = require('./notifications');
const phasePurchase = require('./phasePurchase');
const confirmations = require('./confirmations');

module.exports = {
  ...common,
  ...landing,
  ...courses,
  ...pricing,
  ...checkout,
  ...checkoutModal,
  ...portal,
  ...profile,
  ...referrals,
  ...discounts,
  ...admin,
  ...agents,
  ...auth,
  ...contact,
  ...notifications,
  ...phasePurchase,
  ...confirmations,
};