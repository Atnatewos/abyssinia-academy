/**
 * @fileoverview Config Aggregator
 * Central export point for all configurations.
 * Add new config files here and they become available through the config bridge.
 * Path: packages/shared/config/index.js
 */

const platformConfig = require('./platform.config');
const paymentsConfig = require('./payments.config');
const coursesConfig = require('./courses.config');
const themesConfig = require('./themes.config');
const i18nConfig = require('./i18n/index');
const landingConfig = require('./landing.config');
const phasesConfig = require('./phases.config');
const referralsConfig = require('./referrals.config');
const discountsConfig = require('./discounts.config');

module.exports = {
  platform: platformConfig,
  payments: paymentsConfig,
  courses: coursesConfig,
  themes: themesConfig,
  i18n: i18nConfig,
  landing: landingConfig,
  phases: phasesConfig,
  referrals: referralsConfig,
  discounts: discountsConfig,
};