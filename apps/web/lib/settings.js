/**
 * @fileoverview Settings Resolver — DB-First with Config Fallback
 * Resolves configuration values in this order:
 *   1. Database (admin_settings table) — if admin has saved a value
 *   2. Static config files — if no DB override exists
 *   3. Defaults — hard fallback
 * 
 * Caches results with TTL to avoid hitting the DB on every request.
 * Cache invalidated when admin saves new settings.
 * 
 * Path: apps/web/lib/settings.js
 */

import { Pool } from 'pg';

const isNeon = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isNeon ? { rejectUnauthorized: false } : false,
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
});

/*
 * In-memory cache with TTL
 */
let settingsCache = {};
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 1000; // 60 seconds

/**
 * Fetch a single setting from the database
 * @param {string} key - Setting key
 * @returns {object|null} Setting value or null
 */
const fetchSettingFromDB = async (key) => {
  try {
    const result = await pool.query(
      'SELECT setting_value FROM admin_settings WHERE setting_key = $1',
      [key]
    );
    return result.rows.length > 0 ? result.rows[0].setting_value : null;
  } catch (error) {
    console.error(`Failed to fetch setting "${key}":`, error.message);
    return null;
  }
};

/**
 * Fetch all settings from the database
 * @returns {object} All settings as a merged object
 */
const fetchAllSettingsFromDB = async () => {
  try {
    const result = await pool.query(
      'SELECT setting_key, setting_value FROM admin_settings'
    );
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
 * Clear the settings cache — called after admin saves
 */
export const clearSettingsCache = () => {
  settingsCache = {};
  cacheTimestamp = 0;
};

/**
 * Get a setting value using DB-first resolution.
 * Falls back to the static config if no DB override exists.
 * 
 * @param {string} key - Setting key (e.g., 'pricing')
 * @param {*} fallback - Static config fallback value
 * @returns {*} Resolved setting value
 */
export const getSetting = async (key, fallback) => {
  /*
   * Check if cache is still fresh
   */
  const now = Date.now();
  if (now - cacheTimestamp > CACHE_TTL) {
    settingsCache = await fetchAllSettingsFromDB();
    cacheTimestamp = now;
  }

  /*
   * Return DB override if it exists
   */
  if (settingsCache[key] !== undefined && settingsCache[key] !== null) {
    return settingsCache[key];
  }

  /*
   * Fall back to static config
   */
  return fallback;
};

/**
 * Save a setting to the database and clear cache
 * @param {string} key - Setting key
 * @param {*} value - Setting value
 * @param {string} adminId - Admin UUID who made the change
 * @returns {object} Saved setting
 */
export const saveSetting = async (key, value, adminId) => {
  const result = await pool.query(
    `INSERT INTO admin_settings (setting_key, setting_value, updated_by, updated_at)
     VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
     ON CONFLICT (setting_key)
     DO UPDATE SET setting_value = $2, updated_by = $3, updated_at = CURRENT_TIMESTAMP
     RETURNING setting_key, setting_value, updated_at`,
    [key, JSON.stringify(value), adminId]
  );

  clearSettingsCache();
  return result.rows[0];
};

/**
 * Delete a setting from the database (reset to config default)
 * @param {string} key - Setting key
 */
export const deleteSetting = async (key) => {
  await pool.query('DELETE FROM admin_settings WHERE setting_key = $1', [key]);
  clearSettingsCache();
};

export { fetchAllSettingsFromDB };