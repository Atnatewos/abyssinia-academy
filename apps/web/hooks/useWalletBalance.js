/**
 * @fileoverview useWalletBalance Hook
 *
 * Fetches the authenticated user's current withdrawable balance.
 * Automatically polls every 60 seconds to keep the navbar updated
 * without requiring a page refresh.
 *
 * Path: apps/web/hooks/useWalletBalance.js
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/api';

const POLL_INTERVAL_MS = 60000;

export const useWalletBalance = (isAuthenticated) => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!isAuthenticated) {
      setBalance(null);
      return;
    }

    try {
      /* 
       * We fetch the dashboard which contains the wallet data.
       * The auth header is automatically injected by apiClient.
       */
      const res = await apiClient.get('/referrals/mlm/dashboard');
      if (res?.success && res.data?.wallet) {
        // The API returns currentBalance (withdrawable)
        setBalance(Number(res.data.wallet.currentBalance) || 0);
      }
    } catch (error) {
      /* Silent fail — the pill just won't render */
      console.warn('[useWalletBalance] Failed to fetch balance:', error?.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    setLoading(true);
    fetchBalance();

    const interval = setInterval(fetchBalance, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchBalance]);

  return { balance, loading };
};