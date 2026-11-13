// /**
//  * @fileoverview My Scholarships Page
//  *
//  * Lists all scholarship applications submitted by the current user with
//  * status badges, actions (view details, pay fee, withdraw), and empty
//  * state. Uses SkeletonTableRows during load, ConfirmDialog for withdraw,
//  * design tokens only.
//  *
//  * Path: apps/web/pages/profile/scholarships.jsx
//  */

// import React, { useState, useEffect, useCallback } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/router';
// import { ArrowLeft, Award, ExternalLink, Wallet, XCircle } from 'lucide-react';
// import SEOHead from '../../components/shared/SEOHead';
// import PageLayout from '../../components/shared/PageLayout';
// import { SkeletonTableRows } from '../../components/shared/Skeleton';
// import { useLanguage } from '../../context/LanguageContext';
// import { useAuth } from '../../context/AuthContext';
// import { useToast } from '../../context/ToastContext';
// import { useConfirm } from '../../components/shared/ConfirmProvider';
// import { getItem } from '../../lib/storage';

// const STATUS_TONES = {
//   pending: 'bg-warning/10 text-warning border-warning/30',
//   pending_payment: 'bg-info/10 text-info border-info/30',
//   approved: 'bg-success/10 text-success border-success/30',
//   rejected: 'bg-error/10 text-error border-error/30',
//   withdrawn: 'bg-bg-pill text-text-muted border-border-medium',
//   revoked: 'bg-error/10 text-error border-error/30',
// };

// const STATUS_LABEL_KEYS = {
//   pending: 'pending',
//   pending_payment: 'pendingPayment',
//   approved: 'approved',
//   rejected: 'rejected',
//   withdrawn: 'withdrawn',
//   revoked: 'revoked',
// };

// const MyScholarshipsPage = () => {
//   const router = useRouter();
//   const { t } = useLanguage();
//   const { isAuthenticated } = useAuth();
//   const toast = useToast();
//   const confirm = useConfirm();

//   const [loading, setLoading] = useState(true);
//   const [applications, setApplications] = useState([]);
//   const [withdrawingId, setWithdrawingId] = useState(null);

//   const fetchApplications = useCallback(async () => {
//     if (!isAuthenticated) return;
//     setLoading(true);
//     try {
//       const token = getItem('auth_token');
//       const response = await fetch('/api/scholarships/my-applications', {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const payload = await response.json();
//       if (response.ok && payload.success) {
//         setApplications(payload.data?.applications || []);
//       }
//     } catch (fetchError) {
//       console.error('[my-scholarships] fetch failed:', fetchError);
//     } finally {
//       setLoading(false);
//     }
//   }, [isAuthenticated]);

//   useEffect(() => {
//     fetchApplications();
//   }, [fetchApplications]);

//   const handleWithdraw = useCallback(
//     async (applicationId) => {
//       const confirmed = await confirm({
//         title: t.scholarships?.myApplications?.withdrawConfirmTitle || 'Withdraw Application?',
//         message:
//           t.scholarships?.myApplications?.withdrawConfirmBody ||
//           'This cannot be undone.',
//         confirmText:
//           t.scholarships?.myApplications?.withdrawConfirmButton || 'Yes, Withdraw',
//         cancelText: t.scholarships?.formModal?.cancelButton || 'Cancel',
//         variant: 'danger',
//       });
//       if (!confirmed) return;

//       setWithdrawingId(applicationId);
//       try {
//         const token = getItem('auth_token');
//         const response = await fetch('/api/scholarships/withdraw', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({ applicationId }),
//         });
//         const result = await response.json();
//         if (!response.ok || !result.success) {
//           toast.error(
//             result?.message ||
//               t.scholarships?.myApplications?.withdrawErrorTitle ||
//               'Withdrawal failed.'
//           );
//           return;
//         }
//         toast.success(
//           t.scholarships?.myApplications?.withdrawSuccessBody ||
//             'Application withdrawn.'
//         );
//         await fetchApplications();
//       } catch (withdrawError) {
//         console.error('[my-scholarships] withdraw failed:', withdrawError);
//         toast.error(
//           t.scholarships?.myApplications?.withdrawErrorTitle || 'Withdrawal failed.'
//         );
//       } finally {
//         setWithdrawingId(null);
//       }
//     },
//     [confirm, t, toast, fetchApplications]
//   );

