/**
 * @fileoverview Shared Formatting Utilities
 * Data formatting functions used across the platform
 * Path: packages/shared/utils/formatters.js
 */

/**
 * Format currency in ETB
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency
 */
const formatETB = (amount) => {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format a date string
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale string
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
 * Format a date with time
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale string
 * @returns {string} Formatted date and time
 */
const formatDateTime = (date, locale = 'en-US') => {
  if (!date) return '';
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum characters
 * @returns {string} Truncated text
 */
const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Generate a slug from a string
 * @param {string} text - Text to slugify
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
 * Format a percentage
 * @param {number} value - Value to format
 * @returns {string} Formatted percentage
 */
const formatPercentage = (value) => {
  return `${Math.round(value)}%`;
};

module.exports = {
  formatETB,
  formatDate,
  formatDateTime,
  truncateText,
  generateSlug,
  formatPercentage,
};