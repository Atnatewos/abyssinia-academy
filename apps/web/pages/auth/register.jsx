/**
 * @fileoverview Registration Page
 * New student account creation form
 * Path: apps/web/pages/auth/register.jsx
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus, ArrowLeft } from 'lucide-react';
import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const RegisterPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const { register } = useAuth();
  const toast = useToast();

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

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required.';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required.';
    if (!formData.password || formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
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
      if (formData.email.trim()) {
        payload.email = formData.email.trim();
      }

      console.log('📤 Sending registration payload:', payload);

      const response = await register(payload);

      console.log('📥 Registration response:', response);

      if (response && response.success) {
        toast.success('Registration successful! Welcome to Abyssinia Academy.');
        router.push(router.query.redirect || '/pricing');
      } else {
        toast.error(response?.message || 'Registration failed.');
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.join(', ') ||
        'Registration failed. This phone number may already be registered.';
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
              <div className="auth-icon">
                <UserPlus />
              </div>
              <h1 className="auth-title">{t.auth?.register || 'Create Account'}</h1>
              <p className="auth-subtitle">Join Abyssinia Academy and start learning</p>

              <form onSubmit={handleSubmit} className="auth-form">
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
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="auth-toggle-password">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="auth-error">{errors.password}</p>}
                </div>

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
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="auth-toggle-password">
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="auth-error">{errors.confirmPassword}</p>}
                </div>

                <button type="submit" disabled={loading} className="auth-submit-btn">
                  {loading ? 'Creating account...' : t.auth?.register || 'Create Account'}
                </button>
              </form>

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