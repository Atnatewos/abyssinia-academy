/**
 * @fileoverview Reseller Profile Hook
 *
 * Loads the authenticated user's reseller profile + pricing bounds, and
 * exposes an updatePrice() method that hits PATCH /api/reseller/price.
 *
 * Used by the dashboard (to render current price) and the PriceEditor
 * component (to update it).
 *
 * Path: apps/web/hooks/useResellerProfile.js
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../lib/api';

/**
 * useResellerProfile — Fetch + update reseller profile.
 *
 * @returns {{
 *   profile: object|null,
 *   config: object|null,
 *   loading: boolean,
 *   error: string|null,
 *   saving: boolean,
 *   saveError: string|null,
 *   updatePrice: (price: number) => Promise<{ success: boolean, price?: number, message?: string }>,
 *   refetch: () => Promise<void>
 * }}
 */
const useResellerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/reseller/profile');
      if (!mountedRef.current) return;

      if (response?.success && response.data) {
        setProfile(response.data.profile);
        setConfig(response.data.config);
      } else {
        setError(response?.message || 'Failed to load profile.');
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setError(
        err?.response?.data?.message || err?.message || 'Failed to load profile.'
      );
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updatePrice = useCallback(async (price) => {
    setSaving(true);
    setSaveError(null);

    try {
      const response = await apiClient.patch('/reseller/price', { price });
      if (!mountedRef.current) {
        return { success: false, message: 'Component unmounted' };
      }

      if (response?.success && response.data) {
        /* Optimistically update the profile with the new price */
        setProfile((prev) =>
          prev ? { ...prev, customPrice: response.data.price } : prev
        );
        return { success: true, price: response.data.price };
      }

      const message = response?.message || 'Failed to update price.';
      setSaveError(message);
      return { success: false, message };
    } catch (err) {
      if (!mountedRef.current) {
        return { success: false, message: 'Component unmounted' };
      }
      const message =
        err?.response?.data?.message || err?.message || 'Failed to update price.';
      setSaveError(message);
      return { success: false, message };
    } finally {
      if (mountedRef.current) setSaving(false);
    }
  }, []);

  return {
    profile,
    config,
    loading,
    error,
    saving,
    saveError,
    updatePrice,
    refetch: fetchProfile,
  };
};

export default useResellerProfile;