/**
 * @fileoverview Call-to-Action Banner Component
 * Bottom enrollment banner with glow effect
 * Button link from landing.config.js | Display text from i18n → t.landing.cta.*
 * Path: apps/web/components/landing/CTABanner.jsx
 */

import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getCTAConfig } from '../../lib/config';

const CTABanner = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  /*
   * Button link from landing config
   * Display text from i18n translations
   */
  const ctaConfig = getCTAConfig();
  const buttonHref = ctaConfig.button?.href || '/pricing';

  const landingI18n = t.landing?.cta || {};
  const heading = landingI18n.heading || 'Ready to Start Your Software Career?';
  const subtitle = landingI18n.subtitle || '';
  const buttonText = landingI18n.buttonText || 'Enroll Today & Start Learning';

  return (
    <div className="cta-banner">
      <div className="cta-glow" />
      <h2 className="cta-title">
        <span className="text-gradient-gold">{heading}</span>
      </h2>
      <p className="cta-subtitle">{subtitle}</p>
      {!isAuthenticated && (
        <Link href={buttonHref} className="btn-primary" style={{ display: 'inline-flex' }}>
          {buttonText}
        </Link>
      )}
    </div>
  );
};

export default CTABanner;