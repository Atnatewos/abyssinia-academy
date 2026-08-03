/**
 * @fileoverview Checkout Modal Component
 * Full checkout experience in a modal popup with purchase summary, payment form, and countdown timer
 * ALL content from i18n + config — zero hardcoded strings
 * Path: apps/web/components/payment/CheckoutModal.jsx
 */

import React, { useState, useMemo, useEffect } from 'react';
import { X, Clock, Sparkles, AlertCircle } from 'lucide-react';
import CheckoutForm from './CheckoutForm';
import PaymentMethodSelector from './PaymentMethodSelector';
import PaymentStatus from './PaymentStatus';
import PhaseCartSummary from '../checkout/PhaseCartSummary';
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
} from '../../lib/config';

const CheckoutModal = ({ isOpen = false, onClose, purchaseMode = 'full-course', selectedPhases = [], coursePhases = [] }) => {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const timer = useCountdownTimer();

  const paymentMethods = useMemo(() => getActivePaymentMethods(), []);
  const pricing = useMemo(() => getPricing(), []);
  const approvalConfig = useMemo(() => getApprovalConfig(), []);
  const modalConfig = useMemo(() => getCheckoutModalConfig(), []);

  const purchaseAmount = useMemo(() => {
    if (purchaseMode === 'individual-phases' && selectedPhases.length > 0) {
      const calc = calculatePhasePricing(selectedPhases);
      return calc.finalTotal;
    }
    const fullCourse = pricing.fullCourse || {};
    return fullCourse.amountETB || 2499;
  }, [purchaseMode, selectedPhases, pricing]);

  const currency = useMemo(() => { const fc = pricing.fullCourse || {}; return fc.currency || 'ETB'; }, [pricing]);

  const selectedPhaseNames = useMemo(() => {
    if (purchaseMode === 'full-course') return [];
    return selectedPhases.map((phaseId) => {
      const phase = coursePhases.find((p) => (p.id || `phase-${p.number}`) === phaseId);
      if (!phase) return phaseId;
      return language === 'am' ? (phase.title_am || phase.title) : phase.title;
    });
  }, [purchaseMode, selectedPhases, coursePhases, language]);

  const upgradeNudge = useMemo(() => {
    if (purchaseMode !== 'individual-phases' || selectedPhases.length === 0) return null;
    const calc = calculatePhasePricing(selectedPhases);
    const fullPrice = pricing.fullCourse?.amountETB || 2499;
    if (calc.finalTotal >= fullPrice) {
      return {
        message: (t.checkoutModal?.upgradeNudgeFullCourse || '💡 Get the full course for just {price} ETB — same price, all 5 phases!')
          .replace('{price}', fullPrice.toLocaleString()),
        savings: calc.finalTotal - fullPrice,
      };
    }
    return null;
  }, [purchaseMode, selectedPhases, pricing, language, t]);

  const defaultMethodId = paymentMethods.length > 0 ? paymentMethods[0].id : 'telebirr';
  const [selectedMethod, setSelectedMethod] = useState(defaultMethodId);
  const [submitting, setSubmitting] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);

  const selectedMethodData = useMemo(() => getPaymentMethodById(selectedMethod), [selectedMethod]);

  useEffect(() => { if (isOpen) { document.body.style.overflow = 'hidden'; } else { document.body.style.overflow = ''; } return () => { document.body.style.overflow = ''; }; }, [isOpen]);
  useEffect(() => { const h = (e) => { if (e.key === 'Escape' && isOpen) onClose(); }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [isOpen, onClose]);

  const handleSubmit = async (paymentData) => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('fullName', paymentData.fullName);
      fd.append('phone', paymentData.phone);
      fd.append('paymentMethod', paymentData.paymentMethod);
      fd.append('transactionRef', paymentData.transactionRef);
      fd.append('purchaseMode', purchaseMode);
      fd.append('amount', purchaseAmount.toString());
      if (purchaseMode === 'individual-phases' && selectedPhases.length > 0) fd.append('selectedPhases', JSON.stringify(selectedPhases));
      if (paymentData.screenshot) fd.append('screenshot', paymentData.screenshot);
      const resp = await apiClient.post('/payments/submit', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (resp && resp.success) {
        setPaymentSubmitted(true);
        toast.success(language === 'am' ? (approvalConfig.pendingMessageAm || 'ክፍያዎ እየተረጋገጠ ነው።') : (approvalConfig.pendingMessage || 'Payment proof submitted.'));
      }
    } catch {
      toast.error(t.checkoutModal?.submitError || 'Payment submission failed. Please try again.');
    } finally { setSubmitting(false); }
  };

  if (!isOpen) return null;

  const timerMessage = timer.isEnabled && !timer.isExpired
    ? (language === 'am' ? (timer.messages.checkoutBannerAm || '⏰ ክፍያውን በ {minutes}:{seconds} ውስጥ ያጠናቅቁ') : (timer.messages.checkoutBanner || '⏰ Complete payment within {minutes}:{seconds}')).replace('{minutes}', timer.formattedTime.minutes).replace('{seconds}', timer.formattedTime.seconds)
    : null;

  const modalTitle = language === 'am' ? (modalConfig.titleAm || 'ምዝገባዎን ያጠናቅቁ') : (modalConfig.title || 'Complete Your Enrollment');

  return (
    <div className="checkout-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="checkout-modal-container">
        <button className="checkout-modal-close" onClick={onClose} aria-label="Close checkout"><X size={20} /></button>
        <div className="checkout-modal-header">
          <h2 className="checkout-modal-title">{modalTitle}</h2>
          {timer.isEnabled && (
            <div className="checkout-modal-timer" style={{ borderColor: timer.currentColor, color: timer.currentColor }}>
              <Clock size={14} />
              <span>{timer.isExpired ? (language === 'am' ? (timer.messages.expiredTextAm || 'ቅናሹ አልቋል') : (timer.messages.expiredText || 'Offer expired')) : timer.formattedTime.total}</span>
              {!timer.isExpired && (<div className="checkout-modal-timer-bar"><div className="checkout-modal-timer-bar-fill" style={{ width: `${timer.percentRemaining}%`, background: timer.currentColor }} /></div>)}
            </div>
          )}
        </div>
        {timerMessage && (<div className="checkout-modal-timer-msg" style={{ borderColor: timer.currentColor, color: timer.currentColor }}><Clock size={14} /><span>{timerMessage}</span></div>)}
        {paymentSubmitted ? (
          <div className="checkout-modal-body"><PaymentStatus status="pending" /></div>
        ) : (
          <div className="checkout-modal-body">
            {modalConfig.showPurchaseSummary !== false && (
              <div className="checkout-modal-summary">
                <h3 className="checkout-modal-summary-title">{t.checkoutModal?.purchaseSummaryTitle || 'What You\'re Buying'}</h3>
                {purchaseMode === 'full-course' ? (
                  <div className="checkout-modal-summary-item">
                    <span className="checkout-modal-summary-icon"><Sparkles size={16} /></span>
                    <span className="checkout-modal-summary-name">{t.pricing?.masterclass || 'Full-Stack Software Masterclass'}</span>
                    <span className="checkout-modal-summary-price">{purchaseAmount.toLocaleString()} {currency}</span>
                  </div>
                ) : (
                  <>
                    {selectedPhaseNames.map((name, i) => (
                      <div key={i} className="checkout-modal-summary-item">
                        <span className="checkout-modal-summary-icon"><Sparkles size={16} /></span>
                        <span className="checkout-modal-summary-name">{name}</span>
                        <span className="checkout-modal-summary-price">{(pricing.perPhase?.amountETB || 750).toLocaleString()} {currency}</span>
                      </div>
                    ))}
                  </>
                )}
                {purchaseMode === 'individual-phases' && selectedPhases.length > 0 && (
                  <div className="checkout-modal-summary-totals"><PhaseCartSummary selectedPhases={selectedPhases} compact={false} /></div>
                )}
                {modalConfig.showUpgradeNudge !== false && upgradeNudge && (
                  <div className="checkout-modal-upgrade-nudge"><AlertCircle size={16} /><span>{upgradeNudge.message}</span></div>
                )}
              </div>
            )}
            <div className="checkout-modal-section">
              <label className="checkout-modal-section-label">{t.checkout?.paymentMethod || 'Payment Method'}</label>
              <PaymentMethodSelector methods={paymentMethods} selected={selectedMethod} onSelect={setSelectedMethod} />
            </div>
            <CheckoutForm selectedMethod={selectedMethod} selectedMethodData={selectedMethodData} amount={purchaseAmount} currency={currency} onSubmit={handleSubmit} loading={submitting} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;