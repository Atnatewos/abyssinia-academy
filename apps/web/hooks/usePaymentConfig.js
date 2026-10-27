/**
 * @fileoverview Payment Configuration Hook — Single Source of Truth
 * Fetches pricing + payment methods from /api/settings/public once.
 * All payment-related components consume this hook.
 * No flicker — returns null until data is loaded, components show skeleton.
 * 
 * Path: apps/web/hooks/usePaymentConfig.js
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * usePaymentConfig — Fetches payment settings from the admin database.
 * Falls back to null (not static config) to prevent price flicker.
 * Components should show a loading skeleton while data is null.
 * 
 * @returns {object}
 * @returns {object|null} returns.pricing — Full pricing object or null
 * @returns {Array} returns.paymentMethods — Payment methods array
 * @returns {boolean} returns.loading — Whether initial fetch is in progress
 * @returns {function} returns.refetch — Manually refetch settings
 */
const usePaymentConfig = () => {
  const [pricing, setPricing] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConfig = useCallback(async () => {
    try {
      const response = await fetch('/api/settings/public');
      const data = await response.json();

      if (data && data.success && data.data) {
        if (data.data.pricing) {
          setPricing(data.data.pricing);
        }
        if (data.data.paymentMethods) {
          setPaymentMethods(
            (data.data.paymentMethods || []).filter((m) => m.isActive !== false)
          );
        }
      }
    } catch (error) {
      console.error('Failed to fetch payment config:', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return {
    pricing,
    paymentMethods,
    loading,
    refetch: fetchConfig,
  };
};

export default usePaymentConfig;