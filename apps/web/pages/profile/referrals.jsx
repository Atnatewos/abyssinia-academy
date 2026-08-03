/**
 * @fileoverview Referral Dashboard Page
 * Full referral program page with code, stats, tier progress, earnings, and history.
 * ALL data from API + config + i18n.
 * Handles null/undefined API responses gracefully.
 * Path: apps/web/pages/profile/referrals.jsx
 */

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Share2 } from 'lucide-react';
import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import ReferralCodeCard from '../../components/referral/ReferralCodeCard';
import ReferralShareButtons from '../../components/referral/ReferralShareButtons';
import ReferralStatsCards from '../../components/referral/ReferralStatsCards';
import ReferralTierProgress from '../../components/referral/ReferralTierProgress';
import ReferralHowItWorks from '../../components/referral/ReferralHowItWorks';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getReferralDashboardConfig } from '../../lib/config';
import useReferrals from '../../hooks/useReferrals';

/**
 * ReferralsPage — Full referral dashboard.
 * Requires authentication.
 */
const ReferralsPage = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { data, loading, error } = useReferrals();
  const dashboardConfig = getReferralDashboardConfig();

  /*
   * Unauthenticated state
   */
  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="profile-page">
          <div className="empty-state" style={{ padding: '5rem 1rem' }}>
            <Share2 size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
            <p className="empty-state-desc">Please log in to view your referral dashboard.</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  /*
   * Loading state
   */
  if (loading) {
    return (
      <PageLayout>
        <div className="profile-page">
          <div className="spinner" style={{ marginTop: '4rem' }}>
            <div className="spinner-circle" />
          </div>
        </div>
      </PageLayout>
    );
  }

  /*
   * Error state — show the page shell with an error message
   * but still render whatever data we have (if any)
   */
  const hasError = error && !data;

  /*
   * Safely extract data with fallbacks for all nested values
   */
  const referralData = data || {};
  const referralCode = referralData.code || '';
  const referralLink = referralData.link || '';
  const earnings = referralData.earnings || {};
  const tierData = referralData.tier || { current: null, next: null };
  const history = referralData.history || [];

  return (
    <>
      <SEOHead title={t.referrals?.dashboardTitle || 'Referral Dashboard'} />
      <PageLayout>
        <div className="profile-page">

          {/* Back link */}
          <Link href="/profile" className="profile-back-link">
            <ArrowLeft size={16} />
            {t.profile?.title || 'Back to Profile'}
          </Link>

          {/* Page title */}
          <div className="referral-page-header">
            <h1 className="referral-page-title">
              {t.referrals?.dashboardTitle || 'Referral Dashboard'}
            </h1>
            <p className="referral-page-subtitle">
              {t.referrals?.dashboardSubtitle || 'Share Abyssinia Academy and earn rewards!'}
            </p>
          </div>

          {/* Error banner — shown above content if API failed */}
          {hasError && (
            <div className="profile-form-error" style={{ marginBottom: '1.5rem' }}>
              {t.referrals?.loadError || 'Failed to load referral data. Please try again.'}
            </div>
          )}

          {/* Referral Code Card */}
          <ReferralCodeCard
            code={referralCode}
            link={referralLink}
            discountPercent={tierData?.current?.creditPercent || 10}
          />

          {/* Share Buttons */}
          {referralLink && (
            <ReferralShareButtons
              link={referralLink}
              discountPercent={tierData?.current?.creditPercent || 10}
            />
          )}

          {/* Stats Cards */}
          <ReferralStatsCards
            earnings={earnings}
            tier={tierData?.current}
          />

          {/* Tier Progress */}
          {dashboardConfig.showTierProgress !== false && (
            <ReferralTierProgress
              tier={tierData}
              successfulReferrals={earnings?.successfulReferrals || 0}
            />
          )}

          {/* Earnings Breakdown */}
          {dashboardConfig.showEarningsBreakdown !== false && (
            <div className="profile-card">
              <h3 className="profile-card-title">
                {t.referrals?.earningsBreakdown || 'Earnings Breakdown'}
              </h3>

              <div className="referral-earnings-grid">
                <div className="referral-earnings-item">
                  <span className="referral-earnings-label">
                    {t.referrals?.creditEarned || 'Credit Earned'}
                  </span>
                  <span className="referral-earnings-value">
                    {(earnings.totalCreditEarned || 0).toLocaleString()} ETB
                  </span>
                </div>

                <div className="referral-earnings-item">
                  <span className="referral-earnings-label">
                    {t.referrals?.creditUsed || 'Credit Used'}
                  </span>
                  <span className="referral-earnings-value">
                    {(earnings.totalCreditUsed || 0).toLocaleString()} ETB
                  </span>
                </div>

                <div className="referral-earnings-item highlight">
                  <span className="referral-earnings-label">
                    {t.referrals?.availableCredit || 'Available Credit'}
                  </span>
                  <span className="referral-earnings-value">
                    {(earnings.availableCredit || 0).toLocaleString()} ETB
                  </span>
                </div>

                <div className="referral-earnings-item">
                  <span className="referral-earnings-label">
                    {t.referrals?.commissionEarned || 'Commission Earned'}
                  </span>
                  <span className="referral-earnings-value">
                    {(earnings.totalCommissionEarned || 0).toLocaleString()} ETB
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Referral History */}
          {dashboardConfig.showReferralHistory !== false && (
            <div className="profile-card">
              <h3 className="profile-card-title">
                {t.referrals?.referralHistory || 'Referral History'}
              </h3>

              {history.length > 0 ? (
                <div className="referral-history-list">
                  {history.map((item) => (
                    <div key={item.id} className="referral-history-item">
                      <div className="referral-history-left">
                        <span className={`referral-history-status status-${item.status}`}>
                          {t.referrals?.[`status${item.status.charAt(0).toUpperCase() + item.status.slice(1)}`] || item.status}
                        </span>
                        <span className="referral-history-name">{item.referredName || 'Anonymous'}</span>
                      </div>
                      <div className="referral-history-right">
                        {item.creditAmount > 0 && (
                          <span className="referral-history-credit">
                            +{item.creditAmount.toLocaleString()} ETB
                          </span>
                        )}
                        <span className="referral-history-date">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="profile-card-empty">
                  {t.referrals?.noReferrals || 'You haven\'t referred anyone yet.'}
                </p>
              )}
            </div>
          )}

          {/* How It Works */}
          {dashboardConfig.showHowItWorks !== false && (
            <div className="profile-card">
              <ReferralHowItWorks />
            </div>
          )}
        </div>
      </PageLayout>
    </>
  );
};

export default ReferralsPage;