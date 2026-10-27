/**
 * @fileoverview Profile Overview Page
 * Shows user info, enrollment status, progress, payment history, and quick actions.
 * ALL data from API via useProfile() hook + config + i18n.
 * This is a FRONTEND page — no server-side imports.
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

/**
 * ProfilePage — Main profile overview page.
 * Requires authentication. Fetches data via the useProfile hook
 * which calls the /api/profile endpoint (serverless function).
 */
const ProfilePage = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { profile, loading } = useProfile();
  const profileConfig = getProfileConfig();
  const sections = profileConfig?.sections || {};

  /*
   * Show login prompt for unauthenticated users
   */
  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="profile-page">
          <div className="empty-state" style={{ padding: '5rem 1rem' }}>
            <User size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
            <p className="empty-state-desc">
              {t.profile?.loadError || 'Please log in to view your profile.'}
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  /*
   * Show loading spinner while data is being fetched
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
   * Extract data from the profile response
   */
  const user = profile?.user || {};
  const enrollment = profile?.enrollment || null;
  const progress = profile?.progress || {};
  const payments = profile?.payments || [];

  return (
    <>
      <SEOHead title={t.profile?.title || 'My Profile'} />
      <PageLayout>
        <div className="profile-page">

          {/* ── Profile Header ── */}
          <ProfileHeader
            user={user}
            isEnrolled={user.isEnrolled}
            enrolledAt={enrollment?.enrolled_at || user.enrolledAt}
          />

          {/* ── Two-Column Grid ── */}
          <div className="profile-grid">

            {/* Main Column */}
            <div className="profile-grid-main">

              {/* Enrollment Status Card */}
              {sections.enrollmentCard !== false && (
                <EnrollmentCard
                  enrollment={enrollment}
                  isEnrolled={user.isEnrolled}
                />
              )}

              {/* Phase-by-Phase Progress */}
              {sections.phaseProgress !== false && (
                <PhaseProgressList />
              )}
            </div>

            {/* Sidebar Column */}
            <div className="profile-grid-sidebar">

              {/* Overall Progress with Ring */}
              {sections.overallProgress !== false && (
                <OverallProgressCard
                  progress={progress}
                  completedLessons={progress.completedLessons || 0}
                />
              )}

              {/* Payment History */}
              {sections.paymentHistory !== false && (
                <PaymentHistoryList payments={payments} />
              )}

              {/* Quick Action Links (from config) */}
              {sections.quickActions !== false && (
                <QuickActionsCard />
              )}

              {/* Account Settings Links */}
              {sections.accountSettings !== false && (
                <AccountSettingsCard />
              )}
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  );
};

export default ProfilePage;