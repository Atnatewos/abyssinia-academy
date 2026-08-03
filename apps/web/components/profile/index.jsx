/**
 * @fileoverview Profile Overview Page
 * Shows user info, enrollment status, progress, payment history, and quick actions
 * ALL data from API + config + i18n — zero hardcoded content
 * Path: apps/web/pages/profile/index.jsx
 */

import React from 'react';
import { User } from 'lucide-react';
import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import ProfileHeader from '../../components/profile/ProfileHeader';
import EnrollmentCard from '../../components/profile/EnrollmentCard';
import OverallProgressCard from '../../components/profile/OverallProgressCard';
import PhaseProgressList from '../../components/profile/PhaseProgressList';
import PaymentHistoryList from '../../components/profile/PaymentHistoryList';
import QuickActionsCard from '../../components/profile/QuickActionsCard';
import AccountSettingsCard from '../../components/profile/AccountSettingsCard';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getProfileConfig } from '../../lib/config';
import useProfile from '../../hooks/useProfile';

const ProfilePage = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { profile, loading } = useProfile();
  const profileConfig = getProfileConfig();
  const sections = profileConfig?.sections || {};

  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="profile-page">
          <div className="empty-state" style={{ padding: '5rem 1rem' }}>
            <User size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
            <p className="empty-state-desc">Please log in to view your profile.</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="profile-page">
          <div className="spinner" style={{ marginTop: '4rem' }}><div className="spinner-circle" /></div>
        </div>
      </PageLayout>
    );
  }

  const user = profile?.user || {};
  const enrollment = profile?.enrollment || null;
  const progress = profile?.progress || {};
  const payments = profile?.payments || [];

  return (
    <>
      <SEOHead title={t.profile?.title || 'My Profile'} />
      <PageLayout>
        <div className="profile-page">
          <ProfileHeader
            user={user}
            isEnrolled={user.isEnrolled}
            enrolledAt={enrollment?.enrolled_at || user.enrolledAt}
          />

          <div className="profile-grid">
            <div className="profile-grid-main">
              {sections.enrollmentCard !== false && (
                <EnrollmentCard enrollment={enrollment} isEnrolled={user.isEnrolled} />
              )}
              {sections.phaseProgress !== false && <PhaseProgressList />}
            </div>

            <div className="profile-grid-sidebar">
              {sections.overallProgress !== false && (
                <OverallProgressCard progress={progress} completedLessons={progress.completedLessons || 0} />
              )}
              {sections.paymentHistory !== false && (
                <PaymentHistoryList payments={payments} />
              )}
              {sections.quickActions !== false && <QuickActionsCard />}
              {sections.accountSettings !== false && <AccountSettingsCard />}
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  );
};

export default ProfilePage;