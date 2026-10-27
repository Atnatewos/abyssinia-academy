/**
 * @fileoverview MLM Referral Dashboard Page
 *
 * Route: /profile/referrals
 *
 * Full 4-level MLM referral program page using the tabbed MLMDashboard container.
 * Handles authentication and layout wrapping.
 *
 * Path: apps/web/pages/profile/referrals.jsx
 */
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Share2 } from 'lucide-react';
import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import MLMDashboard from '../../components/referral/MLMDashboard';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

const ReferralsPage = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="profile-page">
          <div className="empty-state" style={{ padding: '5rem 1rem' }}>
            <Share2 size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
            <p className="empty-state-desc">
              {t.referrals?.mlm?.authRequired || 'Please log in to view your referral dashboard.'}
            </p>
            <Link href="/login" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
              Login
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <>
      <SEOHead
        title={t.referrals?.mlm?.dashboard?.title || 'MLM Referral Dashboard'}
        description={t.referrals?.mlm?.dashboard?.subtitle || 'Track your 4-level commission network.'}
      />
      <PageLayout>
        <div className="profile-page mlm-referrals-page">
          <Link href="/profile" className="profile-back-link">
            <ArrowLeft size={16} />
            {t.profile?.title || 'Back to Profile'}
          </Link>
          
          <div className="referral-page-header">
            <h1 className="referral-page-title">
              {t.referrals?.mlm?.dashboard?.title || 'MLM Referral Dashboard'}
            </h1>
            <p className="referral-page-subtitle">
              {t.referrals?.mlm?.dashboard?.subtitle ||
                'Track your 4-level commission network, bonuses, and withdrawals.'}
            </p>
          </div>

          <MLMDashboard />
        </div>
      </PageLayout>
    </>
  );
};

export default ReferralsPage;