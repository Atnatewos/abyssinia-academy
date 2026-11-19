// /**
//  * @fileoverview API Client with Global Confirmation Interceptor
//  *
//  * Path: apps/web/lib/api.js
//  */

// import axios from 'axios';
// import { getItem, removeItem } from './storage';
// import { requestConfirm } from './confirmBridge';

// function getCurrentLanguage() {
//   if (typeof window === 'undefined') return 'en';
//   try {
//     return window.localStorage.getItem('abyssinia_language') || 'en';
//   } catch {
//     return 'en';
//   }
// }

// function getConfirmCopy(keyPath) {
//   const lang = getCurrentLanguage();
//   try {
//     const bundle =
//       lang === 'am'
//         ? require('@shared/config/i18n/am/confirmations')
//         : require('@shared/config/i18n/en/confirmations');
//     let node = bundle.confirmations;
//     for (const part of keyPath.split('.')) {
//       node = node?.[part];
//       if (!node) break;
//     }
//     if (node) return node;
//   } catch {
//     /* Fall through to English */
//   }
//   try {
//     const en = require('@shared/config/i18n/en/confirmations');
//     let node = en.confirmations;
//     for (const part of keyPath.split('.')) {
//       node = node?.[part];
//       if (!node) break;
//     }
//     return node || null;
//   } catch {
//     return null;
//   }
// }

// const EXPRESS_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// /**
//  * Determine the correct base URL for a given endpoint.
//  *
//  * Next.js-only modules (which have their own `pages/api/*` routes) must
//  * bypass the Express URL. Everything else goes to Express if configured.
//  *
//  * @param {string} url
//  * @returns {string}
//  */
// function resolveBaseURL(url) {
//   const u = String(url || '');

//   const isNextjsRoute =
//     u.startsWith('/admin/scholarships') ||
//     u.startsWith('/scholarships') ||
//     u.startsWith('/public/scholarships') ||
//     u.startsWith('/notifications') ||
//     u.startsWith('/settings/public') ||
//     u.startsWith('/reseller') ||
//     u.startsWith('/referrals') ||
//     u.startsWith('/agents') ||
//     u.startsWith('/mlm') ||
//     u.startsWith('/access') ||
//     u.startsWith('/progress') ||
//     u.startsWith('/courses') ||
//     u === '/profile' ||
//     u.startsWith('/profile/');

//   if (isNextjsRoute) {
//     return '/api';
//   }

//   return EXPRESS_BASE_URL || '/api';
// }

// const axiosInstance = axios.create({
//   timeout: 30000,
//   headers: { 'Content-Type': 'application/json' },
// });

// axiosInstance.interceptors.request.use((config) => {
//   const token = getItem('auth_token');
//   const adminToken = getItem('admin_token');

//   config.baseURL = resolveBaseURL(config.url);

//   if (config.url && config.url.startsWith('/admin') && adminToken) {
//     config.headers.Authorization = `Bearer ${adminToken}`;
//   } else if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// axiosInstance.interceptors.response.use(
//   (response) => response.data,
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       const isAdmin =
//         error.config &&
//         error.config.url &&
//         error.config.url.startsWith('/admin');
//       if (isAdmin) {
//         removeItem('admin_token');
//         removeItem('admin_user');
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// const DELETE_PATTERNS = [
//   [/\/admin\/courses\/[^/]+$/, 'actions.deleteCourse'],
//   [/\/admin\/course-videos\/[^/]+$/, 'actions.deleteVideo'],
//   [/\/admin\/discussions\/[^/]+$/, 'actions.deleteDiscussion'],
//   [/\/admin\/discounts\/[^/]+$/, 'actions.deleteDiscount'],
//   [/\/admin\/lessons\/[^/]+$/, 'actions.deleteLesson'],
//   [/\/admin\/phases\/[^/]+$/, 'actions.deletePhase'],
//   [/\/admin\/weeks\/[^/]+$/, 'actions.deleteWeek'],
//   [/\/admin\/admins\/[^/]+$/, 'actions.deleteAdmin'],
//   [/\/admin\/scholarships\/[^/]+$/, 'actions.deleteCampaign'],
// ];

