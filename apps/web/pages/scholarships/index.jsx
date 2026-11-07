/**
 * @fileoverview Public Scholarships Browse Page
 *
 * Guest + authenticated scholarship browse surface. Uses the public
 * endpoint for guests and the authenticated endpoint for signed-in
 * users (which merges the visitor's application statuses into the
 * campaign list).
 *
 * Design system compliance:
 *   - Design tokens only
 *   - Skeleton grid during load
 *   - Staggered entrance on cards
 *   - Zero hardcoded strings (i18n with safe English fallbacks)
 *
 * Path: apps/web/pages/scholarships/index.jsx
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Award,
  Gift,
  Users,
  Clock,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import { SkeletonBase, SkeletonWrapper } from '../../components/shared/Skeleton';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getItem } from '../../lib/storage';

const shortDate = (value) => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
};

const daysUntil = (value) => {
  if (!value) return null;
  try {
    const diff = new Date(value).getTime() - Date.now();
    if (diff < 0) return null;
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
  } catch {
    return null;
  }
};

const BrowseSkeleton = () => (
  <SkeletonWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <div
        key={i}
        className="rounded-2xl overflow-hidden border border-border-light bg-bg-card-solid"
      >
        <SkeletonBase style={{ height: '8rem', borderRadius: 0 }} />
        <div className="p-4 flex flex-col gap-2">
          <SkeletonBase className="skeleton-line skeleton-line-medium" />
          <SkeletonBase className="skeleton-line skeleton-line-short" />
          <SkeletonBase style={{ height: '1.5rem', borderRadius: '9999px' }} />
          <SkeletonBase style={{ height: '2.25rem', borderRadius: '0.5rem' }} />
        </div>
      </div>
    ))}
  </SkeletonWrapper>
);

const ScholarshipCard = ({ campaign, isAuthenticated, index }) => {
  const { t, language } = useLanguage();

  const name = language === 'am' && campaign.nameAm ? campaign.nameAm : campaign.name;
  const description =
    language === 'am' && campaign.descriptionAm
      ? campaign.descriptionAm
      : campaign.description;

  const fee = Number(campaign.registrationFeeETB) || 0;
  const hasQuota = Number(campaign.quota) > 0;
  const remaining = hasQuota
    ? Math.max(0, Number(campaign.quota) - Number(campaign.approvedCount || 0))
    : 0;
  const quotaPct = hasQuota
    ? Math.min(
        100,
        Math.round(
          (Number(campaign.approvedCount || 0) / Number(campaign.quota)) * 100
        )
      )
    : 0;
  const isFull = hasQuota && remaining <= 0;
  const isClosed =
    Boolean(campaign.applicationsCloseAt) &&
    new Date(campaign.applicationsCloseAt) < new Date();
  const daysLeft = daysUntil(campaign.applicationsCloseAt);
  const myApp = campaign.myApplication || null;
  const status = myApp?.status || null;

  const statusLabel = (s) => {
    const map = {
      pending: t.scholarships?.statusLabel?.pending || 'Pending Review',
      pending_payment: t.scholarships?.statusLabel?.pendingPayment || 'Awaiting Payment',
      approved: t.scholarships?.statusLabel?.approved || 'Approved',
      rejected: t.scholarships?.statusLabel?.rejected || 'Not Approved',
      withdrawn: t.scholarships?.statusLabel?.withdrawn || 'Withdrawn',
      revoked: t.scholarships?.statusLabel?.revoked || 'Revoked',
    };
    return map[s] || s;
  };

  let cta;
  if (status) {
    cta = (
      <Link
        href={`/scholarships/${encodeURIComponent(campaign.slug)}`}
        className="group/cta inline-flex items-center justify-between gap-2 w-full px-4 py-2.5 rounded-lg bg-bg-pill border border-border-medium text-text-muted text-xs font-bold hover:border-accent/40 hover:text-accent transition-colors"
      >
        <span className="truncate">{statusLabel(status)}</span>
        <ArrowRight size={12} className="shrink-0 group-hover/cta:translate-x-0.5 transition-transform" />
      </Link>
    );
  } else if (isClosed || isFull) {
    cta = (
      <div className="inline-flex items-center justify-center gap-1.5 w-full px-4 py-2.5 rounded-lg border border-border-medium bg-bg-pill text-text-dim text-xs font-bold cursor-not-allowed">
        {isClosed
          ? t.scholarships?.card?.closed || 'Applications Closed'
          : t.scholarships?.card?.full || 'Quota Full'}
      </div>
    );
  } else if (!isAuthenticated) {
    cta = (
      <Link
        href={`/auth/register?redirect=${encodeURIComponent(
          `/scholarships/${campaign.slug}`
        )}`}
        className="group/cta inline-flex items-center justify-between gap-2 w-full px-4 py-2.5 rounded-lg bg-accent text-text-inverse text-xs font-bold hover:bg-accent-light shadow-glow-gold-sm hover:shadow-glow-gold hover:-translate-y-0.5 transition-all"
      >
        <span>{t.scholarships?.card?.applyNow || 'Apply Now'}</span>
        <ArrowRight size={12} className="group-hover/cta:translate-x-0.5 transition-transform" />
      </Link>
    );
  } else {
    cta = (
      <Link
        href={`/scholarships/${encodeURIComponent(campaign.slug)}`}
        className="group/cta inline-flex items-center justify-between gap-2 w-full px-4 py-2.5 rounded-lg bg-accent text-text-inverse text-xs font-bold hover:bg-accent-light shadow-glow-gold-sm hover:shadow-glow-gold hover:-translate-y-0.5 transition-all"
      >
        <span>{t.scholarships?.card?.applyNow || 'Apply Now'}</span>
        <ArrowRight size={12} className="group-hover/cta:translate-x-0.5 transition-transform" />
      </Link>
    );
  }

  return (
    <article
      className="group flex flex-col rounded-2xl overflow-hidden border border-border-light bg-bg-card-solid hover:-translate-y-1 hover:border-accent/40 hover:shadow-glow-gold transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* Cover */}
      <div className="relative h-32 overflow-hidden">
        {campaign.coverImageUrl ? (
          <>
            <img
              src={campaign.coverImageUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-card-solid via-bg-card-solid/60 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-accent/40 via-accent/15 to-bg-card-solid" />
        )}

        {status && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bg-card-solid/95 border border-accent/40 text-2xs font-extrabold uppercase tracking-wider text-accent">
            {t.scholarships?.card?.applied || 'Applied'}
          </span>
        )}

        {daysLeft !== null && daysLeft <= 7 && !status && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/20 border border-warning/40 text-warning text-2xs font-extrabold uppercase tracking-wider animate-pulse">
            <Clock size={9} />
            {daysLeft === 0 ? 'Closes today' : `${daysLeft}d left`}
          </span>
        )}

        <div className="absolute -bottom-5 left-4 w-12 h-12 rounded-xl bg-accent text-text-inverse flex items-center justify-center shadow-glow-gold-sm border-4 border-bg-card-solid">
          <GraduationCap size={20} />
        </div>
      </div>

      {/* Body */}
      <div className="pt-8 px-4 pb-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="text-sm font-extrabold text-text-main leading-tight line-clamp-2">
            {name}
          </h3>
          {description && (
            <p className="text-2xs text-text-muted mt-1 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-2xs font-bold border border-accent/30">
            <Award size={9} />
            {campaign.grantsFullCourse
              ? t.scholarships?.card?.fullCourse || 'Full Course'
              : (t.scholarships?.card?.phases || '{count} Phase(s)').replace(
                  '{count}',
                  String((campaign.grantsPhases || []).length)
                )}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold border ${
              fee > 0
                ? 'bg-warning/10 text-warning border-warning/30'
                : 'bg-success/10 text-success border-success/30'
            }`}
          >
            <Gift size={9} />
            {fee > 0
              ? (t.scholarships?.card?.registrationFee || '{amount} ETB').replace(
                  '{amount}',
                  fee.toLocaleString()
                )
              : t.scholarships?.card?.registrationFree || 'Free'}
          </span>
        </div>

        {hasQuota && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-2xs">
              <span className="inline-flex items-center gap-1 text-text-muted font-semibold">
                <Users size={10} />
                {remaining} of {campaign.quota} left
              </span>
              <span className="text-text-dim font-bold font-mono">{quotaPct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-bg-input border border-border-light overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  quotaPct >= 90
                    ? 'bg-gradient-to-r from-warning to-error'
                    : 'bg-gradient-to-r from-accent to-accent-light'
                }`}
                style={{ width: `${quotaPct}%` }}
              />
            </div>
          </div>
        )}

        {campaign.applicationsCloseAt && (
          <div className="flex items-center gap-1 text-2xs text-text-dim">
            <Clock size={10} />
            {(t.scholarships?.card?.endsOn || 'Ends {date}').replace(
              '{date}',
              shortDate(campaign.applicationsCloseAt)
            )}
          </div>
        )}

        <div className="mt-auto pt-1">{cta}</div>
      </div>
    </article>
  );
};

