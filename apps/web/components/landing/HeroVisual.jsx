/**
 * @fileoverview Hero Visual Card — Fully Tailwind
 *
 * IDE-style preview card:
 *   - Filename-only top bar (right aligned) with divider
 *   - 16:9 preview image with centered gold play button
 *   - Inset info bar: camera icon + FREE PREVIEW label + gold duration
 *   - Session list as bordered pill rows: chevron + mono title left,
 *     mono timestamp right, active row highlighted in accent
 *
 * The window floats with a subtle 3D tilt (arbitrary keyframes resolve
 * through the same engine as tailwind.config.js animations) and freezes
 * under prefers-reduced-motion. Floating income chips render only when
 * `heroVisual.showIncomeChips` is enabled in landing.config.js.
 *
 * All text resolves from i18n; all structural data from config; every
 * visual value through the Tailwind token bridge.
 *
 * Path: apps/web/components/landing/HeroVisual.jsx
 */

import React from 'react';
import Link from 'next/link';
import { Play, Video, Coins, TrendingUp, Zap } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  getHeroVisualConfig,
  getHeroConfig,
  getCommissionStructure,
  getBonusConfig,
  getWithdrawalConfig,
} from '../../lib/config';

const CHIP_ICON_MAP = {
  level1Rate: Coins,
  directBonus5: TrendingUp,
  payoutHours: Zap,
};

/* ── Token-bridge class recipes ─────────────────────────────────────── */

const WINDOW =
  'relative bg-bg-card-solid border border-solid border-accent/20 rounded-3xl ' +
  'p-4 sm:p-5 shadow-xl';

const SESSION_ROW =
  'flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-solid ' +
  'transition-colors duration-base motion-reduce:transition-none';

const CHIP_BASE =
  'absolute z-above inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ' +
  'bg-bg-card-solid/85 backdrop-blur-md border border-solid border-accent/40 ' +
  'text-accent text-2xs sm:text-xs font-extrabold font-mono whitespace-nowrap shadow-lg';

/**
 * Chip anchor positions — static class strings so Tailwind's scanner
 * emits every variant. Keys mirror landing.config.js `position` values.
 */
const CHIP_POSITIONS = {
  'top-left': 'top-[10%] left-[4%]',
  'top-right': 'top-[26%] right-[4%]',
  'bottom-right': 'bottom-[16%] right-[6%]',
};

/** Staggered float delays per chip, matching the legacy rhythm. */
const CHIP_DELAYS = ['[animation-delay:0s]', '[animation-delay:1.2s]', '[animation-delay:2.4s]'];

const CHIP_FLOAT =
  'animate-[heroWindowFloat_6s_ease-in-out_infinite] motion-reduce:animate-none';

