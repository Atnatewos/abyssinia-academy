/**
 * @fileoverview Earnings Calculator — Compact Cockpit Layout
 *
 * Two-pane cockpit: compact level inputs (badge + rate + slider + number)
 * on the left, sticky live-result panel on the right so the total income
 * never leaves the viewport while the user experiments.
 *
 * Space-saving mechanics:
 *   - One 56px row per level (label/sublabel collapsed into badge + rate chip)
 *   - Config-driven presets replace per-level quick chips
 *   - Full commission/bonus math lives in a closed-by-default Details accordion
 *   - Result panel sticks to the top on desktop and to the bottom on mobile
 *
 * All rates, tiers, bounds, and presets resolve from shared config.
 *
 * Path: apps/web/components/landing/EarningsCalculator.jsx
 */
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Calculator, ArrowRight, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  getCommissionStructure,
  getBonusConfig,
  getLandingEarnConfig,
} from '../../lib/config';

/**
 * Formats an ETB amount with locale-aware thousands separators.
 * @param {number} value
 * @returns {string}
 */
const formatETB = (value) => Number(value || 0).toLocaleString('en-US');

/**
 * Highest tier whose requirement is satisfied by the count (null if none).
 * @param {Array} tiers - Tier ladder from bonus config
 * @param {number} count - Current gate counter
 * @returns {object|null}
 */
const highestTierAt = (tiers, count) => {
  if (!Array.isArray(tiers)) return null;
  let matched = null;
  tiers.forEach((tier) => {
    if (count >= tier.requirement) matched = tier;
  });
  return matched;
};

