/**
 * @fileoverview Canonical breakpoint scale — mobile-first.
 *
 * Every media query in the entire codebase MUST use these values.
 * The old `400 / 560 / 680 / 767 / 900 / 1400` ad-hoc values are retired.
 *
 * Semantics (all are `min-width`):
 *   XS  480  — large phones (iPhone landscape baseline)
 *   SM  640  — small tablets / big phones
 *   MD  768  — tablets
 *   LG  1024 — laptops
 *   XL  1280 — desktops
 *   XXL 1440 — large desktops
 *
 * Anything below XS is treated as the base (mobile) tier — no media query.
 *
 * Path: packages/shared/config/breakpoints.config.js
 */

'use strict';

const BREAKPOINTS = Object.freeze({
  XS: 480,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1440,
});

/**
 * Emits each breakpoint as a ready-to-use media query string.
 * Consumed by tools/generate-css-tokens.js and the responsive CSS builder.
 */
function mediaMin(px) {
  return `(min-width: ${px}px)`;
}

module.exports = Object.freeze({
  BREAKPOINTS,
  mediaMin,
  /** @type {readonly string[]} Ordered list of breakpoint keys. */
  ORDER: Object.freeze(['XS', 'SM', 'MD', 'LG', 'XL', 'XXL']),
});