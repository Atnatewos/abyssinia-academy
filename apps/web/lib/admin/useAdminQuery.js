/**
 * @fileoverview Admin Data Fetching Hook
 *
 * The single fetch primitive for every admin page. Encapsulates:
 *   - Auth gate (missing token → login redirect)
 *   - 401 handling (expired token → login redirect)
 *   - Stale-response guard (sequence counter discards out-of-order replies)
 *   - Unmount safety (no setState after teardown)
 *   - Ref-stable toast/router access (context re-renders never retrigger)
 *   - Optional debounced dependency (search inputs)
 *   - Manual refetch for post-mutation refresh
 *
 * Because toast and router live in refs, the effect dependency array
 * contains ONLY real data dependencies — the infinite
 * fetch → toast → re-render → fetch loop is structurally impossible.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useAdminQuery({
 *     url: '/admin/users',
 *     deps: [statusFilter, debouncedSearch],
 *     select: (res) => res.data,
 *     errorKey: 'admin.common.toasts.loadFailed',
 *   });
 *
 * Path: apps/web/lib/admin/useAdminQuery.js
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import apiClient from '../api';
import { getItem } from '../storage';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { resolveLabel } from './labels';

/** Default debounce for search-driven queries (ms). */
const DEFAULT_DEBOUNCE_MS = 300;

/**
 * Debounce a rapidly-changing value (typically a search input).
 *
 * @param {*} value
 * @param {number} [delayMs]
 * @returns {*}
 */
export const useDebouncedValue = (value, delayMs = DEFAULT_DEBOUNCE_MS) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
};

/**
 * Fetch an admin endpoint with full lifecycle safety.
 *
 * @param {object} options
 * @param {string|Function} options.url - Endpoint path, or (deps) => path
 * @param {Array} [options.deps=[]] - Real data dependencies that trigger refetch
 * @param {Function} [options.select] - Extract payload from the API envelope
 * @param {*} [options.initialData=null] - State before first successful fetch
 * @param {string} [options.errorKey] - i18n key for the failure toast
 * @param {boolean} [options.enabled=true] - Skip fetching when false
 * @param {boolean} [options.silent=false] - Suppress the failure toast
 * @returns {{ data: *, loading: boolean, error: Error|null, refetch: Function }}
 */
const useAdminQuery = ({
  url,
  deps = [],
  select,
  initialData = null,
  errorKey = 'admin.common.toasts.loadFailed',
  enabled = true,
  silent = false,
}) => {
  const router = useRouter();
  const toast = useToast();
  const { t } = useLanguage();

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  /* Ref-stable access — identities never enter the dependency array */
  const routerRef = useRef(router);
  routerRef.current = router;
  const toastRef = useRef(toast);
  toastRef.current = toast;
  const tRef = useRef(t);
  tRef.current = t;
  const selectRef = useRef(select);
  selectRef.current = select;
  const urlRef = useRef(url);
  urlRef.current = url;

  const seqRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refetch = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return undefined;
    }

    const token = getItem('admin_token');
    if (!token) {
      routerRef.current.push('/admin/login');
      return undefined;
    }

    const seq = ++seqRef.current;
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const endpoint =
          typeof urlRef.current === 'function'
            ? urlRef.current(...deps)
            : urlRef.current;

        const response = await apiClient.get(endpoint);

        if (cancelled || seq !== seqRef.current || !mountedRef.current) return;

        if (response?.success) {
          const payload = selectRef.current
            ? selectRef.current(response)
            : response.data;
          setData(payload);
        } else {
          const message =
            response?.message || resolveLabel(tRef.current, errorKey);
          setError(new Error(message));
          if (!silent) toastRef.current.error(message);
        }
      } catch (err) {
        if (cancelled || seq !== seqRef.current || !mountedRef.current) return;

        if (err?.response?.status === 401) {
          routerRef.current.push('/admin/login');
          return;
        }

        const message =
          err?.response?.data?.message || resolveLabel(tRef.current, errorKey);
        setError(err instanceof Error ? err : new Error(message));
        if (!silent) toastRef.current.error(message);
      } finally {
        if (!cancelled && seq === seqRef.current && mountedRef.current) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, tick, ...deps]);

  return { data, loading, error, refetch };
};

export default useAdminQuery;