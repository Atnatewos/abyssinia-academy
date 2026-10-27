/**
 * @fileoverview Oromo Translations — Delegator
 *
 * Thin wrapper that delegates to the modular namespaces under ./om/.
 * Preserves backward compatibility for consumers that
 * require('.../i18n/om.config') directly.
 *
 * Actual translations live in packages/shared/config/i18n/om/*.js
 *
 * Path: packages/shared/config/i18n/om.config.js
 */

module.exports = require('./om/index');