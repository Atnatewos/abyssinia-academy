/**
 * @fileoverview Account Settings Card Component
 * Links to edit profile, change password, language toggle
 * Path: apps/web/components/profile/AccountSettingsCard.jsx
 */

import React from 'react';
import Link from 'next/link';
import { Settings, Edit3, Key, Globe, Bell } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const AccountSettingsCard = () => {
  const { t, language, toggleLanguage } = useLanguage();

  const settingsLinks = [
    { id: 'edit', href: '/profile/edit', icon: Edit3, label: t.profile?.editProfile || 'Edit Profile' },
    { id: 'password', href: '/profile/password', icon: Key, label: t.profile?.changePassword || 'Change Password' },
  ];

  return (
    <div className="profile-card">
      <h3 className="profile-card-title">
        <Settings size={18} />
        {t.profile?.accountSettings || 'Account Settings'}
      </h3>

      <div className="profile-settings-list">
        {settingsLinks.map((link) => (
          <Link key={link.id} href={link.href} className="profile-setting-item">
            <span className="profile-setting-icon"><link.icon size={16} /></span>
            <span className="profile-setting-label">{link.label}</span>
          </Link>
        ))}

        <button onClick={toggleLanguage} className="profile-setting-item">
          <span className="profile-setting-icon"><Globe size={16} /></span>
          <span className="profile-setting-label">{t.profile?.language || 'Language'}</span>
          <span className="profile-setting-value">
            {language === 'en' ? 'English' : 'አማርኛ'}
          </span>
        </button>

        <button className="profile-setting-item">
          <span className="profile-setting-icon"><Bell size={16} /></span>
          <span className="profile-setting-label">{t.profile?.notifications || 'Notification Preferences'}</span>
        </button>
      </div>
    </div>
  );
};

export default AccountSettingsCard;