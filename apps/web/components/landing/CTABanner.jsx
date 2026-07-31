/**
 * @fileoverview Call-to-Action Banner Component
 * Bottom enrollment banner with glow effect
 * Path: apps/web/components/landing/CTABanner.jsx
 */

import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

const CTABanner = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  return (
    <div className="cta-banner">
      <div className="cta-glow" />
      <h2 className="cta-title">
        <span className="text-gradient-gold">Ready to Start Your Software Career?</span>
      </h2>
      <p className="cta-subtitle">
        Enroll today to unlock all courses, 5 structured phases, downloadable project code repositories, and our private Telegram developer mentorship group.
      </p>
      {!isAuthenticated && (
        <Link href="/pricing" className="btn-primary" style={{ display: 'inline-flex' }}>
          {t.pricing?.enrollToday || 'Enroll Today & Start Learning'}
        </Link>
      )}
    </div>
  );
};

export default CTABanner;