/**
 * @fileoverview Call-to-Action Banner Component
 *
 * Closing banner with primary enroll CTA and secondary earn CTA.
 * Links from landing.config; text from i18n.
 *
 * Path: apps/web/components/landing/CTABanner.jsx
 */
import Link from 'next/link';
import { ArrowDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getCTAConfig } from '../../lib/config';

const CTABanner = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const ctaConfig = getCTAConfig();
  const buttonHref = ctaConfig.button?.href || '/pricing';
  const earnHref = ctaConfig.earnButton?.href || '/#earn';

  const landingI18n = t.landing?.cta || {};
  const heading = landingI18n.heading || 'Ready to Start Your Software Career?';
  const subtitle = landingI18n.subtitle || '';
  const buttonText = landingI18n.buttonText || 'Enroll Today & Start Learning';
  const earnText = landingI18n.earnButtonText || 'See How You Earn';

  return (
    <div className="cta-banner">
      <div className="cta-glow" />
      <h2 className="cta-title">
        <span className="text-gradient-gold">{heading}</span>
      </h2>
      <p className="cta-subtitle">{subtitle}</p>
      <div className="cta-actions">
        {!isAuthenticated && (
          <Link href={buttonHref} className="btn-primary" style={{ display: 'inline-flex' }}>
            {buttonText}
          </Link>
        )}
        <Link href={earnHref} className="btn-glass" style={{ display: 'inline-flex' }}>
          <ArrowDown size={18} style={{ color: 'var(--accent-gold)' }} />
          {earnText}
        </Link>
      </div>
    </div>
  );
};

export default CTABanner;