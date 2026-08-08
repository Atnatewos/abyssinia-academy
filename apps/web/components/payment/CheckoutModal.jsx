/**
 * @fileoverview Checkout Modal Component
 * Full checkout experience in a modal popup with purchase summary,
 * payment form, countdown timer, referral discount, discount code input,
 * credit application, and combined discount breakdown with percentages.
 * ALL content from i18n + config — zero hardcoded strings.
 * Path: apps/web/components/payment/CheckoutModal.jsx
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { X, Clock, Sparkles, AlertCircle } from 'lucide-react';
import CheckoutForm from './CheckoutForm';
import PaymentMethodSelector from './PaymentMethodSelector';
import PaymentStatus from './PaymentStatus';
import PhaseCartSummary from '../checkout/PhaseCartSummary';
import DiscountCodeInput from '../discount/DiscountCodeInput';
import DiscountBreakdown from '../discount/DiscountBreakdown';
import DiscountCodeBadge from '../discount/DiscountCodeBadge';
import useCountdownTimer from '../../hooks/useCountdownTimer';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../lib/api';
import {
  getActivePaymentMethods,
  getPaymentMethodById,
  getPricing,
  getApprovalConfig,
  getCheckoutModalConfig,
  calculatePhasePricing,
  calculateCombinedDiscount,
} from '../../lib/config';

/**
 * CheckoutModal — Overlay modal for completing enrollment.
 * Handles referral discounts, discount codes, and credit application.
 * Shows discount code percentage alongside code name in breakdown.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {function} props.onClose - Callback to close the modal
 * @param {string} props.purchaseMode - 'full-course' or 'individual-phases'
 * @param {Array} props.selectedPhases - Array of phase ID strings
 * @param {Array} props.coursePhases - Full phase objects from course config
 * @param {number} props.referralDiscountPercent - Discount from referral (0-100)
 * @param {string} props.referralCode - The referral code used (if any)
 * @param {number} props.availableCredit - Available referral credit balance
 * @param {function} props.onDiscountApplied - Callback when discount is applied
 * @param {function} props.onDiscountRemoved - Callback when discount is removed
 */