//   if (!isAuthenticated) {
//     return (
//       <PageLayout>
//         <div className="container-xl py-16 flex flex-col items-center gap-4 text-center">
//           <Award size={48} className="text-text-dim" />
//           <p className="text-text-muted">
//             {t.scholarships?.form?.loginRequired || 'Please log in to view your applications.'}
//           </p>
//           <Link
//             href="/auth/login?redirect=/profile/scholarships"
//             className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-text-inverse text-xs font-bold hover:bg-accent-light transition-colors"
//           >
//             {t.auth?.login || 'Login'}
//           </Link>
//         </div>
//       </PageLayout>
//     );
//   }

//   return (
//     <>
//       <SEOHead title={t.scholarships?.myApplications?.pageTitle || 'My Scholarships'} />
//       <PageLayout>
//         <div className="container-xl py-12 flex flex-col gap-6">
//           <Link
//             href="/profile"
//             className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-accent transition-colors group self-start"
//           >
//             <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
//             {t.profile?.title || 'Back to Profile'}
//           </Link>

//           <div className="flex items-center gap-2">
//             <Award size={22} className="text-accent" />
//             <h1 className="text-3xl font-extrabold text-text-main">
//               {t.scholarships?.myApplications?.pageTitle || 'My Scholarships'}
//             </h1>
//           </div>
//           <p className="text-sm text-text-muted max-w-2xl">
//             {t.scholarships?.myApplications?.pageSubtitle ||
//               'Track your applications and enrollment status'}
//           </p>

//           {loading ? (
//             <div className="flex flex-col gap-3">
//               <p className="text-xs text-text-dim">
//                 {t.scholarships?.myApplications?.loadingLabel ||
//                   'Loading your applications...'}
//               </p>
//               <SkeletonTableRows
//                 columns={[
//                   { width: '2fr', type: 'avatar-text' },
//                   { width: '1fr', type: 'text' },
//                   { width: '1fr', type: 'badge' },
//                   { width: '0.75fr', type: 'pill' },
//                 ]}
//                 rows={4}
//               />
//             </div>
//           ) : applications.length === 0 ? (
//             <div className="empty-state rounded-2xl border border-border-light bg-bg-card p-10">
//               <Award size={48} className="text-text-dim mb-3" />
//               <h3 className="empty-state-title">
//                 {t.scholarships?.myApplications?.emptyTitle || 'No Applications Yet'}
//               </h3>
//               <p className="empty-state-desc mb-4">
//                 {t.scholarships?.myApplications?.emptyDescription ||
//                   'Browse available scholarships and submit your first application.'}
//               </p>
//               <Link
//                 href="/scholarships"
//                 className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-text-inverse text-xs font-bold hover:bg-accent-light transition-colors"
//               >
//                 <Award size={14} />
//                 {t.scholarships?.myApplications?.emptyCta || 'Browse Scholarships'}
//               </Link>
//             </div>
//           ) : (
//             <div className="flex flex-col gap-3">
//               {applications.map((app) => {
//                 const statusTone = STATUS_TONES[app.status] || STATUS_TONES.withdrawn;
//                 const statusLabel =
//                   t.scholarships?.statusLabel?.[STATUS_LABEL_KEYS[app.status]] || app.status;
//                 const feeAmount = Number(app.registration_fee_etb) || 0;
//                 const canWithdraw = ['pending', 'pending_payment'].includes(app.status);
//                 const needsFee = app.status === 'pending_payment' && feeAmount > 0;

