/**
 * @fileoverview Referral Stats Cards Component
 * Displays 4 stat cards: total referrals, credit balance, cash earned, current tier.
 * ALL display text from i18n → t.referrals.*
 * Path: apps/web/components/referral/ReferralStatsCards.jsx
 */

import React from 'react';
import { Users, CreditCard, DollarSign, Award } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * ReferralStatsCards — Four-card grid showing key referral metrics.
 * Handles null/undefined earnings gracefully with safe defaults.
 *
 * @param {object} props
 * @param {object} props.earnings - Earnings data from the API (may be null)
 * @param {object} props.tier - Current tier data (may be null)
 */
const ReferralStatsCards = ({ earnings = null, tier = null }) => {
  const { t, language } = useLanguage();

  /*
   * Safely access nested values with fallbacks
   */
  const successfulReferrals = earnings?.successfulReferrals || 0;
  const availableCredit = earnings?.availableCredit || 0;
  const pendingCommission = earnings?.pendingCommission || 0;

  const tierCreditPercent = tier?.creditPercent || 10;
  const tierName = language === 'am'
    ? (tier?.nameAm || tier?.name || 'Bronze')
    : (tier?.name || 'Bronze');

  const stats = [
    {
      id: 'referrals',
      icon: Users,
      value: successfulReferrals,
      label: t.referrals?.totalReferrals || 'Total Referrals',
      color: '#3b82f6',
    },
    {
      id: 'credit',
      icon: CreditCard,
      value: `${availableCredit.toLocaleString()} ETB`,
      label: t.referrals?.creditBalance || 'Credit Balance',
      color: '#10b981',
    },
    {
      id: 'cash',
      icon: DollarSign,
      value: `${pendingCommission.toLocaleString()} ETB`,
      label: t.referrals?.cashEarned || 'Cash Earned',
      color: '#f59e0b',
    },
    {
      id: 'tier',
      icon: Award,
      value: tierName,
      label: `${t.referrals?.currentTier || 'Current Tier'} (${tierCreditPercent}% ${t.referrals?.perReferral || 'per referral'})`,
      color: tier?.color || '#cd7f32',
    },
  ];

  return (
    <div className="referral-stats-grid">
      {stats.map((stat) => (
        <div key={stat.id} className="referral-stat-card">
          <div
            className="referral-stat-icon"
            style={{ background: `${stat.color}15`, color: stat.color }}
          >
            <stat.icon size={20} />
          </div>
          <div className="referral-stat-info">
            <span className="referral-stat-value" style={{ color: stat.color }}>
              {stat.value}
            </span>
            <span className="referral-stat-label">{stat.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReferralStatsCards;