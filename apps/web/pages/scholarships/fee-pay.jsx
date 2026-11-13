// /**
//  * @fileoverview Scholarship Fee Payment Page
//  *
//  * Dedicated page for paying a scholarship registration fee. Focused
//  * single-purpose UX:
//  *   - Verifies application state via /api/scholarships/fee-preview
//  *   - Shows the exact fee amount sourced from the campaign (server-side)
//  *   - Renders payment method selector + proof upload form
//  *   - Submits via the existing /api/payments/submit with purpose set
//  *
//  * Auth required. Guest users are redirected to /auth/login with a
//  * redirect back to this exact URL.
//  *
//  * Path: apps/web/pages/scholarships/fee-pay.jsx
//  */

// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { useRouter } from 'next/router';
// import Link from 'next/link';
// import {
//   ArrowLeft,
//   Wallet,
//   ShieldCheck,
//   Clock,
//   AlertCircle,
//   CheckCircle2,
// } from 'lucide-react';
// import SEOHead from '../../components/shared/SEOHead';
// import PageLayout from '../../components/shared/PageLayout';
// import PaymentMethodSelector from '../../components/payment/PaymentMethodSelector';
// import CheckoutForm from '../../components/payment/CheckoutForm';
// import { SkeletonBase, SkeletonWrapper } from '../../components/shared/Skeleton';
// import { useLanguage } from '../../context/LanguageContext';
// import { useAuth } from '../../context/AuthContext';
// import { useToast } from '../../context/ToastContext';
// import { getItem } from '../../lib/storage';
// import usePaymentConfig from '../../hooks/usePaymentConfig';

// /**
//  * Shape-matched skeleton for the fee page.
//  */
// const FeePageSkeleton = () => (
//   <div className="flex flex-col gap-4">
//     <SkeletonBase className="skeleton-line skeleton-line-short" />
//     <SkeletonWrapper className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       <SkeletonBase style={{ height: '6rem' }} />
//       <SkeletonBase style={{ height: '6rem' }} />
//     </SkeletonWrapper>
//     <SkeletonBase style={{ height: '16rem' }} />
//   </div>
// );

// const ScholarshipFeePage = () => {
//   const router = useRouter();
//   const { application } = router.query;
//   const { t } = useLanguage();
//   const { isAuthenticated } = useAuth();
//   const toast = useToast();
//   const { paymentMethods, loading: pricingLoading } = usePaymentConfig();

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [selectedMethod, setSelectedMethod] = useState('');
//   const [submitting, setSubmitting] = useState(false);
//   const [submitted, setSubmitted] = useState(false);

//   /* Fetch fee preview */
//   const fetchPreview = useCallback(async () => {
//     if (!application || !isAuthenticated) return;
//     setLoading(true);
//     setError(null);
//     try {
//       const token = getItem('auth_token');
//       const response = await fetch(
//         `/api/scholarships/fee-preview?applicationId=${encodeURIComponent(application)}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       const payload = await response.json();
//       if (!response.ok || !payload.success) {
//         setError(payload?.message || 'Failed to load fee details.');
//         return;
//       }
//       setPreview(payload.data);
//     } catch (fetchError) {
//       console.error('[scholarship/fee-pay] fetch failed:', fetchError);
//       setError(t.scholarships?.feePage?.notFoundDescription || 'Unable to load.');
//     } finally {
//       setLoading(false);
//     }
//   }, [application, isAuthenticated, t]);

//   useEffect(() => {
//     fetchPreview();
//   }, [fetchPreview]);

//   /* Default payment method */
//   useEffect(() => {
//     if (paymentMethods.length > 0 && !selectedMethod) {
//       setSelectedMethod(paymentMethods[0].id);
//     }
//   }, [paymentMethods, selectedMethod]);

//   const selectedMethodData = useMemo(
//     () => paymentMethods.find((m) => m.id === selectedMethod) || null,
//     [selectedMethod, paymentMethods]
//   );

//   /* Submit handler — reuses existing /api/payments/submit */
//   const handleSubmit = async (paymentData) => {
//     if (!preview) return;
//     setSubmitting(true);
//     try {
//       const formData = new FormData();
//       formData.append('fullName', paymentData.fullName);
//       formData.append('phone', paymentData.phone);
//       formData.append('paymentMethod', paymentData.paymentMethod);
//       formData.append('transactionRef', paymentData.transactionRef);
//       formData.append('amount', String(preview.fee.amount));
//       formData.append('purpose', 'scholarship_registration');
//       formData.append('scholarshipApplicationId', preview.applicationId);
//       if (paymentData.screenshot) {
//         formData.append('screenshot', paymentData.screenshot);
//       }