//                 return (
//                   <div
//                     key={app.id}
//                     className="flex flex-col gap-3 rounded-xl border border-border-light bg-bg-card p-4 sm:p-5"
//                   >
//                     <div className="flex flex-wrap items-start justify-between gap-3">
//                       <div className="flex flex-col gap-1 min-w-0">
//                         <Link
//                           href={`/scholarships/${app.campaign_slug}`}
//                           className="text-base font-extrabold text-text-main hover:text-accent transition-colors truncate"
//                         >
//                           {app.campaign_name}
//                         </Link>
//                         <span className="text-2xs text-text-dim">
//                           {t.scholarships?.myApplications?.appliedLabel || 'Applied'}:{' '}
//                           {new Date(app.created_at).toLocaleDateString()}
//                         </span>
//                       </div>
//                       <span
//                         className={`inline-flex items-center px-2.5 py-1 rounded-full border text-2xs font-bold ${statusTone}`}
//                       >
//                         {statusLabel}
//                       </span>
//                     </div>

//                     <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border-light">
//                       <Link
//                         href={`/scholarships/${app.campaign_slug}`}
//                         className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-medium text-text-muted text-2xs font-bold hover:border-accent/40 hover:text-accent transition-colors"
//                       >
//                         <ExternalLink size={12} />
//                         {t.scholarships?.myApplications?.viewCampaignLabel || 'View Campaign'}
//                       </Link>

//                       {needsFee && (
//                         <Link
//                           href={`/checkout?scholarship=${encodeURIComponent(app.id)}`}
//                           className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-text-inverse text-2xs font-bold hover:bg-accent-light transition-colors"
//                         >
//                           <Wallet size={12} />
//                           {(t.scholarships?.myApplications?.payFeeButton || 'Pay Fee')}{' '}
//                           ({feeAmount.toLocaleString()} ETB)
//                         </Link>
//                       )}

//                       {canWithdraw && (
//                         <button
//                           type="button"
//                           onClick={() => handleWithdraw(app.id)}
//                           disabled={withdrawingId === app.id}
//                           className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-error/30 text-error text-2xs font-bold hover:bg-error/10 transition-colors disabled:opacity-50"
//                         >
//                           <XCircle size={12} />
//                           {t.scholarships?.myApplications?.withdrawButton || 'Withdraw'}
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </PageLayout>
//     </>
//   );
// };

// export default MyScholarshipsPage;




