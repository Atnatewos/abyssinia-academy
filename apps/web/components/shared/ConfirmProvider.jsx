/**
 * @fileoverview Global Confirmation Provider
 *
 * Bridge between api.js (via confirmBridge) and ConfirmDialog. Also
 * exposes useConfirm() for imperative use. Fallback window.confirm
 * uses i18n labels from the confirmations namespace.
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

const ConfirmProvider = ({ children }) => {
  const { t } = useLanguage();
  const [dialogState, setDialogState] = useState(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setDialogState({ options, resolve });
    });
  }, []);

  useEffect(() => {
    subscribeToGlobalConfirm((options) => {
      return new Promise((resolve) => {
        setDialogState({ options, resolve });
      });
    });
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

const useConfirm = () => {
  const ctx = useContext(ConfirmContext);

  if (!ctx) {
    /* Fallback — no provider mounted. Use native confirm with i18n
       defaults for the fallback dialog itself. */
    return async (options) => {
      if (typeof window === 'undefined') return false;
      let fallbackTitle = options.title || 'Confirm';
      try {
        const en = require('@shared/config/i18n/en/confirmations');
        fallbackTitle =
          options.title ||
          en.confirmations?.defaults?.fallbackTitle ||
          fallbackTitle;
      } catch {
        /* silent */
      }
      return window.confirm(
        `${fallbackTitle}\n\n${options.message || ''}`
      );
    };
  }

  return ctx.confirm;
};

export { ConfirmProvider, useConfirm };