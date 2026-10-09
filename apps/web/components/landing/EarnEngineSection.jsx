/**
 * @fileoverview Learn & Earn Engine Section
 *
 * Marketing centerpiece: 3-step story, compact calculator cockpit, and a
 * tabbed reference rail (bonus ladder / next bonus / payout flow) so the
 * three info cards share one slot instead of stacking vertically.
 *
 * Owns the level-count state so the calculator, presets, and rail stay
 * perfectly synchronized. Next-tier amounts use the DELTA credit model,
 * identical to the production bonus engine.
 *
 * Path: apps/web/components/landing/EarnEngineSection.jsx
 */
import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  BookOpen,
  Share2,
  Wallet,
  ShoppingCart,
  ShieldCheck,
  BarChart3,
  UserX,
  Banknote,
  ShoppingBag,
  Lock,
  CircleDollarSign,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  getBonusConfig,
  getCommissionStructure,
  getLandingEarnConfig,
  getReferredDiscountPercent,
  getTrustRulesConfig,
  getWithdrawalConfig,
} from '../../lib/config';

const EarningsCalculator = dynamic(() => import('./EarningsCalculator'), {
  ssr: false,
  loading: () => <div className="earn-calc-skeleton" />,
});

const STEP_ICONS = { BookOpen, Share2, Wallet };
const TRUST_ICONS = { ShoppingCart, ShieldCheck, BarChart3, UserX };
const PAYOUT_STEP_ICONS = { ShoppingBag, Lock, CircleDollarSign };

/* Maps rail tab identifiers to their i18n label keys */
const RAIL_TAB_LABEL_KEYS = {
  ladder: 'tabLadder',
  next: 'tabNext',
  payouts: 'tabPayouts',
};

/**
 * Formats an ETB amount with locale-aware thousands separators.
 * @param {number} value
 * @returns {string}
 */
const formatETB = (value) => Number(value || 0).toLocaleString('en-US');