//       const token = getItem('auth_token');
//       const response = await fetch('/api/payments/submit', {
//         method: 'POST',
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//       });
//       const payload = await response.json();

//       if (!response.ok || !payload.success) {
//         toast.error(payload?.message || t.scholarships?.feePage?.submitErrorTitle);
//         return;
//       }

//       toast.success(t.scholarships?.feePage?.submitSuccessBody || 'Payment submitted.');
//       setSubmitted(true);
//     } catch (submitError) {
//       console.error('[scholarship/fee-pay] submit failed:', submitError);
//       toast.error(t.scholarships?.feePage?.submitErrorTitle || 'Submission failed.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   /* Auth gate */
//   if (!isAuthenticated) {
//     if (typeof window !== 'undefined') {
//       router.replace(
//         `/auth/login?redirect=${encodeURIComponent(router.asPath)}`
//       );
//     }
//     return (
//       <PageLayout>
//         <div className="container-xl py-16 flex flex-col items-center gap-4 text-center">
//           <Wallet size={48} className="text-accent animate-pulse" />
//           <p className="text-text-muted">Redirecting to login...</p>
//         </div>
//       </PageLayout>
//     );
//   }

//   if (loading || pricingLoading) {
//     return (
//       <PageLayout>
//         <div className="container-xl py-12 max-w-2xl mx-auto">
//           <FeePageSkeleton />
//         </div>
//       </PageLayout>
//     );
//   }

//   if (error || !preview) {
//     return (
//       <PageLayout>
//         <div className="container-xl py-16 flex flex-col items-center gap-3 text-center max-w-md mx-auto">
//           <AlertCircle size={48} className="text-error" />
//           <h1 className="text-xl font-extrabold text-text-main">
//             {t.scholarships?.feePage?.notFoundTitle || 'Application Not Found'}
//           </h1>
//           <p className="text-sm text-text-muted">{error}</p>
//           <Link
//             href="/scholarships"
//             className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-text-inverse text-xs font-bold hover:bg-accent-light transition-colors"
//           >
//             <ArrowLeft size={14} />
//             {t.scholarships?.detail?.backToBrowse || 'Browse Scholarships'}
//           </Link>
//         </div>
//       </PageLayout>
//     );
//   }

//   /* Already submitted state */
//   if (submitted) {
//     return (
//       <PageLayout>
//         <div className="container-xl py-16 max-w-md mx-auto flex flex-col items-center gap-3 text-center">
//           <CheckCircle2 size={56} className="text-success" />
//           <h1 className="text-xl font-extrabold text-text-main">
//             {t.scholarships?.feePage?.submitSuccessTitle || 'Payment Submitted'}
//           </h1>
//           <p className="text-sm text-text-muted">
//             {t.scholarships?.feePage?.submitSuccessBody ||
//               'Your payment is under review.'}
//           </p>
//           <Link
//             href={`/scholarships/${preview.campaign.slug}`}
//             className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-text-inverse text-xs font-bold hover:bg-accent-light transition-colors"
//           >
//             <ArrowLeft size={14} />
//             {t.scholarships?.feePage?.backLink || 'Back to Scholarship'}
//           </Link>
//         </div>
//       </PageLayout>
//     );
//   }

//   /* Block payment for non-pending_payment statuses */
//   if (!preview.canPay) {
//     const blockMessages = {
//       pending: t.scholarships?.feePage?.statusPendingMessage,
//       rejected: t.scholarships?.feePage?.statusRejectedMessage,
//       withdrawn: t.scholarships?.feePage?.statusWithdrawnMessage,
//     };
//     return (
//       <PageLayout>
//         <div className="container-xl py-16 max-w-md mx-auto flex flex-col items-center gap-3 text-center">
//           <AlertCircle size={48} className="text-warning" />
//           <h1 className="text-xl font-extrabold text-text-main">
//             {t.scholarships?.feePage?.pageTitle || 'Cannot Pay Fee'}
//           </h1>
//           <p className="text-sm text-text-muted">
//             {blockMessages[preview.status] || preview.blockReason || 'Not available.'}
//           </p>
//           <Link
//             href={`/scholarships/${preview.campaign.slug}`}
//             className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-text-inverse text-xs font-bold hover:bg-accent-light transition-colors"
//           >
//             <ArrowLeft size={14} />
//             {t.scholarships?.feePage?.backLink || 'Back to Scholarship'}
//           </Link>
//         </div>
//       </PageLayout>
//     );
//   }

