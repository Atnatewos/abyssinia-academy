/**
 * @fileoverview Change Password Form Component
 * Path: apps/web/components/profile/ChangePasswordForm.jsx
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Key, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import useProfile from '../../hooks/useProfile';

const ChangePasswordForm = () => {
  const { t } = useLanguage();
  const toast = useToast();
  const router = useRouter();
  const { changePassword, updating, updateError, updateSuccess, clearMessages } = useProfile();

  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (updateSuccess) {
      toast.success(t.profile?.passwordChanged || 'Password changed successfully!');
      clearMessages();
      router.push('/profile');
    }
  }, [updateSuccess, toast, t, router, clearMessages]);

  const validate = () => {
    const newErrors = {};
    if (!formData.currentPassword) newErrors.currentPassword = 'Current password is required.';
    if (!formData.newPassword || formData.newPassword.length < 8) newErrors.newPassword = t.profile?.passwordTooShort || 'Password must be at least 8 characters.';
    if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = t.profile?.passwordMismatch || 'Passwords do not match.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    changePassword({ currentPassword: formData.currentPassword, newPassword: formData.newPassword });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <Link href="/profile" className="profile-back-link">
        <ArrowLeft size={16} />
        {t.profile?.changePassword || 'Back to Profile'}
      </Link>

      {updateError && <div className="profile-form-error">{updateError}</div>}

      <div className="profile-form-field">
        <label htmlFor="profile-current-pw">{t.profile?.currentPassword || 'Current Password'}</label>
        <input id="profile-current-pw" type="password" value={formData.currentPassword} onChange={(e) => handleChange('currentPassword', e.target.value)} className={`profile-form-input ${errors.currentPassword ? 'error' : ''}`} />
        {errors.currentPassword && <p className="profile-form-field-error">{errors.currentPassword}</p>}
      </div>

      <div className="profile-form-field">
        <label htmlFor="profile-new-pw">{t.profile?.newPassword || 'New Password'}</label>
        <input id="profile-new-pw" type="password" value={formData.newPassword} onChange={(e) => handleChange('newPassword', e.target.value)} className={`profile-form-input ${errors.newPassword ? 'error' : ''}`} />
        {errors.newPassword && <p className="profile-form-field-error">{errors.newPassword}</p>}
      </div>

      <div className="profile-form-field">
        <label htmlFor="profile-confirm-pw">{t.profile?.confirmNewPassword || 'Confirm New Password'}</label>
        <input id="profile-confirm-pw" type="password" value={formData.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} className={`profile-form-input ${errors.confirmPassword ? 'error' : ''}`} />
        {errors.confirmPassword && <p className="profile-form-field-error">{errors.confirmPassword}</p>}
      </div>

      <button type="submit" disabled={updating} className="profile-form-submit">
        <Key size={16} />
        {updating ? (t.profile?.saving || 'Updating...') : (t.profile?.changePassword || 'Change Password')}
      </button>
    </form>
  );
};

export default ChangePasswordForm;