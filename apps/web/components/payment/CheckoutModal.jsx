/**
 * @fileoverview Checkout Modal
 *
 * Three-layer structure:
 *   .checkout-modal-overlay    ← fixed full-viewport backdrop
 *   .checkout-modal-container  ← capped-width scrollable card
 *   .checkout-modal-body       ← form + summary content
 *
 * All styling lives in components.css as pure CSS — no Tailwind classes
 * on the shell so nothing from the utility layer can override the modal
 * geometry.
 *
 * Path: apps/web/components/payment/CheckoutModal.jsx
 */

import React, { useMemo, useEffect } from 'react';
import { X, Clock, Sparkles, Layers } from 'lucide-react';
import CheckoutForm from './CheckoutForm';
import PaymentMethodSelector from './PaymentMethodSelector';
import PaymentStatus from './PaymentStatus';
import DiscountCodeInput from '../discount/DiscountCodeInput';
import DiscountBreakdown from '../discount/DiscountBreakdown';
import ResellerCheckoutBanner from '../reseller/ResellerCheckoutBanner';
import useCountdownTimer from '../../hooks/useCountdownTimer';
import { useCheckoutEngine } from '../../hooks/useCheckoutEngine';
import { useLanguage } from '../../context/LanguageContext';
import { getCheckoutModalConfig } from '../../lib/config';

const CheckoutModal = ({
  isOpen = false,
  onClose,
  purchaseMode = 'full-course',
  selectedPhases = [],
  coursePhases = [],
  courseId = null,
  coursePriceEtb = null,
  referralDiscountPercent = 0,
  referralCode = '',
  initialAgentCode = '',
  initialAgentName = '',
  isAgentBuyer = false,
  resellerCode = '',
  resellerProfile = null,
}) => {
  const { t, language } = useLanguage();
  const timer = useCountdownTimer();
  const modalConfig = useMemo(() => getCheckoutModalConfig(), []);

  const engine = useCheckoutEngine({
    purchaseMode,
    selectedPhases,
    courseId,
    coursePriceEtb,
    referralDiscountPercent,
    referralCode,
    initialAgentCode,
    isAgentBuyer,
    resellerCode,
    resellerProfile,
  });

  /* Lock body scroll while the modal is open. */
  useEffect(() => {
    if (!isOpen) return undefined;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  /* Close on Escape. */
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  /* Resolve phase display names. */
  const selectedPhaseDetails = useMemo(() => {
    if (purchaseMode !== 'individual-phases' || selectedPhases.length === 0) {
      return [];
    }
    const perPhasePrice = engine.pricing?.perPhase?.amountETB || 0;
    return selectedPhases.map((phaseId) => {
      const phase = coursePhases.find(
        (p) => (p.id || `phase-${p.phase_number}`) === phaseId
      );
      return {
        id: phaseId,
        title: phase
          ? language === 'am'
            ? phase.title_am || phase.title
            : phase.title
          : phaseId,
        price: perPhasePrice,
      };
    });
  }, [purchaseMode, selectedPhases, coursePhases, engine.pricing, language]);

  if (!isOpen) return null;

  const modalTitle = language === 'am' ? modalConfig.titleAm : modalConfig.title;

  return (
    <div
      className="checkout-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="checkout-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-modal-title"
      >
        <button
          type="button"
          className="checkout-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="checkout-modal-header">
          <h2 id="checkout-modal-title" className="checkout-modal-title">
            {modalTitle}
          </h2>
          {timer.isEnabled && (
            <div
              className="checkout-modal-timer"
              style={{
                borderColor: timer.currentColor,
                color: timer.currentColor,
              }}
            >
              <Clock size={14} />
              <span>
                {timer.isExpired ? 'Expired' : timer.formattedTime.total}
              </span>
            </div>
          )}
        </div>

        {engine.paymentSubmitted ? (
          <div className="checkout-modal-body">
            <PaymentStatus status="pending" />
          </div>
        ) : (
          <div className="checkout-modal-body">
            {engine.isResellerActive && (
              <ResellerCheckoutBanner resellerProfile={resellerProfile} />
            )}

            <div className="checkout-modal-summary">
              <h3 className="checkout-modal-summary-title">
                {t.checkout?.purchaseSummaryTitle || 'Purchase Summary'}
              </h3>

              {purchaseMode === 'full-course' && (
                <div className="checkout-modal-summary-item">
                  <Sparkles size={16} />
                  <span>{t.pricing?.masterclass || 'Full Course'}</span>
                  <span>
                    {engine.baseAmount.toLocaleString()} {engine.currency}
                  </span>
                </div>
              )}

              {purchaseMode === 'individual-phases' &&
                selectedPhaseDetails.length > 0 && (
                  <>
                    {selectedPhaseDetails.map((phase, idx) => (
                      <div
                        key={phase.id || idx}
                        className="checkout-modal-summary-item"
                      >
                        <Layers size={16} />
                        <span>{phase.title}</span>
                        <span>
                          {phase.price.toLocaleString()} {engine.currency}
                        </span>
                      </div>
                    ))}
                    <div className="checkout-modal-summary-item is-total">
                      <span className="checkout-modal-summary-total-label">
                        {t.pricing?.totalLabel || 'Total'}
                      </span>
                      <span>
                        {engine.baseAmount.toLocaleString()} {engine.currency}
                      </span>
                    </div>
                  </>
                )}

              {!engine.isResellerActive &&
                engine.discountBreakdown.totalDiscountPercent > 0 && (
                  <DiscountBreakdown
                    basePrice={engine.baseAmount}
                    breakdown={engine.discountBreakdown}
                    discountCode={engine.discountCode}
                    discountCodePercent={engine.discountCodePercent}
                    referralPercent={
                      isAgentBuyer ? 10 : referralDiscountPercent
                    }
                    currency={engine.currency}
                  />
                )}
            </div>

            {!engine.isResellerActive && (
              <div className="checkout-modal-section">
                <DiscountCodeInput
                  purchaseInfo={{
                    amount: engine.baseAmount,
                    courseType: purchaseMode,
                    selectedPhases,
                  }}
                  onDiscountApplied={engine.handleDiscountApplied}
                  onDiscountRemoved={engine.handleDiscountRemoved}
                />
              </div>
            )}

            <div className="checkout-modal-section">
              <label className="checkout-modal-section-label">
                {t.checkout?.paymentMethod || 'Payment Method'}
              </label>
              <PaymentMethodSelector
                methods={engine.paymentMethods}
                selected={engine.selectedMethod}
                onSelect={engine.setSelectedMethod}
              />
            </div>

            <CheckoutForm
              selectedMethod={engine.selectedMethod}
              selectedMethodData={engine.selectedMethodData}
              amount={engine.finalAmount}
              currency={engine.currency}
              onSubmit={engine.submitPayment}
              loading={engine.submitting}
              discountCode={engine.discountCode}
              discountCodePercent={engine.discountCodePercent}
              discountBreakdown={engine.discountBreakdown}
              initialAgentCode={isAgentBuyer ? '' : initialAgentCode}
              initialAgentName={isAgentBuyer ? '' : initialAgentName}
              isAgentBuyer={isAgentBuyer}
              courseId={courseId}
              resellerCode={resellerCode}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;