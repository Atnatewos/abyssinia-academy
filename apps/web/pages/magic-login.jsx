/**
 * @fileoverview Animated Magic Login Page
 *
 * Used by admins for impersonation or by users for password resets.
 * Reads the token from the URL, swaps it for a valid session, and redirects.
 * Inherits the split-screen aesthetic for brand consistency.
 *
 * Path: apps/web/pages/magic-login.jsx
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import SEOHead from '../components/shared/SEOHead';
import apiClient from '../lib/api';
import { setAuth } from '../lib/auth';
import { getPlatformConfig } from '../lib/config';
import { useLanguage } from '../context/LanguageContext';

const MagicLoginPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const { token } = router.query;
  const [status, setStatus] = useState('authenticating');
  const [errorMsg, setErrorMsg] = useState('');
  const platformConfig = getPlatformConfig();

  useEffect(() => {
    if (!token) return;

    const authenticate = async () => {
      try {
        const res = await apiClient.post('/auth/magic-login', { token });
        if (res.success) {
          setAuth(res.data.token, res.data.user);
          setStatus('success');
          setTimeout(() => router.push('/profile'), 1500);
        } else {
          setStatus('error');
          setErrorMsg(res.message || 'Invalid or expired link.');
        }
      } catch (err) {
        setStatus('error');
        setErrorMsg(err?.response?.data?.message || 'Invalid or expired link.');
      }
    };

    authenticate();
  }, [token, router]);

  return (
    <>
      <SEOHead title="Magic Login" />
      <div className="min-h-screen flex bg-bg-main overflow-hidden items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3 animate-blob" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-warning/15 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3 animate-blob" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 w-full max-w-md bg-bg-card-solid border border-border-light rounded-3xl p-10 text-center shadow-2xl animate-scale-up">
          
          <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6">
            {status === 'authenticating' && <Loader2 className="w-8 h-8 text-accent animate-spin" />}
            {status === 'success' && <CheckCircle2 className="w-8 h-8 text-success" />}
            {status === 'error' && <XCircle className="w-8 h-8 text-error" />}
          </div>

          {status === 'authenticating' && (
            <>
              <h2 className="text-2xl font-extrabold text-text-main mb-2">{t.auth?.authenticating || 'Authenticating...'}</h2>
              <p className="text-sm text-text-muted">{t.auth?.authWait || 'Please wait while we verify your secure link.'}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <h2 className="text-2xl font-extrabold text-success mb-2">{t.auth?.loginSuccessTitle || 'Login Successful!'}</h2>
              <p className="text-sm text-text-muted">{t.auth?.redirecting || 'Redirecting you to your profile...'}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <h2 className="text-2xl font-extrabold text-error mb-2">{t.auth?.loginFailedTitle || 'Login Failed'}</h2>
              <p className="text-sm text-text-muted mb-6">{errorMsg}</p>
              <button onClick={() => router.push('/auth/login')} className="px-6 py-2.5 rounded-xl bg-accent text-bg-main font-bold text-sm hover:bg-accent-light transition-colors">
                {t.auth?.goToLogin || 'Go to Login'}
              </button>
            </>
          )}

          <p className="text-xs text-text-dim mt-8">
            © {new Date().getFullYear()} {platformConfig.brand?.name || 'ABYSSiNIA'}. {t.footer?.rights || 'All rights reserved.'}
          </p>
        </div>
      </div>
    </>
  );
};

export default MagicLoginPage;