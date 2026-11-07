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


'use strict';

const admin = require('./admin');
const agents = require('./agents');
const auth = require('./auth');
const checkout = require('./checkout');
const checkoutModal = require('./checkoutModal');
const common = require('./common');
const confirmations = require('./confirmations');
const contact = require('./contact');
const courses = require('./courses');
const discounts = require('./discounts');
const landing = require('./landing');
const notifications = require('./notifications');
const phasePurchase = require('./phasePurchase');
const portal = require('./portal');
const pricing = require('./pricing');
const profile = require('./profile');
const referrals = require('./referrals');
const scholarships = require('./scholarships');

module.exports = {
  ...admin,
  ...agents,
  ...auth,
  ...checkout,
  ...checkoutModal,
  ...common,
  ...confirmations,
  ...contact,
  ...courses,
  ...discounts,
  ...landing,
  ...notifications,
  ...phasePurchase,
  ...portal,
  ...pricing,
  ...profile,
  ...referrals,
  ...scholarships,
};