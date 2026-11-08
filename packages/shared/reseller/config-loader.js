/**
 * @fileoverview Reseller Config Loader
 *
 * Merges config from multiple sources into a single frozen object:
 *   1. Defaults (reseller.config.defaults.js)  — lowest priority
 *   2. Active config (reseller.config.js)
 *   3. Environment variables (RESELLER_* env vars)
 *   4. Global DB overrides (global_config_overrides table)
 *   5. Per-reseller DB overrides (reseller_config_overrides table)
 *
 * The result is deeply frozen to prevent accidental mutation.
 *
 * Path: packages/shared/reseller/config-loader.js
 */

const resellerConfigDefaults = require('../config/reseller.config.defaults');
const resellerConfig = require('../config/reseller.config');

/**
 * Deep-merge two objects, with `source` winning on conflicts.
 * Arrays are replaced (not concatenated) — this is intentional for config.
 *
 * @param {object} target - Base object
 * @param {object} source - Object whose values take precedence
 * @returns {object} New merged object (inputs are not mutated)
 */
const deepMerge = (target, source) => {
  if (!source || typeof source !== 'object') return target;
  if (!target || typeof target !== 'object') return source;

  const result = Array.isArray(target) ? [...target] : { ...target };

  for (const key of Object.keys(source)) {
    const sourceVal = source[key];
    const targetVal = result[key];

    if (
      sourceVal &&
      typeof sourceVal === 'object' &&
      !Array.isArray(sourceVal) &&
      targetVal &&
      typeof targetVal === 'object' &&
      !Array.isArray(targetVal)
    ) {
      result[key] = deepMerge(targetVal, sourceVal);
    } else {
      result[key] = sourceVal;
    }
  }

  return result;
};

/**
 * Deep-freeze an object and all nested objects.
 *
 * @param {object} obj
 * @returns {object} The same object, frozen
 */
const deepFreeze = (obj) => {
  if (obj === null || typeof obj !== 'object' || Object.isFrozen(obj)) {
    return obj;
  }
  Object.freeze(obj);
  for (const key of Object.getOwnPropertyNames(obj)) {
    deepFreeze(obj[key]);
  }
  return obj;
};

/**
 * Read an env var and coerce it to the type of the default value.
 * This keeps env-var overrides type-safe.
 *
 * @param {string} envName - Environment variable name
 * @param {*} defaultValue - Current value (determines expected type)
 * @returns {*} Coerced value, or defaultValue if env var is unset/invalid
 */
const envOverride = (envName, defaultValue) => {
  const raw = process.env[envName];
  if (raw === undefined || raw === '') return defaultValue;

  if (typeof defaultValue === 'number') {
    const num = Number(raw);
    return Number.isFinite(num) ? num : defaultValue;
  }
  if (typeof defaultValue === 'boolean') {
    return raw === 'true' || raw === '1';
  }
  if (Array.isArray(defaultValue)) {
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return raw;
};

/**
 * Set a nested key using dot-notation path.
 * Example: setByPath(obj, 'commission.subReseller.maxDepth', 2)
 *
 * @param {object} obj - Object to mutate
 * @param {string} path - Dot-notation path
 * @param {*} value - Value to set
 */
const setByPath = (obj, path, value) => {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  current[parts[parts.length - 1]] = value;
};

/**
 * Load the reseller config, merging all sources.
 *
 * @param {object} [options]
 * @param {object} [options.db] - Optional DB adapter: { query(text, params) }
 * @param {string} [options.resellerId] - Optional reseller profile UUID for per-reseller overrides
 * @returns {Promise<object>} Deeply frozen merged config
 */
const loadResellerConfig = async (options = {}) => {
  const { db = null, resellerId = null } = options;

  /* Layer 1 + 2: defaults overlaid with file config */
  let merged = deepMerge(
    JSON.parse(JSON.stringify(resellerConfigDefaults)),
    resellerConfig
  );

  /* Layer 3: environment variable overrides */
  merged.enabled = envOverride('RESELLER_ENABLED', merged.enabled);
  merged.commission.platformFeePercent = envOverride(
    'RESELLER_PLATFORM_FEE_PERCENT',
    merged.commission.platformFeePercent
  );
  merged.payout.lockDays = envOverride('RESELLER_LOCK_DAYS', merged.payout.lockDays);
  merged.pricing.minRetailPriceETB = envOverride(
    'RESELLER_MIN_PRICE',
    merged.pricing.minRetailPriceETB
  );
  merged.pricing.maxRetailPriceETB = envOverride(
    'RESELLER_MAX_PRICE',
    merged.pricing.maxRetailPriceETB
  );
  merged.pricing.defaultRetailPriceETB = envOverride(
    'RESELLER_DEFAULT_PRICE',
    merged.pricing.defaultRetailPriceETB
  );

  /* Layer 4: DB global overrides */
  if (db && typeof db.query === 'function') {
    try {
      const result = await db.query(
        `SELECT config_key, config_value
         FROM global_config_overrides
         WHERE namespace = $1`,
        ['reseller']
      );
      for (const row of result.rows) {
        setByPath(merged, row.config_key, row.config_value);
      }
    } catch (err) {
      /* If the overrides table doesn't exist yet, use file config.
         Non-fatal — the config loader should always succeed. */
    }
  }

  /* Layer 5: per-reseller overrides */
  if (db && typeof db.query === 'function' && resellerId) {
    try {
      const result = await db.query(
        `SELECT * FROM reseller_config_overrides WHERE reseller_id = $1`,
        [resellerId]
      );
      if (result.rows.length > 0) {
        const o = result.rows[0];
        if (o.default_retail_price_override !== null) {
          merged.pricing.defaultRetailPriceETB = parseFloat(o.default_retail_price_override);
        }
        if (o.min_retail_price_override !== null) {
          merged.pricing.minRetailPriceETB = parseFloat(o.min_retail_price_override);
        }
        if (o.max_retail_price_override !== null) {
          merged.pricing.maxRetailPriceETB = parseFloat(o.max_retail_price_override);
        }
        if (o.platform_fee_percent_override !== null) {
          merged.commission.platformFeePercent = parseFloat(o.platform_fee_percent_override);
        }
        if (o.default_sub_share_percent_override !== null) {
          merged.commission.subReseller.defaultSubSharePercent =
            parseFloat(o.default_sub_share_percent_override);
        }
        if (o.max_earnings_per_month_override !== null) {
          merged.caps.maxEarningsPerResellerPerMonthETB =
            parseFloat(o.max_earnings_per_month_override);
        }
      }
    } catch (err) {
      /* Non-fatal: fall back to global config */
    }
  }

  return deepFreeze(merged);
};

module.exports = {
  loadResellerConfig,
};