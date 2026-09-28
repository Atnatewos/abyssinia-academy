/**
 * @fileoverview Admin MLM Platform Stats
 *
 * Route: /admin/referrals/mlm/stats
 *
 * Platform-wide MLM health: total commissions, total bonuses, active
 * referrers, and the monthly platform cap usage bar.
 *
 * Path: apps/web/pages/admin/referrals/mlm/stats.jsx
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Gauge,
  ArrowLeft,
  Loader,
  AlertTriangle,
  Banknote,
  Award,
  Users,
} from 'lucide-react';
import AdminLayout from '../../../../components/admin/AdminLayout';
import { useLanguage } from '../../../../context/LanguageContext';
import { getItem } from '../../../../lib/storage';
import { getMLMCaps } from '../../../../lib/config';

/**
 * Formats a number with locale-aware thousands separator.
 * @param {number} value
 * @returns {string}
 */
const formatNumber = (value) => {
  if (value === null || value === undefined) return '0';
  return Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 });
};

const AdminMlmStatsPage = () => {
  const router = useRouter();
  const { t } = useLanguage();

  const [adminUser, setAdminUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const capsConfig = getMLMCaps();
  const platformCap = capsConfig.maxTotalPayoutPlatformPerMonthETB;

  useEffect(() => {
    const token = getItem('admin_token');
    const user = getItem('admin_user');

    if (!token) {
      router.push('/admin/login');
      return;
    }
    if (user) {
      setAdminUser(typeof user === 'string' ? JSON.parse(user) : user);
    }
    setIsAuthLoading(false);
  }, [router]);

  /**
   * Fetches platform-wide MLM statistics.
   */
  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getItem('admin_token');
      const response = await fetch('/api/admin/referrals/mlm/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload = await response.json();

      if (payload.success) {
        setStats(payload.data);
      } else {
        setError(payload.message || 'Failed to load stats');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchStats();
    }
  }, [isAuthLoading, fetchStats]);

  if (isAuthLoading || !adminUser) {
    return (
      <AdminLayout>
        <div className="admin-loading">
          <Loader className="animate-spin" size={24} />
        </div>
      </AdminLayout>
    );
  }

  const totalCommission = stats?.totalCommissionPaid || 0;
  const totalBonuses = stats?.totalBonusesAwarded || 0;
  const activeReferrers = stats?.activeReferrers || 0;
  const monthlyPayout = stats?.currentMonthPayout || 0;
  const capPercentUsed = platformCap > 0 ? Math.round((monthlyPayout / platformCap) * 100) : 0;
  const isCapWarning = capPercentUsed >= 80;
  const isCapExceeded = capPercentUsed >= 100;

  const statCards = [
    {
      id: 'total-commissions',
      icon: Banknote,
      label: t.referrals?.mlm?.adminMlmTotalCommissions || 'Total Commissions Paid',
      value: `${formatNumber(totalCommission)} ETB`,
      color: '#f59e0b',
    },
    {
      id: 'total-bonuses',
      icon: Award,
      label: t.referrals?.mlm?.adminMlmTotalBonuses || 'Total Bonuses Awarded',
      value: `${formatNumber(totalBonuses)} ETB`,
      color: '#3b82f6',
    },
    {
      id: 'active-referrers',
      icon: Users,
      label: t.referrals?.mlm?.adminMlmActiveReferrers || 'Active Referrers',
      value: formatNumber(activeReferrers),
      color: '#10b981',
    },
    {
      id: 'platform-cap',
      icon: Gauge,
      label: t.referrals?.mlm?.adminMlmPlatformCap || 'Platform Monthly Cap',
      value: `${formatNumber(platformCap)} ETB`,
      color: isCapExceeded ? '#ef4444' : '#8b5cf6',
    },
  ];

  return (
    <AdminLayout
      title={t.referrals?.mlm?.adminMlmStatsTitle || 'Referral System Health'}
      subtitle={t.referrals?.mlm?.adminMlmStatsSubtitle || 'Commissions, bonuses, and cap usage'}
    >
      <div className="admin-page">
        <div className="admin-page-header">
          <button
            type="button"
            className="admin-back-btn"
            onClick={() => router.push('/admin')}
          >
            <ArrowLeft size={16} />
          </button>
        </div>

        {isLoading ? (
          <div className="admin-loading">
            <Loader className="animate-spin" size={24} />
          </div>
        ) : error ? (
          <div className="admin-error-banner">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        ) : (
          <>
            <div className="admin-stats-grid">
              {statCards.map((card) => {
                const IconComponent = card.icon;
                return (
                  <div key={card.id} className="admin-stat-card">
                    <div className="admin-stat-card-top">
                      <div
                        className="admin-stat-icon"
                        style={{ background: `${card.color}15`, border: `1px solid ${card.color}30` }}
                      >
                        <IconComponent size={20} style={{ color: card.color }} />
                      </div>
                    </div>
                    <p className="admin-stat-label">{card.label}</p>
                    <p className="admin-stat-value" style={{ color: card.color }}>
                      {card.value}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="admin-cap-section">
              <div className="admin-cap-header">
                <h3 className="admin-cap-title">
                  {t.referrals?.mlm?.adminMlmPlatformUsed || 'Used This Month'}
                </h3>
                <span
                  className={`admin-cap-percent ${isCapExceeded ? 'danger' : isCapWarning ? 'warning' : ''}`}
                >
                  {capPercentUsed}%
                </span>
              </div>

              <div className="admin-cap-progress-bar">
                <div
                  className={`admin-cap-progress-fill ${isCapExceeded ? 'danger' : isCapWarning ? 'warning' : ''}`}
                  style={{ width: `${Math.min(capPercentUsed, 100)}%` }}
                />
              </div>

              <div className="admin-cap-details">
                <span>
                  {t.referrals?.mlm?.adminMlmPlatformUsed || 'Used'}: {formatNumber(monthlyPayout)} ETB
                </span>
                <span>
                  {t.referrals?.mlm?.adminMlmPlatformRemaining || 'Remaining'}:{' '}
                  {formatNumber(Math.max(platformCap - monthlyPayout, 0))} ETB
                </span>
              </div>

              {isCapWarning && !isCapExceeded && (
                <div className="admin-cap-warning">
                  <AlertTriangle size={16} />
                  <span>
                    {(t.referrals?.mlm?.adminMlmCapWarning || 'Platform cap is {percent}% used.')
                      .replace('{percent}', String(capPercentUsed))}
                  </span>
                </div>
              )}

              {isCapExceeded && (
                <div className="admin-cap-danger">
                  <AlertTriangle size={16} />
                  <span>
                    {t.referrals?.mlm?.adminMlmCapExceeded || 'Platform cap reached. New commissions paused.'}
                  </span>
                </div>
              )}
            </div>

            <div className="admin-quick-links">
              <button
                type="button"
                className="admin-btn primary"
                onClick={() => router.push('/admin/referrals/mlm/withdrawals')}
              >
                <Banknote size={16} />
                {t.referrals?.mlm?.adminWithdrawalsTitle || 'Withdrawal Requests'}
              </button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMlmStatsPage;