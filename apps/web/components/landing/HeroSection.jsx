/**
 * @fileoverview Hero Section — Fully Tailwind
 *
 * Dual-promise hero: "Master the skill" + "Get paid to share it".
 * Owns the responsive hero grid shell and renders the IDE preview card
 * (HeroVisual) plus an optional full-width stats slot as children.
 *
 * Layout contract:
 *   - Mobile: single column, centered copy, full-width stacked CTAs
 *   - lg+   : 7fr / 5fr split, left-aligned copy, inline CTAs
 *   - Type scales fluidly via clamp() so no viewport ever overflows
 *
 * Primary CTA contract:
 *   The Explore Courses button uses the isolated `hcta-*` namespace
 *   (styles/hero-cta.css), loaded last in _app.jsx. Its ink and surface
 *   are cascade-proof and resolve entirely from themes.css tokens.
 *
 * All display text resolves from i18n; all numbers ({total}, {hours})
 * resolve from referrals/payments config.
 *
 * Path: apps/web/components/landing/HeroSection.jsx
 */

import React from 'react';
import Link from 'next/link';
import { Flame, ArrowRight, Zap, Coins, ArrowDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  getHeroConfig,
  getCommissionStructure,
  getWithdrawalConfig,
} from '../../lib/config';
import HeroVisual from './HeroVisual';

const ICON_MAP = { Flame, ArrowRight, Zap, Coins, ArrowDown };

/* ── Token-bridge class recipes ─────────────────────────────────────── */

const BADGE_BASE =
  'inline-flex items-center gap-2 px-4 py-2 rounded-full border border-solid ' +
  'text-xs sm:text-sm font-bold bg-bg-card backdrop-blur-glass max-w-full';

const BADGE_ICON = 'w-4 h-4 shrink-0 animate-bounce motion-reduce:animate-none';

const CTA_GLASS =
  'inline-flex items-center justify-center gap-2 w-full sm:w-auto ' +
  'px-8 py-3.5 rounded-xl text-base font-semibold no-underline cursor-pointer ' +
  'bg-bg-card backdrop-blur-md border border-solid border-border-main ' +
  'text-text-main transition-all duration-base motion-reduce:transition-none ' +
  'hover:border-border-hover hover:bg-bg-card-hover';

/**
 * Inject resolved config values into an i18n template.
 * Unknown placeholders are preserved verbatim for debuggability.
 *
 * @param {string} template - Raw i18n string containing {placeholders}
 * @param {object} values - Resolved numeric/string values
 * @returns {string}
 */
const inject = (template, values) =>
  String(template || '').replace(/{(\w+)}/g, (_, key) =>
    values[key] !== undefined ? String(values[key]) : `{${key}}`
  );

/**
 * HeroSection — Responsive hero grid with copy column, IDE preview
 * column, and an optional full-width stats row.
 *
 * @param {object} props
 * @param {React.ReactNode} [props.statsSlot] - Full-width stats bar rendered under both columns
 */
const HeroSection = ({ statsSlot = null }) => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const heroConfig = getHeroConfig();
  const commissionConfig = getCommissionStructure();
  const withdrawalConfig = getWithdrawalConfig();

  const BadgeIcon = ICON_MAP[heroConfig.badgeIcon] || Flame;
  const EarnBadgeIcon = ICON_MAP[heroConfig.earnBadgeIcon] || Coins;
  const highlightedWord = heroConfig.highlightedWord || '';

  const exploreCta = heroConfig.cta?.exploreCourses || {};
  const unlockCta = heroConfig.cta?.unlockAccess || {};
  const earnCta = heroConfig.cta?.earn || {};

  const ExploreIcon = ICON_MAP[exploreCta.icon] || ArrowRight;
  const UnlockIcon = ICON_MAP[unlockCta.icon] || Zap;
  const EarnIcon = ICON_MAP[earnCta.icon] || ArrowDown;

  /* Resolve template variables from config — zero hardcoded numbers */
  const totalPerSale = commissionConfig?.totalPerSale || 0;
  const processingHours = withdrawalConfig?.processingTimeHours || 0;

  const incomeSubline = inject(t.hero?.incomeSubline || '', {
    total: totalPerSale.toLocaleString('en-US'),
    hours: processingHours,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-12 items-center">
      {/* ── Copy column ── */}
      <div className="flex flex-col items-center lg:items-start gap-6 sm:gap-8 text-center lg:text-left min-w-0">
        {/* Dual promise badges */}
        <div className="flex flex-wrap justify-center lg:justify-start gap-2">
          <div className={`${BADGE_BASE} border-accent/30 text-accent`}>
            <BadgeIcon className={`${BADGE_ICON} fill-accent`} aria-hidden="true" />
            <span>{t.hero?.badge || ''}</span>
          </div>
          <div className={`${BADGE_BASE} border-success/35 text-success`}>
            <EarnBadgeIcon className={BADGE_ICON} aria-hidden="true" />
            <span>{t.hero?.earnBadge || ''}</span>
          </div>
        </div>

        {/* Headline — fluid scale, never overflows the viewport */}
        <h1 className="m-0 font-extrabold tracking-tight leading-[1.1] text-text-main text-[clamp(2rem,6vw,4.5rem)] break-words">
          {t.hero?.title || ''}{' '}
          <span className="text-gradient-gold">{highlightedWord}</span>
        </h1>

        {/* Subtitle */}
        <p className="m-0 max-w-2xl text-lg sm:text-xl leading-relaxed text-text-muted">
          {t.hero?.subtitle || ''}
        </p>

        {/* Income-focused one-liner */}
        {incomeSubline && (
          <p className="m-0 inline-block max-w-xl px-4 py-2.5 rounded-lg bg-accent/5 border border-solid border-accent/20 text-accent text-base font-semibold leading-normal">
            {incomeSubline}
          </p>
        )}

        {/* CTAs — stacked full-width on phones, inline from sm up */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center lg:justify-start gap-4 w-full sm:w-auto pt-2">
          <Link href={exploreCta.href || '/courses'} className="hcta-primary">
            <span className="hcta-label">{t.hero?.exploreCourses || ''}</span>
            <ExploreIcon size={20} className="hcta-icon" aria-hidden="true" />
          </Link>

          {!isAuthenticated && (
            <Link href={unlockCta.href || '/pricing'} className={CTA_GLASS}>
              <UnlockIcon size={20} className="shrink-0 text-accent" aria-hidden="true" />
              <span>{t.hero?.unlockAccess || ''}</span>
            </Link>
          )}

          <Link href={earnCta.href || '/#earn'} className={CTA_GLASS}>
            <EarnIcon size={20} className="shrink-0 text-accent" aria-hidden="true" />
            <span>{t.hero?.earnCta || ''}</span>
          </Link>
        </div>
      </div>

      {/* ── IDE preview column ── */}
      <HeroVisual />

      {/* ── Full-width stats row ── */}
      {statsSlot && <div className="col-span-full">{statsSlot}</div>}
    </div>
  );
};

export default HeroSection;