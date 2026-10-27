/**
 * @fileoverview Edit Profile Form Component
 * Form for updating name, phone, email
 * Path: apps/web/components/profile/EditProfileForm.jsx
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import useProfile from '../../hooks/useProfile';

const EditProfileForm = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const { updateProfile, updating, updateError, updateSuccess, clearMessages } = useProfile();

  const [formData, setFormData] = useState({ fullName: '', phone: '', email: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.full_name || user.fullName || '',
        phone: user.phone || '',
        email: user.email || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (updateSuccess) {
      toast.success(t.profile?.profileUpdated || 'Profile updated successfully!');
      clearMessages();
      router.push('/profile');
    }
  }, [updateSuccess, toast, t, router, clearMessages]);

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = t.checkout?.fullNameRequired || 'Full name is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    updateProfile({ fullName: formData.fullName.trim(), phone: formData.phone.trim(), email: formData.email.trim() });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <Link href="/profile" className="profile-back-link">
        <ArrowLeft size={16} />
        {t.profile?.editProfileTitle || 'Back to Profile'}
      </Link>

      {updateError && <div className="profile-form-error">{updateError}</div>}

      <div className="profile-form-field">
        <label htmlFor="profile-fullname">{t.profile?.fullName || 'Full Name'}</label>
        <input id="profile-fullname" type="text" value={formData.fullName} onChange={(e) => handleChange('fullName', e.target.value)} className={`profile-form-input ${errors.fullName ? 'error' : ''}`} />
        {errors.fullName && <p className="profile-form-field-error">{errors.fullName}</p>}
      </div>

      <div className="profile-form-field">
        <label htmlFor="profile-phone">{t.profile?.phone || 'Phone Number'}</label>
        <input id="profile-phone" type="text" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} className="profile-form-input" />
      </div>

      <div className="profile-form-field">
        <label htmlFor="profile-email">{t.profile?.email || 'Email Address'}</label>
        <input id="profile-email" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} className="profile-form-input" />
      </div>

      <button type="submit" disabled={updating} className="profile-form-submit">
        <Save size={16} />
        {updating ? (t.profile?.saving || 'Saving...') : (t.profile?.saveChanges || 'Save Changes')}
      </button>
    </form>
  );
};

export default EditProfileForm;