/**
 * @fileoverview Reseller Dashboard Page
 *
 * Route: /profile/reseller
 *
 * Wraps the ResellerDashboard container with PageLayout, SEO, auth gate,
 * and the same back-link pattern as /profile/referrals.
 *
 * Path: apps/web/pages/profile/reseller.jsx
 */

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Store } from 'lucide-react';
import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import ResellerDashboard from '../../components/reseller/ResellerDashboard';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

const ResellerPage = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="container-xl py-16">
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-3">
            <Store size={48} className="text-text-dim" />
            <p className="text-sm text-text-muted">
              {t.reseller?.errors?.notAuthenticated ||
                'Please log in to access your reseller dashboard.'}
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-text-inverse text-xs font-bold hover:bg-accent-light transition-colors mt-2"
            >
              {t.auth?.login || 'Log in'}
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <>
      <SEOHead
        title={t.reseller?.title || 'Reseller Dashboard'}
        description={
          t.reseller?.subtitle ||
          'Sell Abyssinia Academy. Set your price. Keep 70%.'
        }
      />
      <PageLayout>
        <div className="container-xl py-8 flex flex-col gap-6">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-accent transition-colors group"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            {t.profile?.title || 'Back to Profile'}
          </Link>

          <header className="flex flex-col gap-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-main">
              {t.reseller?.title || 'Reseller Dashboard'}
            </h1>
            <p className="text-sm text-text-muted max-w-2xl">
              {t.reseller?.subtitle ||
                'Sell Abyssinia Academy. Set your price. Keep 70%.'}
            </p>
          </header>

          <ResellerDashboard />
        </div>
      </PageLayout>
    </>
  );
};

export default ResellerPage;