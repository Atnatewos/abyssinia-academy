/**
 * @fileoverview i18n Config Alias
 *
 * Re-exports the canonical i18n barrel so any consumer resolving the
 * legacy `i18n.config` path receives the same authoritative bundles.
 *
 * Path: packages/shared/config/i18n.config.js
 */

'use strict';

module.exports = require('./i18n');