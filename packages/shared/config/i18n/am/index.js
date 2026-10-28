/**
 * @fileoverview Amharic — i18n Aggregator
 *
 * Path: packages/shared/config/i18n/am/index.js
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