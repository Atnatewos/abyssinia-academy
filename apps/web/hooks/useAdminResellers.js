/**
 * @fileoverview Admin Resellers Data Hook
 *
 * Fetches paginated reseller list for the admin panel. Manages loading
 * and error state, exposes fetchPage for pagination controls.
 *
 * Path: apps/web/hooks/useAdminResellers.js
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../lib/api';

/**
 * useAdminResellers — Paginated admin reseller list.
 *
 * @param {object} [initial]
 * @param {string} [initial.search='']
 * @param {string} [initial.status='all']
 * @returns {{
 *   resellers: object[],
 *   pagination: object|null,
 *   loading: boolean,
 *   error: string|null,
 *   fetchPage: (page: number, opts?: object) => Promise<void>,
 *   refetch: () => Promise<void>
 * }}
 */
const useAdminResellers = (initial = {}) => {
  const [resellers, setResellers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentRef = useRef({ page: 1, search: initial.search || '', status: initial.status || 'all' });
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchPage = useCallback(async (page = 1, opts = {}) => {
    setLoading(true);
    setError(null);

    const search = opts.search !== undefined ? opts.search : currentRef.current.search;
    const status = opts.status !== undefined ? opts.status : currentRef.current.status;

    currentRef.current = { page, search, status };

    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', '20');
      if (search) params.append('search', search);
      if (status && status !== 'all') params.append('status', status);

      const response = await apiClient.get(`/admin/resellers?${params.toString()}`);
      if (!mountedRef.current) return;

      if (response?.success && response.data) {
        setResellers(response.data.resellers || []);
        setPagination(response.data.pagination || null);
      } else {
        setError(response?.message || 'Failed to load resellers.');
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setError(
        err?.response?.data?.message || err?.message || 'Failed to load resellers.'
      );
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  return {
    resellers,
    pagination,
    loading,
    error,
    fetchPage,
    refetch: () => fetchPage(currentRef.current.page),
  };
};

export default useAdminResellers;