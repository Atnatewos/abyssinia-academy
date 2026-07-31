/**
 * @fileoverview Helper Utilities
 * Common utility functions used across the API
 * Path: apps/api/src/utils/helpers.js
 */

const crypto = require('crypto');
const { platform } = require('../../../../packages/shared/config');

/**
 * Generate a random token
 * @param {number} length - Token length in bytes
 * @returns {string} Hex token
 */
const generateRandomToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Format a date to ISO string or return null
 * @param {Date|string} date - Date to format
 * @returns {string|null} Formatted date
 */
const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toISOString();
};

/**
 * Paginate query results
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {object} Pagination metadata
 */
const getPagination = (page = 1, limit = platform.pagination.defaultPageSize) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(
    platform.pagination.maxPageSize,
    Math.max(1, parseInt(limit, 10) || platform.pagination.defaultPageSize)
  );
  
  return {
    page: pageNum,
    limit: limitNum,
    offset: (pageNum - 1) * limitNum,
  };
};

/**
 * Build paginated response
 * @param {Array} rows - Data rows
 * @param {number} total - Total count
 * @param {object} pagination - Pagination metadata
 * @returns {object} Paginated response
 */
const buildPaginatedResponse = (rows, total, pagination) => {
  const totalPages = Math.ceil(total / pagination.limit);
  
  return {
    success: true,
    data: rows,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1,
    },
  };
};

/**
 * Remove sensitive fields from user object
 * @param {object} user - User object
 * @returns {object} Sanitized user
 */
const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

module.exports = {
  generateRandomToken,
  formatDate,
  getPagination,
  buildPaginatedResponse,
  sanitizeUser,
};