/**
 * @fileoverview English Translations — Delegator
 *
 * Thin wrapper that delegates to the modular namespaces under ./en/.
 * Preserves backward compatibility for consumers that
 * require('.../i18n/en.config') directly.
 *
 * Actual translations live in packages/shared/config/i18n/en/*.js
 *
 * Path: packages/shared/config/i18n/en.config.js
 */

module.exports = require('./en/index');