/**
 * @fileoverview MLM Stats Cards
 *
 * Four hero metrics for the dashboard overview (Money Model v2):
 *   1. Available Now   — withdrawable balance (unlocked commissions + bonuses)
 *   2. Bonus Earnings  — lifetime bonus credits (replaces legacy "credit")
 *   3. Team Size       — structural downline count
 *   4. Direct Referrals— level-1 count
 *
 * All values read from the v2 wallet/team payload; zero hardcoded numbers.
 *
 * Path: apps/web/components/referral/MLMStatsCards.jsx
 */

import React from 'react';
import { Wallet, Award, Users, UserPlus, Lock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Formats a numeric ETB value with locale-aware thousands separator.
 * @param {number} value
 * @returns {string}
 */
const formatETB = (value) => {
  if (value === null || value === undefined) return '0';
  return Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 });
};

const MLMStatsCards = ({ wallet, team }) => {
  const { t } = useLanguage();

  /* Money Model v2 wallet contract with safe fallbacks */
  const availableNow = wallet?.availableNow ?? 0;
  const lockedTotal = wallet?.lockedTotal ?? 0;
  const bonusEarned = wallet?.totalBonusEarned ?? 0;
  const totalTeam = team?.totalTeamSize ?? 0;
  const directCount = team?.directReferralCount ?? 0;

  const cards = [
    {
      id: 'available-now',
      icon: Wallet,
      label: t.referrals?.mlm?.stats?.availableNow || 'Available Now',
      value: `${formatETB(availableNow)} ETB`,
      sublabel:
        lockedTotal > 0
          ? `${formatETB(lockedTotal)} ETB ${t.referrals?.mlm?.stats?.locked || 'locked'}`
          : t.referrals?.mlm?.stats?.allUnlocked || 'Fully withdrawable',
      accent: '#10b981',
      hero: true,
    },
    {
      id: 'bonus-earnings',
      icon: Award,
      label: t.referrals?.mlm?.stats?.bonusEarnings || 'Bonus Earnings',
      value: `${formatETB(bonusEarned)} ETB`,
      sublabel: t.referrals?.mlm?.stats?.bonusEarningsSub || 'Lifetime bonus credits',
      accent: '#3b82f6',
      hero: false,
    },
    {
      id: 'team-size',
      icon: Users,
      label: t.referrals?.mlm?.stats?.teamSize || 'Team Size',
      value: formatETB(totalTeam),
      sublabel: t.referrals?.mlm?.stats?.acrossLevels || 'Across 4 levels',
      accent: '#3b82f6',
      hero: false,
    },
    {
      id: 'direct-referrals',
      icon: UserPlus,
      label: t.referrals?.mlm?.stats?.directReferrals || 'Direct Referrals',
      value: formatETB(directCount),
      sublabel: t.referrals?.mlm?.stats?.level1Only || 'Level 1 only',
      accent: '#8b5cf6',
      hero: false,
    },
  ];

  return (
    <div className="mlm-stats-grid">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            className={`glass-card mlm-stat-card ${card.hero ? 'mlm-stat-hero' : ''}`}
          >
            <div
              className="mlm-stat-icon"
              style={{ backgroundColor: `${card.accent}20`, color: card.accent }}
            >
              <IconComponent size={22} />
            </div>
            <div className="mlm-stat-content">
              <span className="mlm-stat-label">{card.label}</span>
              <span className="mlm-stat-value">{card.value}</span>
              <span className="mlm-stat-sublabel">
                {card.id === 'available-now' && lockedTotal > 0 ? (
                  <>
                    <Lock
                      size={11}
                      style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }}
                    />
                    {card.sublabel}
                  </>
                ) : (
                  card.sublabel
                )}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MLMStatsCards;