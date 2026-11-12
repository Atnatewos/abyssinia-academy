/**
 * @fileoverview Checkout Engine
 *
 * Fixes the amount resolution so that:
 *   - Full course      → coursePriceEtb OR global
 *   - Individual phases → perPhase × count  (NOT coursePriceEtb)
 *   - Reseller         → resellerProfile.price (overrides everything)
 *
 * Path: apps/web/hooks/useCheckoutEngine.js
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import apiClient from '../lib/api';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import usePaymentConfig from './usePaymentConfig';
import { getApprovalConfig, calculateCombinedDiscount } from '../lib/config';

export const useCheckoutEngine = ({
  purchaseMode = 'full-course',
  selectedPhases = [],
  courseId = null,
  coursePriceEtb = null,
  referralDiscountPercent = 0,
  referralCode = '',
  initialAgentCode = '',
  isAgentBuyer = false,
  resellerCode = '',
  resellerProfile = null,
}) => {
  const { language } = useLanguage();
  const toast = useToast();
  const { pricing, paymentMethods } = usePaymentConfig();

  const approvalConfig = useMemo(() => getApprovalConfig(), []);
  const currency = pricing?.fullCourse?.currency || pricing?.perPhase?.currency || 'ETB';
  const isResellerActive = Boolean(resellerProfile && resellerCode);

  /* ── Base Amount Resolution ──────────────────────────────────────────
   * Priority:
   *   1. Reseller price (overrides everything)
   *   2. Individual phases (sum of per-phase × count)
   *   3. Course price (if set in admin)
   *   4. Global full course fallback
   */
  const baseAmount = useMemo(() => {
    // 1. Reseller wins
    if (isResellerActive && resellerProfile?.price != null) {
      return Number(resellerProfile.price);
    }

    // 2. Individual phases — compute from per-phase price
    if (purchaseMode === 'individual-phases' && selectedPhases.length > 0) {
      const perPhaseAmount = pricing?.perPhase?.amountETB || 0;
      return perPhaseAmount * selectedPhases.length;
    }

    // 3. Course-specific price (only for full-course mode)
    if (coursePriceEtb != null && Number(coursePriceEtb) > 0) {
      return Number(coursePriceEtb);
    }

    // 4. Global fallback
    return pricing?.fullCourse?.amountETB || 0;
  }, [
    isResellerActive,
    resellerProfile,
    purchaseMode,
    selectedPhases.length,
    coursePriceEtb,
    pricing,
  ]);

  /* ── Discount Logic ──────────────────────────────────────────────── */
  const [discountCode, setDiscountCode] = useState('');
  const [discountCodePercent, setDiscountCodePercent] = useState(0);
  const [discountCodeFixed, setDiscountCodeFixed] = useState(0);

  const discountBreakdown = useMemo(() => {
    if (isResellerActive) {
      return {
        basePrice: baseAmount,
        agentDiscount: 0,
        referralDiscount: 0,
        discountCodeDiscount: 0,
        creditApplied: 0,
        totalDiscount: 0,
        totalDiscountPercent: 0,
        finalPrice: baseAmount,
        wasCapped: false,
        appliedAgentDiscount: false,
        appliedReferral: false,
      };
    }
    return calculateCombinedDiscount({
      basePrice: baseAmount,
      referralDiscountPercent,
      discountCodePercent,
      discountCodeFixed,
      isAgentBuyer,
    });
  }, [
    isResellerActive,
    baseAmount,
    referralDiscountPercent,
    discountCodePercent,
    discountCodeFixed,
    isAgentBuyer,
  ]);

  const finalAmount = discountBreakdown.finalPrice;

  const handleDiscountApplied = useCallback(
    (data) => {
      if (isResellerActive) return;
      setDiscountCode(data.code);
      if (data.type === 'percentage') {
        setDiscountCodePercent(data.value);
        setDiscountCodeFixed(0);
      } else {
        setDiscountCodePercent(0);
        setDiscountCodeFixed(data.discountAmount);
      }
    },
    [isResellerActive]
  );

  const handleDiscountRemoved = useCallback(() => {
    setDiscountCode('');
    setDiscountCodePercent(0);
    setDiscountCodeFixed(0);
  }, []);

  /* ── Payment Method State ────────────────────────────────────────── */
  const [selectedMethod, setSelectedMethod] = useState('');
  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedMethod) {
      setSelectedMethod(paymentMethods[0].id);
    }
  }, [paymentMethods, selectedMethod]);

  const selectedMethodData = useMemo(
    () => paymentMethods.find((m) => m.id === selectedMethod) || null,
    [selectedMethod, paymentMethods]
  );

  /* ── Submission ──────────────────────────────────────────────────── */
  const [submitting, setSubmitting] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);

  const submitPayment = async (paymentData) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('fullName', paymentData.fullName);
      formData.append('phone', paymentData.phone);
      formData.append('paymentMethod', paymentData.paymentMethod);
      formData.append('purchaseMode', purchaseMode);

      if (paymentData.transactionRef) formData.append('transactionRef', paymentData.transactionRef);
      if (paymentData.screenshot) formData.append('screenshot', paymentData.screenshot);

      if (isResellerActive) {
        formData.append('resellerCode', resellerCode);
      } else if (courseId) {
        formData.append('courseId', courseId);
      }

      if (referralCode) formData.append('referralCode', referralCode);
      if (discountCode) formData.append('discountCode', discountCode);
      if (isAgentBuyer) formData.append('isAgentBuyer', 'true');
      if (paymentData.agentId) formData.append('agentId', paymentData.agentId);

      if (purchaseMode === 'individual-phases' && selectedPhases.length > 0) {
        formData.append('selectedPhases', JSON.stringify(selectedPhases));
      }

      const response = await apiClient.post('/payments/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response && response.success) {
        setPaymentSubmitted(true);
        toast.success(
          language === 'am'
            ? approvalConfig.pendingMessageAm
            : approvalConfig.pendingMessage
        );
      } else {
        throw new Error(response?.message || 'Payment submission failed.');
      }
    } catch (err) {
      console.error('[checkout] Failed:', err?.response?.data || err);
      toast.error(
        language === 'am'
          ? 'ክፍያ መላክ አልተሳካም።'
          : err?.response?.data?.message || 'Payment submission failed.'
      );
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    pricing,
    currency,
    paymentMethods,
    selectedMethod,
    setSelectedMethod,
    selectedMethodData,
    baseAmount,
    discountBreakdown,
    finalAmount,
    isResellerActive,
    discountCode,
    discountCodePercent,
    isAgentBuyer,
    referralDiscountPercent,
    submitting,
    paymentSubmitted,
    handleDiscountApplied,
    handleDiscountRemoved,
    submitPayment,
  };
};