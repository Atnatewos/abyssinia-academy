/**
 * @fileoverview Scholarship Banner (Auth Pages)
 *
 * Conditionally renders a promotional banner when there's an active
 * scholarship campaign. Behavior:
 *   - Fetches /api/public/scholarships/active (no auth required)
 *   - Respects a user dismissal stored in localStorage with an expiry
 *     matching scholarshipsConfig.publicListing.bannerDismissStorageDays
 *   - Renders nothing while loading (avoids layout shift on login)
 *   - Renders nothing if there are no active campaigns
 *   - Renders nothing if user dismissed
 *
 * The banner is intentionally small and non-invasive: it slots above
 * the login/register form, doesn't shrink it, and is fully dismissible.
 *
 * All text via i18n. All colors via design tokens.
 *
 * Path: apps/web/components/scholarships/ScholarshipBanner.jsx
 */

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { GraduationCap, X, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getScholarshipPublicListingConfig } from '../../lib/config';
import { getItem, setItem } from '../../lib/storage';

const DISMISS_KEY = 'scholarship_banner_dismissed_until';

/**
 * ScholarshipBanner — dismissible announcement card for auth pages.
 */
const ScholarshipBanner = () => {
  const { t, language } = useLanguage();
  const [campaign, setCampaign] = useState(null);
  const [dismissed, setDismissed] = useState(true); // start hidden until we know
  const [loading, setLoading] = useState(true);

  const config = getScholarshipPublicListingConfig();
  const dismissDays = config.bannerDismissStorageDays || 7;

  /**
   * Check localStorage for an active dismissal.
   * If the stored timestamp is in the future, the banner stays hidden.
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const until = getItem(DISMISS_KEY);
      if (until && Number(until) > Date.now()) {
        setDismissed(true);
        return;
      }
    } catch {
      /* storage unavailable — treat as not dismissed */
    }
    setDismissed(false);
  }, []);

  /**
   * Fetch active campaigns. Silently degrades to hidden on error so the
   * auth page never shows a broken banner.
   */
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
        /* Show the most recently created campaign (first in DESC order). */
        setCampaign(list.length > 0 ? list[0] : null);
      } catch {
        if (!cancelled) setCampaign(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCampaigns();
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Persist dismissal for `dismissDays` days.
   */
  const handleDismiss = useCallback(() => {
    const until = Date.now() + dismissDays * 24 * 60 * 60 * 1000;
    try {
      setItem(DISMISS_KEY, String(until));
    } catch {
      /* storage unavailable — banner just re-shows next visit */
    }
    setDismissed(true);
  }, [dismissDays]);

  /* Render nothing while loading, if dismissed, or if no campaign */
  if (loading || dismissed || !campaign) {
    return null;
  }

  const name = language === 'am' && campaign.nameAm
    ? campaign.nameAm
    : campaign.name;

  /* Compose the descriptive message based on grant type */
  const grantMessage = campaign.grantsFullCourse
    ? (t.scholarships?.banner?.grantFullCourseMessage ||
        'Get full-course access to {campaign} — completely free for {quota} students.')
        .replace('{campaign}', name)
        .replace('{quota}', String(campaign.quota))
    : (t.scholarships?.banner?.grantPhasesMessage ||
        'Get free access to selected phases of {campaign} — limited to {quota} students.')
        .replace('{campaign}', name)
        .replace('{quota}', String(campaign.quota));

  const href = `/scholarships/${encodeURIComponent(campaign.slug)}`;

  return (
    <div
      role="region"
      aria-label={t.scholarships?.banner?.ariaLabel || 'Scholarship announcement'}
      className="relative mb-6 rounded-2xl overflow-hidden border border-accent/30
                 bg-gradient-to-br from-accent/10 via-bg-card-solid to-accent/5
                 shadow-glow-gold-sm animate-fade-in-up"
    >
      {/* Decorative gradient orb */}
      <div
        aria-hidden="true"
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-accent/20 blur-3xl pointer-events-none"
      />

      <div className="relative flex items-start gap-4 p-4 sm:p-5">
        {/* Icon */}
        <div className="shrink-0 w-11 h-11 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
          <GraduationCap size={22} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold text-text-main mb-1">
            {t.scholarships?.banner?.headline || 'New Scholarship Available'}
          </p>
          <p className="text-xs text-text-muted leading-relaxed mb-3">
            {grantMessage}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={href}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                         bg-accent text-text-inverse text-xs font-bold
                         hover:bg-accent-light transition-colors"
            >
              {t.scholarships?.banner?.applyNowButton || 'Apply Now'}
              <ArrowRight size={12} />
            </Link>
            <Link
              href="/scholarships"
              className="inline-flex items-center px-3 py-1.5 rounded-lg
                         border border-border-medium text-text-muted text-xs font-bold
                         hover:border-accent/40 hover:text-accent transition-colors"
            >
              {t.scholarships?.banner?.learnMoreButton || 'Learn More'}
            </Link>
          </div>
        </div>

        {/* Dismiss button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label={t.scholarships?.banner?.dismissAriaLabel || 'Dismiss announcement'}
          className="shrink-0 p-1.5 rounded-md text-text-dim hover:text-text-main
                     hover:bg-bg-ghost-hover transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default ScholarshipBanner;