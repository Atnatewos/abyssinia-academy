/**
 * @fileoverview Config Bridge
 * Safe way to access shared config from Next.js frontend
 * Path: apps/web/lib/config.js
 */

let cachedConfig = null;

/**
 * Load shared config - works around Next.js module resolution
 * @returns {object} Shared configuration
 */
const getConfig = () => {
  if (cachedConfig) return cachedConfig;

  try {
    cachedConfig = require('../../../packages/shared/config');
  } catch {
    try {
      cachedConfig = require('@shared/config');
    } catch {
      cachedConfig = {
        platform: { brand: { name: 'ABYSSiNIA', suffix: 'Tech Academy', tagline: '', established: '2026', contactPhone: '', location: '' }, frontendUrl: '' },
        i18n: { defaultLanguage: 'en', getTranslations: () => ({}) },
        payments: { pricing: { amountETB: 4999 } },
      };
    }
  }

  return cachedConfig;
};

export const platform = () => getConfig().platform;
export const i18n = () => getConfig().i18n;
export const payments = () => getConfig().payments;