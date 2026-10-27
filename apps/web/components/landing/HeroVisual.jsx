/**
 * @fileoverview Hero Visual Card Component
 *
 * IDE-style preview card matching the foundation design exactly:
 *   - Filename-only top bar (right aligned) with divider
 *   - 16:9 preview image with centered gold play button
 *   - Inset info bar: camera icon + FREE PREVIEW label + gold duration
 *   - Session list as bordered pill rows: chevron + mono title left,
 *     mono timestamp right, active row highlighted in gold
 *
 * Floating income chips render only when explicitly enabled via
 * `heroVisual.showIncomeChips` in landing.config.js (default off),
 * keeping the card pixel-clean unless marketing opts in.
 *
 * All text resolves from i18n; all structural data from config.
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

const HeroVisual = () => {
  const { t } = useLanguage();
  const visualConfig = getHeroVisualConfig();
  const heroConfig = getHeroConfig();
  const commissionConfig = getCommissionStructure();
  const bonusConfig = getBonusConfig();
  const withdrawalConfig = getWithdrawalConfig();

  const {
    filename = 'Abyssinia_Masterclass.tsx',
    previewImage = '',
    previewDuration = '45:10',
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
    <div className="hero-visual">
      <div className="hero-visual-window">
        {/* Filename-only top bar with divider */}
        <div className="hero-visual-topbar">
          <span className="hero-visual-filename">{filename}</span>
        </div>

        {/* Preview image, play button, and inset info bar */}
        <div className="hero-visual-preview">
          <img src={previewImage} alt="" />
          <div className="hero-visual-preview-overlay">
            <Link
              href="/courses"
              className="hero-visual-play-btn"
              aria-label={labels.freePreviewLabel || 'FREE PREVIEW'}
            >
              <Play />
            </Link>
          </div>
          <div className="hero-visual-info">
            <span className="hero-visual-info-label">
              <Video size={14} />
              {labels.freePreviewLabel || 'FREE PREVIEW'}: {labels.previewDetail || ''}
            </span>
            <span className="hero-visual-duration">{previewDuration}</span>
          </div>
        </div>

        {/* Session pills: chevron + mono title left, mono time right */}
        <ul className="hero-visual-sessions">
          {(labels.sessions || []).map((label, idx) => (
            <li
              key={label}
              className={`hero-visual-session ${sessions[idx]?.isActive ? 'active' : ''}`}
            >
              <span className="hero-visual-session-title">
                <span className="hero-visual-session-chevron" aria-hidden="true">
                  ›
                </span>
                {label}
              </span>
              <span className="hero-visual-session-time">{sessions[idx]?.time || ''}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Optional floating income chips (config-gated, default off) */}
      {showIncomeChips && (
        <div className="hero-income-chips">
          {incomeChips.map((chip) => {
            const IconComponent = CHIP_ICON_MAP[chip.amountKey] || Coins;
            const amount = resolveAmount(chip.amountKey);
            const label = resolveChipLabel(chip.labelKey).replace(
              /{amount}/g,
              amount.toLocaleString('en-US')
            );
            return (
              <div
                key={chip.amountKey}
                className={`hero-income-chip hero-income-chip-${chip.position || 'top-left'}`}
              >
                <IconComponent size={14} />
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