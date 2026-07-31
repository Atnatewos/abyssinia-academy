/**
 * @fileoverview Pricing Page
 * Tuition display with feature checklist and enrollment CTA
 * Path: apps/web/pages/pricing/index.jsx
 */

import Link from 'next/link';
import { Check } from 'lucide-react';
import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

/**
 * PricingPage - Tuition page matching Gemini foundation
 */
const PricingPage = () => {
  const { t } = useLanguage();
  const { isAuthenticated, isEnrolled } = useAuth();

  const features = [
    t.pricing?.instantAccess || 'Instant access to all 5 phases & course modules',
    t.pricing?.hdPlaylists || 'Unlisted HD YouTube pre-recorded video masterclasses',
    t.pricing?.timestampsNotes || 'Timestamped session breakdowns & lecture notes',
    t.pricing?.githubAssets || 'GitHub source code repositories & starter kits',
    t.pricing?.telegramCommunity || 'Private Telegram developer mentorship community',
  ];

  return (
    <>
      <SEOHead title={t.pricing?.heading || 'Tuition'} />
      <PageLayout>
        <div className="pricing-page">
          <div className="section-header" style={{ marginBottom: '3rem' }}>
            <h1 className="section-title">
              {t.pricing?.heading || 'Simple & Transparent Tuition'}
            </h1>
            <p className="section-subtitle">
              {t.pricing?.subheading || 'One single payment unlocks all courses, 5 phases, code repositories, and unlisted YouTube playlists.'}
            </p>
          </div>

          <div className="pricing-card">
            <div className="pricing-badge">
              {t.pricing?.fullPass || 'Full Academy Access Pass'}
            </div>

            <h3 className="pricing-title">
              {t.pricing?.masterclass || 'Full-Stack Software Masterclass'}
            </h3>
            <p className="pricing-subtitle">Complete 5 Phase Pre-Recorded Access</p>

            <div className="pricing-amount">
              <span className="pricing-price">4,999</span>
              <span className="pricing-currency">ETB</span>
              <span className="pricing-original">9,500 ETB</span>
            </div>

            <ul className="pricing-features">
              {features.map((feature, index) => (
                <li key={index} className="pricing-feature">
                  <Check />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {isEnrolled ? (
              <Link href="/portal" className="pricing-btn">
                Go to Classroom Portal
              </Link>
            ) : isAuthenticated ? (
              <Link href="/checkout" className="pricing-btn">
                {t.pricing?.enrollToday || 'Enroll Today & Start Learning'}
              </Link>
            ) : (
              <Link href="/auth/register?redirect=/checkout" className="pricing-btn">
                {t.pricing?.enrollToday || 'Enroll Today & Start Learning'}
              </Link>
            )}
          </div>
        </div>
      </PageLayout>
    </>
  );
};

export default PricingPage;