/**
 * @fileoverview My Scholarships Page
 *
 * Lists the current user's scholarship applications. Under the "pay at
 * apply" model, action buttons change based on state:
 *   - pending            → only "View Campaign"
 *   - payment_verified   → only "View Campaign" + Withdraw
 *   - approved           → "Go to Course Portal"
 *   - rejected           → refund status chip
 *   - withdrawn          → refund status chip
 *   - revoked            → "View Campaign"
 *
 * Path: apps/web/pages/profile/scholarships.jsx
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Award, ExternalLink, Wallet, XCircle, GraduationCap,
  CheckCircle2, RotateCcw,
} from 'lucide-react';
import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import { SkeletonTableRows } from '../../components/shared/Skeleton';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../components/shared/ConfirmProvider';
import { getScholarshipRules } from '../../lib/config';
import { getItem } from '../../lib/storage';

const STATUS_TONES = {
  pending: 'bg-warning/10 text-warning border-warning/30',
  payment_verified: 'bg-info/10 text-info border-info/30',
  approved: 'bg-success/10 text-success border-success/30',
  rejected: 'bg-error/10 text-error border-error/30',
  withdrawn: 'bg-bg-pill text-text-muted border-border-medium',
  revoked: 'bg-error/10 text-error border-error/30',
};

const STATUS_LABEL_KEYS = {
  pending: 'pending',
  payment_verified: 'paymentVerified',
  approved: 'approved',
  rejected: 'rejected',
  withdrawn: 'withdrawn',
  revoked: 'revoked',
};

const MyScholarshipsPage = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();

  const rules = getScholarshipRules();
  const refundDeadlineDays = Number(rules?.refundProcessingDeadlineDays) || 3;

  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [withdrawingId, setWithdrawingId] = useState(null);

  const fetchApplications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const token = getItem('auth_token');
      const response = await fetch('/api/scholarships/my-applications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json();
      if (response.ok && payload.success) {
        setApplications(payload.data?.applications || []);
      }
    } catch (fetchError) {
      console.error('[my-scholarships] fetch failed:', fetchError);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleWithdraw = useCallback(
    async (applicationId, feeAmount) => {
      const confirmed = await confirm({
        title:
          t.scholarships?.myApplications?.withdrawConfirmTitle ||
          'Withdraw Application?',
        message: (
          t.scholarships?.myApplications?.withdrawConfirmBody ||
          'If you withdraw, your {amount} ETB application fee will be refunded within {days} business days. This cannot be undone.'
        )
          .replace('{amount}', String(feeAmount))
          .replace('{days}', String(refundDeadlineDays)),
        confirmText:
          t.scholarships?.myApplications?.withdrawConfirmButton ||
          'Yes, Withdraw',
        cancelText: t.scholarships?.formModal?.cancelButton || 'Cancel',
        variant: 'danger',
      });
      if (!confirmed) return;

      setWithdrawingId(applicationId);
      try {
        const token = getItem('auth_token');
        const response = await fetch('/api/scholarships/withdraw', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ applicationId }),
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          toast.error(
            result?.message ||
              t.scholarships?.myApplications?.withdrawErrorTitle ||
              'Withdrawal failed.'
          );
          return;
        }
        toast.success(
          t.scholarships?.myApplications?.withdrawSuccessBody ||
            'Application withdrawn. Your refund is being processed.'
        );
        await fetchApplications();
      } catch (withdrawError) {
        console.error('[my-scholarships] withdraw failed:', withdrawError);
        toast.error(
          t.scholarships?.myApplications?.withdrawErrorTitle ||
            'Withdrawal failed.'
        );
      } finally {
        setWithdrawingId(null);
      }
    },
    [confirm, t, toast, fetchApplications, refundDeadlineDays]
  );

  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="container-xl py-16 flex flex-col items-center gap-4 text-center">
          <Award size={48} className="text-text-dim" />
          <p className="text-text-muted">
            {t.scholarships?.form?.loginRequired ||
              'Please log in to view your applications.'}
          </p>
          <Link
            href="/auth/login?redirect=/profile/scholarships"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-text-inverse text-xs font-bold hover:bg-accent-light transition-colors"
          >
            {t.auth?.login || 'Login'}
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <>
      <SEOHead
        title={
          t.scholarships?.myApplications?.pageTitle || 'My Scholarships'
        }
      />
      <PageLayout>
        <div className="container-xl py-12 flex flex-col gap-6">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-accent transition-colors group self-start"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            {t.profile?.title || 'Back to Profile'}
          </Link>

          <div className="flex items-center gap-2">
            <Award size={22} className="text-accent" />
            <h1 className="text-3xl font-extrabold text-text-main">
              {t.scholarships?.myApplications?.pageTitle || 'My Scholarships'}
            </h1>
          </div>
          <p className="text-sm text-text-muted max-w-2xl">
            {t.scholarships?.myApplications?.pageSubtitle ||
              'Track your applications and enrollment status'}
          </p>

          {loading ? (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-text-dim">
                {t.scholarships?.myApplications?.loadingLabel ||
                  'Loading your applications...'}
              </p>
              <SkeletonTableRows
                columns={[
                  { width: '2fr', type: 'avatar-text' },
                  { width: '1fr', type: 'text' },
                  { width: '1fr', type: 'badge' },
                  { width: '0.75fr', type: 'pill' },
                ]}
                rows={4}
              />
            </div>
          ) : applications.length === 0 ? (
            <div className="empty-state rounded-2xl border border-border-light bg-bg-card p-10">
              <Award size={48} className="text-text-dim mb-3" />
              <h3 className="empty-state-title">
                {t.scholarships?.myApplications?.emptyTitle ||
                  'No Applications Yet'}
              </h3>
              <p className="empty-state-desc mb-4">
                {t.scholarships?.myApplications?.emptyDescription ||
                  'Browse available scholarships and submit your first application.'}
              </p>
              <Link
                href="/scholarships"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-text-inverse text-xs font-bold hover:bg-accent-light transition-colors"
              >
                <Award size={14} />
                {t.scholarships?.myApplications?.emptyCta ||
                  'Browse Scholarships'}
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {applications.map((app) => {
                const statusTone = STATUS_TONES[app.status] || STATUS_TONES.withdrawn;
                const statusLabel =
                  t.scholarships?.statusLabel?.[STATUS_LABEL_KEYS[app.status]] ||
                  app.status;
                const feeAmount = Number(app.registration_fee_etb) || 0;
                const canWithdraw = ['pending', 'payment_verified'].includes(
                  app.status
                );
                const isApproved = app.status === 'approved';
                const refundQueued =
                  app.refund_status === 'pending' && Number(app.refund_amount_etb) > 0;
                const refundDone =
                  app.refund_status === 'completed' && Number(app.refund_amount_etb) > 0;

                return (
                  <div
                    key={app.id}
                    className="flex flex-col gap-3 rounded-xl border border-border-light bg-bg-card p-4 sm:p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex flex-col gap-1 min-w-0">
                        <Link
                          href={`/scholarships/${app.campaign_slug}`}
                          className="text-base font-extrabold text-text-main hover:text-accent transition-colors truncate"
                        >
                          {app.campaign_name}
                        </Link>
                        <span className="text-2xs text-text-dim">
                          {t.scholarships?.myApplications?.appliedLabel ||
                            'Applied'}
                          : {new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full border text-2xs font-bold ${statusTone}`}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    {isApproved && (
                      <Link
                        href="/portal"
                        className="inline-flex items-center gap-1.5 self-start px-4 py-2 rounded-lg bg-accent text-text-inverse text-xs font-bold hover:bg-accent-light transition-colors"
                      >
                        <GraduationCap size={13} />
                        {t.scholarships?.myApplications?.goToPortal ||
                          'Go to Course Portal'}
                      </Link>
                    )}

                    {refundQueued && (
                      <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-lg bg-info/10 border border-info/30 text-info text-2xs font-bold">
                        <RotateCcw size={11} />
                        {(t.scholarships?.myApplications?.refundPending ||
                          'Refund Processing')}{' '}
                        · {Number(app.refund_amount_etb).toLocaleString()} ETB
                      </div>
                    )}

                    {refundDone && (
                      <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-lg bg-success/10 border border-success/30 text-success text-2xs font-bold">
                        <CheckCircle2 size={11} />
                        {(t.scholarships?.myApplications?.refundCompleted ||
                          'Refunded')}{' '}
                        · {Number(app.refund_amount_etb).toLocaleString()} ETB
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border-light">
                      <Link
                        href={`/scholarships/${app.campaign_slug}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-medium text-text-muted text-2xs font-bold hover:border-accent/40 hover:text-accent transition-colors"
                      >
                        <ExternalLink size={12} />
                        {t.scholarships?.myApplications?.viewCampaignLabel ||
                          'View Campaign'}
                      </Link>

                      {canWithdraw && (
                        <button
                          type="button"
                          onClick={() => handleWithdraw(app.id, feeAmount)}
                          disabled={withdrawingId === app.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-error/30 text-error text-2xs font-bold hover:bg-error/10 transition-colors disabled:opacity-50"
                        >
                          <XCircle size={12} />
                          {t.scholarships?.myApplications?.withdrawButton ||
                            'Withdraw'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PageLayout>
    </>
  );
};

export default MyScholarshipsPage;