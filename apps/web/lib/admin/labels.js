/**
 * @fileoverview Admin Label Resolver
 *
 * Single source of truth for resolving i18n dot-paths into renderable
 * strings across every admin surface. Resolution chain:
 *   1. Active locale bundle
 *   2. English base bundle (canonical fallback)
 *   3. Empty string guard — objects/arrays never reach the React tree
 *
 * Also exposes template interpolation for {placeholder} copy so no
 * component ever hand-rolls string replacement.
 *
 * Path: apps/web/lib/admin/labels.js
 */

import { TRANSLATIONS, DEFAULT_LANGUAGE } from '../../context/LanguageContext';

const ENGLISH_BUNDLE = TRANSLATIONS[DEFAULT_LANGUAGE] || {};

/**
 * Whether a value is a renderable, non-empty label string.
 * @param {*} value
 * @returns {boolean}
 */
export const isLabelString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

/**
 * Resolve a dot-notation path on an object.
 * @param {object} source
 * @param {string|undefined} path
 * @returns {*}
 */
export const getByPath = (source, path) => {
  if (!source || !path) return undefined;
  return path.split('.').reduce((node, key) => {
    if (node === null || node === undefined) return undefined;
    return node[key];
  }, source);
};

/**
 * Resolve an i18n key against the active bundle, then English base.
 * Guarantees a string return — safe for direct JSX rendering.
 *
 * @param {object} t - Active locale bundle from useLanguage()
 * @param {string} key - Dot-notation i18n path
 * @returns {string}
 */
export const resolveLabel = (t, key) => {
  const active = getByPath(t, key);
  if (isLabelString(active)) return active;
  const fallback = getByPath(ENGLISH_BUNDLE, key);
  return isLabelString(fallback) ? fallback : '';
};

/**
 * Interpolate {placeholder} tokens in a resolved label.
 * Unknown placeholders are preserved verbatim for debuggability.
 *
 * @param {string} template
 * @param {Record<string, string|number>} values
 * @returns {string}
 */
export const interpolate = (template, values = {}) =>
  String(template || '').replace(/{(\w+)}/g, (_, key) =>
    values[key] !== undefined ? String(values[key]) : `{${key}}`
  );

/**
 * Convenience: resolve + interpolate in one call.
 *
 * @param {object} t - Active locale bundle
 * @param {string} key - Dot-notation i18n path
 * @param {Record<string, string|number>} [values]
 * @returns {string}
 */
export const labelWith = (t, key, values) =>
  interpolate(resolveLabel(t, key), values);