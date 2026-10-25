/**
 * @fileoverview Agent Code Hook
 *
 * Manages agent code validation, application, and removal at checkout.
 * Enforces one-time use per checkout session. Auto-resets on unmount so
 * a stale agent attribution never carries over into the next order.
 *
 * Pattern mirrors useDiscountCode so checkout components stay consistent.
 *
 * Path: apps/web/hooks/useAgentCode.js
 */

import { useState, useCallback, useEffect } from 'react';
import apiClient from '../lib/api';

/**
 * Custom hook for managing agent code state.
 * Handles validate → apply → remove flow.
 * Only ONE agent code can be applied at a time.
 * Resets completely on unmount.
 *
 * @returns {object} Agent code state and actions
 */
const useAgentCode = () => {
  const [code, setCode] = useState('');
  const [agentData, setAgentData] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [isApplied, setIsApplied] = useState(false);
  const [hasBeenApplied, setHasBeenApplied] = useState(false);

  /*
   * Auto-reset on unmount — prevents agent code from persisting when the
   * checkout modal closes and reopens.
   */
  useEffect(() => {
    return () => {
      setCode('');
      setAgentData(null);
      setIsApplied(false);
      setValidationError(null);
      setHasBeenApplied(false);
    };
  }, []);

  /**
   * Validate an agent code against the server.
   * Blocks validation if a code has already been applied in this session.
   *
   * @param {string} codeToValidate - The agent code to check
   * @returns {{ success: boolean, data?: object, message?: string }}
   */
  const validateCode = useCallback(
    async (codeToValidate) => {
      if (hasBeenApplied) {
        const message = 'An agent code has already been applied to this order.';
        setValidationError(message);
        return { success: false, message };
      }

      if (!codeToValidate || !codeToValidate.trim()) {
        return { success: false, message: 'Agent code is required.' };
      }

      setIsValidating(true);
      setValidationError(null);

      try {
        const response = await apiClient.post('/agents/validate', {
          code: codeToValidate.trim().toUpperCase(),
        });

        if (response && response.success) {
          setAgentData(response.data);
          return { success: true, data: response.data };
        }

        setValidationError(response?.message || 'Invalid agent code.');
        return { success: false, message: response?.message };
      } catch (err) {
        const message =
          err?.response?.data?.message || 'Failed to validate agent code.';
        setValidationError(message);
        return { success: false, message };
      } finally {
        setIsValidating(false);
      }
    },
    [hasBeenApplied]
  );

  /**
   * Apply the validated agent code.
   * Marks the session as having applied a code — blocks further applications.
   *
   * @param {string} codeToApply - Validated agent code
   */
  const applyCode = useCallback((codeToApply) => {
    setCode(codeToApply);
    setIsApplied(true);
    setHasBeenApplied(true);
    setValidationError(null);
  }, []);

  /**
   * Remove the currently applied agent code.
   * Allows applying a different code after removal.
   */
  const removeCode = useCallback(() => {
    setCode('');
    setAgentData(null);
    setIsApplied(false);
    setValidationError(null);
    setHasBeenApplied(false);
  }, []);

  /**
   * Reset all state — called externally when checkout completes or cancels.
   */
  const reset = useCallback(() => {
    setCode('');
    setAgentData(null);
    setIsApplied(false);
    setValidationError(null);
    setHasBeenApplied(false);
  }, []);

  return {
    code,
    agentData,
    isApplied,
    isValidating,
    validationError,
    hasBeenApplied,
    validateCode,
    applyCode,
    removeCode,
    reset,
  };
};

export default useAgentCode;