/**
 * Highest tier whose requirement is satisfied by the count (null if none).
 * @param {Array} tiers
 * @param {number} count
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

const EarnEngineSection = () => {
  const { t } = useLanguage();
  const labels = t.landing?.earn || {};
  const railLabels = labels.rail || {};

  const earnConfig = getLandingEarnConfig();
  const trustConfig = getTrustRulesConfig();
  const bonusConfig = getBonusConfig();
  const withdrawalConfig = getWithdrawalConfig();
  const commissionConfig = getCommissionStructure();

  const anchorId = earnConfig?.anchorId || 'earn';
  const calcConfig = earnConfig?.calculator || {};
  const railConfig = earnConfig?.rail || {};

  /* Level counts owned here so calculator + rail always agree */
  const [levelCounts, setLevelCounts] = useState(() => [
    ...(calcConfig.defaultLevelCounts || [5, 10, 20, 20]),
  ]);

  /**
   * Clamps a level count into the configured sanity ceiling.
   * @param {number} value
   * @returns {number}
   */
  const clampCount = (value) =>
    Math.max(0, Math.min(calcConfig.sanityCeiling || 10000, Math.round(value) || 0));

  /**
   * Updates a single level count.
   * @param {number} index - Zero-based level index
   * @param {number} value - Requested count
   */
  const handleLevelChange = (index, value) => {
    setLevelCounts((prev) => {
      const next = [...prev];
      next[index] = clampCount(value);
      return next;
    });
  };

  /**
   * Applies a config-driven preset across all levels at once.
   * @param {Array} levels - Preset level counts
   */
  const handleApplyPreset = (levels) => {
    setLevelCounts((levels || []).map((value) => clampCount(value)));
  };

  const directCount = levelCounts[0] || 0;
  const teamCount = levelCounts.slice(1).reduce((sum, count) => sum + count, 0);

  const stepIcons = (earnConfig?.stepIcons || []).map((name) => STEP_ICONS[name] || Wallet);
  const trustIcons = (earnConfig?.trustIcons || []).map((name) => TRUST_ICONS[name] || ShieldCheck);
  const payoutIcons = (railConfig?.payoutStepIcons || []).map(
    (name) => PAYOUT_STEP_ICONS[name] || Banknote
  );

  /* Rail tab state — default from config, validated against tab list */
  const railTabs = railConfig?.tabs || ['ladder', 'next', 'payouts'];
  const [activeTab, setActiveTab] = useState(() => {
    const preferred = railConfig?.defaultTab || 'next';
    return railTabs.includes(preferred) ? preferred : railTabs[0];
  });

  /**
   * Bonus ladder chips: every tier of every category, marked earned
   * when the current gate count satisfies its requirement.
   */
  const ladderChips = useMemo(() => {
    return Object.keys(bonusConfig || {}).flatMap((key) => {
      const category = bonusConfig[key];
      if (!category || !Array.isArray(category.tiers)) return [];
      const gate =
        category.gate ||
        (key === 'directReferral' || key === 'speedBonus' ? 'paying_direct' : 'paying_team');
      const gateCount = gate === 'paying_direct' ? directCount : teamCount;
      return category.tiers.map((tier) => ({
        id: `${key}-${tier.requirement}`,
        label: `${tier.requirement} → ${formatETB(tier.amountETB)} ETB`,
        earned: gateCount >= tier.requirement,
      }));
    });
  }, [bonusConfig, directCount, teamCount]);

  /**
   * Next-tier progress rows (lifetime categories only). Amount shown is
   * the DELTA credit the engine would actually pay on reaching the tier.
   */
  const nextTierRows = useMemo(() => {
    return Object.keys(bonusConfig || {})
      .map((key) => {
        const category = bonusConfig[key];
        if (!category || !Array.isArray(category.tiers) || category.period === 'monthly') {
          return null;
        }
        const gate = category.gate || (key === 'directReferral' ? 'paying_direct' : 'paying_team');
        const gateCount = gate === 'paying_direct' ? directCount : teamCount;
        const sorted = [...category.tiers].sort((a, b) => a.requirement - b.requirement);
        const next = sorted.find((tier) => tier.requirement > gateCount);
        if (!next) return null;
        const achieved = highestTierAt(sorted, gateCount);
        return {
          key,
          name: next.name,
          delta: next.amountETB - (achieved?.amountETB || 0),
          current: gateCount,
          target: next.requirement,
          remaining: next.requirement - gateCount,
        };
      })
      .filter(Boolean);
  }, [bonusConfig, directCount, teamCount]);

  const processingHours = withdrawalConfig?.processingTimeHours || 48;
  const unlockDays = commissionConfig?.unlockDelayDays || 7;

  /**
   * Config-driven values for every {token} placeholder this section
   * renders. Business numbers stay out of copy files entirely.
   */
  const templateValues = {
    percent: getReferredDiscountPercent(),
    hours: processingHours,
    days: unlockDays,
  };

  /**
   * Resolves {token} placeholders in an i18n template against config.
   * Unknown tokens are returned untouched so gaps stay visible.
   *
   * @param {string} template - Raw i18n string
   * @returns {string} Copy with all known tokens injected
   */
  const inject = (template) =>
    String(template || '').replace(/{(\w+)}/g, (match, key) =>
      templateValues[key] !== undefined ? String(templateValues[key]) : match
    );
  const methods = withdrawalConfig?.methods || [];
  const methodLabel = (method) =>
    t.referrals?.mlm?.withdrawal?.[`method_${method.replace(/-/g, '_')}`] || method;

  const payoutSteps = [
    {
      title: railLabels.payoutStep1 || 'Friend enrolls',
      desc: railLabels.payoutStep1Desc || '',
    },
    {
      title: (railLabels.payoutStep2 || 'Locked {days} days').replace('{days}', String(unlockDays)),
      desc: railLabels.payoutStep2Desc || '',
    },
    {
      title: railLabels.payoutStep3 || 'Cash out',
      desc: (railLabels.payoutStep3Desc || '').replace('{hours}', String(processingHours)),
    },
  ];

  return (
    <section id={anchorId} className="landing-earn-3d">
      <div className="landing-pricing-header">
        <span className="landing-pricing-eyebrow">{labels.eyebrow || 'Learn & Earn'}</span>
        <h2 className="landing-pricing-title">{labels.title || 'Your Knowledge Pays. Literally.'}</h2>
        <p className="landing-pricing-subtitle">
          {inject(
            labels.subtitle || 'Share your link — friends get a discount, you earn real cash.'
          )}
        </p>
      </div>

      {/* LINE 1 — three-step story */}
      <div className="earn-steps-grid">
        {[0, 1, 2].map((index) => {
          const IconComponent = stepIcons[index] || Wallet;
          return (
            <div key={`earn-step-${index}`} className="earn-step-card">
              <div className="earn-step-icon">
                <IconComponent size={20} />
              </div>
              <h3 className="earn-step-title">{labels[`step${index + 1}Title`] || ''}</h3>
              <p className="earn-step-desc">{inject(labels[`step${index + 1}Desc`])}</p>
            </div>
          );
        })}
      </div>

      {/* LINE 2 — calculator cockpit (inputs + sticky result) */}
      <EarningsCalculator
        levelCounts={levelCounts}
        onLevelChange={handleLevelChange}
        onApplyPreset={handleApplyPreset}
      />

      {/* LINE 3 — tabbed reference rail (one card slot, three views) */}
      <div className="earn-rail-tabbed">
        <div className="earn-rail-tabs" role="tablist" aria-label={railLabels.ariaLabel || 'Earnings panel'}>
          {railTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              className={`earn-rail-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {railLabels[RAIL_TAB_LABEL_KEYS[tab]] || tab}
            </button>
          ))}
        </div>

        {activeTab === 'ladder' && (
          <div role="tabpanel" className="earn-bonus-chips">
            {ladderChips.map((chip) => (
              <span key={chip.id} className={`earn-chip ${chip.earned ? 'earned' : ''}`}>
                {chip.label}
              </span>
            ))}
          </div>
        )}

        {activeTab === 'next' && (
          <div role="tabpanel">
            <h4 className="earn-rail-title">
              {railLabels.nextTierTitle || 'Next bonus within reach'}
            </h4>
            {nextTierRows.length === 0 ? (
              <p className="earn-next-tier-empty">
                {railLabels.nextTierEmpty || 'All lifetime bonuses reached.'}
              </p>
            ) : (
              <ul className="earn-next-tier-list">
                {nextTierRows.map((row) => {
                  const percent = Math.min((row.current / row.target) * 100, 100);
                  return (
                    <li key={`next-${row.key}`} className="earn-next-tier-row">
                      <div className="earn-next-tier-head">
                        <span className="earn-next-tier-name">{row.name}</span>
                        <span className="earn-next-tier-amount">+{formatETB(row.delta)} ETB</span>
                      </div>
                      <div className="earn-next-tier-bar">
                        <span className="earn-next-tier-bar-fill" style={{ width: `${percent}%` }} />
                      </div>
                      <div className="earn-next-tier-foot">
                        <span>
                          {formatETB(row.current)} / {formatETB(row.target)}
                        </span>
                        <span>
                          {(railLabels.nextTierRemaining || '{n} more').replace('{n}', String(row.remaining))}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'payouts' && (
          <div role="tabpanel">
            <h4 className="earn-rail-title">{railLabels.payoutTitle || 'How payouts flow'}</h4>
            <ol className="earn-payout-timeline">
              {payoutSteps.map((stepItem, index) => {
                const IconComponent = payoutIcons[index] || Banknote;
                return (
                  <li key={`payout-step-${index}`} className="earn-payout-step">
                    <span className="earn-payout-dot">
                      <IconComponent size={14} />
                    </span>
                    <div className="earn-payout-body">
                      <strong>{stepItem.title}</strong>
                      <span>{stepItem.desc}</span>
                    </div>
                  </li>
                );
              })}
            </ol>
            <div className="earn-payout-methods">
              <Banknote size={14} />
              {methods.map((method) => (
                <span key={method} className="earn-payout-method">
                  {methodLabel(method)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* LINE 4 — transparency footer */}
      <div className="earn-trust-block">
        <h3 className="earn-trust-title">{labels.trustTitle || 'Fair Play. Full Transparency.'}</h3>
        <div className="earn-trust-grid">
          {[0, 1, 2, 3].map((index) => {
            const IconComponent = trustIcons[index] || ShieldCheck;
            return (
              <div key={`trust-${index}`} className="earn-trust-card">
                <IconComponent size={18} />
                <strong>{labels[`trust${index + 1}Title`] || ''}</strong>
                <span>{labels[`trust${index + 1}Desc`] || ''}</span>
              </div>
            );
          })}
        </div>
        <p className="earn-disclaimer" style={{ textAlign: 'center' }}>
          {(labels.payoutNote || 'processed ≤ {hours}h').replace('{hours}', String(processingHours))}
        </p>
      </div>
    </section>
  );
};

export default EarnEngineSection;