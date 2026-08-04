/**
 * @fileoverview Dashboard Top Referrers Component
 * Shows the top 5 referrers by count and earnings.
 * Path: apps/web/components/admin/dashboard/DashboardTopReferrers.jsx
 */

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Award } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

/**
 * DashboardTopReferrers — Leaderboard of top referrers.
 *
 * @param {object} props
 * @param {Array} props.referrers - Top referrers data from API
 */
const DashboardTopReferrers = ({ referrers = [] }) => {
  const { t } = useLanguage();

  /*
   * Medal colors for top 3
   */
  const medalColors = ['#ffd700', '#c0c0c0', '#cd7f32'];

  return (
    <div className="admin-chart-card">
      <div className="admin-chart-header">
        <Award size={18} />
        <h3 className="admin-chart-title">Top Referrers</h3>
        <Link href="/admin/referrals" className="admin-chart-link">
          {t.profile?.viewAllPayments || 'View All'} <ArrowRight size={14} />
        </Link>
      </div>

      {referrers.length === 0 ? (
        <div className="admin-chart-empty">
          <p>No referral data yet.</p>
        </div>
      ) : (
        <div className="admin-referrers-mini">
          {referrers.slice(0, 5).map((referrer, index) => (
            <div key={referrer.id || index} className="admin-referrer-mini-row">
              <div className="admin-referrer-mini-rank">
                {index < 3 ? (
                  <span
                    className="admin-referrer-medal"
                    style={{ color: medalColors[index] }}
                  >
                    {index + 1}
                  </span>
                ) : (
                  <span className="admin-referrer-rank-num">{index + 1}</span>
                )}
              </div>
              <div className="admin-referrer-mini-info">
                <span className="admin-referrer-mini-name">
                  {referrer.full_name || referrer.user_name || 'Anonymous'}
                </span>
                <span className="admin-referrer-mini-stats">
                  {referrer.total_referrals || referrer.referralCount || 0}{' '}
                  {t.referrals?.totalReferrals?.toLowerCase() || 'referrals'} ·{' '}
                  {(referrer.total_credit_earned || referrer.creditEarned || 0).toLocaleString()} ETB
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardTopReferrers;