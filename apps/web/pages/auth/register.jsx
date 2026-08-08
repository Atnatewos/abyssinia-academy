/**
 * @fileoverview Registration Page
 * New student account creation form with persistent referral code support.
 * Referral code persists across refreshes and navigation via localStorage.
 * Auto-expires after 7 days (configurable in referrals.config.js).
 * Accepts ?ref= parameter from referral links OR manual referral code input.
 * 
 * Path: apps/web/pages/auth/register.jsx
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus, ArrowLeft, Gift, Tag, Check, Loader } from 'lucide-react';
import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../lib/api';
import { getReferralConfig } from '../../lib/config';
import { getItem, setItem, removeItem } from '../../lib/storage';

const REFERRAL_STORAGE_KEY = 'abyssinia_referral_code';
const REFERRAL_EXPIRY_KEY = 'abyssinia_referral_expiry';

/**
 * RegisterPage — Student registration with persistent referral code.
 * Referral code survives browser refreshes, navigation, and closing/reopening.
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
   * Referral state — persists via localStorage
   */
  const [referralCode, setReferralCode] = useState('');
  const [referralInputValue, setReferralInputValue] = useState('');
  const [referralData, setReferralData] = useState(null);
  const [referralValidating, setReferralValidating] = useState(false);
  const [referralError, setReferralError] = useState(null);
  const [referralApplied, setReferralApplied] = useState(false);
  const [showReferralInput, setShowReferralInput] = useState(false);

  /*
   * On mount: check URL param first, then localStorage fallback
   * Priority: URL ?ref= > localStorage (if not expired) > nothing
   */
  useEffect(() => {
    const refCode = router.query.ref;

    if (refCode && typeof refCode === 'string' && refCode.trim()) {
      /*
       * URL has a referral code — use it and save to localStorage
       */
      const cleanCode = refCode.trim().toUpperCase();
      setReferralCode(cleanCode);
      setReferralInputValue(cleanCode);

      /*
       * Save to localStorage with 7-day expiry
       */
      const cookieDurationDays = referralConfig.registration?.cookieDurationDays || 7;
      const expiry = Date.now() + cookieDurationDays * 24 * 60 * 60 * 1000;
      setItem(REFERRAL_STORAGE_KEY, cleanCode);
      setItem(REFERRAL_EXPIRY_KEY, expiry);

      validateAndApplyReferral(cleanCode);
    } else {
      /*
       * No URL param — check localStorage for a saved referral code
       */
      const savedCode = getItem(REFERRAL_STORAGE_KEY);
      const savedExpiry = getItem(REFERRAL_EXPIRY_KEY);

      if (savedCode && savedExpiry) {
        /*
         * Check if the saved code has expired
         */
        if (Date.now() < savedExpiry) {
          /*
           * Code is still valid — auto-apply it
           */
          const cleanCode = savedCode.toUpperCase();
          setReferralCode(cleanCode);
          setReferralInputValue(cleanCode);
          validateAndApplyReferral(cleanCode);
        } else {
          /*
           * Code has expired — clean up localStorage
           */
          removeItem(REFERRAL_STORAGE_KEY);
          removeItem(REFERRAL_EXPIRY_KEY);
        }
      }
    }
  }, [router.query.ref]);

  /**
   * Validate a referral code against the API and apply if valid.
   * On success, saves to localStorage for persistence.
   */
  const validateAndApplyReferral = async (code) => {
    setReferralValidating(true);
    setReferralError(null);

    try {
      const response = await apiClient.get(`/referrals/validate/${code}`);

      if (response && response.success) {
        setReferralData(response.data);
        setReferralCode(code);
        setReferralApplied(true);

        /*
         * Save to localStorage so it survives refreshes
         */
        const cookieDurationDays = referralConfig.registration?.cookieDurationDays || 7;
        const expiry = Date.now() + cookieDurationDays * 24 * 60 * 60 * 1000;
        setItem(REFERRAL_STORAGE_KEY, code);
        setItem(REFERRAL_EXPIRY_KEY, expiry);
      } else {
        setReferralError(t.referrals?.invalidCode || 'Invalid referral code.');
        setReferralApplied(false);

        /*
         * Invalid code — clear from localStorage
         */
        removeItem(REFERRAL_STORAGE_KEY);
        removeItem(REFERRAL_EXPIRY_KEY);
      }
    } catch (err) {
      const message = err?.response?.data?.message
        || t.referrals?.invalidCode
        || 'Invalid referral code.';
      setReferralError(message);
      setReferralApplied(false);
    } finally {
      setReferralValidating(false);
    }
  };

  /**
   * Handle manual referral code apply button.
   * Saves to localStorage on success.
   */
  const handleApplyReferral = () => {
    if (!referralInputValue.trim()) return;

    const cleanCode = referralInputValue.trim().toUpperCase();
    setReferralCode(cleanCode);
    validateAndApplyReferral(cleanCode);
  };

  /**
   * Remove the applied referral code.
   * Clears from state AND localStorage.
   */
  const handleRemoveReferral = () => {
    setReferralCode('');
    setReferralInputValue('');
    setReferralData(null);
    setReferralError(null);
    setReferralApplied(false);
    removeItem(REFERRAL_STORAGE_KEY);
    removeItem(REFERRAL_EXPIRY_KEY);
  };

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
   * Handle form submission.
   * Clears saved referral code from localStorage on successful registration.
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
      if (referralApplied && referralCode && referralData) {
        payload.referralCode = referralCode;
      }

      const response = await register(payload);

      if (response && response.success) {
        /*
         * Registration successful — clear saved referral code
         * since it's been used
         */
        removeItem(REFERRAL_STORAGE_KEY);
        removeItem(REFERRAL_EXPIRY_KEY);

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

              {/* ── Referral Banner (auto-applied from URL or localStorage) ── */}
              {referralValidating && !referralInputValue && (
                <div className="referral-register-banner loading">
                  <span>Validating referral code...</span>
                </div>
              )}

              {referralData && referralApplied && !referralError && (
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

              {referralError && !referralApplied && (
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

                {/* ── Manual Referral Code Input ── */}
                {!referralApplied && (
                  <div className="auth-field">
                    {!showReferralInput ? (
                      <button
                        type="button"
                        onClick={() => setShowReferralInput(true)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.8125rem',
                          color: 'var(--accent-gold)',
                          fontWeight: 600,
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        <Tag size={14} />
                        {t.referrals?.haveReferralCode || 'Have a referral code?'}
                      </button>
                    ) : (
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.375rem', display: 'block' }}>
                          {t.referrals?.enterReferralCode || 'Enter Referral Code'}
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input
                            type="text"
                            value={referralInputValue}
                            onChange={(e) => setReferralInputValue(e.target.value.toUpperCase())}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleApplyReferral(); } }}
                            placeholder="ABY123XYZ"
                            className="auth-input"
                            style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', flex: 1 }}
                            maxLength={20}
                            disabled={referralValidating}
                          />
                          <button
                            type="button"
                            onClick={handleApplyReferral}
                            disabled={referralValidating || !referralInputValue.trim()}
                            style={{
                              padding: '0.5rem 1rem',
                              borderRadius: '0.5rem',
                              background: 'var(--accent-gold)',
                              color: '#0f172a',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              border: 'none',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              opacity: referralValidating || !referralInputValue.trim() ? 0.5 : 1,
                            }}
                          >
                            {referralValidating ? (
                              <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : (
                              t.discounts?.applyCode || 'Apply'
                            )}
                          </button>
                        </div>
                        {referralError && (
                          <p style={{ fontSize: '0.6875rem', color: '#ef4444', marginTop: '0.25rem' }}>{referralError}</p>
                        )}
                        <button
                          type="button"
                          onClick={() => { setShowReferralInput(false); setReferralError(null); setReferralInputValue(''); }}
                          style={{
                            fontSize: '0.6875rem',
                            color: 'var(--text-dim)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            marginTop: '0.25rem',
                            padding: 0,
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Applied Referral Code Display */}
                {referralApplied && referralCode && (
                  <div className="auth-field">
                    <label>{t.referrals?.referralCodeApplied || 'Referral Code Applied'}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={referralCode}
                        readOnly
                        className="auth-input"
                        style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.3)', flex: 1 }}
                      />
                      <Check size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                      {referralConfig.registration?.allowCodeChange !== false && (
                        <button
                          type="button"
                          onClick={handleRemoveReferral}
                          style={{
                            fontSize: '0.6875rem',
                            color: '#ef4444',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            padding: '0.25rem 0.5rem',
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {referralData && (
                      <p style={{ fontSize: '0.6875rem', color: '#10b981', marginTop: '0.25rem' }}>
                        {(t.referrals?.discountApplied || 'You\'ll receive {percent}% off your enrollment.')
                          .replace('{percent}', referralData.discountPercent)}
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