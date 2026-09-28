/**
 * @fileoverview Login Page
 *
 * Student authentication page. One identifier field accepts phone OR
 * email. The submit payload includes every alias the API understands
 * (identifier / phone / email) so backend and frontend can never
 * drift out of sync again.
 *
 * Path: apps/web/pages/auth/login.jsx
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';
import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

/**
 * LoginPage — Student login form supporting phone or email.
 */
const LoginPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const { login } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  /**
   * Updates a single form field and clears its validation error.
   *
   * @param {string} field - Field name
   * @param {string} value - New value
   */
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  /**
   * Validates the login form before submission.
   *
   * @returns {boolean} True if all fields are valid
   */
  const validateForm = () => {
    const newErrors = {};
    if (!formData.identifier.trim()) {
      newErrors.identifier = t.auth?.identifierRequired || 'Phone number or email is required.';
    }
    if (!formData.password) {
      newErrors.password = t.auth?.passwordRequired || 'Password is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Submits credentials with every identifier alias so the API
   * accepts the payload regardless of which field name it reads.
   *
   * @param {React.FormEvent} e - Form submission event
   */
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
      <PageLayout>
        <div
          className="auth-page"
          style={{ display: 'flex', justifyContent: 'center', padding: '3rem 1rem' }}
        >
          <div style={{ width: '100%', maxWidth: '28rem' }}>
            <Link href="/" className="auth-back-link">
              <ArrowLeft />
              {t.auth?.backToHome || 'Back to Home'}
            </Link>

            <div className="auth-card">
              <div className="auth-icon">
                <LogIn />
              </div>
              <h1 className="auth-title">{t.auth?.login || 'Login'}</h1>
              <p className="auth-subtitle">
                {t.auth?.welcomeBack || 'Welcome back to Abyssinia Academy'}
              </p>

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-field">
                  <label>{t.auth?.identifier || 'Phone Number or Email'}</label>
                  <input
                    type="text"
                    value={formData.identifier}
                    onChange={(e) => handleChange('identifier', e.target.value)}
                    placeholder={t.auth?.identifierPlaceholder || '+251 911 234 567 or email@example.com'}
                    className={`auth-input ${errors.identifier ? 'error' : ''}`}
                    autoComplete="username"
                    autoFocus
                  />
                  {errors.identifier && <p className="auth-error">{errors.identifier}</p>}
                </div>

                <div className="auth-field">
                  <label>{t.auth?.password || 'Password'}</label>
                  <div className="auth-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="••••••••"
                      className={`auth-input ${errors.password ? 'error' : ''}`}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="auth-toggle-password"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                  {errors.password && <p className="auth-error">{errors.password}</p>}
                </div>

                <button type="submit" disabled={loading} className="auth-submit-btn">
                  {loading ? t.auth?.loggingIn || 'Logging in...' : t.auth?.login || 'Login'}
                </button>
              </form>

              <p className="auth-link">
                {t.auth?.noAccount || "Don't have an account?"}{' '}
                <Link href="/auth/register">{t.auth?.register || 'Register'}</Link>
              </p>
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  );
};

export default LoginPage;