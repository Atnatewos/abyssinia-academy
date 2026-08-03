/**
 * @fileoverview Discount Code Hook
 * Manages discount code validation, application, and removal.
 * Path: apps/web/hooks/useDiscountCode.js
 */

import { useState, useCallback } from 'react';
import apiClient from '../lib/api';

/**
 * Custom hook for managing discount code state.
 * Handles validate → apply → remove flow.
 * @returns {object} Discount code state and actions
 */
const useDiscountCode = () => {
  const [code, setCode] = useState('');
  const [discountData, setDiscountData] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [isApplied, setIsApplied] = useState(false);

  /**
   * Validate a discount code against the server.
   * Does NOT apply it — just checks if it's valid.
   * @param {string} codeToValidate - The discount code to check
   * @param {object} purchaseInfo - { amount, courseType, selectedPhases }
   * @returns {object} { success, data, message }
   */
  const validateCode = useCallback(async (codeToValidate, purchaseInfo = {}) => {
    setIsValidating(true);
    setValidationError(null);

    try {
      const response = await apiClient.post('/discounts/validate', {
        code: codeToValidate,
        amount: purchaseInfo.amount || 0,
        courseType: purchaseInfo.courseType || 'full-course',
        selectedPhases: purchaseInfo.selectedPhases || [],
      });

      if (response && response.success) {
        setDiscountData(response.data);
        return { success: true, data: response.data };
      }

      setValidationError(response?.message || 'Invalid discount code.');
      return { success: false, message: response?.message };
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to validate discount code.';
      setValidationError(message);
      return { success: false, message };
    } finally {
      setIsValidating(false);
    }
  }, []);

  /**
   * Apply the validated discount code.
   * This confirms the code will be used for the purchase.
   */
  const applyCode = useCallback((codeToApply) => {
    setCode(codeToApply);
    setIsApplied(true);
  }, []);

  /**
   * Remove the currently applied discount code.
   */
  const removeCode = useCallback(() => {
    setCode('');
    setDiscountData(null);
    setIsApplied(false);
    setValidationError(null);
  }, []);

  /**
   * Reset all state (useful when checkout modal closes)
   */
  const reset = useCallback(() => {
    setCode('');
    setDiscountData(null);
    setIsApplied(false);
    setValidationError(null);
  }, []);

  return {
    code,
    discountData,
    isApplied,
    isValidating,
    validationError,
    validateCode,
    applyCode,
    removeCode,
    reset,
  };
};

export default useDiscountCode;