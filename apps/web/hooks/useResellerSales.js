/**
 * @fileoverview Reseller Sales Hook
 *
 * Paginated sales history for the authenticated reseller. Fetches from
 * /api/reseller/sales?page=N&limit=N and returns both the row data and
 * the pagination metadata.
 *
 * Path: apps/web/hooks/useResellerSales.js
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../lib/api';

const DEFAULT_LIMIT = 20;

/**
 * useResellerSales — Paginated sales list.
 *
 * @returns {{
 *   sales: object[],
 *   pagination: object|null,
 *   loading: boolean,
 *   error: string|null,
 *   fetchPage: (page: number) => Promise<void>,
 *   refetch: () => Promise<void>
 * }}
 */
const useResellerSales = () => {
  const [sales, setSales] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentPageRef = useRef(1);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchPage = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    currentPageRef.current = page;

    try {
      const response = await apiClient.get(
        `/reseller/sales?page=${page}&limit=${DEFAULT_LIMIT}`
      );
      if (!mountedRef.current) return;

      if (response?.success && response.data) {
        setSales(response.data.sales || []);
        setPagination(response.data.pagination || null);
      } else {
        setError(response?.message || 'Failed to load sales.');
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setError(
        err?.response?.data?.message || err?.message || 'Failed to load sales.'
      );
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  return {
    sales,
    pagination,
    loading,
    error,
    fetchPage,
    refetch: () => fetchPage(currentPageRef.current),
  };
};

export default useResellerSales;