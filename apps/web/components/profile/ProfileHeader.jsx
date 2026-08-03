/**
 * @fileoverview Profile Header Component
 * Avatar, name, contact info, enrollment badge, and action buttons
 * ALL display text from i18n → t.profile.*
 * Path: apps/web/components/profile/ProfileHeader.jsx
 */

import React from 'react';
import Link from 'next/link';
import { User, Mail, Phone, Calendar, Shield, Edit3, Key } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * ProfileHeader — Top section of the profile page
 * @param {object} props
 * @param {object} props.user - User object from profile data
 * @param {boolean} props.isEnrolled - Whether user is enrolled
 * @param {string} props.enrolledAt - Enrollment date
 */
const ProfileHeader = ({ user = {}, isEnrolled = false, enrolledAt = null }) => {
  const { t } = useLanguage();

  const initials = user.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const joinedDate = enrolledAt
    ? new Date(enrolledAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : (user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : null);

  return (
    <div className="profile-header">
      <div className="profile-header-avatar-section">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.fullName} className="profile-header-avatar-img" />
        ) : (
          <div className="profile-header-avatar-placeholder">
            <span>{initials}</span>
          </div>
        )}
      </div>

      <div className="profile-header-info">
        <h1 className="profile-header-name">{user.fullName || 'Student'}</h1>

        <div className="profile-header-meta">
          {user.email && (
            <span className="profile-header-meta-item">
              <Mail size={14} />
              {user.email}
            </span>
          )}
          {user.phone && (
            <span className="profile-header-meta-item">
              <Phone size={14} />
              {user.phone}
            </span>
          )}
          {joinedDate && (
            <span className="profile-header-meta-item">
              <Calendar size={14} />
              {t.profile?.enrolledSince || 'Member since'}: {joinedDate}
            </span>
          )}
        </div>

        <div className="profile-header-badges">
          {isEnrolled && (
            <span className="profile-header-badge enrolled">
              <Shield size={14} />
              {t.profile?.enrolled || 'Enrolled'}
            </span>
          )}
          {!isEnrolled && (
            <span className="profile-header-badge not-enrolled">
              {t.profile?.notEnrolled || 'Not Enrolled'}
            </span>
          )}
        </div>
      </div>

      <div className="profile-header-actions">
        <Link href="/profile/edit" className="profile-header-action-btn">
          <Edit3 size={16} />
          <span>{t.profile?.editProfile || 'Edit Profile'}</span>
        </Link>
        <Link href="/profile/password" className="profile-header-action-btn secondary">
          <Key size={16} />
          <span>{t.profile?.changePassword || 'Change Password'}</span>
        </Link>
      </div>
    </div>
  );
};

export default ProfileHeader;