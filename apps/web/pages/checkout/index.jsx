/**
 * @fileoverview Checkout Page
 * Payment submission with method selection and proof upload
 * Handles both full-course and individual-phases purchase modes
 * All payment data from shared config — zero hardcoded values
 * Path: apps/web/pages/checkout/index.jsx
 */

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import CheckoutForm from '../../components/payment/CheckoutForm';
import PaymentMethodSelector from '../../components/payment/PaymentMethodSelector';
import PaymentStatus from '../../components/payment/PaymentStatus';
import PhaseCartSummary from '../../components/checkout/PhaseCartSummary';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../lib/api';
import {
  getActivePaymentMethods,
  getPaymentMethodById,
  getPricing,
  getApprovalConfig,
  calculatePhasePricing,
} from '../../lib/config';

/**
 * CheckoutPage — Payment submission page
 * Supports two modes via URL query params:
 *   ?mode=full-course — full course purchase
 *   ?mode=individual-phases&phases=phase-1,phase-2 — individual phase purchase
 */
const CheckoutPage = () => {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  /*
   * Read purchase mode and selected phases from URL query params
   */
  const purchaseMode = router.query.mode || 'full-course';
  const selectedPhasesFromUrl = router.query.phases
    ? router.query.phases.split(',').filter(Boolean)
    : [];

  /*
   * Load config data
   */
  const paymentMethods = useMemo(() => getActivePaymentMethods(), []);
  const pricing = useMemo(() => getPricing(), []);
  const approvalConfig = useMemo(() => getApprovalConfig(), []);

  /*
   * Calculate the correct amount based on purchase mode
   */
  const purchaseAmount = useMemo(() => {
    if (purchaseMode === 'individual-phases' && selectedPhasesFromUrl.length > 0) {
      const calc = calculatePhasePricing(selectedPhasesFromUrl);
      return calc.finalTotal;
    }
    const fullCourse = pricing.fullCourse || {};
    return fullCourse.amountETB || 4999;
  }, [purchaseMode, selectedPhasesFromUrl, pricing]);

  const currency = useMemo(() => {
    const fullCourse = pricing.fullCourse || {};
    return fullCourse.currency || 'ETB';
  }, [pricing]);

  /*
   * Default to first active payment method
   */
  const defaultMethodId = paymentMethods.length > 0 ? paymentMethods[0].id : 'telebirr';

  const [selectedMethod, setSelectedMethod] = useState(defaultMethodId);
  const [submitting, setSubmitting] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);

  /*
   * Get full method data for the selected payment method
   */
  const selectedMethodData = useMemo(
    () => getPaymentMethodById(selectedMethod),
    [selectedMethod]
  );

  /**
   * Handle payment form submission
   * Sends payment proof to API with purchase mode and phase data
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
      formDataToSend.append('amount', purchaseAmount.toString());

      if (purchaseMode === 'individual-phases' && selectedPhasesFromUrl.length > 0) {
        formDataToSend.append('selectedPhases', JSON.stringify(selectedPhasesFromUrl));
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
      toast.error('Payment submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * Redirect unauthenticated users
   */
  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="empty-state" style={{ padding: '5rem 1rem' }}>
          <p className="empty-state-desc">Please log in to access checkout.</p>
          <Link
            href={`/auth/login?redirect=${encodeURIComponent(router.asPath)}`}
            className="pricing-btn"
            style={{ display: 'inline-flex', marginTop: '1rem' }}
          >
            Go to Login
          </Link>
        </div>
      </PageLayout>
    );
  }

  /*
   * Show payment status after successful submission
   */
  if (paymentSubmitted) {
    return (
      <>
        <SEOHead title={t.checkout?.pendingTitle || 'Payment Under Review'} />
        <PageLayout>
          <div className="checkout-page">
            <Link href="/pricing" className="auth-back-link">
              <ArrowLeft />
              Back to Pricing
            </Link>
            <PaymentStatus status="pending" />
          </div>
        </PageLayout>
      </>
    );
  }

  /*
   * Build purchase summary text
   */
  const purchaseSummary = purchaseMode === 'individual-phases'
    ? `${selectedPhasesFromUrl.length} phase(s) selected`
    : 'Full Course — All 5 Phases';

  return (
    <>
      <SEOHead title={t.checkout?.title || 'Enroll in Abyssinia Academy'} />
      <PageLayout>
        <div className="checkout-page">
          <Link href="/pricing" className="auth-back-link">
            <ArrowLeft />
            Back to Pricing
          </Link>

          <div className="auth-card" style={{ maxWidth: '32rem', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <span className="section-tag">Checkout Portal</span>
              <h2 className="auth-title" style={{ textAlign: 'left' }}>
                {t.checkout?.title || 'Enroll in Abyssinia Academy'}
              </h2>
              <p className="auth-subtitle" style={{ textAlign: 'left' }}>
                {t.checkout?.subtitle || 'Pay securely to unlock your courses.'}
              </p>
            </div>

            {/* Purchase Summary */}
            <div className="checkout-purchase-summary">
              <span className="checkout-purchase-label">Purchase:</span>
              <span className="checkout-purchase-value">{purchaseSummary}</span>
            </div>

            {/* Phase Cart Summary — only for individual phase purchases */}
            {purchaseMode === 'individual-phases' && selectedPhasesFromUrl.length > 0 && (
              <PhaseCartSummary selectedPhases={selectedPhasesFromUrl} />
            )}

            {/* Payment Method Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                className="checkout-field"
                style={{ marginBottom: '0.5rem', display: 'block' }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {t.checkout?.paymentMethod || 'Payment Method'}
                </span>
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
              amount={purchaseAmount}
              currency={currency}
              onSubmit={handleSubmit}
              loading={submitting}
            />
          </div>
        </div>
      </PageLayout>
    </>
  );
};

export default CheckoutPage;