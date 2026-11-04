/**
 * @fileoverview Split-Screen Animated Login Page
 *
 * Professional split-screen layout with a rich, animated brand visual on
 * the left and a clean, minimal form on the right. Fully responsive using
 * the unified Tailwind design system. Automatically respects the user's
 * language and theme preferences via the global contexts.
 *
 * Path: apps/web/pages/auth/login.jsx
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Eye, EyeOff, LogIn, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import SEOHead from '../../components/shared/SEOHead';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getPlatformConfig } from '../../lib/config';

const LoginPage = () => {
  const router = useRouter();
  const { t, language } = useLanguage();
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
      newErrors.identifier = t.auth?.identifierRequired || 'Phone or email is required.';
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
        router.push(router.query.redirect || '/portal');
      } else {
        toast.error(response?.message || t.auth?.invalidCredentials || 'Invalid credentials.');
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
        
        {/* ── LEFT PANEL: ANIMATED BRAND VISUAL (Hidden on Mobile) ── */}
        <div className="hidden lg:flex w-1/2 relative bg-bg-card-solid overflow-hidden flex-col justify-between p-12 border-r border-border-light">
          {/* Animated Ambient Globs */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/25 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3 animate-blob" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-warning/20 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3 animate-blob" style={{ animationDelay: '2s' }} />
          
          {/* Abstract Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

          {/* Logo & Brand */}
          <div className="relative z-10 animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-accent text-bg-main flex items-center justify-center font-black text-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:scale-105 transition-transform duration-300">
                A
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-text-main tracking-tight">
                  {platformConfig.brand?.name || 'ABYSSiNIA'}
                </h1>
                <p className="text-xs font-medium text-text-muted">
                  {platformConfig.brand?.suffix || 'Tech Academy'}
                </p>
              </div>
            </Link>
          </div>

          {/* Hero Copy (From Config) */}
          <div className="relative z-10 max-w-md">
            <h2 className="text-4xl font-extrabold text-text-main leading-tight mb-4 animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
              {t.hero?.title || 'Master Full Stack Web Application Development at'}{' '}
              <span className="text-accent block mt-2">{platformConfig.brand?.name || 'ABYSSiNIA'}</span>
            </h2>
            <p className="text-base text-text-muted mb-8 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
              {t.hero?.subtitle || 'A step-by-step 5-phase engineering curriculum.'}
            </p>
            <ul className="space-y-3">
              {[
                t.landing?.features?.cards?.[0]?.title || 'HD Video Sessions',
                t.landing?.features?.cards?.[1]?.title || 'Real Code Repositories',
                t.landing?.features?.cards?.[2]?.title || 'Private Mentorship Community',
              ].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm font-medium text-text-main animate-fade-in-up" style={{ animationDelay: `${0.4 + (idx * 0.1)}s`, opacity: 0 }}>
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <div className="relative z-10 animate-fade-in-up" style={{ animationDelay: '0.7s', opacity: 0 }}>
            <p className="text-xs text-text-dim">
              © {new Date().getFullYear()} {platformConfig.brand?.name || 'ABYSSiNIA'}. {t.footer?.rights || 'All rights reserved.'}
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL: THE FORM ── */}
        <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 bg-bg-main relative">
          <div className="w-full max-w-sm mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
            
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-accent mb-8 transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              {t.auth?.backToHome || 'Back to Home'}
            </Link>

            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-text-main mb-2">
                {t.auth?.welcomeBack || 'Welcome Back!'}
              </h1>
              <p className="text-sm text-text-muted">
                {t.auth?.noAccount || "Don't have an account?"}{' '}
                <Link href="/auth/register" className="font-bold text-accent hover:underline">
                  {t.auth?.register || 'Create an account'}
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-text-main mb-1.5">
                  {t.auth?.identifier || 'Phone Number or Email'}
                </label>
                <input
                  type="text"
                  value={formData.identifier}
                  onChange={(e) => handleChange('identifier', e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 rounded-xl bg-bg-card border text-sm text-text-main outline-none transition-all duration-200 ${
                    errors.identifier ? 'border-error focus:border-error' : 'border-border-light focus:border-accent focus:ring-2 focus:ring-accent/20'
                  }`}
                  autoComplete="username"
                  autoFocus
                />
                {errors.identifier && <p className="text-xs text-error mt-1.5">{errors.identifier}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-bold text-text-main">
                    {t.auth?.password || 'Password'}
                  </label>
                  <Link href="/auth/forgot-password" className="text-xs font-semibold text-accent hover:underline">
                    {t.auth?.forgotPassword || 'Forgot password?'}
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 rounded-xl bg-bg-card border text-sm text-text-main outline-none transition-all duration-200 pr-12 ${
                      errors.password ? 'border-error focus:border-error' : 'border-border-light focus:border-accent focus:ring-2 focus:ring-accent/20'
                    }`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-error mt-1.5">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-accent text-bg-main font-bold text-sm hover:bg-accent-light transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(245,158,11,0.25)] hover:shadow-[0_6px_25px_rgba(245,158,11,0.4)] hover:-translate-y-0.5"
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