/**
 * @fileoverview Agent Code Hook
 *
 * Manages agent code validation, application, and removal at checkout.
 * Supports two flows:
 *   1. Manual validation → /api/agents/validate → applyCode(data)
 *   2. Pre-validated → applyPrevalidated(data) — used when the pricing
 *      page already knows the agent's code (from registration attribution)
 *
 * Path: apps/web/hooks/useAgentCode.js
 */

import { useState, useCallback, useEffect } from 'react';
import apiClient from '../lib/api';

const useAgentCode = () => {
  const [code, setCode] = useState('');
  const [agentData, setAgentData] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [isApplied, setIsApplied] = useState(false);
  const [hasBeenApplied, setHasBeenApplied] = useState(false);

  /* Reset state on unmount so a stale code never carries into a new order */
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
   *
   * @param {string} codeToValidate - The agent code to check
   * @returns {Promise<{success: boolean, data?: object, message?: string}>}
   */
  const validateCode = useCallback(
    async (codeToValidate) => {
      if (hasBeenApplied) {
        const message =
          'An agent code has already been applied to this order.';
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
   * Apply a code that was already validated (or pre-attributed at
   * registration time).
   *
   * @param {object} prevalidatedData
   * @param {string} prevalidatedData.code         - The agent code string
   * @param {string} [prevalidatedData.agentName]  - Display name of the agent
   * @param {string} [prevalidatedData.agentUserId]- Agent's user UUID (for submit)
   */
  const applyPrevalidated = useCallback((prevalidatedData) => {
    if (!prevalidatedData?.code) return;
    setCode(prevalidatedData.code.toUpperCase());
    setAgentData({
      code: prevalidatedData.code.toUpperCase(),
      agentName: prevalidatedData.agentName || 'Registered Agent',
      agentUserId: prevalidatedData.agentUserId || null,
    });
    setIsApplied(true);
    setHasBeenApplied(true);
    setValidationError(null);
  }, []);

  /**
   * Apply the validated agent code (from validateCode's successful result).
   *
   * @param {string} codeToApply - Validated agent code string
   * @param {object} [data]      - The full validate response data
   */
  const applyCode = useCallback((codeToApply, data) => {
    setCode(codeToApply);
    if (data) setAgentData(data);
    setIsApplied(true);
    setHasBeenApplied(true);
    setValidationError(null);
  }, []);

  const removeCode = useCallback(() => {
    setCode('');
    setAgentData(null);
    setIsApplied(false);
    setValidationError(null);
    setHasBeenApplied(false);
  }, []);

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
    applyPrevalidated,
    removeCode,
    reset,
  };
};

export default useAgentCode;