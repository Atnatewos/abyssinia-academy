// /**
//  * @fileoverview Profile Header Component
//  * Avatar, name, contact info, enrollment badge, and action buttons
//  * ALL display text from i18n → t.profile.*
//  * Path: apps/web/components/profile/ProfileHeader.jsx
//  */

// import React from 'react';
// import Link from 'next/link';
// import { User, Mail, Phone, Calendar, Shield, Edit3, Key } from 'lucide-react';
// import { useLanguage } from '../../context/LanguageContext';

// /**
//  * ProfileHeader — Top section of the profile page
//  * @param {object} props
//  * @param {object} props.user - User object from profile data
//  * @param {boolean} props.isEnrolled - Whether user is enrolled
//  * @param {string} props.enrolledAt - Enrollment date
//  */
// const ProfileHeader = ({ user = {}, isEnrolled = false, enrolledAt = null }) => {
//   const { t } = useLanguage();

//   const initials = user.fullName
//     ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
//     : '?';

//   const joinedDate = enrolledAt
//     ? new Date(enrolledAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
//     : (user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : null);

//   return (
//     <div className="profile-header">
//       <div className="profile-header-avatar-section">
//         {user.avatarUrl ? (
//           <img src={user.avatarUrl} alt={user.fullName} className="profile-header-avatar-img" />
//         ) : (
//           <div className="profile-header-avatar-placeholder">
//             <span>{initials}</span>
//           </div>
//         )}
//       </div>

//       <div className="profile-header-info">
//         <h1 className="profile-header-name">{user.fullName || 'Student'}</h1>

//         <div className="profile-header-meta">
//           {user.email && (
//             <span className="profile-header-meta-item">
//               <Mail size={14} />
//               {user.email}
//             </span>
//           )}
//           {user.phone && (
//             <span className="profile-header-meta-item">
//               <Phone size={14} />
//               {user.phone}
//             </span>
//           )}
//           {joinedDate && (
//             <span className="profile-header-meta-item">
//               <Calendar size={14} />
//               {t.profile?.enrolledSince || 'Member since'}: {joinedDate}
//             </span>
//           )}
//         </div>

//         <div className="profile-header-badges">
//           {isEnrolled && (
//             <span className="profile-header-badge enrolled">
//               <Shield size={14} />
//               {t.profile?.enrolled || 'Enrolled'}
//             </span>
//           )}
//           {!isEnrolled && (
//             <span className="profile-header-badge not-enrolled">
//               {t.profile?.notEnrolled || 'Not Enrolled'}
//             </span>
//           )}
//         </div>
//       </div>

//       <div className="profile-header-actions">
//         <Link href="/profile/edit" className="profile-header-action-btn">
//           <Edit3 size={16} />
//           <span>{t.profile?.editProfile || 'Edit Profile'}</span>
//         </Link>
//         <Link href="/profile/password" className="profile-header-action-btn secondary">
//           <Key size={16} />
//           <span>{t.profile?.changePassword || 'Change Password'}</span>
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default ProfileHeader;











/**
 * @fileoverview Profile Header Component
 *
 * Avatar, name, contact info, enrollment badge, and action buttons.
 *
 * Field normalization: The API returns Postgres snake_case fields
 * (full_name, avatar_url, is_enrolled), but this component historically
 * consumed camelCase (fullName, avatarUrl, isEnrolled). To be resilient
 * to both shapes (and any API evolution), we normalize at the top.
 *
 * Path: apps/web/components/profile/ProfileHeader.jsx
 */

import React from 'react';
import Link from 'next/link';
import { User, Mail, Phone, Calendar, Shield, Edit3, Key } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Resolve a user field that might be in camelCase or snake_case.
 * Returns the first non-null value found.
 *
 * @param {object} user - User object from either API shape
 * @param {string[]} keys - Candidate keys, in priority order
 * @returns {*}
 */
const pickField = (user, keys) => {
  if (!user) return undefined;
  for (const key of keys) {
    const value = user[key];
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
};

/**
 * Format a date string into a readable form. Falls back to null on
 * any parse failure so the UI omits the line entirely.
 */
const formatDate = (value, opts) => {
  if (!value) return null;
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString('en-US', opts);
  } catch {
    return null;
  }
};

/**
 * ProfileHeader — Top section of the profile page.
 *
 * @param {object} props
 * @param {object} props.user - User object (snake_case or camelCase)
 * @param {boolean} props.isEnrolled - Whether user is enrolled
 * @param {string} props.enrolledAt - Enrollment date
 */
const ProfileHeader = ({ user = {}, isEnrolled: isEnrolledProp, enrolledAt = null }) => {
  const { t } = useLanguage();

  /* ── Normalize fields: accept both snake_case and camelCase ── */
  const fullName =
    pickField(user, ['fullName', 'full_name', 'name']) || 'Student';
  const email = pickField(user, ['email']) || null;
  const phone = pickField(user, ['phone']) || null;
  const avatarUrl = pickField(user, ['avatarUrl', 'avatar_url']) || null;

  /* isEnrolled can come as a prop override OR as a field on user */
  const isEnrolledRaw =
    isEnrolledProp !== undefined
      ? isEnrolledProp
      : pickField(user, ['isEnrolled', 'is_enrolled']);
  const isEnrolled = Boolean(isEnrolledRaw);

  /* Enrollment / joined date resolution */
  const enrolledAtValue =
    enrolledAt ||
    pickField(user, ['enrolledAt', 'enrolled_at']);
  const createdAtValue =
    pickField(user, ['createdAt', 'created_at']);

  const joinedDate =
    formatDate(enrolledAtValue, { year: 'numeric', month: 'long', day: 'numeric' }) ||
    formatDate(createdAtValue, { year: 'numeric', month: 'long' });

  /* Initials fallback: first letters of the first two name words */
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <div className="profile-header">
      <div className="profile-header-avatar-section">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={fullName}
            className="profile-header-avatar-img"
          />
        ) : (
          <div className="profile-header-avatar-placeholder">
            <span>{initials}</span>
          </div>
        )}
      </div>

      <div className="profile-header-info">
        <h1 className="profile-header-name">{fullName}</h1>

        <div className="profile-header-meta">
          {email && (
            <span className="profile-header-meta-item">
              <Mail size={14} />
              {email}
            </span>
          )}
          {phone && (
            <span className="profile-header-meta-item">
              <Phone size={14} />
              {phone}
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
          {isEnrolled ? (
            <span className="profile-header-badge enrolled">
              <Shield size={14} />
              {t.profile?.enrolled || 'Enrolled'}
            </span>
          ) : (
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