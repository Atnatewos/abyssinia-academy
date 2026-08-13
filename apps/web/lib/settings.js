/**
 * @fileoverview Settings Resolver — DB-First with Config Fallback
 * Uses shared database pool for consistent connection handling.
 * Path: apps/web/lib/settings.js
 */

import { query } from './db';

let settingsCache = {};
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 1000;

/**
 * Clear the settings cache — called after admin saves
 */
export const clearSettingsCache = () => {
  settingsCache = {};
  cacheTimestamp = 0;
};

/**
 * Fetch all settings from the database
 */
const fetchAllSettingsFromDB = async () => {
  try {
    const result = await query('SELECT setting_key, setting_value FROM admin_settings');
    const merged = {};
    for (const row of result.rows) {
      merged[row.setting_key] = row.setting_value;
    }
    return merged;
  } catch (error) {
    console.error('Failed to fetch settings:', error.message);
    return {};
  }
};

/**
 * Get a setting value using DB-first resolution.
 */
export const getSetting = async (key, fallback) => {
  const now = Date.now();
  if (now - cacheTimestamp > CACHE_TTL) {
    settingsCache = await fetchAllSettingsFromDB();
    cacheTimestamp = now;
  }

  if (settingsCache[key] !== undefined && settingsCache[key] !== null) {
    return settingsCache[key];
  }

  return fallback;
};

export { fetchAllSettingsFromDB };