/**
 * @fileoverview Reseller Code Hook
 *
 * Manages reseller attribution captured from a `?reseller=CODE` query
 * parameter. Fetches the reseller's profile from the public validation
 * endpoint and persists the code across page reloads so a visitor who
 * bounces still gets attributed when they return.
 *
 * Behavior:
 *   - On mount: read `router.query.reseller`; if present, validate.
 *   - Persist validated code in localStorage (survives redirect to register).
 *   - On any page load without a query param: restore from localStorage.
 *   - Clear on explicit reset (e.g., after successful checkout).
 *
 * Path: apps/web/hooks/useResellerCode.js
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import apiClient from '../lib/api';
import { getItem, setItem, removeItem } from '../lib/storage';
import { isResellerEnabled } from '../lib/reseller-config';

const STORAGE_KEY = 'reseller_code';
const STORAGE_PROFILE_KEY = 'reseller_profile';

/**
 * useResellerCode — Returns the current reseller attribution state.
 *
 * @returns {{
 *   resellerProfile: object|null,
 *   resellerCode: string,
 *   loading: boolean,
 *   error: string|null,
 *   clearReseller: () => void
 * }}
 */
const useResellerCode = () => {
  const router = useRouter();
  const [resellerProfile, setResellerProfile] = useState(null);
  const [resellerCode, setResellerCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Validate a reseller code against the public endpoint.
   * Returns the profile or null.
   *
   * @param {string} code
   * @returns {Promise<object|null>}
   */
  const validateResellerCode = useCallback(async (code) => {
    if (!code || typeof code !== 'string') return null;

    try {
      const response = await apiClient.post('/reseller/validate-code', {
        code: code.trim().toUpperCase(),
      });

      if (response?.success && response.data) {
        return {
          code: response.data.code,
          displayName: response.data.displayName,
          price: response.data.price,
        };
      }
      return null;
    } catch (err) {
      console.warn(
        '[useResellerCode] Validation failed:',
        err?.response?.data?.message || err?.message
      );
      return null;
    }
  }, []);

  /**
   * Clear the reseller attribution from state + localStorage.
   */
  const clearReseller = useCallback(() => {
    removeItem(STORAGE_KEY);
    removeItem(STORAGE_PROFILE_KEY);
    setResellerProfile(null);
    setResellerCode('');
    setError(null);
  }, []);

  useEffect(() => {
    if (!isResellerEnabled()) return;

    let cancelled = false;

    const resolveAttribution = async () => {
      setLoading(true);
      setError(null);

      /* 1. Query param takes precedence */
      const queryCode = router.query?.reseller;
      if (queryCode && typeof queryCode === 'string') {
        const profile = await validateResellerCode(queryCode);
        if (cancelled) return;

        if (profile) {
          setResellerProfile(profile);
          setResellerCode(profile.code);
          setItem(STORAGE_KEY, profile.code);
          setItem(STORAGE_PROFILE_KEY, profile);
          setLoading(false);
          return;
        }

        /* Query param invalid — do not fall back to storage (user tried a new code) */
        setError('Invalid or inactive reseller code.');
        clearReseller();
        setLoading(false);
        return;
      }

      /* 2. No query param — restore from localStorage */
      const storedCode = getItem(STORAGE_KEY);
      const storedProfile = getItem(STORAGE_PROFILE_KEY);

      if (storedCode && storedProfile) {
        setResellerProfile(storedProfile);
        setResellerCode(storedCode);
        setLoading(false);
        return;
      }

      setLoading(false);
    };

    resolveAttribution();

    return () => {
      cancelled = true;
    };
  }, [router.query?.reseller, validateResellerCode, clearReseller]);

  return {
    resellerProfile,
    resellerCode,
    loading,
    error,
    clearReseller,
  };
};

export default useResellerCode;