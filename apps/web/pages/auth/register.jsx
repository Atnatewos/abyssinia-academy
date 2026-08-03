/**
 * @fileoverview Registration Page
 * New student account creation form with referral code support.
 * Accepts ?ref= parameter from referral links.
 * Path: apps/web/pages/auth/register.jsx
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus, ArrowLeft, Gift } from 'lucide-react';
import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../lib/api';
import { getReferralConfig } from '../../lib/config';

/**
 * RegisterPage — Student registration with optional referral code.
 * If a ?ref= parameter is present in the URL, the referral code is
 * automatically applied and validated.
 */
const RegisterPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const { register } = useAuth();
  const toast = useToast();
  const referralConfig = getReferralConfig();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  /*
   * Referral state
   */
  const [referralCode, setReferralCode] = useState('');
  const [referralData, setReferralData] = useState(null);
  const [referralValidating, setReferralValidating] = useState(false);
  const [referralError, setReferralError] = useState(null);

  /*
   * Extract referral code from URL query parameter on mount
   */
  useEffect(() => {
    const refCode = router.query.ref;

    if (refCode && typeof refCode === 'string' && refCode.trim()) {
      const cleanCode = refCode.trim().toUpperCase();
      setReferralCode(cleanCode);

      /*
       * Validate the referral code against the API
       */
      const validateReferralCode = async () => {
        setReferralValidating(true);
        setReferralError(null);

        try {
          const response = await apiClient.get(`/referrals/validate/${cleanCode}`);

          if (response && response.success) {
            setReferralData(response.data);
          } else {
            setReferralError(t.referrals?.invalidCode || 'Invalid referral code.');
          }
        } catch (err) {
          const message = err?.response?.data?.message
            || t.referrals?.invalidCode
            || 'Invalid referral code.';
          setReferralError(message);
        } finally {
          setReferralValidating(false);
        }
      };

      validateReferralCode();
    }
  }, [router.query.ref, t]);

  /**
   * Handle form field changes
   */
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  /**
   * Validate the registration form
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t.checkout?.fullNameRequired || 'Full name is required.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t.checkout?.phoneRequired || 'Phone number is required.';
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t.profile?.passwordMismatch || 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      };

      if (formData.email.trim()) {
        payload.email = formData.email.trim();
      }

      /*
       * Attach referral code if present and valid
       */
      if (referralCode && referralData) {
        payload.referralCode = referralCode;
      }

      const response = await register(payload);

      if (response && response.success) {
        toast.success('Registration successful! Welcome to Abyssinia Academy.');
        router.push(router.query.redirect || '/pricing');
      } else {
        toast.error(response?.message || 'Registration failed.');
      }
    } catch (err) {
      const message = err?.response?.data?.message
        || 'Registration failed. This phone number may already be registered.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead title={t.auth?.register || 'Register'} />
      <PageLayout>
        <div className="auth-page" style={{ display: 'flex', justifyContent: 'center', padding: '3rem 1rem' }}>
          <div style={{ width: '100%', maxWidth: '28rem' }}>
            <Link href="/" className="auth-back-link">
              <ArrowLeft />
              Back to Home
            </Link>

            <div className="auth-card">

              {/* Auth Icon */}
              <div className="auth-icon">
                <UserPlus />
              </div>

              <h1 className="auth-title">{t.auth?.register || 'Create Account'}</h1>
              <p className="auth-subtitle">Join Abyssinia Academy and start learning</p>

              {/* Referral Banner */}
              {referralValidating && (
                <div className="referral-register-banner loading">
                  <span>Validating referral code...</span>
                </div>
              )}

              {referralData && !referralError && (
                <div className="referral-register-banner success">
                  <Gift size={18} />
                  <div>
                    <p className="referral-register-banner-title">
                      {(t.referrals?.invitedBy || 'You\'ve been invited by {name}!')
                        .replace('{name}', referralData.referrerName)}
                    </p>
                    <p className="referral-register-banner-desc">
                      {(t.referrals?.discountApplied || 'You\'ll receive {percent}% off your enrollment.')
                        .replace('{percent}', referralData.discountPercent)}
                    </p>
                  </div>
                </div>
              )}

              {referralError && (
                <div className="referral-register-banner error">
                  <span>{referralError}</span>
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="auth-form">

                {/* Full Name */}
                <div className="auth-field">
                  <label>{t.checkout?.fullName || 'Full Name'}</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    placeholder="Abebe Kebede"
                    className={`auth-input ${errors.fullName ? 'error' : ''}`}
                    name="fullName"
                  />
                  {errors.fullName && <p className="auth-error">{errors.fullName}</p>}
                </div>

                {/* Phone */}
                <div className="auth-field">
                  <label>{t.checkout?.phone || 'Phone Number'}</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+251 911 234 567"
                    className={`auth-input ${errors.phone ? 'error' : ''}`}
                    name="phone"
                  />
                  {errors.phone && <p className="auth-error">{errors.phone}</p>}
                </div>

                {/* Email */}
                <div className="auth-field">
                  <label>
                    {t.auth?.email || 'Email Address'}{' '}
                    <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="abebe@example.com"
                    className="auth-input"
                    name="email"
                  />
                </div>

                {/* Password */}
                <div className="auth-field">
                  <label>{t.auth?.password || 'Password'}</label>
                  <div className="auth-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="Min. 6 characters"
                      className={`auth-input ${errors.password ? 'error' : ''}`}
                      name="password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="auth-toggle-password"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="auth-error">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div className="auth-field">
                  <label>{t.auth?.confirmPassword || 'Confirm Password'}</label>
                  <div className="auth-input-wrapper">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      placeholder="Re-enter your password"
                      className={`auth-input ${errors.confirmPassword ? 'error' : ''}`}
                      name="confirmPassword"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="auth-toggle-password"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="auth-error">{errors.confirmPassword}</p>}
                </div>

                {/* Referral Code Display (read-only if from URL) */}
                {referralCode && (
                  <div className="auth-field">
                    <label>{t.referrals?.yourCode || 'Referral Code'}</label>
                    <input
                      type="text"
                      value={referralCode}
                      readOnly={referralConfig.registration?.allowCodeChange === false}
                      className="auth-input"
                      style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}
                    />
                    {referralData && (
                      <p style={{ fontSize: '0.6875rem', color: '#10b981', marginTop: '0.25rem' }}>
                        {(t.referrals?.referralCodeApplied || 'Referral code applied: {code}')
                          .replace('{code}', referralCode)}
                      </p>
                    )}
                  </div>
                )}

                {/* Submit */}
                <button type="submit" disabled={loading} className="auth-submit-btn">
                  {loading ? 'Creating account...' : t.auth?.register || 'Create Account'}
                </button>
              </form>

              {/* Login Link */}
              <p className="auth-link">
                {t.auth?.hasAccount || 'Already have an account?'}{' '}
                <Link href="/auth/login">{t.auth?.login || 'Login'}</Link>
              </p>
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  );
};

export default RegisterPage;