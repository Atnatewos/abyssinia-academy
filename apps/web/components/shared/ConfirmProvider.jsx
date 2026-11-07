/**
 * @fileoverview Global Confirmation Provider
 *
 * Bridges the imperative `useConfirm()` hook (used everywhere in this
 * app) and the shared `<ConfirmDialog>` component. Also subscribes to
 * the `confirmBridge` so `api.js` interceptors can request confirmation
 * without needing a hook context.
 *
 * Design decision — no native fallback:
 *   Previously, when `<ConfirmProvider>` was missing from the tree, this
 *   hook fell back to `window.confirm()`. That produced jarring native
 *   dialogs that broke the platform's design system. The provider is now
 *   mounted at the root (<_app.jsx />), so the fallback should never fire.
 *   If it does — because a new chat session removed the provider from
 *   _app.jsx — a rejected promise with a descriptive error is thrown
 *   instead of a native alert. This makes the misconfiguration loud in
 *   dev and never user-facing in prod.
 *
 * Path: apps/web/components/shared/ConfirmProvider.jsx
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import ConfirmDialog from './ConfirmDialog';
import { subscribeToGlobalConfirm } from '../../lib/confirmBridge';
import { useLanguage } from '../../context/LanguageContext';

const ConfirmContext = createContext(null);

/**
 * Mounts the confirm dialog once and exposes `useConfirm()` to any child.
 * The dialog renders inline (fixed overlay via <ConfirmDialog>) so it's
 * always above the rest of the UI.
 */
const ConfirmProvider = ({ children }) => {
  const { t } = useLanguage();
  const [dialogState, setDialogState] = useState(null);

  /* Imperative path — useConfirm() called from a component */
  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        setDialogState({ options, resolve });
      }),
    []
  );

  /* Bridge path — api.js interceptors call requestConfirm() which
     routes through the confirmBridge subscription here */
  useEffect(() => {
    subscribeToGlobalConfirm(
      (options) =>
        new Promise((resolve) => {
          setDialogState({ options, resolve });
        })
    );
  }, []);

  const handleConfirm = useCallback(() => {
    if (!dialogState) return;
    const { resolve } = dialogState;
    setDialogState(null);
    resolve(true);
  }, [dialogState]);

  const handleClose = useCallback(() => {
    if (!dialogState) return;
    const { resolve } = dialogState;
    setDialogState(null);
    resolve(false);
  }, [dialogState]);

  const value = { confirm };

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {dialogState && (
        <ConfirmDialog
          isOpen
          onClose={handleClose}
          onConfirm={handleConfirm}
          loading={false}
          {...dialogState.options}
        />
      )}
    </ConfirmContext.Provider>
  );
};

/**
 * useConfirm — imperative access to the styled confirm dialog.
 *
 * Returns an async function `(options) => Promise<boolean>`.
 *
 * Throws (via rejected Promise) when called outside a ConfirmProvider —
 * intentionally loud so developers notice the misconfiguration instead
 * of shipping a broken build with silent native alerts.
 */
const useConfirm = () => {
  const ctx = useContext(ConfirmContext);

  if (!ctx) {
    /* Loud failure — the provider should be mounted in _app.jsx. */
    console.error(
      '[useConfirm] ConfirmProvider is not mounted. Add <ConfirmProvider> around your app tree in pages/_app.jsx.'
    );
    return () =>
      Promise.reject(
        new Error(
          'useConfirm() called without a <ConfirmProvider>. Mount the provider in pages/_app.jsx.'
        )
      );
  }

  return ctx.confirm;
};

export { ConfirmProvider, useConfirm };