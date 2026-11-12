/**
 * @fileoverview Payment Configuration Hook with Cache
 *
 * Fetches pricing + payment methods from /api/settings/public once.
 * Uses stale-while-revalidate: returns the last cached response
 * immediately, then refreshes in the background.
 *
 * Path: apps/web/hooks/usePaymentConfig.js
 */

import { useState, useEffect, useCallback } from 'react';

const CACHE_KEY = 'abyssinia_cache_payment_config';

/**
 * Safely read the cached payment config.
 */
const readCache = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Safely write the payment config to cache.
 */
const writeCache = (value) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
};

const usePaymentConfig = () => {
  // Initialize from cache so prices render on frame 1
  const [pricing, setPricing] = useState(() => {
    const cached = readCache();
    return cached?.pricing || null;
  });
  const [paymentMethods, setPaymentMethods] = useState(() => {
    const cached = readCache();
    return cached?.paymentMethods || [];
  });
  const [loading, setLoading] = useState(true);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings/public');
      const data = await response.json();

      if (data && data.success && data.data) {
        const nextPricing = data.data.pricing || null;
        const nextMethods = (data.data.paymentMethods || []).filter(
          (m) => m.isActive !== false
        );

        setPricing(nextPricing);
        setPaymentMethods(nextMethods);
        writeCache({ pricing: nextPricing, paymentMethods: nextMethods });
      } else {
        // Server returned something odd — rely on cache if we had it
        const cached = readCache();
        if (!cached?.pricing) {
          setPricing(null);
          setPaymentMethods([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch payment config:', error.message);
      // On network failure, if we already have prices from cache, keep them.
      const cached = readCache();
      if (!cached?.pricing) {
        setPricing(null);
        setPaymentMethods([]);
      }
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