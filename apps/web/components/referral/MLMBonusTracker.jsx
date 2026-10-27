/**
 * @fileoverview MLM Bonus Tracker
 *
 * Displays progress bars for each bonus category showing how close
 * the user is to the next threshold. Categories are independent
 * and non-stacking (delta approach).
 *
 * Path: apps/web/components/referral/MLMBonusTracker.jsx
 */

import React, { useMemo } from 'react';
import { Trophy, Target, Zap, Star, TrendingUp, UserPlus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getBonusConfig } from '../../lib/config';

const CATEGORY_ICONS = {
  directReferral: UserPlus,
  milestone: Target,
  rank: Star,
  teamBonus: TrendingUp,
  speedBonus: Zap,
};

const CATEGORY_COLORS = {
  directReferral: '#f59e0b',
  milestone: '#3b82f6',
  rank: '#eab308',
  teamBonus: '#10b981',
  speedBonus: '#8b5cf6',
};

const MLMBonusTracker = ({ team, bonusSummary, loading }) => {
  const { t } = useLanguage();
  const bonusConfig = useMemo(() => getBonusConfig(), []);

  const directCount = team?.directReferralCount || 0;
  const teamCount = team?.totalTeamSize || 0;

  const categories = useMemo(() => {
    const result = [];
    const categoryKeys = Object.keys(bonusConfig || {});

    categoryKeys.forEach((key) => {
      const categoryData = bonusConfig[key];
      if (!categoryData?.tiers?.length) return;

      const currentValue = categoryData.period === 'monthly'
        ? directCount
        : (key === 'directReferral' || key === 'speedBonus' ? directCount : teamCount);

      const sortedTiers = [...categoryData.tiers].sort((a, b) => a.requirement - b.requirement);
      const nextTier = sortedTiers.find((tier) => tier.requirement > currentValue);
      const progressMax = nextTier?.requirement || sortedTiers[sortedTiers.length - 1]?.requirement || 1;
      const progressPercent = Math.min((currentValue / progressMax) * 100, 100);
      const categoryLabel = t.referrals?.mlm?.bonuses?.[key] || key;

      result.push({
        key,
        label: categoryLabel,
        currentValue,
        nextTier,
        progressPercent,
        progressMax,
        totalEarned: bonusSummary?.byCategory?.[categoryData.category] || 0,
      });
    });

    return result;
  }, [bonusConfig, directCount, teamCount, bonusSummary, t]);

  if (loading) {
    return (
      <div className="glass-card mlm-bonus-tracker">
        <h3 className="mlm-section-title">{t.referrals?.mlm?.bonuses?.title || 'Bonus Progress'}</h3>
        <div className="mlm-table-loading"><div className="spinner spinner-sm" /></div>
      </div>
    );
  }

  return (
    <div className="glass-card mlm-bonus-tracker">
      <h3 className="mlm-section-title">{t.referrals?.mlm?.bonuses?.title || 'Bonus Progress'}</h3>
      <p className="mlm-section-subtitle">
        {t.referrals?.mlm?.bonuses?.subtitle || 'Bonuses are credits. Categories are independent.'}
      </p>

      <div className="mlm-bonus-list">
        {categories.map((category) => {
          const IconComponent = CATEGORY_ICONS[category.key] || Trophy;
          const color = CATEGORY_COLORS[category.key] || '#f59e0b';

          return (
            <div key={category.key} className="mlm-bonus-item">
              <div className="mlm-bonus-item-header">
                <div className="mlm-bonus-icon" style={{ backgroundColor: `${color}18`, color }}>
                  <IconComponent size={18} />
                </div>
                <span className="mlm-bonus-label">{category.label}</span>
                {category.totalEarned > 0 && (
                  <span className="mlm-bonus-earned">{category.totalEarned} ETB</span>
                )}
              </div>

              <div className="mlm-bonus-progress-row">
                <div className="mlm-bonus-progress-bar">
                  <div className="mlm-bonus-progress-fill" style={{ width: `${category.progressPercent}%`, backgroundColor: color }} />
                </div>
                <span className="mlm-bonus-progress-text">{category.currentValue} / {category.progressMax}</span>
              </div>

              <div className="mlm-bonus-next-info">
                {category.nextTier ? (
                  <span>
                    {t.referrals?.mlm?.bonuses?.nextAt || 'Next:'}{' '}
                    <strong>{category.nextTier.requirement}</strong>{' '}
                    {t.referrals?.mlm?.bonuses?.reaches || '→'}{' '}
                    <strong>{category.nextTier.amountETB} ETB</strong>
                  </span>
                ) : (
                  <span className="mlm-bonus-maxed">{t.referrals?.mlm?.bonuses?.maxReached || 'Maximum tier achieved!'}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mlm-bonus-note">
        <p>{t.referrals?.mlm?.bonuses?.nonStackingNote || 'Within each category, only the highest achieved threshold counts.'}</p>
      </div>
    </div>
  );
};

export default MLMBonusTracker;