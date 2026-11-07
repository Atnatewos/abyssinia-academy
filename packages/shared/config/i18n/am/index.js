/**
 * @fileoverview Amharic — i18n Aggregator
 *
 * Path: packages/shared/config/i18n/am/index.js
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