//   /* Ready to pay */
//   const feeAmount = Number(preview.fee.amount) || 0;
//   const currency = preview.fee.currency || 'ETB';

//   return (
//     <>
//       <SEOHead
//         title={`${t.scholarships?.feePage?.pageTitle || 'Pay Fee'} - ${preview.campaign.name}`}
//       />
//       <PageLayout>
//         <div className="container-xl py-12 max-w-2xl mx-auto">
//           {/* Back link */}
//           <Link
//             href={`/scholarships/${preview.campaign.slug}`}
//             className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-accent mb-6 transition-colors group"
//           >
//             <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
//             {t.scholarships?.feePage?.backLink || 'Back to Scholarship'}
//           </Link>

//           {/* Header */}
//           <div className="flex items-center gap-3 mb-6">
//             <div className="shrink-0 w-12 h-12 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
//               <Wallet size={22} />
//             </div>
//             <div>
//               <h1 className="text-2xl font-extrabold text-text-main">
//                 {t.scholarships?.feePage?.pageTitle || 'Pay Registration Fee'}
//               </h1>
//               <p className="text-sm text-text-muted mt-0.5">
//                 {(t.scholarships?.feePage?.pageSubtitle ||
//                   'Complete your enrollment for {campaign}').replace(
//                   '{campaign}',
//                   preview.campaign.name
//                 )}
//               </p>
//             </div>
//           </div>

//           {/* Summary card */}
//           <div className="rounded-2xl border border-border-light bg-bg-card p-5 mb-6">
//             <h2 className="text-sm font-extrabold text-text-main uppercase tracking-wider mb-3">
//               {t.scholarships?.feePage?.summaryTitle || 'Payment Summary'}
//             </h2>
//             <div className="flex flex-col gap-3">
//               <div className="flex items-center justify-between">
//                 <span className="text-sm text-text-muted">
//                   {t.scholarships?.feePage?.campaignLabel || 'Campaign'}
//                 </span>
//                 <span className="text-sm font-semibold text-text-main">
//                   {preview.campaign.name}
//                 </span>
//               </div>
//               <div className="flex items-center justify-between pt-3 border-t border-border-light">
//                 <span className="text-sm text-text-muted">
//                   {t.scholarships?.feePage?.feeLabel || 'Registration Fee'}
//                 </span>
//                 <span className="text-2xl font-extrabold text-accent">
//                   {feeAmount.toLocaleString()} {currency}
//                 </span>
//               </div>
//               {preview.fee.paymentDueAt && (
//                 <div className="flex items-center justify-between pt-3 border-t border-border-light">
//                   <span className="text-sm text-text-muted inline-flex items-center gap-1.5">
//                     <Clock size={12} />
//                     {t.scholarships?.feePage?.deadlineLabel || 'Deadline'}
//                   </span>
//                   <span className="text-sm font-semibold text-text-main">
//                     {new Date(preview.fee.paymentDueAt).toLocaleDateString()}
//                   </span>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Payment method selector */}
//           <div className="mb-6">
//             <label className="block text-sm font-bold text-text-main mb-2">
//               {t.checkout?.paymentMethod || 'Payment Method'}
//             </label>
//             <PaymentMethodSelector
//               methods={paymentMethods}
//               selected={selectedMethod}
//               onSelect={setSelectedMethod}
//             />
//           </div>

//           {/* Form — reuses CheckoutForm */}
//           <div className="rounded-2xl border border-border-light bg-bg-card p-5">
//             <CheckoutForm
//               selectedMethod={selectedMethod}
//               selectedMethodData={selectedMethodData}
//               amount={feeAmount}
//               currency={currency}
//               onSubmit={handleSubmit}
//               loading={submitting}
//             />
//           </div>

//           {/* Trust footer */}
//           <div className="mt-6 flex items-center justify-center gap-2 text-2xs text-text-dim">
//             <ShieldCheck size={12} />
//             <span>
//               {t.checkout?.securePayment || 'Your payment details are secure.'}
//             </span>
//           </div>
//         </div>
//       </PageLayout>
//     </>
//   );
// };

