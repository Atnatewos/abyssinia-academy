/**
 * @fileoverview Authentication Utilities
 * Token management and auth state helpers
 * Path: apps/web/lib/auth.js
 */

import { getItem, setItem, removeItem } from './storage';

/**
 * Get the current auth token
 * @returns {string|null} JWT token
 */
const getToken = () => {
  return getItem('auth_token');
};

/**
 * Get the current user object
 * @returns {object|null} User data
 */
const getUser = () => {
  return getItem('user');
};

/**
 * Save authentication data after login/register
 * @param {string} token - JWT token
 * @param {object} user - User data
 */
const setAuth = (token, user) => {
  setItem('auth_token', token);
  setItem('user', user);
};

/**
 * Clear all authentication data
 */
const clearAuth = () => {
  removeItem('auth_token');
  removeItem('user');
};

/**
 * Check if user is authenticated
 * @returns {boolean} Is authenticated
 */
const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

/**
 * Check if user is enrolled
 * @returns {boolean} Is enrolled
 */
const isEnrolled = () => {
  const user = getUser();
  return user?.is_enrolled === true;
};

export { getToken, getUser, setAuth, clearAuth, isAuthenticated, isEnrolled };