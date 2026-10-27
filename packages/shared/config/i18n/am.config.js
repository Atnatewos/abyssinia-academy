/**
 * @fileoverview Amharic Translations — Delegator
 *
 * Thin wrapper that delegates to the modular namespaces under ./am/.
 * Preserves backward compatibility for consumers that
 * require('.../i18n/am.config') directly.
 *
 * Actual translations live in packages/shared/config/i18n/am/*.js
 *
 * Path: packages/shared/config/i18n/am.config.js
 */

module.exports = require('./am/index');