// export default ScholarshipFeePage;





/**
 * @fileoverview Legacy Fee Payment Bridge
 *
 * This page exists ONLY to allow applicants with legacy `pending_payment`
 * applications (from before the "pay at apply" migration) to complete
 * their fee payment. New applications always create their payment row as
 * part of the apply wizard — no post-approval payment page is used under
 * Model A.
 *
 * Behavior:
 *   - If the application is not `pending_payment`, the user is redirected
 *     to the campaign detail page with a message.
 *   - Otherwise the page renders a minimal proof-upload form that submits
 *     to `/api/payments/submit` with `purpose = 'scholarship_registration'`.
 *
 * This route can be deleted entirely once every `pending_payment` row is
 * resolved. It is kept solely for backward compatibility with existing
 * applicants.
 *
 * Path: apps/web/pages/scholarships/fee-pay.jsx
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  ArrowLeft, Wallet, ShieldCheck, AlertCircle, CheckCircle2, Loader2,
} from 'lucide-react';
import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import PaymentMethodSelector from '../../components/payment/PaymentMethodSelector';
import CheckoutForm from '../../components/payment/CheckoutForm';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getItem } from '../../lib/storage';
import usePaymentConfig from '../../hooks/usePaymentConfig';

const LegacyFeePage = () => {
  const router = useRouter();
  const { application } = router.query;
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const { paymentMethods, loading: pricingLoading } = usePaymentConfig();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchPreview = useCallback(async () => {
    if (!application || !isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const token = getItem('auth_token');
      const response = await fetch(
        `/api/scholarships/fee-preview?applicationId=${encodeURIComponent(application)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        setError(payload?.message || 'Failed to load fee details.');
        return;
      }
      setPreview(payload.data);

      /* If the application is not pending_payment, redirect to campaign. */
      if (payload.data.status !== 'pending_payment') {
        router.replace(`/scholarships/${payload.data.campaign.slug}`);
      }
    } catch (fetchError) {
      console.error('[scholarship/fee-pay] fetch failed:', fetchError);
      setError(
        t.scholarships?.feePage?.notFoundDescription || 'Unable to load.'
      );
    } finally {
      setLoading(false);
    }
  }, [application, isAuthenticated, router, t]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedMethod) {
      setSelectedMethod(paymentMethods[0].id);
    }
  }, [paymentMethods, selectedMethod]);

  const selectedMethodData = paymentMethods.find((m) => m.id === selectedMethod) || null;

  const handleSubmit = async (paymentData) => {
    if (!preview) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('fullName', paymentData.fullName);
      formData.append('phone', paymentData.phone);
      formData.append('paymentMethod', paymentData.paymentMethod);
      formData.append('transactionRef', paymentData.transactionRef);
      formData.append('amount', String(preview.fee.amount));
      formData.append('purpose', 'scholarship_registration');
      formData.append('scholarshipApplicationId', preview.applicationId);
      if (paymentData.screenshot) {
        formData.append('screenshot', paymentData.screenshot);
      }

      const token = getItem('auth_token');
      const response = await fetch('/api/payments/submit', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        toast.error(
          payload?.message || t.scholarships?.feePage?.submitErrorTitle
        );
        return;
      }

      toast.success(
        t.scholarships?.feePage?.submitSuccessBody || 'Payment submitted.'
      );
      setSubmitted(true);
    } catch (submitError) {
      console.error('[scholarship/fee-pay] submit failed:', submitError);
      toast.error(
        t.scholarships?.feePage?.submitErrorTitle || 'Submission failed.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      router.replace(
        `/auth/login?redirect=${encodeURIComponent(router.asPath)}`
      );
    }
    return (
      <PageLayout>
        <div className="container-xl py-16 flex flex-col items-center gap-4 text-center">
          <Wallet size={48} className="text-accent animate-pulse" />
          <p className="text-text-muted">Redirecting to login...</p>
        </div>
      </PageLayout>
    );
  }

  if (loading || pricingLoading) {
    return (
      <PageLayout>
        <div className="container-xl py-16 flex flex-col items-center gap-4 text-center">
          <Loader2 size={48} className="text-accent animate-spin" />
          <p className="text-text-muted">
            {t.scholarships?.feePage?.loadingLabel || 'Loading...'}
          </p>
        </div>
      </PageLayout>
    );
  }

  if (error || !preview) {
    return (
      <PageLayout>
        <div className="container-xl py-16 flex flex-col items-center gap-3 text-center max-w-md mx-auto">
          <AlertCircle size={48} className="text-error" />
          <h1 className="text-xl font-extrabold text-text-main">
            {t.scholarships?.feePage?.notFoundTitle || 'Application Not Found'}
          </h1>
          <p className="text-sm text-text-muted">{error}</p>
          <Link
            href="/scholarships"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-text-inverse text-xs font-bold hover:bg-accent-light transition-colors"
          >
            <ArrowLeft size={14} />
            {t.scholarships?.detail?.backToBrowse || 'Browse Scholarships'}
          </Link>
        </div>
      </PageLayout>
    );
  }

  if (submitted) {
    return (
      <PageLayout>
        <div className="container-xl py-16 max-w-md mx-auto flex flex-col items-center gap-3 text-center">
          <CheckCircle2 size={56} className="text-success" />
          <h1 className="text-xl font-extrabold text-text-main">
            {t.scholarships?.feePage?.submitSuccessTitle ||
              'Payment Submitted'}
          </h1>
          <p className="text-sm text-text-muted">
            {t.scholarships?.feePage?.submitSuccessBody ||
              'Your payment is under review.'}
          </p>
          <Link
            href={`/scholarships/${preview.campaign.slug}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-text-inverse text-xs font-bold hover:bg-accent-light transition-colors"
          >
            <ArrowLeft size={14} />
            {t.scholarships?.feePage?.backLink || 'Back to Scholarship'}
          </Link>
        </div>
      </PageLayout>
    );
  }

  const feeAmount = Number(preview.fee.amount) || 0;
  const currency = preview.fee.currency || 'ETB';

  return (
    <>
      <SEOHead
        title={`${t.scholarships?.feePage?.pageTitle || 'Pay Fee'} - ${preview.campaign.name}`}
      />
      <PageLayout>
        <div className="container-xl py-12 max-w-2xl mx-auto">
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-warning/10 border border-warning/30 text-warning text-xs mb-6">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-0.5">Legacy Fee Payment</p>
              <p className="opacity-90">
                Your application was created before our new apply flow. Complete
                your original registration fee payment below to activate your
                application review.
              </p>
            </div>
          </div>

          <Link
            href={`/scholarships/${preview.campaign.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-accent mb-6 transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            {t.scholarships?.feePage?.backLink || 'Back to Scholarship'}
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="shrink-0 w-12 h-12 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
              <Wallet size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-text-main">
                {t.scholarships?.feePage?.pageTitle || 'Pay Application Fee'}
              </h1>
              <p className="text-sm text-text-muted mt-0.5">
                {(
                  t.scholarships?.feePage?.pageSubtitle ||
                  'Complete your application for {campaign}'
                ).replace('{campaign}', preview.campaign.name)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border-light bg-bg-card p-5 mb-6">
            <h2 className="text-sm font-extrabold text-text-main uppercase tracking-wider mb-3">
              {t.scholarships?.feePage?.summaryTitle || 'Payment Summary'}
            </h2>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">
                  {t.scholarships?.feePage?.campaignLabel || 'Campaign'}
                </span>
                <span className="text-sm font-semibold text-text-main">
                  {preview.campaign.name}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border-light">
                <span className="text-sm text-text-muted">
                  {t.scholarships?.feePage?.feeLabel || 'Application Fee'}
                </span>
                <span className="text-2xl font-extrabold text-accent">
                  {feeAmount.toLocaleString()} {currency}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-text-main mb-2">
              {t.scholarships?.formModal?.paymentMethodLabel ||
                'Payment Method'}
            </label>
            <PaymentMethodSelector
              methods={paymentMethods}
              selected={selectedMethod}
              onSelect={setSelectedMethod}
            />
          </div>

          <div className="rounded-2xl border border-border-light bg-bg-card p-5">
            <CheckoutForm
              selectedMethod={selectedMethod}
              selectedMethodData={selectedMethodData}
              amount={feeAmount}
              currency={currency}
              onSubmit={handleSubmit}
              loading={submitting}
              hideAgentCode
            />
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-2xs text-text-dim">
            <ShieldCheck size={12} />
            <span>
              {t.checkout?.securePayment || 'Your payment details are secure.'}
            </span>
          </div>
        </div>
      </PageLayout>
    </>
  );
};

export default LegacyFeePage;