// function hydrate(copy) {
//   if (!copy) return null;
//   return {
//     title: copy.title,
//     message: copy.message || '',
//     confirmText: copy.confirmText,
//     cancelText: copy.cancelText || undefined,
//     requireInput: copy.requireInput || undefined,
//     variant: copy.variant || 'warning',
//   };
// }

// function getDefaultConfirm(method, url) {
//   const m = method.toLowerCase();
//   const u = (url || '').toString();

//   if (m === 'delete') {
//     for (const [pattern, key] of DELETE_PATTERNS) {
//       if (pattern.test(u)) return hydrate(getConfirmCopy(key));
//     }
//     return hydrate(getConfirmCopy('actions.deleteGeneric'));
//   }

//   if (m === 'patch' && /\/admin\/payments\/[^/]+\/approve$/.test(u))
//     return hydrate(getConfirmCopy('actions.approvePayment'));
//   if (m === 'patch' && /\/admin\/payments\/[^/]+\/reject$/.test(u))
//     return hydrate(getConfirmCopy('actions.rejectPayment'));
//   if (m === 'post' && /\/admin\/payments\/bulk-approve$/.test(u))
//     return hydrate(getConfirmCopy('actions.bulkApprovePayments'));

//   if (m === 'patch' && /\/admin\/referrals\/mlm\/withdrawals\/[^/]+$/.test(u))
//     return hydrate(getConfirmCopy('actions.processWithdrawal'));

//   if (m === 'post' && /\/admin\/users\/bulk$/.test(u))
//     return hydrate(getConfirmCopy('actions.bulkUserAction'));

//   if (m === 'put' && /\/admin\/settings$/.test(u))
//     return hydrate(getConfirmCopy('actions.saveSettings'));
//   if (m === 'post' && /\/admin\/settings$/.test(u))
//     return hydrate(getConfirmCopy('actions.resetSettings'));

//   if (m === 'post' && /\/admin\/notifications\/broadcast$/.test(u))
//     return hydrate(getConfirmCopy('actions.broadcastAnnouncement'));

//   if (m === 'post' && /\/referrals\/mlm\/withdrawals$/.test(u))
//     return hydrate(getConfirmCopy('actions.requestWithdrawal'));
//   if (m === 'post' && /\/payments\/submit$/.test(u))
//     return hydrate(getConfirmCopy('actions.submitPayment'));
//   if (m === 'put' && /\/profile\/password$/.test(u))
//     return hydrate(getConfirmCopy('actions.changePassword'));
//   if (m === 'put' && /\/profile$/.test(u))
//     return hydrate(getConfirmCopy('actions.saveProfile'));

//   return null;
// }

// const CANCELLED_RESPONSE = Object.freeze({
//   success: false,
//   cancelled: true,
//   message: 'Action cancelled by user.',
// });

// async function interceptedRequest(method, url, data, options = {}) {
//   const { _confirm, ...axiosOptions } = options;
//   const confirmOptions = _confirm || getDefaultConfirm(method, url);

//   if (confirmOptions) {
//     const confirmed = await requestConfirm(confirmOptions);
//     if (!confirmed) return CANCELLED_RESPONSE;
//   }

//   return axiosInstance.request({ method, url, data, ...axiosOptions });
// }

// const apiClient = {
//   get: (url, options = {}) =>
//     axiosInstance.request({ method: 'get', url, ...options }),
//   post: (url, data, options = {}) =>
//     interceptedRequest('post', url, data, options),
//   put: (url, data, options = {}) =>
//     interceptedRequest('put', url, data, options),
//   patch: (url, data, options = {}) =>
//     interceptedRequest('patch', url, data, options),
//   delete: (url, options = {}) =>
//     interceptedRequest('delete', url, null, options),
// };

// export default apiClient;
// export { CANCELLED_RESPONSE, getConfirmCopy };





