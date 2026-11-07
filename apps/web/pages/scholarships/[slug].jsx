/**
 * @fileoverview Scholarship Detail + Apply Page
 *
 * Shows a single campaign, its grant summary, eligibility checks, and
 * the fee policy in the pay-at-apply refund model.
 *
 * Fee Policy Block:
 *   - Free campaigns: "This scholarship is completely free"
 *   - Paid campaigns: "Pay at apply, refund if rejected" with three
 *     guarantee points + the refund deadline in days
 *
 * Design system compliance:
 *   - Design tokens only (bg-bg-card, text-text-main, border-border-light)
 *   - No raw palette, no dark: variants
 *   - Skeleton matches layout shape (zero CLS)
 *   - ConfirmDialog via useConfirm() — no window.confirm anywhere
 *
 * Path: apps/web/pages/scholarships/[slug].jsx
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  FileCheck,
  Gift,
  Users,
  XCircle,
  Wallet,
  Sparkles,
  ArrowRight,
  CreditCard,
  ShieldCheck,
  Info,
} from 'lucide-react';
import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import ApplicationForm from '../../components/scholarships/ApplicationForm';
import { SkeletonBase, SkeletonWrapper } from '../../components/shared/Skeleton';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../components/shared/ConfirmProvider';
import { getScholarshipRegistrationFeeConfig } from '../../lib/config';
import { getItem } from '../../lib/storage';

const STATUS_TONES = {
  pending: 'bg-warning/10 text-warning border-warning/30',
  pending_payment: 'bg-info/10 text-info border-info/30',
  approved: 'bg-success/10 text-success border-success/30',
  rejected: 'bg-error/10 text-error border-error/30',
  withdrawn: 'bg-bg-pill text-text-muted border-border-medium',
  revoked: 'bg-error/10 text-error border-error/30',
};

const STATUS_LABEL_KEYS = {
  pending: 'pending',
  pending_payment: 'pendingPayment',
  approved: 'approved',
  rejected: 'rejected',
  withdrawn: 'withdrawn',
  revoked: 'revoked',
};

const toCamelKey = (snake) =>
  String(snake || '')
    .split('_')
    .map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join('');

const resolveDocLabel = (t, type) => {
  const camel = toCamelKey(type);
  return t.scholarships?.documents?.[camel] || t.scholarships?.documents?.[type] || type;
};

const DetailSkeleton = () => (
  <div className="flex flex-col gap-6">
    <SkeletonBase className="skeleton-line skeleton-line-short" />
    <SkeletonBase style={{ width: '60%', height: '2.5rem' }} />
    <SkeletonWrapper className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SkeletonBase style={{ height: '6rem' }} />
      <SkeletonBase style={{ height: '6rem' }} />
    </SkeletonWrapper>
    <SkeletonBase style={{ height: '12rem' }} />
  </div>
);

const ScholarshipDetailPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();

  const feeConfig = getScholarshipRegistrationFeeConfig();
  const refundDeadlineDays = Number(feeConfig?.paymentDeadlineDays) || 7;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [myApplication, setMyApplication] = useState(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const fetchCampaign = useCallback(async () => {
    if (!slug || !isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const token = getItem('auth_token');
      const response = await fetch(`/api/scholarships/${encodeURIComponent(slug)}`, {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        setError(payload?.message || 'Failed to load campaign.');
        return;
      }
      setCampaign(payload.data.campaign);
      setEligibility(payload.data.eligibility);
      setMyApplication(payload.data.myApplication || null);
    } catch (fetchError) {
      console.error('[scholarship/detail] fetch failed:', fetchError);
      setError(t.scholarships?.detail?.notFoundDescription || 'Unable to load.');
    } finally {
      setLoading(false);
    }
  }, [slug, isAuthenticated, t]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  const handleWithdraw = useCallback(async () => {
    if (!myApplication?.id) return;
    const confirmed = await confirm({
      title: t.scholarships?.myApplications?.withdrawConfirmTitle || 'Withdraw Application?',
      message: t.scholarships?.myApplications?.withdrawConfirmBody || 'This cannot be undone.',
      confirmText: t.scholarships?.myApplications?.withdrawConfirmButton || 'Yes, Withdraw',
      cancelText: t.scholarships?.formModal?.cancelButton || 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;

    setWithdrawing(true);
    try {
      const token = getItem('auth_token');
      const response = await fetch('/api/scholarships/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ applicationId: myApplication.id }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        toast.error(result?.message || 'Withdrawal failed.');
        return;
      }
      toast.success(t.scholarships?.myApplications?.withdrawSuccessBody || 'Application withdrawn.');
      setMyApplication(null);
      await fetchCampaign();
    } catch (withdrawError) {
      console.error('[scholarship/detail] withdraw failed:', withdrawError);
      toast.error('Withdrawal failed.');
    } finally {
      setWithdrawing(false);
    }
  }, [myApplication, confirm, t, toast, fetchCampaign]);

  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="container-xl py-16 flex flex-col items-center gap-4 text-center">
          <Award size={48} className="text-text-dim" />
          <p className="text-text-muted">
            {t.scholarships?.form?.loginRequired || 'You must be logged in to view scholarship details.'}
          </p>
          <Link
            href={`/auth/login?redirect=${encodeURIComponent(`/scholarships/${slug}`)}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-text-inverse text-xs font-bold hover:bg-accent-light transition-colors"
          >
            {t.auth?.login || 'Login'}
          </Link>
        </div>
      </PageLayout>
    );
  }

  if (loading) {
    return (
      <>
        <SEOHead title={t.scholarships?.detail?.loadingLabel || 'Loading...'} />
        <PageLayout>
          <div className="container-xl py-12"><DetailSkeleton /></div>
        </PageLayout>
      </>
    );
  }

  if (error || !campaign) {
    return (
      <>
        <SEOHead title={t.scholarships?.detail?.notFoundTitle || 'Not Found'} />
        <PageLayout>
          <div className="container-xl py-16 flex flex-col items-center gap-3 text-center">
            <XCircle size={48} className="text-error" />
            <h1 className="text-xl font-extrabold text-text-main">
              {t.scholarships?.detail?.notFoundTitle || 'Not Found'}
            </h1>
            <p className="text-sm text-text-muted">{error}</p>
            <Link
              href="/scholarships"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-text-inverse text-xs font-bold hover:bg-accent-light transition-colors"
            >
              <ArrowLeft size={14} />
              {t.scholarships?.detail?.backToBrowse || 'Browse Other Scholarships'}
            </Link>
          </div>
        </PageLayout>
      </>
    );
  }

  const name = language === 'am' && campaign.nameAm ? campaign.nameAm : campaign.name;
  const description = language === 'am' && campaign.descriptionAm ? campaign.descriptionAm : campaign.description;

  const statusLabel = myApplication
    ? t.scholarships?.statusLabel?.[STATUS_LABEL_KEYS[myApplication.status]] || myApplication.status
    : null;
  const statusTone = myApplication ? STATUS_TONES[myApplication.status] : '';

  const canApply = eligibility?.canApply === true;
  const blockReason = eligibility?.blockReason || null;
  const feeAmount = Number(campaign.registrationFeeETB) || 0;
  const requiredDocs = Array.isArray(campaign.requiredDocuments) ? campaign.requiredDocuments : [];

  const renderApplyButton = () => {
    if (myApplication?.status === 'pending_payment' && feeAmount > 0) {
      return (
        <Link
          href={`/scholarships/fee-pay?application=${encodeURIComponent(myApplication.id)}`}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent text-text-inverse text-sm font-bold hover:bg-accent-light transition-colors shadow-glow-gold"
        >
          <Wallet size={16} />
          {(t.scholarships?.detail?.payFeeCta || 'Pay Registration Fee ({amount} ETB)').replace(
            '{amount}',
            feeAmount.toLocaleString()
          )}
        </Link>
      );
    }
    if (myApplication) {
      return (
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-bold ${statusTone}`}>
          <FileCheck size={14} />
          {statusLabel}
        </div>
      );
    }
    if (!canApply) {
      const blockMessages = {
        ALREADY_APPLIED: t.scholarships?.detail?.eligibilityAlreadyApplied || 'Already applied',
        USER_BANNED: t.scholarships?.detail?.eligibilityBanned || 'Not eligible',
        CAMPAIGN_CLOSED: t.scholarships?.card?.closed || 'Closed',
        QUOTA_FULL: t.scholarships?.card?.full || 'Quota Full',
      };
      return (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-medium bg-bg-pill text-text-muted text-xs font-bold">
          <XCircle size={14} />
          {blockMessages[blockReason] || blockReason || 'Not available'}
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={() => setApplyOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent text-text-inverse text-sm font-bold hover:bg-accent-light transition-colors shadow-glow-gold"
      >
        <CheckCircle2 size={16} />
        {t.scholarships?.detail?.applyCta || 'Apply for This Scholarship'}
      </button>
    );
  };

  return (
    <>
      <SEOHead title={name} description={description} />
      <PageLayout>
        <div className="container-xl py-12 flex flex-col gap-8">
          <Link
            href="/scholarships"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-accent transition-colors group self-start"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            {t.scholarships?.detail?.backLink || 'Back to Scholarships'}
          </Link>

          {/* Hero */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-2xs font-bold border border-accent/30">
                <Award size={11} />
                {campaign.grantsFullCourse
                  ? t.scholarships?.card?.fullCourse || 'Full Course Access'
                  : (t.scholarships?.card?.phases || '{count} Phase(s)').replace(
                      '{count}',
                      String((campaign.grantsPhases || []).length)
                    )}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-pill text-text-muted text-2xs font-bold border border-border-medium">
                <Gift size={11} />
                {feeAmount > 0
                  ? (t.scholarships?.card?.registrationFee || '{amount} ETB').replace(
                      '{amount}',
                      feeAmount.toLocaleString()
                    )
                  : t.scholarships?.card?.registrationFree || 'Free Registration'}
              </span>
              {campaign.quota > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-pill text-text-muted text-2xs font-bold border border-border-medium">
                  <Users size={11} />
                  {(t.scholarships?.card?.spotsRemaining || '{remaining} of {total} spots left')
                    .replace('{remaining}', String(campaign.remaining))
                    .replace('{total}', String(campaign.quota))}
                </span>
              )}
              {campaign.applicationsCloseAt && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-pill text-text-muted text-2xs font-bold border border-border-medium">
                  <Clock size={11} />
                  {(t.scholarships?.card?.endsOn || 'Ends {date}').replace(
                    '{date}',
                    new Date(campaign.applicationsCloseAt).toLocaleDateString()
                  )}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-text-main">{name}</h1>
            {description && (
              <p className="text-base text-text-muted leading-relaxed max-w-2xl">{description}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {renderApplyButton()}
              {myApplication &&
                ['pending', 'pending_payment'].includes(myApplication.status) && (
                  <button
                    type="button"
                    onClick={handleWithdraw}
                    disabled={withdrawing}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-error/30 text-error text-xs font-bold hover:bg-error/10 transition-colors disabled:opacity-50"
                  >
                    <XCircle size={14} />
                    {t.scholarships?.myApplications?.withdrawButton || 'Withdraw Application'}
                  </button>
                )}
            </div>
          </div>

          {/* Grant details */}
          <section className="rounded-2xl border border-border-light bg-bg-card p-6">
            <h2 className="text-lg font-extrabold text-text-main mb-4 flex items-center gap-2">
              <Gift size={18} className="text-accent" />
              {t.scholarships?.detail?.grantTitle || 'What You Will Get'}
            </h2>
            {campaign.grantsFullCourse ? (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20">
                <CheckCircle2 size={20} className="text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-text-main">
                    {t.scholarships?.detail?.grantFullCourse || 'Complete access to all 5 phases'}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    {t.scholarships?.detail?.grantFullCourseDesc ||
                      'Every video, every project, every mentor session.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20">
                  <CheckCircle2 size={20} className="text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-text-main">
                      {t.scholarships?.detail?.grantPhases || 'Access to specific phases'}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {t.scholarships?.detail?.grantPhasesDesc ||
                        'You will unlock the exact phases listed below.'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(campaign.grantsPhases || []).map((phaseId) => (
                    <span
                      key={phaseId}
                      className="inline-flex items-center px-3 py-1 rounded-md bg-accent/10 text-accent text-xs font-bold border border-accent/20"
                    >
                      {phaseId.replace('phase-', 'Phase ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Learn More */}
          {(campaign.learnMoreContent || campaign.learnMoreUrl) && (
            <section className="rounded-2xl border border-border-light bg-bg-card p-6">
              <h2 className="text-lg font-extrabold text-text-main mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-accent" />
                {t.scholarships?.learnMore?.title || 'About This Scholarship'}
              </h2>
              {campaign.learnMoreContent && (
                <div className="text-sm text-text-muted leading-relaxed whitespace-pre-wrap">
                  {campaign.learnMoreContent}
                </div>
              )}
              {campaign.learnMoreUrl && (
                <a
                  href={campaign.learnMoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-accent hover:underline"
                >
                  {t.scholarships?.learnMore?.externalLinkLabel || 'Read Full Details'}
                  <ArrowRight size={14} />
                </a>
              )}
            </section>
          )}

          {/* Required documents */}
          {requiredDocs.length > 0 && (
            <section className="rounded-2xl border border-border-light bg-bg-card p-6">
              <h2 className="text-lg font-extrabold text-text-main mb-4 flex items-center gap-2">
                <FileCheck size={18} className="text-accent" />
                {t.scholarships?.detail?.documentsTitle || 'Required Documents'}
              </h2>
              <ul className="flex flex-col gap-2">
                {requiredDocs.map((doc) => (
                  <li
                    key={doc.type}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-bg-input border border-border-light"
                  >
                    <span className="text-sm text-text-main">
                      {resolveDocLabel(t, doc.type)}
                    </span>
                    <span
                      className={`text-2xs font-bold uppercase ${
                        doc.required ? 'text-accent' : 'text-text-dim'
                      }`}
                    >
                      {doc.required
                        ? t.scholarships?.detail?.documentRequired || 'Required'
                        : t.scholarships?.detail?.documentOptional || 'Optional'}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ── Fee Policy ─────────────────────────────────────────────────
              Pay-at-apply with refund guarantee. Explains that the fee is
              collected at submission and fully refundable if rejected.
           */}
          <section className="rounded-2xl border border-info/30 bg-info/5 p-6">
            <h2 className="text-lg font-extrabold text-text-main mb-3 flex items-center gap-2">
              <Wallet size={18} className="text-info" />
              {t.scholarships?.detail?.feePolicyTitle || 'Registration Fee Policy'}
            </h2>

            {feeAmount === 0 ? (
              <p className="text-sm text-text-main leading-relaxed">
                {t.scholarships?.detail?.feePolicyFreeMessage ||
                  'This scholarship is completely free. No fee is ever charged.'}
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-2 text-sm text-text-main">
                  <CreditCard size={16} className="text-info shrink-0 mt-0.5" />
                  <p className="font-semibold">
                    {t.scholarships?.detail?.feePolicyPaidTitle ||
                      'Pay at apply, refund if rejected'}
                  </p>
                </div>
                <div className="flex items-start gap-2 text-sm text-text-muted">
                  <CheckCircle2 size={16} className="text-info shrink-0 mt-0.5" />
                  <p>
                    {(t.scholarships?.detail?.feePolicyPaidMessage ||
                      'The {amount} ETB registration fee is collected when you submit. This fee is fully refundable if your application is not approved.')
                      .replace('{amount}', String(feeAmount))}
                  </p>
                </div>
                <div className="flex items-start gap-2 text-sm text-text-muted">
                  <ShieldCheck size={16} className="text-info shrink-0 mt-0.5" />
                  <p>
                    {(t.scholarships?.detail?.feePolicyRefundMessage ||
                      'If your application is rejected, your full fee is automatically queued for refund within {days} days.')
                      .replace('{days}', String(refundDeadlineDays))}
                  </p>
                </div>
                <div className="flex items-start gap-2 text-sm text-text-muted">
                  <Info size={16} className="text-info shrink-0 mt-0.5" />
                  <p>
                    {t.scholarships?.detail?.feePolicySecureMessage ||
                      'Your payment is held securely until a decision is made.'}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Application status */}
          {myApplication && (
            <section className="rounded-2xl border border-border-light bg-bg-card p-6">
              <h2 className="text-lg font-extrabold text-text-main mb-4">
                {t.scholarships?.detail?.applicationStatusTitle || 'Your Application'}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${statusTone}`}>
                  {statusLabel}
                </span>
                <span className="text-xs text-text-dim">
                  {new Date(myApplication.created_at).toLocaleDateString()}
                </span>
              </div>
              {myApplication.status === 'rejected' && myApplication.rejection_reason && (
                <p className="text-xs text-text-muted px-3 py-2 rounded-lg bg-error/5 border border-error/20">
                  {(t.scholarships?.detail?.rejectionNotice || 'Reason: {reason}').replace(
                    '{reason}',
                    myApplication.rejection_reason
                  )}
                </p>
              )}
            </section>
          )}
        </div>

        <ApplicationForm
          isOpen={applyOpen}
          onClose={() => setApplyOpen(false)}
          campaign={campaign}
          onSubmitted={() => {
            setApplyOpen(false);
            fetchCampaign();
          }}
        />
      </PageLayout>
    </>
  );
};

export default ScholarshipDetailPage;