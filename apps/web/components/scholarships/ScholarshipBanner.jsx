/**
 * @fileoverview Scholarship Banner (Auth Pages)
 *
 * Renders up to `scholarshipsConfig.publicListing.maxBannerCampaigns`
 * campaign cards stacked vertically. Defaults to 1 (newest campaign).
 *
 * Dismissal behavior:
 *   - Clicking the X on any card hides ALL banners for the rest of the
 *     current page instance (client-side navigation won't re-show them).
 *   - A full page refresh resets the flag → banners reappear.
 *
 * Config-driven:
 *   - `maxBannerCampaigns` from config controls how many stack
 *   - Setting to 0 hides the banner system entirely (return null)
 *
 * Path: apps/web/components/scholarships/ScholarshipBanner.jsx
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  X,
  ArrowRight,
  Award,
  Gift,
  Users,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getScholarshipPublicListingConfig } from '../../lib/config';

/* Module-scoped dismissal flag. Persists across client-side navigation,
   resets on full page load (fresh page = banners reappear). */
let dismissedInCurrentPageLoad = false;

/**
 * SingleBannerCard — the visual card for one campaign.
 */
const SingleBannerCard = ({ campaign, onDismiss, isDismissing }) => {
  const { t, language } = useLanguage();

  const name =
    language === 'am' && campaign.nameAm ? campaign.nameAm : campaign.name;

  const grantMessage = campaign.grantsFullCourse
    ? (t.scholarships?.banner?.grantFullCourseMessage ||
        'Get full-course access to {campaign} — completely free for {quota} students.')
        .replace('{campaign}', name)
        .replace('{quota}', String(campaign.quota))
    : (t.scholarships?.banner?.grantPhasesMessage ||
        'Get free access to selected phases of {campaign} — limited to {quota} students.')
        .replace('{campaign}', name)
        .replace('{quota}', String(campaign.quota));

  const feeAmount = Number(campaign.registrationFeeETB) || 0;
  const hasQuota = campaign.quota > 0;
  const remaining = hasQuota
    ? Math.max(0, campaign.quota - (campaign.approvedCount || 0))
    : 0;
  const quotaPercent = hasQuota
    ? Math.min(100, Math.round(((campaign.approvedCount || 0) / campaign.quota) * 100))
    : 0;

  const detailHref = `/scholarships/${encodeURIComponent(campaign.slug)}`;

  return (
    <div
      role="region"
      aria-label={t.scholarships?.banner?.ariaLabel || 'Scholarship announcement'}
      className={`relative w-full rounded-2xl overflow-hidden border border-accent/40
                  bg-bg-card-solid shadow-xl
                  transition-all duration-200 ease-out
                  hover:-translate-y-0.5 hover:shadow-glow-gold-lg
                  ${isDismissing ? 'opacity-0 scale-95' : 'opacity-100 scale-100 animate-fade-in-up'}`}
    >
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-accent-light to-accent"
      />

      {campaign.coverImageUrl && (
        <>
          <img
            src={campaign.coverImageUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-bg-card-solid/95 via-bg-card-solid/85 to-bg-card-solid/95 pointer-events-none"
          />
        </>
      )}

      <div
        aria-hidden="true"
        className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-accent/30 blur-3xl pointer-events-none"
      />

      <div className="relative p-5">
        <button
          type="button"
          onClick={onDismiss}
          aria-label={t.scholarships?.banner?.dismissAriaLabel || 'Dismiss announcement'}
          className="absolute top-3 right-3 p-1.5 rounded-md
                     text-text-dim hover:text-text-main hover:bg-bg-ghost-hover
                     transition-colors z-10"
        >
          <X size={15} />
        </button>

        <div className="flex items-center gap-2 mb-3 flex-wrap pr-8">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-accent text-text-inverse flex items-center justify-center shadow-glow-gold-sm">
            <GraduationCap size={20} />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/15 border border-accent/40 text-accent text-2xs font-extrabold uppercase tracking-wider">
              <Sparkles size={9} />
              {t.scholarships?.banner?.headline || 'New Scholarship'}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bg-pill border border-border-medium text-text-muted text-2xs font-bold">
              <Award size={9} />
              {campaign.grantsFullCourse
                ? t.scholarships?.card?.fullCourse || 'Full Course'
                : (t.scholarships?.card?.phases || '{count} Phase(s)').replace(
                    '{count}',
                    String((campaign.grantsPhases || []).length)
                  )}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 border border-success/30 text-success text-2xs font-bold">
              <Gift size={9} />
              {feeAmount > 0
                ? (t.scholarships?.card?.registrationFee || '{amount} ETB').replace(
                    '{amount}',
                    feeAmount.toLocaleString()
                  )
                : t.scholarships?.card?.registrationFree || 'Free'}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm font-extrabold text-text-main mb-1">{name}</p>
          <p className="text-xs text-text-muted leading-relaxed">{grantMessage}</p>
        </div>

        {hasQuota && (
          <div className="flex flex-col gap-1.5 mb-4">
            <div className="flex items-center justify-between text-2xs">
              <span className="inline-flex items-center gap-1 text-text-muted font-semibold">
                <Users size={10} />
                {(t.scholarships?.banner?.spotsLeft || '{remaining} of {quota} spots left')
                  .replace('{remaining}', String(remaining))
                  .replace('{quota}', String(campaign.quota))}
              </span>
              <span className="text-text-dim font-bold font-mono">
                {quotaPercent}% filled
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-bg-input border border-border-light overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-accent-light transition-all duration-500"
                style={{ width: `${quotaPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={detailHref}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg
                       bg-accent text-text-inverse text-xs font-extrabold
                       shadow-glow-gold-sm hover:bg-accent-light
                       hover:shadow-glow-gold hover:-translate-y-0.5
                       transition-all duration-200"
          >
            {t.scholarships?.banner?.applyNowButton || 'Apply Now'}
            <ArrowRight size={12} />
          </Link>
          <Link
            href="/scholarships"
            className="inline-flex items-center px-4 py-2 rounded-lg
                       border border-border-medium bg-transparent
                       text-text-muted text-xs font-bold
                       hover:border-accent/40 hover:text-accent hover:bg-accent/5
                       transition-colors"
          >
            {t.scholarships?.banner?.learnMoreButton || 'Learn More'}
          </Link>
        </div>
      </div>
    </div>
  );
};

/**
 * ScholarshipBanner — renders up to `maxBannerCampaigns` stacked cards.
 */
const ScholarshipBanner = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [dismissed, setDismissed] = useState(dismissedInCurrentPageLoad);
  const [loading, setLoading] = useState(true);
  const [isDismissing, setIsDismissing] = useState(false);

  const config = getScholarshipPublicListingConfig();
  const maxBannerCampaigns = Math.max(0, Number(config.maxBannerCampaigns) || 0);

  useEffect(() => {
    let cancelled = false;
    const fetchCampaigns = async () => {
      try {
        const response = await fetch('/api/public/scholarships/active', {
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) {
          if (!cancelled) setLoading(false);
          return;
        }
        const payload = await response.json();
        if (cancelled) return;
        const list = payload?.data?.campaigns || [];
        setCampaigns(list);
      } catch {
        if (!cancelled) setCampaigns([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchCampaigns();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDismiss = () => {
    setIsDismissing(true);
    dismissedInCurrentPageLoad = true;
    setTimeout(() => setDismissed(true), 200);
  };

  /* Config gate: maxBannerCampaigns = 0 disables the banner system */
  if (maxBannerCampaigns === 0) return null;
  if (loading || dismissed) return null;
  if (!campaigns || campaigns.length === 0) return null;

  /* Render up to N cards. Backend orders by created_at DESC. */
  const visibleCampaigns = campaigns.slice(0, maxBannerCampaigns);

  /* Single campaign → no extra gap wrapper needed */
  if (visibleCampaigns.length === 1) {
    return (
      <SingleBannerCard
        campaign={visibleCampaigns[0]}
        onDismiss={handleDismiss}
        isDismissing={isDismissing}
      />
    );
  }

  /* Multiple campaigns → stack with gap */
  return (
    <div className="flex flex-col gap-3">
      {visibleCampaigns.map((campaign) => (
        <SingleBannerCard
          key={campaign.slug}
          campaign={campaign}
          onDismiss={handleDismiss}
          isDismissing={isDismissing}
        />
      ))}
    </div>
  );
};

export default ScholarshipBanner;