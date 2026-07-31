/**
 * @fileoverview Checkout Page
 * Payment submission with method selection and proof upload
 * Path: apps/web/pages/checkout/index.jsx
 */

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import CheckoutForm from '../../components/payment/CheckoutForm';
import PaymentMethodSelector from '../../components/payment/PaymentMethodSelector';
import PaymentStatus from '../../components/payment/PaymentStatus';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../lib/api';

/**
 * CheckoutPage - Payment submission page matching Gemini payment modal
 */
const CheckoutPage = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [selectedMethod, setSelectedMethod] = useState('telebirr');
  const [submitting, setSubmitting] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);

  const paymentMethods = [
    { id: 'telebirr', name: 'Telebirr', icon: '📱', accountNumber: '0911234567', instructions: 'Send payment to the Telebirr number above and enter the transaction ID below.' },
    { id: 'cbe-birr', name: 'CBE Birr', icon: '🏦', accountNumber: '1000123456789', instructions: 'Transfer to the CBE Birr account above and enter the reference number below.' },
    { id: 'bank-transfer', name: 'Bank Transfer', icon: '🏛️', accountNumber: '1000123456789', instructions: 'Transfer to the bank account above and upload the receipt screenshot.' },
  ];

  const selectedMethodData = paymentMethods.find((m) => m.id === selectedMethod);

  const handleSubmit = async (paymentData) => {
    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', paymentData.fullName);
      formDataToSend.append('phone', paymentData.phone);
      formDataToSend.append('paymentMethod', paymentData.paymentMethod);
      formDataToSend.append('transactionRef', paymentData.transactionRef);
      if (paymentData.screenshot) {
        formDataToSend.append('screenshot', paymentData.screenshot);
      }

      const response = await apiClient.post('/payments/submit', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response && response.success) {
        setPaymentSubmitted(true);
        toast.success('Payment proof submitted successfully. Waiting for approval.');
      }
    } catch (err) {
      toast.error('Payment submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="empty-state" style={{ padding: '5rem 1rem' }}>
          <p className="empty-state-desc">Please log in to access checkout.</p>
          <Link href="/auth/login?redirect=/checkout" className="pricing-btn" style={{ display: 'inline-flex', marginTop: '1rem' }}>
            Go to Login
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <>
      <SEOHead title={t.checkout?.title || 'Enroll in Abyssinia Academy'} />
      <PageLayout>
        <div className="checkout-page">
          <Link href="/pricing" className="auth-back-link">
            <ArrowLeft />
            Back to Pricing
          </Link>

          {paymentSubmitted ? (
            <PaymentStatus status="pending" />
          ) : (
            <div className="auth-card" style={{ maxWidth: '32rem', margin: '0 auto' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <span className="section-tag">Checkout Portal</span>
                <h2 className="auth-title" style={{ textAlign: 'left' }}>
                  {t.checkout?.title || 'Enroll in Abyssinia Academy'}
                </h2>
                <p className="auth-subtitle" style={{ textAlign: 'left' }}>
                  {t.checkout?.subtitle || 'Pay securely to unlock all courses.'}
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="checkout-field" style={{ marginBottom: '0.5rem', display: 'block' }}>
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

              <CheckoutForm
                selectedMethod={selectedMethod}
                methods={paymentMethods}
                amount={4999}
                onSubmit={handleSubmit}
                loading={submitting}
                selectedMethodData={selectedMethodData}
              />
            </div>
          )}
        </div>
      </PageLayout>
    </>
  );
};

export default CheckoutPage;