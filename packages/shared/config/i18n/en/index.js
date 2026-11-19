// /**
//  * @fileoverview English Translations — Namespace Aggregator
//  *
//  * Merges all English translation namespaces into a single object.
//  * The public shape matches the legacy en.config.js exactly, so no
//  * consumer code needs to change.
//  *
//  * Structure:
//  *   - Most namespaces are spread directly (their top-level keys become
//  *     top-level keys on the merged object).
//  *   - Self-contained namespaces (reseller, footer) are nested under
//  *     their own root key so consumers access `t.<namespace>.<section>`.
//  *
//  * To add a new namespace:
//  *   1. Create the file in this folder (e.g., partners.js)
//  *   2. require it below
//  *   3. Either spread it (`...partners`) if its export is flat, or nest
//  *      it (`partners: partnersExport`) if its export has its own root key
//  *
//  * Path: packages/shared/config/i18n/en/index.js
//  */

// 'use strict';

// const admin = require('./admin');
// const agents = require('./agents');
// const auth = require('./auth');
// const checkout = require('./checkout');
// const checkoutModal = require('./checkoutModal');
// const common = require('./common');
// const confirmations = require('./confirmations');
// const contact = require('./contact');
// const courses = require('./courses');
// const discounts = require('./discounts');
// const landing = require('./landing');
// const notifications = require('./notifications');
// const phasePurchase = require('./phasePurchase');
// const portal = require('./portal');
// const pricing = require('./pricing');
// const profile = require('./profile');
// const referrals = require('./referrals');
// const scholarships = require('./scholarships');

// /*
//  * Self-contained namespaces.
//  *
//  * Each of these files exports an object wrapped in its own root key
//  * (e.g., ./footer.js exports { footer: { ... } }), so we nest them under
//  * their root key rather than spreading them flat.
//  *
//  * This keeps access patterns consistent:
//  *   t.footer.columns.platform
//  *   t.reseller.dashboard.title
//  */
// const reseller = require('./reseller');
// const footerNamespace = require('./footer');

// module.exports = {
//   ...admin,
//   ...agents,
//   ...auth,
//   ...checkout,
//   ...checkoutModal,
//   ...common,
//   ...confirmations,
//   ...contact,
//   ...courses,
//   ...discounts,
//   ...landing,
//   ...notifications,
//   ...phasePurchase,
//   ...portal,
//   ...pricing,
//   ...profile,
//   ...referrals,
//   ...scholarships,

//   /* Footer exposes its own root key so we spread it to flatten. */
//   ...footerNamespace,

//   /* Reseller stays nested as a single object. */
//   reseller,
// };











/**
 * @fileoverview English Translations — Namespace Aggregator
 *
 * Deep-merges every English namespace into one bundle. The admin
 * namespace is merged LAST so it is authoritative: no other namespace
 * file can shadow `admin.godMode`, `admin.courses`, or any admin key,
 * while admin sub-keys contributed by other namespaces still survive.
 *
 * Shape contract:
 *   - Flat namespaces merge at the root (t.auth, t.pricing, …)
 *   - `reseller` stays nested under its own root key
 *   - `footer` exports its own root key and merges flat
 *
 * Path: packages/shared/config/i18n/en/index.js
 */

'use strict';

const { deepMerge } = require('../merge');

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
const footerNamespace = require('./footer');
const landing = require('./landing');
const notifications = require('./notifications');
const phasePurchase = require('./phasePurchase');
const portal = require('./portal');
const pricing = require('./pricing');
const profile = require('./profile');
const referrals = require('./referrals');
const reseller = require('./reseller');
const scholarships = require('./scholarships');

module.exports = deepMerge(
  agents,
  auth,
  checkout,
  checkoutModal,
  common,
  confirmations,
  contact,
  courses,
  discounts,
  footerNamespace,
  landing,
  notifications,
  phasePurchase,
  portal,
  pricing,
  profile,
  referrals,
  scholarships,
  { reseller },
  admin
);