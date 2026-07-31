/**
 * @fileoverview LocalStorage Utility
 * Type-safe wrapper for browser localStorage with JSON serialization
 * Path: apps/web/lib/storage.js
 */

/**
 * Get a value from localStorage
 * Only parses JSON if the value looks like a JSON object/array
 * Plain strings (like JWT tokens) are returned as-is
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Stored value or default
 */
const getItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null || item === undefined) {
      return defaultValue;
    }

    if (item === 'null') return null;
    if (item === 'undefined') return undefined;
    if (item === 'true') return true;
    if (item === 'false') return false;

    const firstChar = item.trim()[0];
    if (firstChar === '{' || firstChar === '[') {
      return JSON.parse(item);
    }

    return item;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error.message);
    const raw = localStorage.getItem(key);
    return raw || defaultValue;
  }
};

/**
 * Set a value in localStorage with JSON serialization for objects
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 */
const setItem = (key, value) => {
  try {
    if (typeof value === 'object' && value !== null) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.setItem(key, String(value));
    }
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
};

/**
 * Remove a value from localStorage
 * @param {string} key - Storage key
 */
const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
};

/**
 * Check if a key exists in localStorage
 * @param {string} key - Storage key
 * @returns {boolean} Whether key exists
 */
const hasItem = (key) => {
  try {
    return localStorage.getItem(key) !== null;
  } catch (error) {
    return false;
  }
};

export { getItem, setItem, removeItem, hasItem };