/**
 * @fileoverview Reseller Dashboard Data Hook
 *
 * Fetches aggregate statistics for the authenticated reseller from
 * /api/reseller/dashboard. Manages loading and error state.
 *
 * Exposes:
 *   - dashboard    → { wallet, sales, subResellers, recentSales }
 *   - loading      → boolean
 *   - error        → string | null
 *   - refetch()    → re-runs the fetch
 *
 * Path: apps/web/hooks/useResellerDashboard.js
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../lib/api';

/**
 * useResellerDashboard — Fetches and caches the reseller's dashboard data.
 *
 * @returns {{
 *   dashboard: object|null,
 *   loading: boolean,
 *   error: string|null,
 *   refetch: () => Promise<void>
 * }}
 */
const useResellerDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/reseller/dashboard');
      if (!mountedRef.current) return;

      if (response?.success && response.data) {
        setDashboard(response.data);
      } else {
        setError(response?.message || 'Failed to load dashboard.');
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setError(
        err?.response?.data?.message || err?.message || 'Failed to load dashboard.'
      );
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    dashboard,
    loading,
    error,
    refetch: fetchDashboard,
  };
};

export default useResellerDashboard;