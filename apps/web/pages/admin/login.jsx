// /**
//  * @fileoverview Admin Login Page
//  * Separate authentication for admin users
//  * Path: apps/web/pages/admin/login.jsx
//  */

// import { useState } from 'react';
// import { useRouter } from 'next/router';
// import { Shield, Eye, EyeOff } from 'lucide-react';
// import SEOHead from '../../components/shared/SEOHead';
// import FloatingGlow from '../../components/shared/FloatingGlow';
// import { useToast } from '../../context/ToastContext';
// import apiClient from '../../lib/api';

// const AdminLoginPage = () => {
//   const router = useRouter();
//   const toast = useToast();

//   const [formData, setFormData] = useState({ username: '', password: '' });
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.username.trim() || !formData.password) {
//       toast.error('Please fill in all fields.');
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await apiClient.post('/auth/admin/login', {
//         username: formData.username.trim(),
//         password: formData.password,
//       });

//       if (response && response.success) {
//         localStorage.setItem('admin_token', response.data.token);
//         localStorage.setItem('admin_user', JSON.stringify(response.data.admin));
//         toast.success('Admin login successful.');
//         router.push('/admin');
//       } else {
//         toast.error(response?.message || 'Invalid credentials.');
//       }
//     } catch (err) {
//       const message = err?.response?.data?.message || 'Login failed. Invalid credentials.';
//       toast.error(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <SEOHead title="Admin Login" />
//       <div style={{ minHeight: '100vh', display: 'flex', position: 'relative', overflow: 'hidden', background: '#070b14', color: '#f8fafc', fontFamily: 'Satoshi, Inter, sans-serif' }}>
//         <FloatingGlow />
//         <main style={{ flex: 1, position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
//           <div style={{ width: '100%', maxWidth: '24rem' }}>
//             <div className="auth-card">
//               <div className="auth-icon">
//                 <Shield />
//               </div>
//               <h1 className="auth-title">Admin Login</h1>
//               <p className="auth-subtitle">Abyssinia Academy Admin Panel</p>

//               <form onSubmit={handleSubmit} className="auth-form">
//                 <div className="auth-field">
//                   <label>Username</label>
//                   <input
//                     type="text"
//                     value={formData.username}
//                     onChange={(e) => setFormData((p) => ({ ...p, username: e.target.value }))}
//                     placeholder="admin"
//                     className="auth-input"
//                     autoComplete="username"
//                   />
//                 </div>

//                 <div className="auth-field">
//                   <label>Password</label>
//                   <div className="auth-input-wrapper">
//                     <input
//                       type={showPassword ? 'text' : 'password'}
//                       value={formData.password}
//                       onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
//                       placeholder="••••••••"
//                       className="auth-input"
//                       autoComplete="current-password"
//                     />
//                     <button type="button" onClick={() => setShowPassword(!showPassword)} className="auth-toggle-password">
//                       {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
//                     </button>
//                   </div>
//                 </div>

//                 <button type="submit" disabled={loading} className="auth-submit-btn">
//                   {loading ? 'Logging in...' : 'Login'}
//                 </button>
//               </form>

//               <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '1rem' }}>
//                 Default: admin / admin2026
//               </p>
//             </div>
//           </div>
//         </main>
//       </div>
//     </>
//   );
// };

// export default AdminLoginPage;











/**
 * @fileoverview Admin Login Page
 *
 * Standalone authentication surface for the admin panel. Deliberately
 * renders outside AdminLayout so an unauthenticated visitor never sees
 * the sidebar shell.
 *
 * Security contract:
 *   - No credential hints are rendered anywhere in the UI. Default
 *     provisioning values live only in the seed script and environment.
 *   - Tokens persist through the shared storage layer so every consumer
 *     (api client, layout gate) reads the same keys.
 *   - Input length is bounded before submission to keep payloads sane.
 *
 * Path: apps/web/pages/admin/login.jsx
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import { Shield, Eye, EyeOff } from 'lucide-react';
import SEOHead from '../../components/shared/SEOHead';
import FloatingGlow from '../../components/shared/FloatingGlow';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../lib/api';
import { setItem } from '../../lib/storage';

const MAX_USERNAME_LENGTH = 100;
const MAX_PASSWORD_LENGTH = 200;

const AdminLoginPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const toast = useToast();

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const copy = t.admin?.login || {};

  const handleSubmit = async (event) => {
    event.preventDefault();

    const username = formData.username.trim();
    const password = formData.password;

    if (!username || !password) {
      toast.error(copy.requiredFields);
      return;
    }

    if (
      username.length > MAX_USERNAME_LENGTH ||
      password.length > MAX_PASSWORD_LENGTH
    ) {
      toast.error(copy.tooLong);
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/admin/login', {
        username,
        password,
      });

      if (response && response.success) {
        setItem('admin_token', response.data.token);
        setItem('admin_user', response.data.admin);
        toast.success(copy.success);
        router.push('/admin');
      } else {
        toast.error(response?.message || copy.invalidCredentials);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || copy.invalidCredentials
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead title={copy.pageTitle} />
      <div className="admin-login-page">
        <FloatingGlow />
        <main className="admin-login-main">
          <div className="admin-login-card">
            <div className="auth-card">
              <div className="auth-icon">
                <Shield />
              </div>
              <h1 className="auth-title">{copy.heading}</h1>
              <p className="auth-subtitle">{copy.subtitle}</p>

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-field">
                  <label htmlFor="admin-username">{copy.usernameLabel}</label>
                  <input
                    id="admin-username"
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, username: e.target.value }))
                    }
                    className="auth-input"
                    autoComplete="username"
                    maxLength={MAX_USERNAME_LENGTH}
                    required
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="admin-password">{copy.passwordLabel}</label>
                  <div className="auth-input-wrapper">
                    <input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, password: e.target.value }))
                      }
                      className="auth-input"
                      autoComplete="current-password"
                      maxLength={MAX_PASSWORD_LENGTH}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="auth-toggle-password"
                      aria-label={
                        showPassword ? copy.hidePassword : copy.showPassword
                      }
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="auth-submit-btn">
                  {loading ? copy.submitting : copy.submit}
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