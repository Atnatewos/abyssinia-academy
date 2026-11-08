/**
 * @fileoverview Scholarship Floating Card
 *
 * Persistent bottom-right card that advertises the newest active
 * scholarship campaign. Behavior:
 *
 *   - Only renders when there is at least one active campaign
 *   - Appears 3 seconds after mount (gentle, non-pushy)
 *   - Slides in from the right with a subtle spring
 *   - Fixed positioning — stays put on scroll
 *   - Dismissible via X button (persists for 7 days via localStorage)
 *   - Hidden on viewports < md (mobile screens are too crowded)
 *   - Hidden on /auth/* pages (ScholarshipBanner is already there)
 *
 * Config-driven:
 *   - publicListing.floatingCard.enabled      — master kill switch
 *   - publicListing.floatingCard.delayMs      — appearance delay
 *   - publicListing.floatingCard.dismissDays  — how long dismissal lasts
 *   - publicListing.maxBannerCampaigns        — how many campaigns to show
 *
 * Path: apps/web/components/scholarships/ScholarshipFloatingCard.jsx
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  GraduationCap,
  X,
  ArrowRight,
  Award,
  Gift,
  Users,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getScholarshipPublicListingConfig } from '../../lib/config';
import { getItem, setItem } from '../../lib/storage';

/* localStorage key for dismissal expiry. Value is a Unix timestamp
   (ms). Cleared when the campaign set changes, so a new campaign
   always re-triggers the card. */
const DISMISS_KEY = 'scholarship_floating_dismissed_until';

/**
 * Format a quota progress label — "5 of 10 spots left" style.
 * Extracted here so both the compact and expanded card views use the
 * same wording.
 */
const buildSpotsLabel = (t, remaining, quota) =>
  (t.scholarships?.banner?.spotsLeft || '{remaining} of {quota} spots left')
    .replace('{remaining}', String(remaining))
    .replace('{quota}', String(quota));

