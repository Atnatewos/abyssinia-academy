/**
 * @fileoverview Discount Code Hook
 * Manages discount code validation, application, and removal.
 * Enforces one-time use per checkout session.
 * Auto-resets on unmount to prevent carry-over between modal opens.
 * 
 * Path: apps/web/hooks/useDiscountCode.js
 */

import { useState, useCallback, useEffect } from 'react';
import apiClient from '../lib/api';

/**
 * Custom hook for managing discount code state.
 * Handles validate → apply → remove flow.
 * Only ONE code can be applied at a time.
 * Resets completely on unmount.
 * 
 * @returns {object} Discount code state and actions
 */
const useDiscountCode = () => {
  const [code, setCode] = useState('');
  const [discountData, setDiscountData] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [isApplied, setIsApplied] = useState(false);
  const [hasBeenApplied, setHasBeenApplied] = useState(false);

  /*
   * Auto-reset on unmount — prevents discount code
   * from persisting when modal closes and reopens.
   */
  useEffect(() => {
    return () => {
      setCode('');
      setDiscountData(null);
      setIsApplied(false);
      setValidationError(null);
      setHasBeenApplied(false);
    };
  }, []);

  /**
   * Validate a discount code against the server.
   * Blocks validation if a code has already been applied in this session.
   * 
   * @param {string} codeToValidate - The discount code to check
   * @param {object} purchaseInfo - { amount, courseType, selectedPhases }
   * @returns {object} { success, data, message }
   */
  const validateCode = useCallback(async (codeToValidate, purchaseInfo = {}) => {
    /*
     * Block: code already applied in this session
     */
    if (hasBeenApplied) {
      setValidationError('A discount code has already been applied to this order.');
      return { success: false, message: 'A discount code has already been applied to this order.' };
    }

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
  }, [hasBeenApplied]);

  /**
   * Apply the validated discount code.
   * Marks the session as having applied a code — blocks further applications.
   */
  const applyCode = useCallback((codeToApply) => {
    setCode(codeToApply);
    setIsApplied(true);
    setHasBeenApplied(true);
    setValidationError(null);
  }, []);

  /**
   * Remove the currently applied discount code.
   * Allows applying a different code after removal.
   */
  const removeCode = useCallback(() => {
    setCode('');
    setDiscountData(null);
    setIsApplied(false);
    setValidationError(null);
    /*
     * Allow re-application after removal — but only ONE active at a time
     */
    setHasBeenApplied(false);
  }, []);

  /**
   * Reset all state — called externally when checkout flow completes or cancels
   */
  const reset = useCallback(() => {
    setCode('');
    setDiscountData(null);
    setIsApplied(false);
    setValidationError(null);
    setHasBeenApplied(false);
  }, []);

  return {
    code,
    discountData,
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

export default useDiscountCode;