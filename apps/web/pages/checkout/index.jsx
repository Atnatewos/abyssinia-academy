/**
 * @fileoverview Checkout Page — Single-column centered layout
 * Path: apps/web/pages/checkout/index.jsx
 */

import { useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import CheckoutForm from '../../components/payment/CheckoutForm';
import PaymentMethodSelector from '../../components/payment/PaymentMethodSelector';
import PaymentStatus from '../../components/payment/PaymentStatus';
import DiscountCodeInput from '../../components/discount/DiscountCodeInput';
import DiscountBreakdown from '../../components/discount/DiscountBreakdown';
import { useCheckoutEngine } from '../../hooks/useCheckoutEngine';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../hooks/useCourses';
import useResellerCode from '../../hooks/useResellerCode';

const CheckoutPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { courses } = useCourses();
  const { resellerProfile, resellerCode, loading: resellerLoading } = useResellerCode();

  const purchaseMode = router.query.mode || 'full-course';
  const selectedPhases = router.query.phases ? router.query.phases.split(',').filter(Boolean) : [];
  const slug = router.query.course;
  const courseContext = useMemo(() => (courses || []).find((c) => c.slug === slug), [courses, slug]);

  const engine = useCheckoutEngine({
    purchaseMode,
    selectedPhases,
    courseId: courseContext?.id || null,
    coursePriceEtb: courseContext?.price_etb || null,
    referralDiscountPercent: 0,
    referralCode: '',
    isAgentBuyer: false,
    resellerCode,
    resellerProfile,
  });

  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="empty-state" style={{ padding: '5rem 1rem' }}>
          <p className="empty-state-desc">Please log in to access checkout.</p>
          <Link href={`/auth/login?redirect=${encodeURIComponent(router.asPath)}`} className="pricing-btn">Go to Login</Link>
        </div>
      </PageLayout>
    );
  }

  if (engine.pricing === undefined || resellerLoading) {
    return (
      <PageLayout>
        <div className="spinner" style={{ padding: '5rem 0' }}><div className="spinner-circle" /></div>
      </PageLayout>
    );
  }

  return (
    <>
      <SEOHead title={t.checkout?.title || 'Enroll'} />
      <PageLayout>
        <div style={{ maxWidth: '34rem', margin: '0 auto', padding: '2.5rem 1rem' }}>
          <Link href="/pricing" className="auth-back-link" style={{ marginBottom: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={16} /> Back to Pricing
          </Link>

          {engine.paymentSubmitted ? (
            <PaymentStatus status="pending" />
          ) : (
            <div style={{ background: 'var(--bg-card-solid)', borderRadius: '1.5rem', border: '1px solid var(--border-medium)', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
              <header style={{ marginBottom: '1.5rem' }}>
                <span className="section-tag">CHECKOUT</span>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.5rem 0 0' }}>{t.checkout?.title || 'Complete Enrollment'}</h1>
              </header>

              <div className="checkout-modal-summary" style={{ background: 'var(--surface-secondary)', padding: '1rem', borderRadius: '1rem', marginBottom: '1.5rem', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600 }}>
                  <span>{courseContext ? courseContext.title : (purchaseMode === 'individual-phases' ? `${selectedPhases.length} Phases` : 'Full Course')}</span>
                  <span style={{ color: 'var(--accent-gold)' }}>{engine.baseAmount.toLocaleString()} {engine.currency}</span>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <DiscountCodeInput purchaseInfo={{ amount: engine.baseAmount, courseType: purchaseMode, selectedPhases }} onDiscountApplied={engine.handleDiscountApplied} onDiscountRemoved={engine.handleDiscountRemoved} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Payment Method</label>
                <PaymentMethodSelector methods={engine.paymentMethods} selected={engine.selectedMethod} onSelect={engine.setSelectedMethod} />
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
                isAgentBuyer={engine.isAgentBuyer}
                courseId={courseContext?.id || null}
                resellerCode={resellerCode}
              />
            </div>
          )}
        </div>
      </PageLayout>
    </>
  );
};

export default CheckoutPage;