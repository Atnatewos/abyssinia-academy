/**
 * @fileoverview API Client with Global Confirmation Interceptor
 *
 * All confirmation copy is sourced from the shared i18n confirmations
 * namespace. Zero hardcoded strings in this file.
 *
 * To add a new confirmation pattern:
 *   1. Add a `patterns` entry to DELETE_PATTERNS or a specific matcher
 *   2. Add the copy to en/confirmations.js + am/confirmations.js under
 *      `confirmations.actions.<key>`
 *
 * Path: apps/web/lib/api.js
 */

import axios from 'axios';
import { getItem, removeItem } from './storage';
import { requestConfirm } from './confirmBridge';

/* ── i18n resolver ─────────────────────────────────────────────────── */

/**
 * Resolve the current language from the same localStorage key that
 * LanguageContext writes. Falls back to 'en'.
 */
function getCurrentLanguage() {
  if (typeof window === 'undefined') return 'en';
  try {
    return window.localStorage.getItem('abyssinia_language') || 'en';
  } catch {
    return 'en';
  }
}

/**
 * Load a nested i18n key from the confirmations namespace.
 * Falls back to English if the key is missing in the current language.
 *
 * @param {string} keyPath - e.g. 'actions.deleteCourse'
 * @returns {object|null}
 */
function getConfirmCopy(keyPath) {
  const lang = getCurrentLanguage();
  try {
    const bundle =
      lang === 'am'
        ? require('@shared/config/i18n/am/confirmations')
        : require('@shared/config/i18n/en/confirmations');
    let node = bundle.confirmations;
    for (const part of keyPath.split('.')) {
      node = node?.[part];
      if (!node) break;
    }
    if (node) return node;
  } catch {
    /* Fall through to English */
  }
  try {
    const en = require('@shared/config/i18n/en/confirmations');
    let node = en.confirmations;
    for (const part of keyPath.split('.')) {
      node = node?.[part];
      if (!node) break;
    }
    return node || null;
  } catch {
    return null;
  }
}

/* ── Base axios instance ───────────────────────────────────────────── */

const axiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getItem('auth_token');
  const adminToken = getItem('admin_token');

  if (config.url && config.url.startsWith('/admin') && adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAdmin =
        error.config &&
        error.config.url &&
        error.config.url.startsWith('/admin');
      if (isAdmin) {
        removeItem('admin_token');
        removeItem('admin_user');
      }
    }
    return Promise.reject(error);
  }
);

/* ── Pattern → i18n key mapping ─────────────────────────────────────── */

/**
 * Delete patterns — first match wins. Each entry is [regex, i18nKey].
 */
const DELETE_PATTERNS = [
  [/\/admin\/courses\/[^/]+$/, 'actions.deleteCourse'],
  [/\/admin\/course-videos\/[^/]+$/, 'actions.deleteVideo'],
  [/\/admin\/discussions\/[^/]+$/, 'actions.deleteDiscussion'],
  [/\/admin\/discounts\/[^/]+$/, 'actions.deleteDiscount'],
  [/\/admin\/lessons\/[^/]+$/, 'actions.deleteLesson'],
  [/\/admin\/phases\/[^/]+$/, 'actions.deletePhase'],
  [/\/admin\/weeks\/[^/]+$/, 'actions.deleteWeek'],
  [/\/admin\/admins\/[^/]+$/, 'actions.deleteAdmin'],
];

/**
 * Hydrate a raw i18n entry into ConfirmDialog options.
 */
function hydrate(copy) {
  if (!copy) return null;
  return {
    title: copy.title,
    message: copy.message || '',
    confirmText: copy.confirmText,
    cancelText: copy.cancelText || undefined,
    requireInput: copy.requireInput || undefined,
    variant: copy.variant || 'warning',
  };
}

/**
 * Resolve the default confirmation for a method + URL.
 * Returns null when no confirmation is configured.
 */
function getDefaultConfirm(method, url) {
  const m = method.toLowerCase();
  const u = (url || '').toString();

  if (m === 'delete') {
    for (const [pattern, key] of DELETE_PATTERNS) {
      if (pattern.test(u)) return hydrate(getConfirmCopy(key));
    }
    return hydrate(getConfirmCopy('actions.deleteGeneric'));
  }

  if (m === 'patch' && /\/admin\/payments\/[^/]+\/approve$/.test(u))
    return hydrate(getConfirmCopy('actions.approvePayment'));
  if (m === 'patch' && /\/admin\/payments\/[^/]+\/reject$/.test(u))
    return hydrate(getConfirmCopy('actions.rejectPayment'));
  if (m === 'post' && /\/admin\/payments\/bulk-approve$/.test(u))
    return hydrate(getConfirmCopy('actions.bulkApprovePayments'));

  if (m === 'patch' && /\/admin\/referrals\/mlm\/withdrawals\/[^/]+$/.test(u))
    return hydrate(getConfirmCopy('actions.processWithdrawal'));

  if (m === 'post' && /\/admin\/users\/bulk$/.test(u))
    return hydrate(getConfirmCopy('actions.bulkUserAction'));

  if (m === 'put' && /\/admin\/settings$/.test(u))
    return hydrate(getConfirmCopy('actions.saveSettings'));
  if (m === 'post' && /\/admin\/settings$/.test(u))
    return hydrate(getConfirmCopy('actions.resetSettings'));

  if (m === 'post' && /\/admin\/notifications\/broadcast$/.test(u))
    return hydrate(getConfirmCopy('actions.broadcastAnnouncement'));

  if (m === 'post' && /\/referrals\/mlm\/withdrawals$/.test(u))
    return hydrate(getConfirmCopy('actions.requestWithdrawal'));
  if (m === 'post' && /\/payments\/submit$/.test(u))
    return hydrate(getConfirmCopy('actions.submitPayment'));
  if (m === 'put' && /\/profile\/password$/.test(u))
    return hydrate(getConfirmCopy('actions.changePassword'));
  if (m === 'put' && /\/profile$/.test(u))
    return hydrate(getConfirmCopy('actions.saveProfile'));

  return null;
}

/* ── Interceptor wrapper ───────────────────────────────────────────── */

const CANCELLED_RESPONSE = Object.freeze({
  success: false,
  cancelled: true,
  message: 'Action cancelled by user.',
});

async function interceptedRequest(method, url, data, options = {}) {
  const { _confirm, ...axiosOptions } = options;
  const confirmOptions = _confirm || getDefaultConfirm(method, url);

  if (confirmOptions) {
    const confirmed = await requestConfirm(confirmOptions);
    if (!confirmed) return CANCELLED_RESPONSE;
  }

  return axiosInstance.request({ method, url, data, ...axiosOptions });
}

/* ── Public API client ─────────────────────────────────────────────── */

const apiClient = {
  get: (url, options = {}) =>
    axiosInstance.request({ method: 'get', url, ...options }),
  post: (url, data, options = {}) =>
    interceptedRequest('post', url, data, options),
  put: (url, data, options = {}) =>
    interceptedRequest('put', url, data, options),
  patch: (url, data, options = {}) =>
    interceptedRequest('patch', url, data, options),
  delete: (url, options = {}) =>
    interceptedRequest('delete', url, null, options),
};

export default apiClient;
export { CANCELLED_RESPONSE, getConfirmCopy };