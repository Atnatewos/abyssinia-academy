/**
 * @fileoverview Sub-Resellers Hook
 *
 * Manages the list of sub-resellers under the current reseller + the
 * invite / remove flows. Used by the Sub-Resellers tab.
 *
 * Path: apps/web/hooks/useSubResellers.js
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../lib/api';

/**
 * useSubResellers — Fetch, invite, remove sub-resellers.
 *
 * @returns {{
 *   subResellers: object[],
 *   limits: object|null,
 *   loading: boolean,
 *   error: string|null,
 *   inviting: boolean,
 *   inviteError: string|null,
 *   inviteSubReseller: (identifier: string, subSharePercent: number) => Promise<{ success, data?, message? }>,
 *   removeSubReseller: (subResellerId: string) => Promise<{ success, message? }>,
 *   refetch: () => Promise<void>
 * }}
 */
const useSubResellers = () => {
  const [subResellers, setSubResellers] = useState([]);
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchSubResellers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/reseller/sub-resellers');
      if (!mountedRef.current) return;

      if (response?.success && response.data) {
        setSubResellers(response.data.subResellers || []);
        setLimits(response.data.limits || null);
      } else {
        setError(response?.message || 'Failed to load sub-resellers.');
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to load sub-resellers.'
      );
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubResellers();
  }, [fetchSubResellers]);

  const inviteSubReseller = useCallback(
    async (identifier, subSharePercent) => {
      setInviting(true);
      setInviteError(null);

      try {
        const response = await apiClient.post('/reseller/sub-resellers', {
          identifier,
          subSharePercent,
        });
        if (!mountedRef.current) return { success: false };

        if (response?.success) {
          await fetchSubResellers();
          return { success: true, data: response.data };
        }

        const message = response?.message || 'Failed to invite sub-reseller.';
        setInviteError(message);
        return { success: false, message };
      } catch (err) {
        if (!mountedRef.current) return { success: false };
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to invite sub-reseller.';
        setInviteError(message);
        return { success: false, message };
      } finally {
        if (mountedRef.current) setInviting(false);
      }
    },
    [fetchSubResellers]
  );

  const removeSubReseller = useCallback(
    async (subResellerId) => {
      try {
        const response = await apiClient.delete(
          `/reseller/sub-resellers/${subResellerId}`
        );
        if (!mountedRef.current) return { success: false };

        if (response?.success) {
          await fetchSubResellers();
          return { success: true };
        }
        return {
          success: false,
          message: response?.message || 'Failed to remove sub-reseller.',
        };
      } catch (err) {
        if (!mountedRef.current) return { success: false };
        return {
          success: false,
          message:
            err?.response?.data?.message ||
            err?.message ||
            'Failed to remove sub-reseller.',
        };
      }
    },
    [fetchSubResellers]
  );

  return {
    subResellers,
    limits,
    loading,
    error,
    inviting,
    inviteError,
    inviteSubReseller,
    removeSubReseller,
    refetch: fetchSubResellers,
  };
};

export default useSubResellers;