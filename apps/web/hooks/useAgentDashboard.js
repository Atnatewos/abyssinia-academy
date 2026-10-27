/**
 * @fileoverview Agent Dashboard Hook
 *
 * Manages state for the student-facing agent dashboard.
 * Fetches aggregate stats + paginated commission history.
 *
 * Path: apps/web/hooks/useAgentDashboard.js
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../lib/api';

const useAgentDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);

  const [commissions, setCommissions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [commissionsLoading, setCommissionsLoading] = useState(false);

  /* Prevent state updates after unmount */
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchDashboard = useCallback(async () => {
    setDashboardLoading(true);
    setDashboardError(null);
    try {
      const response = await apiClient.get('/agents/dashboard');
      if (isMounted.current) {
        if (response.success) {
          setDashboard(response.data);
        } else {
          setDashboardError(response.message || 'Failed to load agent dashboard.');
        }
      }
    } catch (err) {
      if (isMounted.current) {
        setDashboardError(
          err?.response?.data?.message || 'Failed to load agent dashboard.'
        );
      }
    } finally {
      if (isMounted.current) setDashboardLoading(false);
    }
  }, []);

  const fetchCommissions = useCallback(async (page = 1) => {
    setCommissionsLoading(true);
    try {
      const response = await apiClient.get(`/agents/commissions?page=${page}&limit=20`);
      if (isMounted.current) {
        if (response.success) {
          setCommissions(response.data.commissions || []);
          setPagination(response.data.pagination || null);
        }
      }
    } catch (err) {
      console.error('Failed to load agent commissions:', err.message);
    } finally {
      if (isMounted.current) setCommissionsLoading(false);
    }
  }, []);

  /* Load on mount */
  useEffect(() => {
    fetchDashboard();
    fetchCommissions(1);
  }, [fetchDashboard, fetchCommissions]);

  return {
    dashboard,
    dashboardLoading,
    dashboardError,
    commissions,
    pagination,
    commissionsLoading,
    fetchCommissions,
    refresh: () => {
      fetchDashboard();
      fetchCommissions(1);
    },
  };
};

export default useAgentDashboard;