/**
 * @fileoverview Referral Hook
 * Fetches and manages referral dashboard data.
 * Path: apps/web/hooks/useReferrals.js
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/api';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for fetching referral dashboard data.
 * @returns {object} Referral state and refetch function
 */
const useReferrals = () => {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch the full referral dashboard
   */
  const fetchDashboard = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/referrals/dashboard');

      if (response && response.success) {
        setData(response.data);
      } else {
        setError('Failed to load referral data.');
      }
    } catch (err) {
      console.error('Referral fetch error:', err);
      setError('Unable to load referral data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /*
   * Fetch on mount
   */
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboard,
  };
};

export default useReferrals;