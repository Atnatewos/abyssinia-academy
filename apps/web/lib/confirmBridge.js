/**
 * @fileoverview Confirmation Bridge
 *
 * A minimal, dependency-free module that lets the API interceptor in
 * api.js dispatch a confirmation dialog without importing
 * ConfirmProvider (which would create a circular dependency).
 *
 * Two sides talk through this bridge:
 *
 *   api.js           → calls requestConfirm(options) → Promise<boolean>
 *   ConfirmProvider  → calls subscribeToGlobalConfirm(fn) to receive calls
 *
 * If no subscriber is registered yet (provider not mounted), the bridge
 * falls back to a native window.confirm so nothing silently bypasses.
 *
 * Path: apps/web/lib/confirmBridge.js
 */

/**
 * The currently registered confirm handler, set by ConfirmProvider on
 * mount. Null until the provider renders for the first time.
 *
 * @type {((options: object) => Promise<boolean>) | null}
 */
let globalConfirmHandler = null;

/**
 * Register the ConfirmProvider's confirm function. Called once from
 * ConfirmProvider's useEffect on mount.
 *
 * @param {(options: object) => Promise<boolean>} handler
 */
export function subscribeToGlobalConfirm(handler) {
  globalConfirmHandler = handler;
}

/**
 * Dispatch a confirmation request through the registered handler.
 * Falls back to window.confirm when no provider is mounted so
 * critical actions still get a gate (SSR safety).
 *
 * @param {object} options - ConfirmDialog props
 * @returns {Promise<boolean>}
 */
export async function requestConfirm(options) {
  if (typeof globalConfirmHandler === 'function') {
    return globalConfirmHandler(options);
  }

  if (typeof window === 'undefined') return false;

  return window.confirm(
    `${options.title || 'Confirm'}\n\n${options.message || ''}`
  );
}