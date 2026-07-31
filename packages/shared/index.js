/**
 * @fileoverview Shared Package Entry Point
 * Central export for all shared modules
 * Path: packages/shared/index.js
 */

const config = require('./config/index');
const API_ENDPOINTS = require('./constants/api-endpoints');
const { ROLES, PERMISSIONS } = require('./constants/roles');
const validators = require('./utils/validators');
const formatters = require('./utils/formatters');
const pricing = require('./utils/pricing');

module.exports = {
  config,
  API_ENDPOINTS,
  ROLES,
  PERMISSIONS,
  validators,
  formatters,
  pricing,
};