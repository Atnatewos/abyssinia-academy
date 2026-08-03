/**
 * @fileoverview Edit Profile Page
 * Path: apps/web/pages/profile/edit.jsx
 */

import React from 'react';
import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import EditProfileForm from '../../components/profile/EditProfileForm';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

const EditProfilePage = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="empty-state" style={{ padding: '5rem 1rem' }}>
          <p className="empty-state-desc">Please log in to edit your profile.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <>
      <SEOHead title={t.profile?.editProfile || 'Edit Profile'} />
      <PageLayout>
        <div className="profile-page">
          <div className="profile-form-container">
            <h1 className="profile-form-title">{t.profile?.editProfileTitle || 'Edit Profile'}</h1>
            <EditProfileForm />
          </div>
        </div>
      </PageLayout>
    </>
  );
};

export default EditProfilePage;