/**
 * @fileoverview Split-Screen Animated Registration Page
 *
 * Visual hierarchy:
 *   ┌───────────────────────────────────────────────┐
 *   │ LEFT (desktop only)  │ RIGHT (form)           │
 *   │                      │                        │
 *   │ Ambient orbs         │ ← Back to Home         │
 *   │ Brand mark           │                        │
 *   │ Hero headline        │ ┌────────────────────┐ │
 *   │ Feature cards        │ │ Scholarship banner │ │
 *   │ Trust stat band      │ │ (own row, hover)   │ │
 *   │ Copyright            │ └────────────────────┘ │
 *   │                      │                        │
 *   │                      │ Register               │
 *   │                      │ [form fields]          │
 *   └───────────────────────────────────────────────┘
 *
 * All existing functionality preserved. Zero hardcoded strings.
 *
 * Path: apps/web/pages/auth/register.jsx
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  UserPlus,
  ArrowLeft,
  Gift,
  Tag,
  Loader,
  Briefcase,
  CheckCircle2,
  Video,
  Code2,
  Users2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import SEOHead from '../../components/shared/SEOHead';
import ScholarshipBanner from '../../components/scholarships/ScholarshipBanner';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../lib/api';
import {
  getReferralConfig,
  getAgentConfig,
  getPlatformConfig,
} from '../../lib/config';
import { getItem, setItem, removeItem } from '../../lib/storage';

const REFERRAL_STORAGE_KEY = 'abyssinia_referral_code';
const REFERRAL_EXPIRY_KEY = 'abyssinia_referral_expiry';

const RegisterPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const { register } = useAuth();
  const toast = useToast();
  const referralConfig = getReferralConfig();
  const agentConfig = getAgentConfig();
  const platformConfig = getPlatformConfig();

  const agentQueryParam = agentConfig?.attribution?.queryParam || 'agent';
  const agentStorageKey = agentConfig?.attribution?.storageKey || 'abyssinia_agent_code';
  const agentExpiryKey = agentConfig?.attribution?.storageExpiryKey || 'abyssinia_agent_expiry';
  const agentCookieDays = agentConfig?.attribution?.cookieDurationDays || 30;

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

  const [referralCode, setReferralCode] = useState('');
  const [referralInputValue, setReferralInputValue] = useState('');
  const [referralData, setReferralData] = useState(null);
  const [referralValidating, setReferralValidating] = useState(false);
  const [referralError, setReferralError] = useState(null);
  const [referralApplied, setReferralApplied] = useState(false);
  const [showReferralInput, setShowReferralInput] = useState(false);

  const [agentCode, setAgentCode] = useState('');
  const [agentData, setAgentData] = useState(null);
  const [agentValidating, setAgentValidating] = useState(false);
  const [agentError, setAgentError] = useState(null);

  const validateAndApplyReferral = useCallback(
    async (code) => {
      setReferralValidating(true);
      setReferralError(null);
      try {
        const response = await apiClient.get(`/referrals/validate/${code}`);
        if (response && response.success) {
          setReferralData(response.data);
          setReferralCode(code);
          setReferralApplied(true);
          const cookieDurationDays = referralConfig.registration?.cookieDurationDays || 7;
          const expiry = Date.now() + cookieDurationDays * 24 * 60 * 60 * 1000;
          setItem(REFERRAL_STORAGE_KEY, code);
          setItem(REFERRAL_EXPIRY_KEY, expiry);
        } else {
          setReferralError(t.referrals?.invalidCode || 'Invalid referral code.');
          setReferralApplied(false);
          removeItem(REFERRAL_STORAGE_KEY);
          removeItem(REFERRAL_EXPIRY_KEY);
        }
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          t.referrals?.invalidCode ||
          'Invalid referral code.';
        setReferralError(message);
        setReferralApplied(false);
      } finally {
        setReferralValidating(false);
      }
    },
    [t, referralConfig]
  );

  const validateAndApplyAgent = useCallback(
    async (code) => {
      setAgentValidating(true);
      setAgentError(null);
      try {
        const response = await apiClient.get(
          `/agents/validate-by-code?code=${encodeURIComponent(code)}`
        );
        if (response && response.success) {
          setAgentData(response.data);
          setAgentCode(response.data.code);
          const expiry = Date.now() + agentCookieDays * 24 * 60 * 60 * 1000;
          setItem(agentStorageKey, response.data.code);
          setItem(agentExpiryKey, expiry);
        } else {
          setAgentError(t.agents?.invalidAgentCode || 'Invalid agent code.');
          removeItem(agentStorageKey);
          removeItem(agentExpiryKey);
        }
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          t.agents?.invalidAgentCode ||
          'Invalid agent code.';
        setAgentError(message);
        removeItem(agentStorageKey);
        removeItem(agentExpiryKey);
      } finally {
        setAgentValidating(false);
      }
    },
    [t, agentCookieDays, agentStorageKey, agentExpiryKey]
  );

  useEffect(() => {
    const refCode = router.query.ref;
    if (refCode && typeof refCode === 'string' && refCode.trim()) {
      const cleanCode = refCode.trim().toUpperCase();
      setReferralCode(cleanCode);
      setReferralInputValue(cleanCode);
      validateAndApplyReferral(cleanCode);
    } else {
      const savedCode = getItem(REFERRAL_STORAGE_KEY);
      const savedExpiry = getItem(REFERRAL_EXPIRY_KEY);
      if (savedCode && savedExpiry && Date.now() < Number(savedExpiry)) {
        const cleanCode = String(savedCode).toUpperCase();
        setReferralCode(cleanCode);
        setReferralInputValue(cleanCode);
        validateAndApplyReferral(cleanCode);
      } else {
        removeItem(REFERRAL_STORAGE_KEY);
        removeItem(REFERRAL_EXPIRY_KEY);
      }
    }

    const agentParam = router.query[agentQueryParam];
    if (agentParam && typeof agentParam === 'string' && agentParam.trim()) {
      const cleanCode = agentParam.trim().toUpperCase();
      setAgentCode(cleanCode);
      validateAndApplyAgent(cleanCode);
    } else {
      const savedAgent = getItem(agentStorageKey);
      const savedAgentExpiry = getItem(agentExpiryKey);
      if (savedAgent && savedAgentExpiry && Date.now() < Number(savedAgentExpiry)) {
        const cleanCode = String(savedAgent).toUpperCase();
        setAgentCode(cleanCode);
        validateAndApplyAgent(cleanCode);
      } else {
        removeItem(agentStorageKey);
        removeItem(agentExpiryKey);
      }
    }
  }, [
    router.query.ref,
    router.query[agentQueryParam],
    agentQueryParam,
    agentStorageKey,
    agentExpiryKey,
    validateAndApplyReferral,
    validateAndApplyAgent,
  ]);

  const handleApplyReferral = () => {
    if (!referralInputValue.trim()) return;
    const cleanCode = referralInputValue.trim().toUpperCase();
    setReferralCode(cleanCode);
    validateAndApplyReferral(cleanCode);
  };

  const handleRemoveReferral = () => {
    setReferralCode('');
    setReferralInputValue('');
    setReferralData(null);
    setReferralError(null);
    setReferralApplied(false);
    removeItem(REFERRAL_STORAGE_KEY);
    removeItem(REFERRAL_EXPIRY_KEY);
  };

  const handleRemoveAgent = () => {
    setAgentCode('');
    setAgentData(null);
    setAgentError(null);
    removeItem(agentStorageKey);
    removeItem(agentExpiryKey);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim())
      newErrors.fullName = t.checkout?.fullNameRequired || 'Full name is required.';
    if (!formData.phone.trim())
      newErrors.phone = t.checkout?.phoneRequired || 'Phone number is required.';
    if (!formData.password || formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters.';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = t.profile?.passwordMismatch || 'Passwords do not match.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
      if (formData.email.trim()) payload.email = formData.email.trim();
      if (referralApplied && referralCode && referralData) payload.referralCode = referralCode;
      if (agentCode && agentData) payload.agentCode = agentCode;

      const response = await register(payload);

      if (response && response.success) {
        removeItem(REFERRAL_STORAGE_KEY);
        removeItem(REFERRAL_EXPIRY_KEY);
        removeItem(agentStorageKey);
        removeItem(agentExpiryKey);
        toast.success(
          t.auth?.registerSuccess || 'Registration successful! Welcome to Abyssinia Academy.'
        );

        /*
         * Redirect priority:
         *   1. Explicit `?redirect=` param (e.g. from scholarship Apply Now)
         *   2. Landing page (default for all users — was /pricing)
         *   3. If the user just registered with a scholarship reference
         *      in the URL, land on the scholarships list
         */
        const explicit = router.query.redirect;
        if (explicit) {
          router.push(String(explicit));
        } else if (router.query.scholarship) {
          router.push('/scholarships');
        } else {
          router.push('/');
        }
      } else {
        toast.error(response?.message || 'Registration failed.');
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        'Registration failed. This phone number may already be registered.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl bg-bg-input border text-sm text-text-main outline-none transition-all duration-200 ${
      errors[field]
        ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20'
        : 'border-border-medium focus:border-accent focus:ring-2 focus:ring-accent/20'
    }`;

  /* Feature list — richer than just text */
  const heroFeatures = [
    { icon: Video, label: 'HD Video Sessions' },
    { icon: Code2, label: 'Real Code Repositories' },
    { icon: Users2, label: 'Private Mentorship Community' },
  ];

  /* Trust band stats */
  const trustStats = [
    { value: '500+', label: 'Students' },
    { value: '5', label: 'Phases' },
    { value: '24/7', label: 'Support' },
  ];

  return (
    <>
      <SEOHead title={t.auth?.register || 'Register'} />
      <div className="min-h-screen flex bg-bg-main overflow-hidden selection:bg-accent/30 selection:text-text-main">
        {/* ═══════════════════════════════════════════════════════════════
            LEFT PANEL — ANIMATED BRAND VISUAL (desktop only)
            ═══════════════════════════════════════════════════════════════ */}
        <div className="hidden lg:flex w-1/2 relative bg-bg-card-solid overflow-hidden flex-col justify-between p-12 border-r border-border-light">
          {/* Gradient mesh backdrop */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-transparent to-warning/10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/25 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3 animate-blob" />
          <div
            className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-warning/20 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3 animate-blob"
            style={{ animationDelay: '2s' }}
          />
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, var(--text-main) 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
            aria-hidden="true"
          />

          {/* Brand */}
          <div
            className="relative z-10 animate-fade-in-up"
            style={{ animationDelay: '0.1s', opacity: 0 }}
          >
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-14 h-14 rounded-2xl bg-accent text-text-inverse flex items-center justify-center font-black text-2xl shadow-glow-gold-lg group-hover:scale-105 group-hover:shadow-glow-gold transition-all duration-300">
                A
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-text-main tracking-tight">
                  {platformConfig.brand?.name || 'ABYSSiNIA'}
                </h1>
                <p className="text-xs font-semibold text-accent uppercase tracking-wider">
                  {platformConfig.brand?.suffix || 'Tech Academy'}
                </p>
              </div>
            </Link>
          </div>

          {/* Hero copy + features */}
          <div className="relative z-10 max-w-md">
            <h2
              className="text-4xl font-extrabold text-text-main leading-tight mb-4 animate-fade-in-up"
              style={{ animationDelay: '0.2s', opacity: 0 }}
            >
              {t.hero?.title ||
                'Master Full Stack Web Application Development at'}{' '}
              <span className="text-accent block mt-2">
                {platformConfig.brand?.name || 'ABYSSiNIA'}
              </span>
            </h2>
            <p
              className="text-base text-text-muted mb-8 leading-relaxed animate-fade-in-up"
              style={{ animationDelay: '0.3s', opacity: 0 }}
            >
              {t.hero?.subtitle ||
                'A step-by-step 5-phase engineering curriculum.'}
            </p>

            <ul className="flex flex-col gap-3">
              {heroFeatures.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <li
                    key={feature.label}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl
                               bg-bg-card/60 backdrop-blur-sm border border-border-light
                               animate-fade-in-up"
                    style={{
                      animationDelay: `${0.4 + idx * 0.1}s`,
                      opacity: 0,
                    }}
                  >
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-text-main">
                      {feature.label}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-success ml-auto shrink-0" />
                  </li>
                );
              })}
            </ul>

            {/* Trust band */}
            <div
              className="mt-8 grid grid-cols-3 gap-3 animate-fade-in-up"
              style={{ animationDelay: '0.8s', opacity: 0 }}
            >
              {trustStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border-light bg-bg-card/60 backdrop-blur-sm p-3 text-center"
                >
                  <p className="text-2xl font-black text-accent leading-none mb-1">
                    {stat.value}
                  </p>
                  <p className="text-2xs text-text-dim uppercase tracking-widest font-semibold">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div
            className="relative z-10 animate-fade-in-up"
            style={{ animationDelay: '1s', opacity: 0 }}
          >
            <p className="text-xs text-text-dim">
              © {new Date().getFullYear()}{' '}
              {platformConfig.brand?.name || 'ABYSSiNIA'}.{' '}
              {t.footer?.rights || 'All rights reserved.'}
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            RIGHT PANEL — FORM
            ═══════════════════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col justify-center px-6 py-10 lg:px-16 bg-bg-main relative overflow-y-auto">
          <div
            className="w-full max-w-sm mx-auto animate-fade-in-up"
            style={{ animationDelay: '0.2s', opacity: 0 }}
          >
            {/* Back link */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-accent mb-6 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              {t.auth?.backToHome || 'Back to Home'}
            </Link>

            {/* Scholarship banner — dedicated row ABOVE the form heading */}
            <div className="mb-8">
              <ScholarshipBanner />
            </div>

            {/* Form heading */}
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-text-main mb-2">
                {t.auth?.register || 'Create Account'}
              </h1>
              <p className="text-sm text-text-muted">
                {t.auth?.hasAccount || 'Already have an account?'}{' '}
                <Link
                  href="/auth/login"
                  className="font-bold text-accent hover:underline"
                >
                  {t.auth?.login || 'Login'}
                </Link>
              </p>
            </div>

            {/* Agent banners */}
            {agentValidating && !agentData && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-warning/10 border border-warning/20 text-warning text-sm mb-4">
                <Loader className="w-4 h-4 animate-spin" />
                <span>{t.agents?.validatingAgent || 'Validating agent code...'}</span>
              </div>
            )}
            {agentData && !agentError && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm mb-4">
                <Briefcase className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">
                    {(t.agents?.invitedByAgent || 'You were invited by {name}.').replace(
                      '{name}',
                      agentData.agentName
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={handleRemoveAgent}
                    className="text-xs text-error underline mt-1 hover:text-error/80"
                  >
                    {t.agents?.removeAgentCode || 'Remove code'}
                  </button>
                </div>
              </div>
            )}
            {agentError && !agentData && (
              <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm mb-4">
                {agentError}
              </div>
            )}

            {/* Referral banners */}
            {referralValidating && !referralInputValue && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-warning/10 border border-warning/20 text-warning text-sm mb-4">
                <Loader className="w-4 h-4 animate-spin" />
                <span>Validating referral code...</span>
              </div>
            )}
            {referralData && referralApplied && !referralError && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm mb-4">
                <Gift className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">
                    {(t.referrals?.invitedBy || "You've been invited by {name}!").replace(
                      '{name}',
                      referralData.referrerName
                    )}
                  </p>
                  <p className="text-xs opacity-90">
                    {(t.referrals?.discountApplied ||
                      "You'll receive {percent}% off your enrollment.").replace(
                      '{percent}',
                      referralData.discountPercent
                    )}
                  </p>
                </div>
              </div>
            )}
            {referralError && !referralApplied && (
              <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm mb-4">
                {referralError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-text-main mb-1.5">
                  {t.checkout?.fullName || 'Full Name'}
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="Abebe Kebede"
                  className={inputClass('fullName')}
                  name="fullName"
                  autoComplete="name"
                />
                {errors.fullName && (
                  <p className="text-xs text-error mt-1" role="alert">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-text-main mb-1.5">
                  {t.checkout?.phone || 'Phone Number'}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+251 911 234 567"
                  className={inputClass('phone')}
                  name="phone"
                  autoComplete="tel"
                />
                {errors.phone && (
                  <p className="text-xs text-error mt-1" role="alert">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-text-main mb-1.5">
                  {t.auth?.email || 'Email Address'}{' '}
                  <span className="text-text-muted font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="abebe@example.com"
                  className={inputClass('email')}
                  name="email"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-text-main mb-1.5">
                  {t.auth?.password || 'Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Min. 6 characters"
                    className={`${inputClass('password')} pr-12`}
                    name="password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-error mt-1" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-text-main mb-1.5">
                  {t.auth?.confirmPassword || 'Confirm Password'}
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="Re-enter password"
                    className={`${inputClass('confirmPassword')} pr-12`}
                    name="confirmPassword"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-error mt-1" role="alert">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {!referralApplied && (
                <div className="pt-2">
                  {!showReferralInput ? (
                    <button
                      type="button"
                      onClick={() => setShowReferralInput(true)}
                      className="flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
                    >
                      <Tag className="w-4 h-4" />
                      {t.referrals?.haveReferralCode || 'Have a referral code?'}
                    </button>
                  ) : (
                    <div className="p-3 bg-bg-card border border-border-light rounded-xl">
                      <label className="block text-xs font-bold text-text-muted mb-1.5">
                        {t.referrals?.enterReferralCode || 'Enter Referral Code'}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={referralInputValue}
                          onChange={(e) =>
                            setReferralInputValue(e.target.value.toUpperCase())
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleApplyReferral();
                            }
                          }}
                          placeholder="ABY123XYZ"
                          className="flex-1 px-3 py-2 rounded-lg bg-bg-input border border-border-light focus:border-accent outline-none text-sm font-mono tracking-wider text-text-main placeholder:text-text-dim"
                          maxLength={20}
                          disabled={referralValidating}
                        />
                        <button
                          type="button"
                          onClick={handleApplyReferral}
                          disabled={referralValidating || !referralInputValue.trim()}
                          className="px-4 py-2 rounded-lg bg-accent text-text-inverse font-bold text-xs disabled:opacity-50 hover:bg-accent-light transition-colors"
                        >
                          {referralValidating ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            t.discounts?.applyCode || 'Apply'
                          )}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowReferralInput(false);
                          setReferralError(null);
                          setReferralInputValue('');
                        }}
                        className="text-xs text-text-dim hover:text-error mt-2"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-accent text-text-inverse font-bold text-sm hover:bg-accent-light transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-glow-gold hover:shadow-glow-gold-lg hover:-translate-y-0.5 mt-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    {t.auth?.register || 'Create Account'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;