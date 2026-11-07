/**
 * @fileoverview Scholarships Browse Page
 *
 * Public + authenticated. Shows all active scholarship campaigns.
 * Authenticated users additionally see their application status
 * per campaign (via the /api/scholarships endpoint which joins the
 * user's applications).
 *
 * Uses:
 *   - Skeleton wrappers during load
 *   - PageLayout + SEOHead + i18n
 *   - Design tokens exclusively (no raw palette)
 *
 * Path: apps/web/pages/scholarships/index.jsx
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Award, RefreshCw } from 'lucide-react';
import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import ScholarshipCard from '../../components/scholarships/ScholarshipCard';
import { SkeletonCard, SkeletonWrapper } from '../../components/shared/Skeleton';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getItem } from '../../lib/storage';

/**
 * Loading skeleton grid — matches the visual shape of the card grid
 * to prevent layout shift.
 */
const BrowseSkeleton = () => (
  <SkeletonWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <SkeletonCard key={i} showIcon bodyLines={3} />
    ))}
  </SkeletonWrapper>
);

/**
 * ScholarshipIndexPage — browse page.
 */
const ScholarshipIndexPage = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getItem('auth_token');
      const endpoint = isAuthenticated
        ? '/api/scholarships'
        : '/api/public/scholarships/active';
      const headers = { Accept: 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(endpoint, { headers });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        setError(payload?.message || 'Failed to load campaigns.');
        return;
      }

      const list = payload.data?.campaigns || [];
      setCampaigns(list);
    } catch (fetchError) {
      console.error('[scholarships/index] fetch failed:', fetchError);
      setError(
        t.scholarships?.browse?.errorDescription || 'Please refresh and try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, t]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return (
    <>
      <SEOHead title={t.scholarships?.browse?.pageTitle || 'Scholarships'} />
      <PageLayout>
        <div className="container-xl py-12 flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-accent transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              {t.common?.backToHome || 'Back to Home'}
            </Link>
            <div className="flex items-center gap-2">
              <Award size={22} className="text-accent" />
              <h1 className="text-3xl font-extrabold text-text-main">
                {t.scholarships?.browse?.pageTitle || 'Scholarships'}
              </h1>
            </div>
            <p className="text-sm text-text-muted max-w-2xl">
              {t.scholarships?.browse?.pageSubtitle ||
                'Financial assistance for aspiring developers'}
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col gap-6">
              <p className="text-xs text-text-dim">
                {t.scholarships?.browse?.loadingLabel || 'Loading scholarships...'}
              </p>
              <BrowseSkeleton />
            </div>
          ) : error ? (
            <div className="empty-state rounded-2xl border border-error/20 bg-error/5 p-8">
              <Award size={40} className="text-error mb-3" />
              <h3 className="empty-state-title">
                {t.scholarships?.browse?.errorTitle || 'Could not load scholarships'}
              </h3>
              <p className="empty-state-desc mb-4">{error}</p>
              <button
                type="button"
                onClick={fetchCampaigns}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-text-inverse text-xs font-bold hover:bg-accent-light transition-colors"
              >
                <RefreshCw size={14} />
                {t.scholarships?.browse?.retryButton || 'Try Again'}
              </button>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="empty-state rounded-2xl border border-border-light bg-bg-card p-10">
              <Award size={48} className="text-text-dim mb-3" />
              <h3 className="empty-state-title">
                {t.scholarships?.browse?.emptyTitle || 'No Scholarships Available'}
              </h3>
              <p className="empty-state-desc">
                {t.scholarships?.browse?.emptyDescription ||
                  'Check back soon — new campaigns are announced regularly.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <ScholarshipCard
                  key={campaign.slug}
                  campaign={campaign}
                  myApplication={campaign.myApplication || null}
                />
              ))}
            </div>
          )}
        </div>
      </PageLayout>
    </>
  );
};

export default ScholarshipIndexPage;