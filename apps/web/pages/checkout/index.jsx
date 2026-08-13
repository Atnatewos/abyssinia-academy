/**
 * @fileoverview Checkout Page — Database-Driven
 * Uses usePaymentConfig hook for consistent pricing.
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
import usePaymentConfig from '../../hooks/usePaymentConfig';
import { getApprovalConfig } from '../../lib/config';

const CheckoutPage = () => {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const { pricing, paymentMethods, loading: pricingLoading } = usePaymentConfig();

  const purchaseMode = router.query.mode || 'full-course';
  const selectedPhasesFromUrl = router.query.phases
    ? router.query.phases.split(',').filter(Boolean)
    : [];

  const approvalConfig = useMemo(() => getApprovalConfig(), []);

  const purchaseAmount = useMemo(() => {
    if (purchaseMode === 'individual-phases' && selectedPhasesFromUrl.length > 0) {
      const perPhasePrice = pricing?.perPhase?.amountETB || 0;
      return perPhasePrice * selectedPhasesFromUrl.length;
    }
    return pricing?.fullCourse?.amountETB || 0;
  }, [purchaseMode, selectedPhasesFromUrl, pricing]);

  const currency = pricing?.fullCourse?.currency || 'ETB';

  const [selectedMethod, setSelectedMethod] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);

  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedMethod) {
      setSelectedMethod(paymentMethods[0].id);
    }
  }, [paymentMethods, selectedMethod]);

  const selectedMethodData = useMemo(() => {
    return paymentMethods.find((m) => m.id === selectedMethod) || null;
  }, [selectedMethod, paymentMethods]);

  const handleSubmit = async (paymentData) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('fullName', paymentData.fullName);
      formData.append('phone', paymentData.phone);
      formData.append('paymentMethod', paymentData.paymentMethod);
      formData.append('transactionRef', paymentData.transactionRef);
      formData.append('purchaseMode', purchaseMode);
      formData.append('amount', purchaseAmount.toString());
      if (purchaseMode === 'individual-phases') {
        formData.append('selectedPhases', JSON.stringify(selectedPhasesFromUrl));
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
      toast.error('Payment submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="empty-state" style={{ padding: '5rem 1rem' }}>
          <p className="empty-state-desc">Please log in to access checkout.</p>
          <Link href={`/auth/login?redirect=${encodeURIComponent(router.asPath)}`} className="pricing-btn">
            Go to Login
          </Link>
        </div>
      </PageLayout>
    );
  }

  if (pricingLoading || !pricing) {
    return (
      <PageLayout>
        <div className="spinner" style={{ padding: '5rem 0' }}><div className="spinner-circle" /></div>
      </PageLayout>
    );
  }

  if (paymentSubmitted) {
    return (
      <PageLayout>
        <div className="checkout-page">
          <Link href="/pricing" className="auth-back-link"><ArrowLeft />Back to Pricing</Link>
          <PaymentStatus status="pending" />
        </div>
      </PageLayout>
    );
  }

  const purchaseSummary = purchaseMode === 'individual-phases'
    ? `${selectedPhasesFromUrl.length} phase(s) selected`
    : 'Full Course — All 5 Phases';

  return (
    <>
      <SEOHead title={t.checkout?.title || 'Enroll'} />
      <PageLayout>
        <div className="checkout-page">
          <Link href="/pricing" className="auth-back-link"><ArrowLeft />Back to Pricing</Link>
          <div className="auth-card" style={{ maxWidth: '32rem', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <span className="section-tag">Checkout</span>
              <h2 className="auth-title">{t.checkout?.title || 'Enroll'}</h2>
            </div>
            <div className="checkout-purchase-summary">
              <span>Purchase:</span>
              <span>{purchaseSummary}</span>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ marginBottom: '0.5rem', display: 'block' }}>{t.checkout?.paymentMethod || 'Payment Method'}</label>
              <PaymentMethodSelector methods={paymentMethods} selected={selectedMethod} onSelect={setSelectedMethod} />
            </div>
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