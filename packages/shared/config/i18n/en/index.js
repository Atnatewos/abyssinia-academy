/**
 * @fileoverview English Translations — Namespace Aggregator
 *
 * Merges all English translation namespaces into a single object.
 * The public shape matches the legacy en.config.js exactly, so no
 * consumer code needs to change.
 *
 * Structure:
 *   - Most namespaces are spread directly (their top-level keys become
 *     top-level keys on the merged object).
 *   - The `reseller` namespace is kept nested under a single `reseller`
 *     key so consumers access `t.reseller.dashboard.title` (matching the
 *     pattern used by other self-contained namespaces like `agents` and
 *     `scholarships` which export wrapper objects).
 *
 * To add a new namespace:
 *   1. Create the file in this folder (e.g., partners.js)
 *   2. require it below
 *   3. Either spread it (`...partners`) if its export is flat, or nest
 *      it (`partners: partnersExport`) if its export has its own root key
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

/*
 * Reseller namespace.
 * The file `./reseller.js` exports a self-contained object with all
 * reseller-related strings (dashboard, price, subResellers, terms, etc.).
 * We nest it under a single `reseller` key so consumers read
 * `t.reseller.<section>.<key>` — consistent with how `agents` and
 * `scholarships` expose their strings.
 */
const reseller = require('./reseller');

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
  reseller,
};