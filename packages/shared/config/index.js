/**
 * @fileoverview Config Aggregator
 * Central export point for all configurations
 * Path: packages/shared/config/index.js
 */

const platformConfig = require('./platform.config');
const paymentsConfig = require('./payments.config');
const coursesConfig = require('./courses.config');
const themesConfig = require('./themes.config');
const i18nConfig = require('./i18n/index');

module.exports = {
  platform: platformConfig,
  payments: paymentsConfig,
  courses: coursesConfig,
  themes: themesConfig,
  i18n: i18nConfig,
};