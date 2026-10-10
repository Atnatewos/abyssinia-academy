/**
 * @fileoverview Profile Edit Page
 *
 * Redesigned account management surface with custom confirmation modals:
 *   - Identity header card: avatar, display name, member-since date
 *   - Personal information form with dirty-state tracking
 *   - Password change with live strength meter
 *   - Custom success modal after save (not just toast)
 *   - Custom error modal for failures
 *
 * All feedback uses custom modals + toasts — zero browser dialogs.
 * All copy from i18n; password policy from env config.
 *
 * Path: apps/web/pages/profile/edit.jsx
 */
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Lock, Eye, EyeOff, Mail, Phone, User, Calendar, CheckCircle, XCircle } from 'lucide-react';
import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../lib/api';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?[0-9]{9,15}$/;
const NAME_MIN_LENGTH = 2;

const getPasswordMinLength = () => {
  const parsed = parseInt(process.env.NEXT_PUBLIC_PASSWORD_MIN_LENGTH, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 8;
};

const ProfileEditPage = () => {
  const { t, language } = useLanguage();
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const labels = t.profile || {};
  const minLength = getPasswordMinLength();
  const dateLocale = language === 'am' ? 'am-ET' : 'en-US';

  /* Identity header state */
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [createdAt, setCreatedAt] = useState(null);

  /* Personal info state */
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [baselineJson, setBaselineJson] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ fullName: '', phone: '', email: '' });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);

  /* Password state */
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  /* Custom confirmation modals */
  const [successModal, setSuccessModal] = useState({ open: false, title: '', message: '' });
  const [errorModal, setErrorModal] = useState({ open: false, title: '', message: '' });

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      setProfileLoading(true);
      try {
        const response = await apiClient.get('/profile');
        if (cancelled) return;

        const raw = response?.data || {};
        const apiUser = raw.user || raw;
        const nextName = apiUser.fullName || apiUser.full_name || user?.full_name || '';
        const nextPhone = apiUser.phone || user?.phone || '';
        const nextEmail = apiUser.email || user?.email || '';

        setFullName(nextName);
        setPhone(nextPhone);
        setEmail(nextEmail);
        setBaselineJson(JSON.stringify({ fullName: nextName, phone: nextPhone, email: nextEmail }));
        setAvatarUrl(apiUser.avatarUrl || apiUser.avatar_url || user?.avatar_url || '');
        setIsEnrolled(apiUser.isEnrolled ?? apiUser.is_enrolled ?? user?.is_enrolled ?? false);
        setCreatedAt(apiUser.createdAt || apiUser.created_at || user?.created_at || null);
      } catch {
        if (cancelled) return;
        const fallbackName = user?.full_name || user?.fullName || '';
        const fallbackPhone = user?.phone || '';
        const fallbackEmail = user?.email || '';
        setFullName(fallbackName);
        setPhone(fallbackPhone);
        setEmail(fallbackEmail);
        setBaselineJson(
          JSON.stringify({ fullName: fallbackName, phone: fallbackPhone, email: fallbackEmail })
        );
        toast.error(labels.loadError || 'Failed to load profile. Please try again.');
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    };

    loadProfile();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const isDirty =
    baselineJson !== '' &&
    JSON.stringify({ fullName, phone, email }) !== baselineJson;

  const displayName = fullName || user?.full_name || user?.fullName || '—';
  const avatarInitial = displayName.charAt(0).toUpperCase();

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString(dateLocale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const memberSinceText = (labels.memberSince || 'Member since {date}').replace(
    '{date}',
    formatDate(createdAt)
  );

  const validateProfile = () => {
    const nextErrors = { fullName: '', phone: '', email: '' };

    if (fullName.trim().length < NAME_MIN_LENGTH) {
      nextErrors.fullName = labels.fullNameRequired || 'Full name is required.';
    }
    if (!PHONE_PATTERN.test(phone.trim())) {
      nextErrors.phone = labels.phoneRequired || 'Please provide a valid phone number.';
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = labels.emailInvalid || 'Please enter a valid email address.';
    }

    setFieldErrors(nextErrors);
    return !nextErrors.fullName && !nextErrors.phone && !nextErrors.email;
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    if (!validateProfile()) return;

    setProfileSaving(true);
    try {
      const response = await apiClient.post('/profile', {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
      });
      
      /* Success: show custom modal + toast + refresh auth context */
      const successMessage = response?.message || labels.saved || 'Profile updated successfully';
      setSuccessModal({
        open: true,
        title: labels.saveSuccessTitle || 'Changes Saved',
        message: successMessage,
      });
      toast.success(successMessage);
      setBaselineJson(JSON.stringify({ fullName, phone, email }));
      setFieldErrors({ fullName: '', phone: '', email: '' });
      refreshUser();
    } catch (err) {
      const code = err?.response?.data?.code;
      const errorMessage = err?.response?.data?.message || labels.saveFailed || 'Failed to update profile';
      
      /* Error: show custom modal + toast */
      setErrorModal({
        open: true,
        title: labels.saveErrorTitle || 'Save Failed',
        message: errorMessage,
      });
      
      if (code === 'EMAIL_TAKEN') {
        setFieldErrors((prev) => ({ ...prev, email: labels.emailTaken || 'This email is already used by another account.' }));
        toast.error(labels.emailTaken || 'This email is already used by another account.');
      } else if (code === 'INVALID_PHONE') {
        setFieldErrors((prev) => ({ ...prev, phone: errorMessage }));
        toast.error(errorMessage);
      } else if (code === 'INVALID_NAME') {
        setFieldErrors((prev) => ({ ...prev, fullName: errorMessage }));
        toast.error(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setProfileSaving(false);
    }
  };

  const passwordStrength = useMemo(() => {
    if (!newPassword) return { level: 0, key: '' };
    let score = 0;
    if (newPassword.length >= minLength) score += 1;
    if (newPassword.length >= 12) score += 1;
    if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) score += 1;
    if (/\d/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    if (score <= 2) return { level: 1, key: 'strengthWeak' };
    if (score === 3) return { level: 2, key: 'strengthFair' };
    return { level: 3, key: 'strengthStrong' };
  }, [newPassword, minLength]);

  const strengthClassName =
    passwordStrength.level === 1 ? 'weak' : passwordStrength.level === 2 ? 'fair' : 'strong';

  const handlePasswordSubmit = (event) => {
    event.preventDefault();

    if (!currentPassword) {
      setErrorModal({
        open: true,
        title: labels.passwordErrorTitle || 'Password Error',
        message: labels.currentPasswordRequired || 'Current password is required',
      });
      toast.error(labels.currentPasswordRequired || 'Current password is required');
      return;
    }
    if (!newPassword) {
      setErrorModal({
        open: true,
        title: labels.passwordErrorTitle || 'Password Error',
        message: labels.newPasswordRequired || 'New password is required',
      });
      toast.error(labels.newPasswordRequired || 'New password is required');
      return;
    }
    if (newPassword.length < minLength) {
      const message = (labels.passwordTooShort || 'Password must be at least {length} characters.').replace(
        '{length}',
        String(minLength)
      );
      setErrorModal({
        open: true,
        title: labels.passwordErrorTitle || 'Password Error',
        message,
      });
      toast.error(message);
      return;
    }
    if (!confirmPassword) {
      setErrorModal({
        open: true,
        title: labels.passwordErrorTitle || 'Password Error',
        message: labels.confirmPasswordRequired || 'Please confirm your new password',
      });
      toast.error(labels.confirmPasswordRequired || 'Please confirm your new password');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorModal({
        open: true,
        title: labels.passwordErrorTitle || 'Password Error',
        message: labels.passwordMismatch || 'Passwords do not match.',
      });
      toast.error(labels.passwordMismatch || 'Passwords do not match.');
      return;
    }

    setConfirmOpen(true);
  };

  const executePasswordChange = async () => {
    setPasswordSaving(true);
    try {
      const response = await apiClient.post('/profile/password', {
        currentPassword,
        newPassword,
      });
      const successMessage = response?.message || labels.passwordChanged || 'Password changed successfully!';
      setSuccessModal({
        open: true,
        title: labels.passwordSuccessTitle || 'Password Changed',
        message: successMessage,
      });
      toast.success(successMessage);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setConfirmOpen(false);
    } catch (err) {
      const code = err?.response?.data?.code;
      const message = err?.response?.data?.message || '';
      let errorMessage = labels.passwordChangeFailed || 'Failed to change password';
      
      if (code === 'WRONG_CURRENT' || message.toLowerCase().includes('current')) {
        errorMessage = labels.wrongCurrentPassword || 'Current password is incorrect';
      } else if (code === 'SAME_PASSWORD') {
        errorMessage = labels.sameAsCurrent || 'New password must be different from the current one.';
      }
      
      setErrorModal({
        open: true,
        title: labels.passwordErrorTitle || 'Password Error',
        message: errorMessage,
      });
      toast.error(errorMessage);
    } finally {
      setPasswordSaving(false);
    }
  };

  if (profileLoading) {
    return (
      <>
        <SEOHead title={labels.editProfileTitle || 'Edit Profile'} />
        <PageLayout>
          <div className="profile-edit-page">
            <div className="profile-edit-shell">
              <Link href="/profile" className="auth-back-link">
                <ArrowLeft size={16} />
                <span>{labels.backToProfile || 'Back to Profile'}</span>
              </Link>

              <div className="profile-edit-header">
                <div className="profile-edit-avatar shimmer" />
                <div className="profile-edit-identity">
                  <span className="shimmer" style={{ width: '10rem', height: '1.25rem', display: 'block' }} />
                  <span className="shimmer" style={{ width: '8rem', height: '0.75rem', marginTop: '0.5rem', display: 'block' }} />
                </div>
                <span className="status-badge shimmer" style={{ width: '5rem', height: '1.5rem' }} />
              </div>

              <div className="profile-edit-grid">
                {Array.from({ length: 2 }).map((_, sectionIndex) => (
                  <div key={`section-shimmer-${sectionIndex}`} className="profile-edit-section">
                    <span className="shimmer" style={{ width: '10rem', height: '1rem', marginBottom: '1rem', display: 'block' }} />
                    {Array.from({ length: 3 }).map((_, fieldIndex) => (
                      <div key={`field-shimmer-${sectionIndex}-${fieldIndex}`} className="form-group">
                        <span className="shimmer" style={{ width: '6rem', height: '0.75rem', marginBottom: '0.375rem', display: 'block' }} />
                        <span className="shimmer" style={{ width: '100%', height: '2.75rem', borderRadius: '0.5rem', display: 'block' }} />
                      </div>
                    ))}
                    <span className="shimmer" style={{ width: '9rem', height: '2.5rem', borderRadius: '0.5rem', display: 'block' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PageLayout>
      </>
    );
  }

  return (
    <>
      <SEOHead title={labels.editProfileTitle || 'Edit Profile'} />
      <PageLayout>
        <div className="profile-edit-page">
          <div className="profile-edit-shell">
            <Link href="/profile" className="auth-back-link">
              <ArrowLeft size={16} />
              <span>{labels.backToProfile || 'Back to Profile'}</span>
            </Link>

            <div className="profile-edit-header">
              <div className="profile-edit-avatar">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} />
                ) : (
                  <span>{avatarInitial}</span>
                )}
              </div>
              <div className="profile-edit-identity">
                <h2>{displayName}</h2>
                <p className="profile-edit-meta">
                  <Calendar size={12} />
                  <span>{memberSinceText}</span>
                </p>
              </div>
              <span className={`status-badge ${isEnrolled ? 'approved' : 'pending'}`}>
                {isEnrolled ? labels.enrolled || 'Enrolled' : labels.notEnrolled || 'Not Enrolled'}
              </span>
            </div>

            <div className="profile-edit-grid">
              <form onSubmit={handleProfileSave} className="profile-edit-section" noValidate>
                <h3 className="profile-edit-section-title">
                  <User size={16} />
                  <span>{labels.personalInfoSection || 'Personal Information'}</span>
                </h3>

                <div className="form-group">
                  <label htmlFor="fullName">{labels.fullName || 'Full Name'}</label>
                  <div className="input-with-icon">
                    <User size={16} />
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: '' }));
                      }}
                      className={fieldErrors.fullName ? 'input-error' : ''}
                      aria-invalid={fieldErrors.fullName ? 'true' : 'false'}
                      required
                    />
                  </div>
                  {fieldErrors.fullName && <p className="profile-field-error">{fieldErrors.fullName}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">{labels.phone || 'Phone Number'}</label>
                  <div className="input-with-icon">
                    <Phone size={16} />
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: '' }));
                      }}
                      className={fieldErrors.phone ? 'input-error' : ''}
                      aria-invalid={fieldErrors.phone ? 'true' : 'false'}
                      required
                    />
                  </div>
                  {fieldErrors.phone && <p className="profile-field-error">{fieldErrors.phone}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">{labels.email || 'Email Address'}</label>
                  <div className="input-with-icon">
                    <Mail size={16} />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      className={fieldErrors.email ? 'input-error' : ''}
                      aria-invalid={fieldErrors.email ? 'true' : 'false'}
                      required
                    />
                  </div>
                  {fieldErrors.email ? (
                    <p className="profile-field-error">{fieldErrors.email}</p>
                  ) : (
                    <p className="form-hint">
                      {labels.emailNote || 'You can update your email address at any time.'}
                    </p>
                  )}
                </div>

                <div className="profile-edit-actions">
                  {isDirty && (
                    <span className="profile-dirty-pill">
                      {labels.unsavedChanges || 'Unsaved changes'}
                    </span>
                  )}
                  <button type="submit" className="btn-primary" disabled={!isDirty || profileSaving}>
                    <Save size={16} />
                    <span>{profileSaving ? labels.saving || 'Saving...' : labels.saveChanges || 'Save Changes'}</span>
                  </button>
                </div>
              </form>

              <form onSubmit={handlePasswordSubmit} className="profile-edit-section" id="password" noValidate>
                <h3 className="profile-edit-section-title">
                  <Lock size={16} />
                  <span>{labels.passwordSection || 'Change Password'}</span>
                </h3>
                <p className="profile-edit-section-subtitle">
                  {labels.passwordSubtitle || 'Update your password to keep your account secure'}
                </p>

                <div className="form-group">
                  <label htmlFor="currentPassword">{labels.currentPassword || 'Current Password'}</label>
                  <div className="input-with-icon input-with-toggle">
                    <Lock size={16} />
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="input-toggle-btn"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">{labels.newPassword || 'New Password'}</label>
                  <div className="input-with-icon input-with-toggle">
                    <Lock size={16} />
                    <input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="input-toggle-btn"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {newPassword && (
                    <div className="profile-strength" aria-live="polite">
                      <div className="profile-strength-bars">
                        {[1, 2, 3].map((segment) => (
                          <span
                            key={`strength-segment-${segment}`}
                            className={`profile-strength-bar ${
                              passwordStrength.level >= segment ? `filled-${strengthClassName}` : ''
                            }`}
                          />
                        ))}
                      </div>
                      <span className="profile-strength-label">
                        {labels.passwordStrength || 'Password strength'}:{' '}
                        {labels[passwordStrength.key] || ''}
                      </span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    {labels.confirmNewPassword || 'Confirm New Password'}
                  </label>
                  <div className="input-with-icon">
                    <Lock size={16} />
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div className="profile-edit-actions">
                  <button type="submit" className="btn-primary" disabled={passwordSaving}>
                    <Lock size={16} />
                    <span>
                      {passwordSaving
                        ? labels.changing || 'Changing...'
                        : labels.changePasswordBtn || 'Change Password'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Password change confirmation modal */}
        {confirmOpen && (
          <div className="modal-overlay" onClick={() => !passwordSaving && setConfirmOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>{labels.confirmTitle || 'Confirm Password Change'}</h3>
              <p>
                {labels.confirmDescription ||
                  'You are about to change your account password. You will need to use the new password next time you log in.'}
              </p>
              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setConfirmOpen(false)}
                  disabled={passwordSaving}
                >
                  {labels.cancelAction || 'Cancel'}
                </button>
                <button
                  className="btn-primary"
                  onClick={executePasswordChange}
                  disabled={passwordSaving}
                >
                  {passwordSaving
                    ? labels.changing || 'Changing...'
                    : labels.confirmAction || 'Yes, Change Password'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom success modal */}
        {successModal.open && (
          <div className="modal-overlay" onClick={() => setSuccessModal({ open: false, title: '', message: '' })}>
            <div className="modal-content modal-success" onClick={(e) => e.stopPropagation()}>
              <div className="modal-icon success">
                <CheckCircle size={32} />
              </div>
              <h3>{successModal.title}</h3>
              <p>{successModal.message}</p>
              <div className="modal-actions">
                <button
                  className="btn-primary"
                  onClick={() => setSuccessModal({ open: false, title: '', message: '' })}
                >
                  {labels.okAction || 'OK'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom error modal */}
        {errorModal.open && (
          <div className="modal-overlay" onClick={() => setErrorModal({ open: false, title: '', message: '' })}>
            <div className="modal-content modal-error" onClick={(e) => e.stopPropagation()}>
              <div className="modal-icon error">
                <XCircle size={32} />
              </div>
              <h3>{errorModal.title}</h3>
              <p>{errorModal.message}</p>
              <div className="modal-actions">
                <button
                  className="btn-primary"
                  onClick={() => setErrorModal({ open: false, title: '', message: '' })}
                >
                  {labels.okAction || 'OK'}
                </button>
              </div>
            </div>
          </div>
        )}
      </PageLayout>
    </>
  );
};

export default ProfileEditPage;