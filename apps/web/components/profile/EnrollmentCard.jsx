/**
 * @fileoverview Enrollment Status Card Component
 * Shows enrollment plan, date, access type
 * Path: apps/web/components/profile/EnrollmentCard.jsx
 */

import React from 'react';
import { Shield, Clock, Infinity, Layers } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const EnrollmentCard = ({ enrollment = null, isEnrolled = false }) => {
  const { t } = useLanguage();

  const isFullCourse = enrollment?.purchase_mode === 'full-course';
  const phaseCount = enrollment?.selected_phases?.length || 0;
  const enrolledDate = enrollment?.enrolled_at
    ? new Date(enrollment.enrolled_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <div className="profile-card">
      <h3 className="profile-card-title">
        <Shield size={18} />
        {t.profile?.enrollmentStatus || 'Enrollment Status'}
      </h3>

      {!isEnrolled ? (
        <div className="profile-enrollment-empty">
          <p>{t.profile?.notEnrolledStatus || 'You are not currently enrolled in any course.'}</p>
          <a href="/pricing" className="profile-card-link">{t.checkout?.viewPricing || 'View Pricing'}</a>
        </div>
      ) : (
        <div className="profile-enrollment-details">
          <div className="profile-enrollment-row">
            <span className="profile-enrollment-label">{t.profile?.plan || 'Plan'}</span>
            <span className="profile-enrollment-value">
              <Layers size={14} />
              {isFullCourse
                ? (t.profile?.fullCourse || 'Full Course')
                : (t.profile?.individualPhases || '{count} Phase(s)').replace('{count}', phaseCount)}
            </span>
          </div>

          {enrolledDate && (
            <div className="profile-enrollment-row">
              <span className="profile-enrollment-label">{t.profile?.purchasedOn || 'Purchased on'}</span>
              <span className="profile-enrollment-value">
                <Clock size={14} />
                {enrolledDate}
              </span>
            </div>
          )}

          <div className="profile-enrollment-row">
            <span className="profile-enrollment-label">{t.profile?.accessType || 'Access'}</span>
            <span className="profile-enrollment-value">
              <Infinity size={14} />
              {t.profile?.lifetime || 'Lifetime'}
            </span>
          </div>

          {enrollment?.purchase_amount && (
            <div className="profile-enrollment-row">
              <span className="profile-enrollment-label">{t.checkout?.tuitionFee || 'Tuition Fee'}</span>
              <span className="profile-enrollment-value highlight">
                {enrollment.purchase_amount.toLocaleString()} ETB
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnrollmentCard;