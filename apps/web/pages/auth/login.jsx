/**
 * @fileoverview Login Page
 * Student authentication with phone and password
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
 * LoginPage - Student login form
 */
const LoginPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const { login } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required.';
    if (!formData.password) newErrors.password = 'Password is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await login({ phone: formData.phone.trim(), password: formData.password });
      if (response && response.success) {
        toast.success('Welcome back!');
        router.push(router.query.redirect || '/portal');
      } else {
        toast.error('Invalid credentials.');
      }
    } catch (err) {
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead title={t.auth?.login || 'Login'} />
      <PageLayout>
        <div className="auth-page" style={{ display: 'flex', justifyContent: 'center', padding: '3rem 1rem' }}>
          <div style={{ width: '100%', maxWidth: '28rem' }}>
            <Link href="/" className="auth-back-link">
              <ArrowLeft />
              Back to Home
            </Link>

            <div className="auth-card">
              <div className="auth-icon">
                <LogIn />
              </div>
              <h1 className="auth-title">{t.auth?.login || 'Login'}</h1>
              <p className="auth-subtitle">Welcome back to Abyssinia Academy</p>

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-field">
                  <label>{t.checkout?.phone || 'Phone Number'}</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+251 911 234 567"
                    className={`auth-input ${errors.phone ? 'error' : ''}`}
                  />
                  {errors.phone && <p className="auth-error">{errors.phone}</p>}
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
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="auth-toggle-password">
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                  {errors.password && <p className="auth-error">{errors.password}</p>}
                </div>

                <button type="submit" disabled={loading} className="auth-submit-btn">
                  {loading ? 'Logging in...' : t.auth?.login || 'Login'}
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