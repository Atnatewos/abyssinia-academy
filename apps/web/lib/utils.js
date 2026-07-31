/**
 * @fileoverview General Utilities
 * Common helper functions used across the frontend
 * Path: apps/web/lib/utils.js
 */

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum character length
 * @returns {string} Truncated text
 */
const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Format a date string to locale date
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale code
 * @returns {string} Formatted date
 */
const formatDate = (date, locale = 'en-US') => {
  if (!date) return '';
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format currency in ETB
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
const formatETB = (amount) => {
  return new Intl.NumberFormat('en-ET', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Generate a URL-friendly slug from text
 * @param {string} text - Input text
 * @returns {string} URL-friendly slug
 */
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

/**
 * Delay execution for a given time
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
const delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export { truncateText, formatDate, formatETB, generateSlug, delay };