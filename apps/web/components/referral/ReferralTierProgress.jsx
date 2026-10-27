/**
 * @fileoverview Referral Tier Progress Component
 * Visual progress bar showing current tier and progress toward next tier.
 * ALL display text from i18n → t.referrals.*
 * Handles null tier data gracefully.
 * Path: apps/web/components/referral/ReferralTierProgress.jsx
 */

import React, { useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getReferralTiers } from '../../lib/config';

/**
 * ReferralTierProgress — Shows tier progression with visual bar.
 *
 * @param {object} props
 * @param {object} props.tier - Current tier data { current, next } (may be null)
 * @param {number} props.successfulReferrals - Number of completed referrals
 */
const ReferralTierProgress = ({ tier = null, successfulReferrals = 0 }) => {
  const { t, language } = useLanguage();
  const allTiers = useMemo(() => getReferralTiers(), []);

  /*
   * Safely access current tier with fallback to first tier
   */
  const currentTierData = tier?.current || allTiers[0] || {
    name: 'Bronze',
    nameAm: 'ብሮንዝ',
    creditPercent: 10,
    color: '#cd7f32',
  };

  const nextTierData = tier?.next || null;

  const currentTierName = language === 'am'
    ? (currentTierData.nameAm || currentTierData.name || 'Bronze')
    : (currentTierData.name || 'Bronze');

  const nextTierName = nextTierData
    ? (language === 'am' ? (nextTierData.nameAm || nextTierData.name) : nextTierData.name)
    : null;

  /*
   * Calculate progress percentage toward next tier
   */
  const progressPercent = useMemo(() => {
    if (!nextTierData) return 100;

    const currentMin = allTiers.find((t) => t.name === currentTierData.name)?.minReferrals || 0;
    const referralsInCurrentTier = successfulReferrals - currentMin;
    const tierRange = nextTierData.minReferrals - currentMin;

    return tierRange > 0
      ? Math.round((referralsInCurrentTier / tierRange) * 100)
      : 100;
  }, [nextTierData, currentTierData, successfulReferrals, allTiers]);

  return (
    <div className="referral-tier-progress">
      <div className="referral-tier-progress-header">
        <span className="referral-tier-progress-label">
          {t.referrals?.tierProgress || 'Tier Progress'}
        </span>
        <span className="referral-tier-progress-current">
          {(t.referrals?.currentTierLabel || 'Current: {tier}')
            .replace('{tier}', currentTierName)}
        </span>
      </div>

      {/* Tier dots */}
      <div className="referral-tier-dots">
        {allTiers.map((tierItem, index) => {
          const isAchieved = successfulReferrals >= tierItem.minReferrals;
          const isCurrent = currentTierData.name === tierItem.name;

          return (
            <div
              key={index}
              className={`referral-tier-dot ${isAchieved ? 'achieved' : ''} ${isCurrent ? 'current' : ''}`}
              style={{
                background: isAchieved ? tierItem.color : 'rgba(148,163,184,0.15)',
                borderColor: isCurrent ? tierItem.color : 'transparent',
              }}
              title={`${tierItem.name}: ${tierItem.minReferrals}+ ${t.referrals?.totalReferrals || 'referrals'}`}
            />
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="referral-tier-bar">
        <div
          className="referral-tier-bar-fill"
          style={{
            width: `${progressPercent}%`,
            background: currentTierData.color || '#f59e0b',
          }}
        />
      </div>

      {/* Next tier info */}
      {nextTierData ? (
        <p className="referral-tier-next">
          {(t.referrals?.referralsNeeded || '{count} more referral(s) needed for {tier}')
            .replace('{count}', String(nextTierData.referralsNeeded))
            .replace('{tier}', nextTierName || '')}
        </p>
      ) : (
        <p className="referral-tier-max">
          {t.referrals?.creditCapReached || 'Maximum tier reached!'}
        </p>
      )}
    </div>
  );
};

export default ReferralTierProgress;