/**
 * @fileoverview Locale Deep-Merge Utility
 *
 * Recursively merges translation namespaces so a later source wins on
 * conflicting leaf keys while every non-conflicting key from earlier
 * sources survives. Arrays and primitives replace wholesale; plain
 * objects merge recursively.
 *
 * Used by every locale aggregator to guarantee the admin namespace is
 * authoritative, and by the frontend LanguageContext to fill locale
 * gaps from the English base bundle.
 *
 * Path: packages/shared/config/i18n/merge.js
 */

'use strict';

/**
 * Whether a value is a plain mergeable object (not null, not an array).
 * @param {*} value
 * @returns {boolean}
 */
const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * Deep-merge any number of source objects, left to right.
 * Later sources take precedence on conflicting leaves.
 *
 * @param {...object} sources - Translation objects in priority order
 * @returns {object} A new merged object (inputs are never mutated)
 */
const deepMerge = (...sources) => {
  const result = {};

  for (const source of sources) {
    if (!isPlainObject(source)) continue;

    for (const key of Object.keys(source)) {
      const incoming = source[key];
      if (incoming === undefined) continue;

      const existing = result[key];
      result[key] =
        isPlainObject(existing) && isPlainObject(incoming)
          ? deepMerge(existing, incoming)
          : incoming;
    }
  }

  return result;
};

module.exports = { deepMerge, isPlainObject };