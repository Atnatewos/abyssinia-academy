/**
 * @fileoverview Checkout Modal — Database-Driven Pricing
 * Uses usePaymentConfig hook — same prices as pricing page and admin panel.
 * No static fallback visible to user.
 * Path: apps/web/components/payment/CheckoutModal.jsx
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { X, Clock, Sparkles, AlertCircle } from 'lucide-react';
import CheckoutForm from './CheckoutForm';
import PaymentMethodSelector from './PaymentMethodSelector';
import PaymentStatus from './PaymentStatus';
import DiscountCodeInput from '../discount/DiscountCodeInput';
import DiscountBreakdown from '../discount/DiscountBreakdown';
import DiscountCodeBadge from '../discount/DiscountCodeBadge';
import useCountdownTimer from '../../hooks/useCountdownTimer';
import usePaymentConfig from '../../hooks/usePaymentConfig';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../lib/api';
import { getApprovalConfig, getCheckoutModalConfig, calculateCombinedDiscount } from '../../lib/config';

const CheckoutModal = ({
  isOpen = false,
  onClose,
  purchaseMode = 'full-course',
  selectedPhases = [],
  coursePhases = [],
  referralDiscountPercent = 0,
  referralCode = '',
  onDiscountApplied,
  onDiscountRemoved,
}) => {
  const { t, language } = useLanguage();
  const toast = useToast();
  const timer = useCountdownTimer();
  const { pricing, paymentMethods, loading: pricingLoading } = usePaymentConfig();

  const approvalConfig = useMemo(() => getApprovalConfig(), []);
  const modalConfig = useMemo(() => getCheckoutModalConfig(), []);

  const [discountCode, setDiscountCode] = useState('');
  const [discountCodePercent, setDiscountCodePercent] = useState(0);
  const [discountCodeFixed, setDiscountCodeFixed] = useState(0);
  const [creditApplied, setCreditApplied] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);

  const selectedMethodData = useMemo(() => {
    return paymentMethods.find((m) => m.id === selectedMethod) || null;
  }, [selectedMethod, paymentMethods]);

  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedMethod) {
      setSelectedMethod(paymentMethods[0].id);
    }
  }, [paymentMethods, selectedMethod]);

  const baseAmount = useMemo(() => {
    if (purchaseMode === 'individual-phases' && selectedPhases.length > 0) {
      const perPhaseAmount = pricing?.perPhase?.amountETB || 0;
      return perPhaseAmount * selectedPhases.length;
    }
    return pricing?.fullCourse?.amountETB || 0;
  }, [purchaseMode, selectedPhases, pricing]);

  const currency = pricing?.fullCourse?.currency || 'ETB';

  const discountBreakdown = useMemo(() => {
    return calculateCombinedDiscount({
      basePrice: baseAmount,
      referralDiscountPercent,
      discountCodePercent,
      discountCodeFixed,
      creditAmount: creditApplied,
    });
  }, [baseAmount, referralDiscountPercent, discountCodePercent, discountCodeFixed, creditApplied]);

  const finalAmount = discountBreakdown.finalPrice;

  const selectedPhaseNames = useMemo(() => {
    if (purchaseMode === 'full-course') return [];
    return selectedPhases.map((phaseId) => {
      const phase = coursePhases.find((p) => (p.id || `phase-${p.number}`) === phaseId);
      return phase ? (language === 'am' ? (phase.title_am || phase.title) : phase.title) : phaseId;
    });
  }, [purchaseMode, selectedPhases, coursePhases, language]);

  const discountBadgeType = useMemo(() => {
    if (referralDiscountPercent > 0 && discountCodePercent > 0) return 'both';
    if (referralDiscountPercent > 0) return 'referral';
    if (discountCodePercent > 0) return 'discount';
    return null;
  }, [referralDiscountPercent, discountCodePercent]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleDiscountApplied = useCallback((data) => {
    setDiscountCode(data.code);
    if (data.type === 'percentage') {
      setDiscountCodePercent(data.value);
      setDiscountCodeFixed(0);
    } else {
      setDiscountCodePercent(0);
      setDiscountCodeFixed(data.discountAmount);
    }
    if (onDiscountApplied) onDiscountApplied(data);
  }, [onDiscountApplied]);

  const handleDiscountRemoved = useCallback(() => {
    setDiscountCode('');
    setDiscountCodePercent(0);
    setDiscountCodeFixed(0);
    if (onDiscountRemoved) onDiscountRemoved();
  }, [onDiscountRemoved]);

  const handleSubmit = async (paymentData) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('fullName', paymentData.fullName);
      formData.append('phone', paymentData.phone);
      formData.append('paymentMethod', paymentData.paymentMethod);
      formData.append('transactionRef', paymentData.transactionRef);
      formData.append('purchaseMode', purchaseMode);
      formData.append('amount', finalAmount.toString());

      if (referralCode) formData.append('referralCode', referralCode);
      if (discountCode) {
        formData.append('discountCode', discountCode);
        formData.append('discountCodeAmount', String(discountBreakdown.discountCodeDiscount));
      }
      if (referralDiscountPercent > 0) {
        formData.append('referralDiscountPercent', String(referralDiscountPercent));
        formData.append('referralDiscountAmount', String(discountBreakdown.referralDiscount));
      }
      if (purchaseMode === 'individual-phases' && selectedPhases.length > 0) {
        formData.append('selectedPhases', JSON.stringify(selectedPhases));
      }
      if (paymentData.screenshot) formData.append('screenshot', paymentData.screenshot);

      const response = await apiClient.post('/payments/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response && response.success) {
        setPaymentSubmitted(true);
        toast.success(language === 'am' ? approvalConfig.pendingMessageAm : approvalConfig.pendingMessage);
      }
    } catch {
      toast.error(language === 'am' ? 'ክፍያ መላክ አልተሳካም።' : 'Payment submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const modalTitle = language === 'am' ? modalConfig.titleAm : modalConfig.title;

  return (
    <div className="checkout-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="checkout-modal-container">
        <button className="checkout-modal-close" onClick={onClose}><X size={20} /></button>
        <div className="checkout-modal-header">
          <h2 className="checkout-modal-title">{modalTitle}</h2>
          {timer.isEnabled && (
            <div className="checkout-modal-timer" style={{ borderColor: timer.currentColor, color: timer.currentColor }}>
              <Clock size={14} />
              <span>{timer.isExpired ? 'Expired' : timer.formattedTime.total}</span>
            </div>
          )}
        </div>

        {paymentSubmitted ? (
          <div className="checkout-modal-body"><PaymentStatus status="pending" /></div>
        ) : (
          <div className="checkout-modal-body">
            <div className="checkout-modal-summary">
              {discountBadgeType && (
                <DiscountCodeBadge
                  type={discountBadgeType}
                  referralPercent={referralDiscountPercent}
                  discountPercent={discountCodePercent}
                  discountCode={discountCode}
                />
              )}
              <h3 className="checkout-modal-summary-title">{t.checkoutModal?.purchaseSummaryTitle || 'Purchase Summary'}</h3>
              {purchaseMode === 'full-course' ? (
                <div className="checkout-modal-summary-item">
                  <Sparkles size={16} />
                  <span>{t.pricing?.masterclass || 'Full Course'}</span>
                  <span>{baseAmount.toLocaleString()} {currency}</span>
                </div>
              ) : (
                selectedPhaseNames.map((name, i) => (
                  <div key={i} className="checkout-modal-summary-item">
                    <Sparkles size={16} />
                    <span>{name}</span>
                    <span>{pricing?.perPhase?.amountETB?.toLocaleString()} {currency}</span>
                  </div>
                ))
              )}
              {(referralDiscountPercent > 0 || discountCodePercent > 0) && (
                <DiscountBreakdown
                  basePrice={baseAmount}
                  breakdown={discountBreakdown}
                  discountCode={discountCode}
                  discountCodePercent={discountCodePercent}
                  referralPercent={referralDiscountPercent}
                  currency={currency}
                />
              )}
            </div>

            <div className="checkout-modal-section">
              <DiscountCodeInput
                purchaseInfo={{ amount: baseAmount, courseType: purchaseMode, selectedPhases }}
                onDiscountApplied={handleDiscountApplied}
                onDiscountRemoved={handleDiscountRemoved}
              />
            </div>

            <div className="checkout-modal-section">
              <label className="checkout-modal-section-label">{t.checkout?.paymentMethod || 'Payment Method'}</label>
              <PaymentMethodSelector methods={paymentMethods} selected={selectedMethod} onSelect={setSelectedMethod} />
            </div>

            <CheckoutForm
              selectedMethod={selectedMethod}
              selectedMethodData={selectedMethodData}
              amount={finalAmount}
              currency={currency}
              onSubmit={handleSubmit}
              loading={submitting}
              discountCode={discountCode}
              discountCodePercent={discountCodePercent}
              discountBreakdown={discountBreakdown}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;