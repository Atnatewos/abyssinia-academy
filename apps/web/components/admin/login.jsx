/**
 * @fileoverview Admin Login Page
 * Separate login for admin users
 * Path: apps/web/pages/admin/login.jsx
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import { Shield, Eye, EyeOff } from 'lucide-react';
import SEOHead from '../../components/shared/SEOHead';
import FloatingGlow from '../../components/shared/FloatingGlow';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../lib/api';

/**
 * AdminLoginPage - Admin authentication form
 * Stores admin token separately from student token
 */
const AdminLoginPage = () => {
  const router = useRouter();
  const toast = useToast();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * Handle admin login submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.password) {
      toast.error('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post('/auth/admin/login', {
        username: formData.username.trim(),
        password: formData.password,
      });

      if (response && response.success) {
        localStorage.setItem('admin_token', response.data.token);
        localStorage.setItem('admin_user', JSON.stringify(response.data.admin));
        toast.success('Admin login successful.');
        router.push('/admin');
      } else {
        toast.error(response?.message || 'Invalid credentials.');
      }
    } catch (err) {
      const message = err?.response?.data?.message || 'Login failed. Invalid credentials.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead title="Admin Login" />

      <div className="min-h-screen font-sans transition-colors duration-300 flex relative overflow-x-hidden bg-[#070b14] text-slate-100">
        <FloatingGlow />

        <main className="flex-1 relative z-10 flex items-center justify-center px-4">
          <div className="w-full max-w-sm">
            <div className="glass-card rounded-3xl p-8 border-amber-500/20 shadow-2xl animate-scale-bounce">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto mb-4">
                  <Shield className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  Admin Login
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Abyssinia Academy Admin Panel
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData((p) => ({ ...p, username: e.target.value }))}
                    placeholder="admin"
                    className="glass-input"
                    autoComplete="username"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                      placeholder="••••••••"
                      className="glass-input pr-10"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminLoginPage;