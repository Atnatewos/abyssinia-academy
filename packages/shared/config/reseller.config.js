/**
 * @fileoverview Reseller System — Active Configuration
 *
 * This is the config file you EDIT to tune the reseller system. Values here
 * override `reseller.config.defaults.js`. Further overrides can come from:
 *   1. Environment variables (process.env.RESELLER_*)
 *   2. Database overrides (global_config_overrides table)
 *   3. Per-reseller overrides (reseller_config_overrides table)
 *
 * The merge order (lowest to highest priority):
 *   defaults → this file → env vars → DB overrides
 *
 * To change a value: edit it here and restart the server.
 * To change at runtime: use the admin panel (stored in DB).
 *
 * Path: packages/shared/config/reseller.config.js
 */

const resellerConfigDefaults = require('./reseller.config.defaults');

const resellerConfig = {
  /* ═══════════════════════════════════════════════════════════════════════
   * Master switch
   * ═══════════════════════════════════════════════════════════════════════ */
  enabled: resellerConfigDefaults.enabled,

  /* ═══════════════════════════════════════════════════════════════════════
   * PRICING
   * ═══════════════════════════════════════════════════════════════════════ */
  pricing: {
    ...resellerConfigDefaults.pricing,
    /* Override any pricing value here if needed */
  },

  /* ═══════════════════════════════════════════════════════════════════════
   * COMMISSION
   * ═══════════════════════════════════════════════════════════════════════ */
  commission: {
    ...resellerConfigDefaults.commission,
    subReseller: {
      ...resellerConfigDefaults.commission.subReseller,
      /* Override any sub-reseller value here if needed */
    },
  },

  /* ═══════════════════════════════════════════════════════════════════════
   * PAYOUT
   * ═══════════════════════════════════════════════════════════════════════ */
  payout: {
    ...resellerConfigDefaults.payout,
  },

  /* ═══════════════════════════════════════════════════════════════════════
   * CAPS
   * ═══════════════════════════════════════════════════════════════════════ */
  caps: {
    ...resellerConfigDefaults.caps,
  },

  /* ═══════════════════════════════════════════════════════════════════════
   * REFUNDS
   * ═══════════════════════════════════════════════════════════════════════ */
  refunds: {
    ...resellerConfigDefaults.refunds,
  },

  /* ═══════════════════════════════════════════════════════════════════════
   * ANTI-FRAUD
   * ═══════════════════════════════════════════════════════════════════════ */
  antiFraud: {
    ...resellerConfigDefaults.antiFraud,
  },

  /* ═══════════════════════════════════════════════════════════════════════
   * UX
   * ═══════════════════════════════════════════════════════════════════════ */
  ux: {
    ...resellerConfigDefaults.ux,
  },

  /* ═══════════════════════════════════════════════════════════════════════
   * ROLLOUT
   * ═══════════════════════════════════════════════════════════════════════ */
  rollout: {
    ...resellerConfigDefaults.rollout,
  },
};

module.exports = resellerConfig;