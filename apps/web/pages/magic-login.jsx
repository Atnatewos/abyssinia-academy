/**
 * @fileoverview Magic Login Page
 * 
 * Used by admins for impersonation or by users for password resets.
 * Reads the token from the URL, swaps it for a valid session, and redirects.
 * 
 * Path: apps/web/pages/magic-login.jsx
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PageLayout from '../components/shared/PageLayout';
import apiClient from '../lib/api';
import { setAuth } from '../lib/auth';

const MagicLoginPage = () => {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState('authenticating');
  const [errorMsg, setErrorMsg] = useState('');

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
    <PageLayout>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', maxWidth: '400px' }}>
          {status === 'authenticating' && <h2>Authenticating...</h2>}
          {status === 'success' && <h2 style={{ color: '#10b981' }}>Success! Redirecting...</h2>}
          {status === 'error' && (
            <>
              <h2 style={{ color: '#ef4444' }}>Login Failed</h2>
              <p>{errorMsg}</p>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default MagicLoginPage;