const HeroVisual = () => {
  const { t } = useLanguage();

  const visualConfig = getHeroVisualConfig();
  const heroConfig = getHeroConfig();
  const commissionConfig = getCommissionStructure();
  const bonusConfig = getBonusConfig();
  const withdrawalConfig = getWithdrawalConfig();

  const {
    filename = '',
    previewImage = '',
    previewDuration = '',
    sessions = [],
    showIncomeChips = false,
  } = visualConfig || {};

  const labels = t.landing?.heroVisual || {};
  const incomeChips = heroConfig?.incomeChips || [];

  /**
   * Resolve a chip label from the hero namespace, tolerating legacy
   * namespace-prefixed keys stored in older config revisions.
   *
   * @param {string} labelKey - Plain or 'hero.'-prefixed i18n key
   * @returns {string} Raw template containing {amount}
   */
  const resolveChipLabel = (labelKey) => {
    const plainKey = String(labelKey || '').replace(/^hero\./, '');
    return t.hero?.[plainKey] || '';
  };

  /**
   * Resolve a chip amountKey from the config graph.
   *
   * @param {string} amountKey
   * @returns {number}
   */
  const resolveAmount = (amountKey) => {
    switch (amountKey) {
      case 'level1Rate':
        return commissionConfig?.levelAmounts?.[0] || 0;
      case 'directBonus5':
        return bonusConfig?.directReferral?.tiers?.[0]?.amountETB || 0;
      case 'payoutHours':
        return withdrawalConfig?.processingTimeHours || 0;
      default:
        return 0;
    }
  };

  return (
    <div className="relative min-w-0">
      {/* IDE window — floats with a subtle perspective tilt */}
      <div
        className={`${WINDOW} animate-[heroWindowFloat_6s_ease-in-out_infinite] motion-reduce:animate-none`}
      >
        {/* Filename-only top bar with divider */}
        <div className="flex justify-end pb-3.5 mb-4 border-b border-solid border-border-light">
          <span className="font-mono text-xs text-text-dim truncate">{filename}</span>
        </div>

        {/* Preview image, play button, and inset info bar */}
        <div className="group relative aspect-video rounded-xl overflow-hidden bg-bg-main">
          <img
            src={previewImage}
            alt=""
            className="w-full h-full object-cover opacity-85 transition-transform duration-slower group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />

          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-bg-main/25 to-bg-main/55">
            <Link
              href="/courses"
              aria-label={labels.freePreviewLabel || ''}
              className="w-16 h-16 rounded-full bg-accent text-on-accent flex items-center justify-center shadow-glow-gold transition-transform duration-base hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100"
            >
              <Play className="w-6 h-6 fill-current ml-0.5" aria-hidden="true" />
            </Link>
          </div>

          {/* Inset info bar pinned inside the preview */}
          <div className="absolute left-3 right-3 bottom-3 flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg bg-bg-card-solid/90 backdrop-blur-md border border-solid border-border-pill">
            <span className="flex items-center gap-2 min-w-0 truncate text-xs font-bold text-text-main tracking-wide">
              <Video size={14} className="shrink-0 text-accent" aria-hidden="true" />
              <span className="truncate">
                {labels.freePreviewLabel || ''}
                {labels.previewDetail ? `: ${labels.previewDetail}` : ''}
              </span>
            </span>
            <span className="shrink-0 font-mono text-xs font-bold text-accent">
              {previewDuration}
            </span>
          </div>
        </div>

        {/* Session pills: chevron + mono title left, mono time right */}
        <ul className="list-none m-0 mt-4 p-0 flex flex-col gap-3">
          {(labels.sessions || []).map((label, idx) => {
            const isActive = Boolean(sessions[idx]?.isActive);
            return (
              <li
                key={label}
                className={`${SESSION_ROW} ${
                  isActive
                    ? 'border-accent/35 bg-accent/5'
                    : 'border-border-light bg-bg-ghost-hover hover:border-border-medium'
                }`}
              >
                <span
                  className={`flex items-center gap-2 min-w-0 flex-1 truncate font-mono text-xs font-semibold ${
                    isActive ? 'text-accent' : 'text-text-muted'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`shrink-0 font-bold ${isActive ? 'text-accent' : 'text-text-dim'}`}
                  >
                    ›
                  </span>
                  <span className="truncate">{label}</span>
                </span>
                <span className="shrink-0 font-mono text-xs text-text-dim">
                  {sessions[idx]?.time || ''}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Optional floating income chips (config-gated, default off) */}
      {showIncomeChips && (
        <div className="absolute inset-0 pointer-events-none z-above" aria-hidden="true">
          {incomeChips.map((chip, idx) => {
            const IconComponent = CHIP_ICON_MAP[chip.amountKey] || Coins;
            const amount = resolveAmount(chip.amountKey);
            const label = resolveChipLabel(chip.labelKey).replace(
              /{amount}/g,
              amount.toLocaleString('en-US')
            );
            const position = CHIP_POSITIONS[chip.position] || CHIP_POSITIONS['top-left'];
            const delay = CHIP_DELAYS[idx % CHIP_DELAYS.length];

            return (
              <div
                key={chip.amountKey}
                className={`${CHIP_BASE} ${position} ${CHIP_FLOAT} ${delay}`}
              >
                <IconComponent size={14} className="shrink-0" />
                <span>{label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HeroVisual;