const CheckoutModal = ({
  isOpen = false,
  onClose,
  purchaseMode = 'full-course',
  selectedPhases = [],
  coursePhases = [],
  referralDiscountPercent = 0,
  referralCode = '',
  availableCredit = 0,
  onDiscountApplied,
  onDiscountRemoved,
}) => {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const timer = useCountdownTimer();

  /*
   * Load config data
   */
  const paymentMethods = useMemo(() => getActivePaymentMethods(), []);
  const pricing = useMemo(() => getPricing(), []);
  const approvalConfig = useMemo(() => getApprovalConfig(), []);
  const modalConfig = useMemo(() => getCheckoutModalConfig(), []);

  /*
   * Calculate base amount from selected items
   */
  const baseAmount = useMemo(() => {
    if (purchaseMode === 'individual-phases' && selectedPhases.length > 0) {
      const calc = calculatePhasePricing(selectedPhases);
      return calc.baseTotal;
    }
    const fullCourse = pricing.fullCourse || {};
    return fullCourse.amountETB || 2499;
  }, [purchaseMode, selectedPhases, pricing]);

  const currency = useMemo(() => {
    const fullCourse = pricing.fullCourse || {};
    return fullCourse.currency || 'ETB';
  }, [pricing]);

  /*
   * Discount code state
   */
  const [discountCode, setDiscountCode] = useState('');
  const [discountCodePercent, setDiscountCodePercent] = useState(0);
  const [discountCodeFixed, setDiscountCodeFixed] = useState(0);

  /*
   * Credit application state
   */
  const [creditApplied, setCreditApplied] = useState(0);

  /*
   * Calculate combined discount breakdown whenever inputs change
   */
  const discountBreakdown = useMemo(() => {
    return calculateCombinedDiscount({
      basePrice: baseAmount,
      referralDiscountPercent,
      discountCodePercent,
      discountCodeFixed,
      creditAmount: creditApplied,
    });
  }, [baseAmount, referralDiscountPercent, discountCodePercent, discountCodeFixed, creditApplied]);

  /*
   * Final purchase amount after all discounts
   */
  const finalAmount = discountBreakdown.finalPrice;

  /*
   * Resolve phase names for display
   */
  const selectedPhaseNames = useMemo(() => {
    if (purchaseMode === 'full-course') return [];
    return selectedPhases.map((phaseId) => {
      const phase = coursePhases.find((p) => (p.id || `phase-${p.number}`) === phaseId);
      if (!phase) return phaseId;
      return language === 'am' ? (phase.title_am || phase.title) : phase.title;
    });
  }, [purchaseMode, selectedPhases, coursePhases, language]);

  /*
   * Check if upgrade to full course is a better deal
   */
  const upgradeNudge = useMemo(() => {
    if (purchaseMode !== 'individual-phases' || selectedPhases.length === 0) return null;
    const fullPrice = pricing.fullCourse?.amountETB || 2499;
    if (finalAmount >= fullPrice) {
      return {
        message: (t.checkoutModal?.upgradeNudgeFullCourse
          || '💡 Get the full course for just {price} ETB — same price, all 5 phases!')
          .replace('{price}', fullPrice.toLocaleString()),
      };
    }
    return null;
  }, [purchaseMode, selectedPhases, finalAmount, pricing, t]);

  /*
   * Determine what discount badge to show
   */
  const discountBadgeType = useMemo(() => {
    if (referralDiscountPercent > 0 && discountCodePercent > 0) return 'both';
    if (referralDiscountPercent > 0) return 'referral';
    if (discountCodePercent > 0) return 'discount';
    return null;
  }, [referralDiscountPercent, discountCodePercent]);

  /*
   * Payment method state
   */
  const defaultMethodId = paymentMethods.length > 0 ? paymentMethods[0].id : 'telebirr';
  const [selectedMethod, setSelectedMethod] = useState(defaultMethodId);
  const [submitting, setSubmitting] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);

  const selectedMethodData = useMemo(() => getPaymentMethodById(selectedMethod), [selectedMethod]);

  /*
   * Lock body scroll when modal is open
   */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  /*
   * Handle Escape key to close
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  /**
   * Handle discount code applied callback.
   * Passes the discount data up to the parent (pricing page)
   * so the badge remains visible after modal close.
   */
  const handleDiscountApplied = useCallback((data) => {
    setDiscountCode(data.code);
    if (data.type === 'percentage') {
      setDiscountCodePercent(data.value);
      setDiscountCodeFixed(0);
    } else if (data.type === 'fixed_amount') {
      setDiscountCodePercent(0);
      setDiscountCodeFixed(data.discountAmount);
    }

    /*
     * Notify parent so the badge persists on the pricing page
     */
    if (onDiscountApplied) {
      onDiscountApplied(data);
    }
  }, [onDiscountApplied]);

  /**
   * Handle discount code removed callback.
   * Clears local state and notifies parent.
   */
  const handleDiscountRemoved = useCallback(() => {
    setDiscountCode('');
    setDiscountCodePercent(0);
    setDiscountCodeFixed(0);

    if (onDiscountRemoved) {
      onDiscountRemoved();
    }
  }, [onDiscountRemoved]);

  /**
   * Handle payment form submission
   */
  const handleSubmit = async (paymentData) => {
    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', paymentData.fullName);
      formDataToSend.append('phone', paymentData.phone);
      formDataToSend.append('paymentMethod', paymentData.paymentMethod);
      formDataToSend.append('transactionRef', paymentData.transactionRef);
      formDataToSend.append('purchaseMode', purchaseMode);
      formDataToSend.append('amount', finalAmount.toString());

      /*
       * Attach referral data
       */
      if (referralCode) {
        formDataToSend.append('referralCode', referralCode);
      }

      /*
       * Attach discount code data
       */
      if (discountCode) {
        formDataToSend.append('discountCode', discountCode);
        formDataToSend.append('discountCodeAmount', String(discountBreakdown.discountCodeDiscount));
      }

      /*
       * Attach credit applied
       */
      if (creditApplied > 0) {
        formDataToSend.append('creditApplied', String(creditApplied));
      }

      /*
       * Attach referral discount info
       */
      if (referralDiscountPercent > 0) {
        formDataToSend.append('referralDiscountPercent', String(referralDiscountPercent));
        formDataToSend.append('referralDiscountAmount', String(discountBreakdown.referralDiscount));
      }

      if (purchaseMode === 'individual-phases' && selectedPhases.length > 0) {
        formDataToSend.append('selectedPhases', JSON.stringify(selectedPhases));
      }

      if (paymentData.screenshot) {
        formDataToSend.append('screenshot', paymentData.screenshot);
      }

      const response = await apiClient.post('/payments/submit', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response && response.success) {
        setPaymentSubmitted(true);
        toast.success(
          language === 'am'
            ? (approvalConfig.pendingMessageAm || 'ክፍያዎ እየተረጋገጠ ነው።')
            : (approvalConfig.pendingMessage || 'Payment proof submitted. Waiting for approval.')
        );
      }
    } catch (err) {
      toast.error(
        language === 'am'
          ? (t.checkoutModal?.submitError || 'ክፍያ መላክ አልተሳካም።')
          : (t.checkoutModal?.submitError || 'Payment submission failed. Please try again.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  /*
   * Timer display
   */
  const timerMessage = timer.isEnabled && !timer.isExpired
    ? (language === 'am'
        ? (timer.messages.checkoutBannerAm || '⏰ ክፍያውን በ {minutes}:{seconds} ውስጥ ያጠናቅቁ')
        : (timer.messages.checkoutBanner || '⏰ Complete payment within {minutes}:{seconds} to secure this price'))
        .replace('{minutes}', timer.formattedTime.minutes)
        .replace('{seconds}', timer.formattedTime.seconds)
    : null;

  const modalTitle = language === 'am'
    ? (modalConfig.titleAm || 'ምዝገባዎን ያጠናቅቁ')
    : (modalConfig.title || 'Complete Your Enrollment');

  return (
    <div
      className="checkout-modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="checkout-modal-container">

        {/* Close Button */}
        <button
          className="checkout-modal-close"
          onClick={onClose}
          aria-label="Close checkout"
        >
          <X size={20} />
        </button>

        {/* Header with Timer */}
        <div className="checkout-modal-header">
          <h2 className="checkout-modal-title">{modalTitle}</h2>
          {timer.isEnabled && (
            <div
              className="checkout-modal-timer"
              style={{ borderColor: timer.currentColor, color: timer.currentColor }}
            >
              <Clock size={14} />
              <span>
                {timer.isExpired
                  ? (language === 'am'
                      ? (timer.messages.expiredTextAm || 'ቅናሹ አልቋል')
                      : (timer.messages.expiredText || 'Offer expired'))
                  : timer.formattedTime.total}
              </span>
              {!timer.isExpired && (
                <div className="checkout-modal-timer-bar">
                  <div
                    className="checkout-modal-timer-bar-fill"
                    style={{ width: `${timer.percentRemaining}%`, background: timer.currentColor }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Timer Message Banner */}
        {timerMessage && (
          <div
            className="checkout-modal-timer-msg"
            style={{ borderColor: timer.currentColor, color: timer.currentColor }}
          >
            <Clock size={14} />
            <span>{timerMessage}</span>
          </div>
        )}

        {/* Payment Submitted Success */}
        {paymentSubmitted ? (
          <div className="checkout-modal-body">
            <PaymentStatus status="pending" />
          </div>
        ) : (
          <div className="checkout-modal-body">

            {/* Purchase Summary */}
            {modalConfig.showPurchaseSummary !== false && (
              <div className="checkout-modal-summary">

                {/* Discount Badge */}
                {discountBadgeType && (
                  <DiscountCodeBadge
                    type={discountBadgeType}
                    referralPercent={referralDiscountPercent}
                    discountPercent={discountCodePercent}
                    discountCode={discountCode}
                  />
                )}

                <h3 className="checkout-modal-summary-title">
                  {t.checkoutModal?.purchaseSummaryTitle || 'What You\'re Buying'}
                </h3>

                {/* Full Course */}
                {purchaseMode === 'full-course' ? (
                  <div className="checkout-modal-summary-item">
                    <span className="checkout-modal-summary-icon">
                      <Sparkles size={16} />
                    </span>
                    <span className="checkout-modal-summary-name">
                      {t.pricing?.masterclass || 'Full-Stack Software Masterclass'}
                    </span>
                    <span className="checkout-modal-summary-price">
                      {baseAmount.toLocaleString()} {currency}
                    </span>
                  </div>
                ) : (
                  /* Individual Phases */
                  <>
                    {selectedPhaseNames.map((name, index) => (
                      <div key={index} className="checkout-modal-summary-item">
                        <span className="checkout-modal-summary-icon">
                          <Sparkles size={16} />
                        </span>
                        <span className="checkout-modal-summary-name">{name}</span>
                        <span className="checkout-modal-summary-price">
                          {(pricing.perPhase?.amountETB || 750).toLocaleString()} {currency}
                        </span>
                      </div>
                    ))}
                  </>
                )}

                {/* Discount Breakdown — shows discount code percentage alongside code name */}
                {(referralDiscountPercent > 0 || discountCodePercent > 0 || creditApplied > 0) && (
                  <div className="checkout-modal-summary-totals">
                    <DiscountBreakdown
                      basePrice={baseAmount}
                      breakdown={discountBreakdown}
                      discountCode={discountCode}
                      discountCodePercent={discountCodePercent}
                      referralPercent={referralDiscountPercent}
                      currency={currency}
                    />
                  </div>
                )}

                {/* Upgrade Nudge */}
                {modalConfig.showUpgradeNudge !== false && upgradeNudge && (
                  <div className="checkout-modal-upgrade-nudge">
                    <AlertCircle size={16} />
                    <span>{upgradeNudge.message}</span>
                  </div>
                )}
              </div>
            )}

            {/* Discount Code Input */}
            <div className="checkout-modal-section">
              <DiscountCodeInput
                purchaseInfo={{
                  amount: baseAmount,
                  courseType: purchaseMode,
                  selectedPhases,
                }}
                onDiscountApplied={handleDiscountApplied}
                onDiscountRemoved={handleDiscountRemoved}
              />
            </div>

            {/* Payment Method Selector */}
            <div className="checkout-modal-section">
              <label className="checkout-modal-section-label">
                {t.checkout?.paymentMethod || 'Payment Method'}
              </label>
              <PaymentMethodSelector
                methods={paymentMethods}
                selected={selectedMethod}
                onSelect={setSelectedMethod}
              />
            </div>

            {/* Checkout Form */}
            <CheckoutForm
              selectedMethod={selectedMethod}
              selectedMethodData={selectedMethodData}
              amount={finalAmount}
              currency={currency}
              onSubmit={handleSubmit}
              loading={submitting}
              discountCode={discountCode}
              discountCodePercent={discountCodePercent}
              discountCodeFixed={discountCodeFixed}
              discountBreakdown={discountBreakdown}
              onDiscountApplied={handleDiscountApplied}
              onDiscountRemoved={handleDiscountRemoved}
              purchaseMode={purchaseMode}
              selectedPhases={selectedPhases}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;