const ScholarshipsBrowsePage = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getItem('auth_token');
      const endpoint =
        isAuthenticated && token
          ? '/api/scholarships'
          : '/api/public/scholarships/active';
      const headers = { Accept: 'application/json' };
      if (isAuthenticated && token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(endpoint, { headers });
      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        setError(
          t.scholarships?.browse?.errorTitle || 'Could not load scholarships'
        );
        return;
      }
      setCampaigns(payload.data?.campaigns || []);
    } catch (err) {
      console.error('[scholarships/browse] fetch failed:', err);
      setError(t.scholarships?.browse?.errorTitle || 'Could not load scholarships');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, t]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return (
    <>
      <SEOHead
        title={t.scholarships?.browse?.pageTitle || 'Scholarships'}
        description={
          t.scholarships?.browse?.pageSubtitle || 'Financial assistance for aspiring developers'
        }
      />
      <PageLayout>
        <div className="container-xl py-12 flex flex-col gap-8">
          {/* Hero */}
          <header className="relative overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/20 via-bg-card-solid to-bg-card-solid p-8 md:p-10 animate-fade-in-up">
            <div
              aria-hidden="true"
              className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-accent/30 blur-3xl pointer-events-none animate-blob"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-warning/20 blur-3xl pointer-events-none animate-blob"
              style={{ animationDelay: '2s' }}
            />
            <div className="relative flex flex-col gap-4 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-accent/15 border border-accent/40 text-accent text-2xs font-extrabold uppercase tracking-widest">
                <Sparkles size={10} />
                {t.scholarships?.page?.title || 'Scholarships'}
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold text-text-main leading-tight">
                {t.scholarships?.browse?.pageTitle || 'Scholarships'}
              </h1>
              <p className="text-sm md:text-base text-text-muted leading-relaxed">
                {t.scholarships?.browse?.pageSubtitle ||
                  'Financial assistance for aspiring developers'}
              </p>
            </div>
          </header>

          {/* Grid */}
          {loading ? (
            <BrowseSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-error/10 border border-error/30 flex items-center justify-center text-error">
                <RefreshCw size={22} />
              </div>
              <h2 className="text-base font-bold text-text-main">{error}</h2>
              <button
                type="button"
                onClick={fetchCampaigns}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-text-inverse text-xs font-bold hover:bg-accent-light transition-colors"
              >
                <RefreshCw size={12} />
                {t.scholarships?.browse?.retryButton || 'Try Again'}
              </button>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center animate-fade-in-up">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center text-accent animate-pulse-glow">
                <GraduationCap size={28} />
              </div>
              <h2 className="text-lg font-extrabold text-text-main">
                {t.scholarships?.browse?.emptyTitle || 'No Scholarships Available'}
              </h2>
              <p className="text-sm text-text-muted max-w-md">
                {t.scholarships?.browse?.emptyDescription ||
                  'Check back soon — new campaigns are announced regularly.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {campaigns.map((campaign, idx) => (
                <ScholarshipCard
                  key={campaign.slug}
                  campaign={campaign}
                  isAuthenticated={isAuthenticated}
                  index={idx}
                />
              ))}
            </div>
          )}

          {/* Guest CTA */}
          {!isAuthenticated && campaigns.length > 0 && (
            <div className="relative overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/15 via-accent/5 to-transparent p-6 text-center animate-fade-in-up">
              <div
                aria-hidden="true"
                className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-accent/20 blur-3xl pointer-events-none"
              />
              <p className="relative text-sm font-bold text-text-main mb-1">
                {t.scholarships?.browse?.sectionSubtitle ||
                  'Create an account to apply for a scholarship'}
              </p>
              <Link
                href="/auth/register"
                className="relative inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg mt-3 bg-accent text-text-inverse text-xs font-bold hover:bg-accent-light hover:-translate-y-0.5 shadow-glow-gold-sm transition-all"
              >
                {t.auth?.register || 'Create Account'}
                <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </div>
      </PageLayout>
    </>
  );
};

export default ScholarshipsBrowsePage;