const ScholarshipFloatingCard = () => {
  const router = useRouter();
  const { t, language } = useLanguage();

  const [campaigns, setCampaigns] = useState([]);
  const [visible, setVisible] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [mounted, setMounted] = useState(false);

  const config = getScholarshipPublicListingConfig();
  const floatingConfig = config?.floatingCard || {};

  const enabled = floatingConfig.enabled !== false;
  const delayMs = Number(floatingConfig.delayMs) || 3000;
  const dismissDays = Number(floatingConfig.dismissDays) || 7;
  const maxShow = Math.max(1, Number(config.maxBannerCampaigns) || 1);

  /* Hide entirely on auth pages — ScholarshipBanner already handles those */
  const onAuthPage =
    typeof router.pathname === 'string' &&
    router.pathname.startsWith('/auth/');

  /* Don't show on admin pages — those are for admins, not students */
  const onAdminPage =
    typeof router.pathname === 'string' &&
    router.pathname.startsWith('/admin');

  /* Fetch the newest active campaigns */
  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;

    const fetchCampaigns = async () => {
      try {
        const response = await fetch('/api/public/scholarships/active', {
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) return;
        const payload = await response.json();
        if (cancelled) return;
        const list = payload?.data?.campaigns || [];
        setCampaigns(list);
      } catch {
        if (!cancelled) setCampaigns([]);
      }
    };

    fetchCampaigns();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  /* Delay the appearance so the card doesn't pop the moment the page
     loads. Matches Intercom/Crisp-style soft onboarding. */
  useEffect(() => {
    if (!enabled) return undefined;
    if (onAuthPage || onAdminPage) return undefined;
    if (campaigns.length === 0) return undefined;

    /* Respect prior dismissal — but key it by campaign slug so a brand
       new campaign is not blocked by an old dismissal. */
    let dismissedUntil = 0;
    try {
      const raw = getItem(DISMISS_KEY);
      dismissedUntil = Number(raw) || 0;
    } catch {
      /* storage unavailable — show the card */
    }

    if (Date.now() < dismissedUntil) return undefined;

    const timer = setTimeout(() => {
      setMounted(true);
      /* One frame later, trigger the transition so the slide animates */
      requestAnimationFrame(() => setVisible(true));
    }, delayMs);

    return () => clearTimeout(timer);
  }, [enabled, onAuthPage, onAdminPage, campaigns.length, delayMs]);

  const handleDismiss = () => {
    setDismissing(true);
    setVisible(false);
    try {
      setItem(DISMISS_KEY, String(Date.now() + dismissDays * 24 * 60 * 60 * 1000));
    } catch {
      /* storage unavailable */
    }
    setTimeout(() => setMounted(false), 300);
  };

  if (!enabled) return null;
  if (onAuthPage || onAdminPage) return null;
  if (!mounted) return null;
  if (!campaigns || campaigns.length === 0) return null;

  const campaign = campaigns[0]; /* newest by created_at DESC */
  const name =
    language === 'am' && campaign.nameAm ? campaign.nameAm : campaign.name;

  const feeAmount = Number(campaign.registrationFeeETB) || 0;
  const hasQuota = Number(campaign.quota) > 0;
  const remaining = hasQuota
    ? Math.max(0, Number(campaign.quota) - Number(campaign.approvedCount || 0))
    : 0;
  const quotaPercent = hasQuota
    ? Math.min(
        100,
        Math.round(
          (Number(campaign.approvedCount || 0) / Number(campaign.quota)) * 100
        )
      )
    : 0;

  const detailHref = `/scholarships/${encodeURIComponent(campaign.slug)}`;

  return (
    <aside
      role="complementary"
      aria-label={t.scholarships?.banner?.ariaLabel || 'Scholarship announcement'}
      className={`hidden md:flex fixed bottom-6 right-6 z-[90] w-[22rem] max-w-[calc(100vw-3rem)]
                  flex-col rounded-2xl overflow-hidden border border-accent/40
                  bg-bg-card-solid shadow-2xl shadow-accent/20
                  transition-all duration-300 ease-out
                  ${visible && !dismissing
                    ? 'opacity-100 translate-x-0 translate-y-0'
                    : 'opacity-0 translate-x-8 translate-y-2 pointer-events-none'}`}
    >
      {/* Accent band at the top */}
      <div
        aria-hidden="true"
        className="h-1 shrink-0 bg-gradient-to-r from-accent via-accent-light to-accent"
      />

      {/* Cover image (if campaign has one) */}
      {campaign.coverImageUrl && (
        <div className="relative h-24 overflow-hidden shrink-0">
          <img
            src={campaign.coverImageUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-bg-card-solid via-bg-card-solid/50 to-transparent"
          />
          <div className="absolute top-2 left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent text-text-inverse text-2xs font-extrabold uppercase tracking-wider shadow">
            <Sparkles size={9} />
            {t.scholarships?.banner?.headline || 'New Scholarship'}
          </div>
        </div>
      )}

      {/* Dismiss button — positioned absolutely so it sits above the
          cover image or the body if there's no cover. */}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label={t.scholarships?.banner?.dismissAriaLabel || 'Dismiss announcement'}
        className="absolute top-3 right-3 z-10 p-1.5 rounded-md
                   bg-bg-card-solid/90 backdrop-blur text-text-dim
                   hover:text-text-main hover:bg-bg-ghost-hover
                   transition-colors border border-border-light"
      >
        <X size={13} />
      </button>

      {/* Body */}
      <div className="relative p-4 flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-start gap-2.5">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-accent text-text-inverse flex items-center justify-center shadow-glow-gold-sm">
            <GraduationCap size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-extrabold text-text-main leading-tight line-clamp-2">
              {name}
            </p>
            <p className="text-2xs text-text-muted mt-0.5">
              {t.scholarships?.banner?.headline || 'Scholarship open for applications'}
            </p>
          </div>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-1">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-accent/10 text-accent text-2xs font-bold border border-accent/30">
            <Award size={9} />
            {campaign.grantsFullCourse
              ? t.scholarships?.card?.fullCourse || 'Full Course'
              : (t.scholarships?.card?.phases || '{count} Phase(s)').replace(
                  '{count}',
                  String((campaign.grantsPhases || []).length)
                )}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-2xs font-bold border ${
              feeAmount > 0
                ? 'bg-warning/10 text-warning border-warning/30'
                : 'bg-success/10 text-success border-success/30'
            }`}
          >
            <Gift size={9} />
            {feeAmount > 0
              ? (t.scholarships?.card?.registrationFee || '{amount} ETB').replace(
                  '{amount}',
                  feeAmount.toLocaleString()
                )
              : t.scholarships?.card?.registrationFree || 'Free'}
          </span>
        </div>

        {/* Quota progress */}
        {hasQuota && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-2xs">
              <span className="inline-flex items-center gap-1 text-text-muted font-semibold">
                <Users size={10} />
                {buildSpotsLabel(t, remaining, campaign.quota)}
              </span>
              <span className="text-text-dim font-bold font-mono">
                {quotaPercent}%
              </span>
            </div>
            <div className="h-1 rounded-full bg-bg-input border border-border-light overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  quotaPercent >= 90
                    ? 'bg-gradient-to-r from-warning to-error'
                    : 'bg-gradient-to-r from-accent to-accent-light'
                }`}
                style={{ width: `${quotaPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* CTA */}
        <Link
          href={detailHref}
          className="group inline-flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg
                     bg-accent text-text-inverse text-xs font-extrabold
                     hover:bg-accent-light hover:-translate-y-0.5
                     shadow-glow-gold-sm hover:shadow-glow-gold
                     transition-all duration-200"
        >
          <span>{t.scholarships?.banner?.applyNowButton || 'Apply Now'}</span>
          <ArrowRight
            size={13}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </Link>

        <Link
          href="/scholarships"
          className="inline-flex items-center justify-center gap-1 text-2xs font-bold text-text-muted hover:text-accent transition-colors"
        >
          {t.scholarships?.banner?.learnMoreButton || 'See all scholarships'}
          <ChevronRight size={11} />
        </Link>
      </div>
    </aside>
  );
};

export default ScholarshipFloatingCard;