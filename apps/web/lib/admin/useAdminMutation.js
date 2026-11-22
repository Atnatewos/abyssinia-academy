/**
 * @fileoverview Admin Mutation Hook
 *
 * Wraps every admin write action in a consistent lifecycle:
 *   confirm (styled dialog) → request → toast → onSuccess callback
 *
 * Guarantees:
 *   - No native browser dialogs anywhere
 *   - Cancelled confirmations short-circuit silently
 *   - 401 redirects to login
 *   - Per-action busy flag for button disabling
 *   - Server error messages surface through the styled toast
 *
 * Usage:
 *   const { mutate, busy } = useAdminMutation();
 *   await mutate({
 *     method: 'patch',
 *     url: `/admin/payments/${id}/approve`,
 *     confirm: { title, message, variant: 'warning', confirmText },
 *     successKey: 'admin.common.toasts.saved',
 *     errorKey: 'admin.common.toasts.actionFailed',
 *     onSuccess: refetch,
 *   });
 *
 * Path: apps/web/lib/admin/useAdminMutation.js
 */

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import apiClient from '../api';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { useConfirm } from '../../components/shared/ConfirmProvider';
import { resolveLabel, interpolate } from './labels';

/**
 * Execute admin mutations with confirmation, feedback, and busy state.
 *
 * @returns {{ mutate: Function, busy: boolean }}
 */
const useAdminMutation = () => {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const { t } = useLanguage();

  const [busy, setBusy] = useState(false);

  const routerRef = useRef(router);
  routerRef.current = router;
  const toastRef = useRef(toast);
  toastRef.current = toast;
  const confirmRef = useRef(confirm);
  confirmRef.current = confirm;
  const tRef = useRef(t);
  tRef.current = t;

  /**
   * Run a mutation.
   *
   * @param {object} options
   * @param {'post'|'put'|'patch'|'delete'} options.method
   * @param {string} options.url
   * @param {*} [options.payload] - Request body
   * @param {object|null} [options.confirm] - Styled-dialog options; null skips
   * @param {string} [options.successKey] - i18n key for success toast
   * @param {Record<string,string|number>} [options.successValues] - Template values
   * @param {string} [options.errorKey] - i18n key for failure toast
   * @param {Function} [options.onSuccess] - Called with response after success
   * @returns {Promise<object|null>} Response envelope, or null when cancelled/failed
   */
  const mutate = useCallback(async ({
    method,
    url,
    payload,
    confirm: confirmOptions = null,
    successKey = 'admin.common.toasts.saved',
    successValues,
    errorKey = 'admin.common.toasts.actionFailed',
    onSuccess,
  }) => {
    if (confirmOptions) {
      const approved = await confirmRef.current(confirmOptions);
      if (!approved) return null;
    }

    setBusy(true);
    try {
      /* The interceptor's own confirm is bypassed — this hook owns the UX */
      const requestOptions = { _confirm: null };
      const response =
        method === 'delete'
          ? await apiClient.delete(url, requestOptions)
          : await apiClient[method](url, payload, requestOptions);

      if (response?.cancelled) return null;

      if (response?.success) {
        const template = resolveLabel(tRef.current, successKey);
        toastRef.current.success(
          successValues ? interpolate(template, successValues) : template
        );
        if (typeof onSuccess === 'function') onSuccess(response);
        return response;
      }

      toastRef.current.error(
        response?.message || resolveLabel(tRef.current, errorKey)
      );
      return null;
    } catch (err) {
      if (err?.response?.status === 401) {
        routerRef.current.push('/admin/login');
        return null;
      }
      toastRef.current.error(
        err?.response?.data?.message || resolveLabel(tRef.current, errorKey)
      );
      return null;
    } finally {
      setBusy(false);
    }
  }, []);

  return { mutate, busy };
};

export default useAdminMutation;