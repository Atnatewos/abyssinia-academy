/**
 * @fileoverview Split-Screen Animated Login Page
 *
 * Visual system matched to register.jsx:
 *   - LEFT (desktop): animated orbs, brand, hero, feature cards, trust band
 *   - RIGHT: form with the scholarship banner in its own row above the
 *     "Welcome Back" heading
 *
 * Redirect logic after successful login:
 *   1. Explicit `?redirect=` param → that path
 *   2. Otherwise → landing page ('/')
 *
 * All strings via i18n. All colors via design tokens.
 *
 * Path: apps/web/pages/auth/login.jsx
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  LogIn,
  ArrowLeft,
  CheckCircle2,
  Video,
  Code2,
  Users2,
} from 'lucide-react';
import SEOHead from '../../components/shared/SEOHead';
import ScholarshipBanner from '../../components/scholarships/ScholarshipBanner';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getPlatformConfig } from '../../lib/config';

/* Feature list matches the register page for visual consistency */
const HERO_FEATURES = [
  { icon: Video, label: 'HD Video Sessions' },
  { icon: Code2, label: 'Real Code Repositories' },
  { icon: Users2, label: 'Private Mentorship Community' },
];

const TRUST_STATS = [
  { value: '500+', label: 'Students' },
  { value: '5', label: 'Phases' },
  { value: '24/7', label: 'Support' },
];

const LoginPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const { login } = useAuth();
  const toast = useToast();
  const platformConfig = getPlatformConfig();

  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.identifier.trim()) {
      newErrors.identifier =
        t.auth?.identifierRequired || 'Phone or email is required.';
    }
    if (!formData.password) {
      newErrors.password = t.auth?.passwordRequired || 'Password is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const trimmed = formData.identifier.trim();
      const looksLikeEmail = trimmed.includes('@');

      const response = await login({
        identifier: trimmed,
        phone: looksLikeEmail ? undefined : trimmed,
        email: looksLikeEmail ? trimmed : undefined,
        password: formData.password,
      });

      if (response && response.success) {
        toast.success(t.auth?.loginSuccess || 'Welcome back!');

        /*
         * Redirect priority:
         *   1. Explicit `?redirect=` param
         *   2. Landing page (default for all users)
         */
        const explicit = router.query.redirect;
        if (explicit) {
          router.push(String(explicit));
        } else {
          router.push('/');
        }
      } else {
        toast.error(
          response?.message || t.auth?.invalidCredentials || 'Invalid credentials.'
        );
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        t.auth?.loginFailed ||
        'Login failed. Please check your credentials.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead title={t.auth?.login || 'Login'} />
      <div className="min-h-screen flex bg-bg-main overflow-hidden selection:bg-accent/30 selection:text-text-main">
        {/* ═══════════════════════════════════════════════════════════
            LEFT PANEL — ANIMATED BRAND VISUAL (desktop only)
            ═══════════════════════════════════════════════════════════ */}
        <div className="hidden lg:flex w-1/2 relative bg-bg-card-solid overflow-hidden flex-col justify-between p-12 border-r border-border-light">
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
              {HERO_FEATURES.map((feature, idx) => {
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

            <div
              className="mt-8 grid grid-cols-3 gap-3 animate-fade-in-up"
              style={{ animationDelay: '0.8s', opacity: 0 }}
            >
              {TRUST_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border-light bg-bg-card/60 backdrop-blur-sm p-3 text-center"
                >
                  <p className="text-2xl font-black text-accent leading-none mb-1">
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-text-dim uppercase tracking-widest font-semibold">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

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

        {/* ═══════════════════════════════════════════════════════════
            RIGHT PANEL — FORM
            ═══════════════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 bg-bg-main relative">
          <div
            className="w-full max-w-sm mx-auto animate-fade-in-up"
            style={{ animationDelay: '0.2s', opacity: 0 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-accent mb-6 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              {t.auth?.backToHome || 'Back to Home'}
            </Link>

            <div className="mb-8">
              <ScholarshipBanner />
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-text-main mb-2">
                {t.auth?.welcomeBack || 'Welcome Back!'}
              </h1>
              <p className="text-sm text-text-muted">
                {t.auth?.noAccount || "Don't have an account?"}{' '}
                <Link
                  href="/auth/register"
                  className="font-bold text-accent hover:underline"
                >
                  {t.auth?.register || 'Create an account'}
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="login-identifier"
                  className="block text-sm font-bold text-text-main mb-1.5"
                >
                  {t.auth?.identifier || 'Phone Number or Email'}
                </label>
                <input
                  id="login-identifier"
                  type="text"
                  value={formData.identifier}
                  onChange={(e) => handleChange('identifier', e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 rounded-xl bg-bg-input border text-sm text-text-main outline-none transition-all duration-200 ${
                    errors.identifier
                      ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20'
                      : 'border-border-medium focus:border-accent focus:ring-2 focus:ring-accent/20'
                  }`}
                  autoComplete="username"
                  autoFocus
                />
                {errors.identifier && (
                  <p className="text-xs text-error mt-1.5" role="alert">
                    {errors.identifier}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-sm font-bold text-text-main"
                  >
                    {t.auth?.password || 'Password'}
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-semibold text-accent hover:underline"
                  >
                    {t.auth?.forgotPassword || 'Forgot password?'}
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 rounded-xl bg-bg-input border text-sm text-text-main outline-none transition-all duration-200 pr-12 ${
                      errors.password
                        ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20'
                        : 'border-border-medium focus:border-accent focus:ring-2 focus:ring-accent/20'
                    }`}
                    autoComplete="current-password"
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
                  <p className="text-xs text-error mt-1.5" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-accent text-text-inverse font-bold text-sm hover:bg-accent-light transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-glow-gold hover:shadow-glow-gold-lg hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <LogIn className="w-4 h-4 animate-spin" />
                    {t.auth?.loggingIn || 'Logging in...'}
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    {t.auth?.login || 'Login'}
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

export default LoginPage;