const EarningsCalculator = ({ levelCounts, onLevelChange, onApplyPreset }) => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const labels = t.landing?.earn || {};

  const commissionConfig = getCommissionStructure();
  const bonusConfig = getBonusConfig();
  const earnConfig = getLandingEarnConfig();
  const calcConfig = earnConfig?.calculator || {};

  const levelAmounts = commissionConfig?.levelAmounts || [];
  const maxLevels = commissionConfig?.maxLevels || 4;
  const maxSlider = calcConfig.maxSliderLevel || 100;
  const sanityCeiling = calcConfig.sanityCeiling || 10000;
  const step = calcConfig.step || 1;
  const presets = calcConfig.presets || [];
  const showChainStrip = calcConfig.showChainStrip === true;

  /* Details accordion starts closed unless config opts in */
  const [detailsOpen, setDetailsOpen] = useState(calcConfig.detailsOpenByDefault === true);

  const directCount = levelCounts[0] || 0;
  const teamCount = levelCounts.slice(1, maxLevels).reduce((sum, count) => sum + count, 0);
  const networkTotal = directCount + teamCount;

  /**
   * Per-level commission rows: count × configured rate.
   */
  const commissionRows = useMemo(() => {
    return levelCounts.slice(0, maxLevels).map((count, index) => ({
      level: index + 1,
      count,
      rate: levelAmounts[index] || 0,
      amount: count * (levelAmounts[index] || 0),
    }));
  }, [levelCounts, levelAmounts, maxLevels]);

  const commissionTotal = commissionRows.reduce((sum, row) => sum + row.amount, 0);

  /**
   * Lifetime bonuses unlocked at this network size (delta-from-zero model,
   * identical to the production engine). Monthly categories excluded.
   */
  const unlockedBonuses = useMemo(() => {
    return Object.keys(bonusConfig || {})
      .map((key) => {
        const category = bonusConfig[key];
        if (!category || !Array.isArray(category.tiers) || category.period === 'monthly') {
          return null;
        }
        const gate = category.gate || (key === 'directReferral' ? 'paying_direct' : 'paying_team');
        const gateCount = gate === 'paying_direct' ? directCount : teamCount;
        const tier = highestTierAt(category.tiers, gateCount);
        if (!tier) return null;
        return { key, name: tier.name, amount: tier.amountETB };
      })
      .filter(Boolean);
  }, [bonusConfig, directCount, teamCount]);

  const bonusTotal = unlockedBonuses.reduce((sum, row) => sum + row.amount, 0);
  const grandTotal = commissionTotal + bonusTotal;

  const ctaHref = isAuthenticated
    ? earnConfig?.cta?.authed || '/profile/referrals'
    : earnConfig?.cta?.guest || '/auth/register';

  /**
   * Clamps a typed value into the sane configuration range.
   * @param {number} value - Raw input value
   * @returns {number}
   */
  const clampCount = (value) => Math.max(0, Math.min(sanityCeiling, Math.round(value) || 0));

  /**
   * Detects whether the current levels exactly match a preset.
   * @param {object} preset - Preset entry from config
   * @returns {boolean}
   */
  const isPresetActive = (preset) => {
    const levels = preset.levels || [];
    return (
      levels.length === levelCounts.length &&
      levels.every((value, index) => value === (levelCounts[index] || 0))
    );
  };

  /**
   * Resolves a preset display label from i18n by capitalized key.
   * @param {string} presetKey - Config preset key
   * @returns {string}
   */
  const presetLabel = (presetKey) => {
    const suffix = presetKey.charAt(0).toUpperCase() + presetKey.slice(1);
    return labels[`calcPreset${suffix}`] || presetKey;
  };

  return (
    <div className="earn-cockpit-grid">
      {/* ── Left pane: compact inputs + presets + collapsible math ── */}
      <div className="earn-cockpit-inputs-card">
        <div className="earn-cockpit-header">
          <h4 className="earn-calc-title">
            <Calculator size={16} />
            {labels.calcTitle || 'Estimate your earnings'}
          </h4>
          <span className="earn-network-chip">
            {(labels.calcNetworkChip || 'network: {count}').replace('{count}', formatETB(networkTotal))}
          </span>
        </div>

        <div className="earn-cockpit-inputs">
          {commissionRows.map((row, index) => (
            <div key={`cockpit-level-${row.level}`} className="earn-cockpit-row">
              <span className="earn-cockpit-badge" aria-hidden="true">
                L{row.level}
              </span>
              <span className="earn-cockpit-rate">
                {formatETB(row.rate)} ETB
              </span>
              <input
                type="range"
                className="earn-cockpit-slider"
                min={0}
                max={maxSlider}
                step={step}
                value={Math.min(row.count, maxSlider)}
                onChange={(event) => onLevelChange(index, clampCount(Number(event.target.value)))}
                aria-label={(labels.calcLevelRow || 'Level {level}').replace('{level}', String(row.level))}
                aria-valuetext={`${row.count}`}
              />
              <input
                type="number"
                className="earn-cockpit-number"
                min={0}
                max={sanityCeiling}
                step={step}
                value={row.count}
                onChange={(event) => onLevelChange(index, clampCount(Number(event.target.value)))}
                aria-label={(labels.calcLevelRow || 'Level {level}').replace('{level}', String(row.level))}
              />
            </div>
          ))}
        </div>

        {/* Optional chain strip (config-gated, default off) */}
        {showChainStrip && (
          <div className="earn-calc-chain" aria-label={labels.chainTitle || 'Network chain'}>
            <span className="earn-calc-chain-node earn-chain-you">
              <span className="earn-calc-chain-label">{labels.chainYou || 'YOU'}</span>
            </span>
            {commissionRows.map((row) => (
              <React.Fragment key={`cockpit-chain-${row.level}`}>
                <span className="earn-calc-chain-arrow" aria-hidden="true">→</span>
                <span className="earn-calc-chain-node">
                  <span className="earn-calc-chain-label">L{row.level}</span>
                  <span className="earn-calc-chain-count">{formatETB(row.count)}</span>
                </span>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* One-click network presets */}
        {presets.length > 0 && (
          <div className="earn-cockpit-presets">
            <span className="earn-cockpit-presets-label">
              {labels.calcPresetsTitle || 'Quick presets'}
            </span>
            {presets.map((preset) => (
              <button
                key={preset.key}
                type="button"
                className={`earn-calc-chip ${isPresetActive(preset) ? 'active' : ''}`}
                onClick={() => onApplyPreset(preset.levels)}
              >
                {presetLabel(preset.key)}
              </button>
            ))}
          </div>
        )}

        {/* Collapsible full math (breakdown + unlocked bonuses) */}
        <div className="earn-cockpit-details">
          <button
            type="button"
            className="earn-cockpit-details-toggle"
            onClick={() => setDetailsOpen((prev) => !prev)}
            aria-expanded={detailsOpen}
          >
            <ChevronDown size={14} className={detailsOpen ? 'open' : ''} />
            {detailsOpen
              ? labels.calcDetailsToggleOpen || 'Hide full math'
              : labels.calcDetailsToggle || 'Show full math'}
          </button>
          {detailsOpen && (
            <div className="earn-cockpit-details-body">
              <div className="earn-calc-rows">
                <span className="earn-calc-rows-title">
                  {labels.calcBreakdownTitle || 'Commission breakdown'}
                </span>
                {commissionRows.map((row) => (
                  <div key={`detail-row-${row.level}`} className="earn-calc-row">
                    <span className="earn-calc-row-label">
                      {(labels.calcLevelRow || 'Level {level}').replace('{level}', String(row.level))}
                    </span>
                    <span className="earn-calc-row-math">
                      {formatETB(row.count)} × {formatETB(row.rate)} ETB
                    </span>
                    <span className="earn-calc-row-amount">{formatETB(row.amount)} ETB</span>
                  </div>
                ))}
              </div>
              <div className="earn-calc-rows">
                <span className="earn-calc-rows-title">
                  {labels.calcBonusesTitle || 'Bonuses unlocked'}
                </span>
                {unlockedBonuses.length === 0 ? (
                  <p className="earn-calc-empty-note">
                    {labels.calcNoBonuses || 'No bonus tiers reached yet at this size.'}
                  </p>
                ) : (
                  unlockedBonuses.map((row) => (
                    <div key={`detail-bonus-${row.key}`} className="earn-calc-row">
                      <span className="earn-calc-row-label">{row.name}</span>
                      <span className="earn-calc-row-amount">+{formatETB(row.amount)} ETB</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Right pane: sticky live result ── */}
      <aside className="earn-cockpit-result" aria-label={labels.calcTotal || 'Estimated total'}>
        <div className="earn-cockpit-result-grid">
          <div>
            <span className="earn-cockpit-result-label">
              {labels.calcCommissions || 'Commissions'}
            </span>
            <div className="earn-cockpit-mini-grid">
              {commissionRows.map((row) => (
                <span key={`mini-${row.level}`} className="earn-cockpit-mini-cell">
                  <em>L{row.level}</em>
                  {formatETB(row.amount)}
                </span>
              ))}
            </div>
            <span className="earn-cockpit-result-sub">= {formatETB(commissionTotal)} ETB</span>
          </div>
          <div>
            <span className="earn-cockpit-result-label">
              {labels.calcBonuses || 'Bonuses'}
            </span>
            <div className="earn-cockpit-bonus-chips">
              {unlockedBonuses.length === 0 ? (
                <span className="earn-calc-empty-note">
                  {labels.calcNoBonuses || 'No bonus tiers reached yet.'}
                </span>
              ) : (
                unlockedBonuses.map((row) => (
                  <span key={`result-chip-${row.key}`} className="earn-chip earned" title={row.name}>
                    +{formatETB(row.amount)}
                  </span>
                ))
              )}
            </div>
            <span className="earn-cockpit-result-sub">= {formatETB(bonusTotal)} ETB</span>
          </div>
        </div>

        <div className="earn-calc-total">
          <span>{labels.calcTotal || 'Estimated total'}</span>
          <strong>{formatETB(grandTotal)} ETB</strong>
        </div>

        <Link href={ctaHref} className="earn-calc-cta">
          {labels.calcCta || 'Get My Referral Link'}
          <ArrowRight size={16} />
        </Link>

        <p className="earn-disclaimer">
          {labels.calcDisclaimer || 'Illustrative estimate, not a guarantee.'}
        </p>
      </aside>
    </div>
  );
};

export default EarningsCalculator;