/**
 * @fileoverview API Client with Global Confirmation Interceptor
 *
 * Base URL resolution — dual-backend routing contract:
 *
 *   NEXT.JS (same-origin `/api`) owns:
 *     - All student-facing feature modules (scholarships, referrals,
 *       reseller, agents, notifications, progress, access, courses, profile)
 *     - Admin: dashboard, users (incl. God Mode), referrals, payments,
 *       enrollments, analytics, audit, admins, agents, discounts,
 *       course-videos, discussions, notifications, resellers, settings,
 *       scholarships
 *
 *   EXPRESS (`NEXT_PUBLIC_API_URL`) owns:
 *     - Admin curriculum CRUD: /admin/courses, /admin/phases,
 *       /admin/weeks, /admin/lessons (nested create/publish routes)
 *     - Legacy /admin/students surface
 *     - Student auth, payment submission, legacy course reads
 *
 * Any endpoint whose handler lives in `pages/api/*` MUST be listed in
 * NEXT_ADMIN_PREFIXES or NEXT_STUDENT_PREFIXES below, otherwise it will
 * be sent to Express and 404.
 *
 * Path: apps/web/lib/api.js
 */

import axios from 'axios';
import { getItem, removeItem } from './storage';
import { requestConfirm } from './confirmBridge';

/* ── i18n resolver ─────────────────────────────────────────────────── */

function getCurrentLanguage() {
  if (typeof window === 'undefined') return 'en';
  try {
    return window.localStorage.getItem('abyssinia_language') || 'en';
  } catch {
    return 'en';
  }
}

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

/* ── Base URL resolution ───────────────────────────────────────────── */

const EXPRESS_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Admin modules implemented as Next.js API routes (`pages/api/admin/*`).
 * These must never be sent to Express.
 */
const NEXT_ADMIN_PREFIXES = [
  '/admin/dashboard',
  '/admin/users',
  '/admin/referrals',
  '/admin/payments',
  '/admin/enrollments',
  '/admin/analytics',
  '/admin/audit',
  '/admin/admins',
  '/admin/agents',
  '/admin/discounts',
  '/admin/course-videos',
  '/admin/discussions',
  '/admin/notifications',
  '/admin/resellers',
  '/admin/settings',
  '/admin/scholarships',
];

/**
 * Student-facing modules implemented as Next.js API routes.
 */
const NEXT_STUDENT_PREFIXES = [
  '/scholarships',
  '/public/scholarships',
  '/notifications',
  '/settings/public',
  '/reseller',
  '/referrals',
  '/agents',
  '/mlm',
  '/access',
  '/progress',
  '/courses',
  '/profile',
];

/**
 * Determine the correct base URL for a given endpoint.
 *
 * @param {string} url - The request path (may include a query string)
 * @returns {string} The base URL
 */
function resolveBaseURL(url) {
  const u = String(url || '');

  const isNextAdminRoute = NEXT_ADMIN_PREFIXES.some(
    (prefix) => u === prefix || u.startsWith(`${prefix}/`) || u.startsWith(`${prefix}?`)
  );
  if (isNextAdminRoute) return '/api';

  const isNextStudentRoute = NEXT_STUDENT_PREFIXES.some(
    (prefix) => u === prefix || u.startsWith(`${prefix}/`) || u.startsWith(`${prefix}?`)
  );
  if (isNextStudentRoute) return '/api';

  return EXPRESS_BASE_URL || '/api';
}

/* ── Axios instance ────────────────────────────────────────────────── */

const axiosInstance = axios.create({
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getItem('auth_token');
  const adminToken = getItem('admin_token');

  config.baseURL = resolveBaseURL(config.url);

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

/* ── Pattern → i18n key mapping ────────────────────────────────────── */

const DELETE_PATTERNS = [
  [/\/admin\/courses\/[^/]+$/, 'actions.deleteCourse'],
  [/\/admin\/course-videos\/[^/]+$/, 'actions.deleteVideo'],
  [/\/admin\/discussions\/[^/]+$/, 'actions.deleteDiscussion'],
  [/\/admin\/discounts\/[^/]+$/, 'actions.deleteDiscount'],
  [/\/admin\/lessons\/[^/]+$/, 'actions.deleteLesson'],
  [/\/admin\/phases\/[^/]+$/, 'actions.deletePhase'],
  [/\/admin\/weeks\/[^/]+$/, 'actions.deleteWeek'],
  [/\/admin\/admins\/[^/]+$/, 'actions.deleteAdmin'],
  [/\/admin\/scholarships\/[^/]+$/, 'actions.deleteCampaign'],
];

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