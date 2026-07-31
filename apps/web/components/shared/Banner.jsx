/**
 * @fileoverview Top Promo Banner Component
 * Animated announcement bar shown on every page
 * Path: apps/web/components/shared/Banner.jsx
 */

import { Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import Link from 'next/link';

/**
 * Banner - Top promotional bar with sparkle animation
 * Matches the Gemini foundation banner exactly
 */
const Banner = () => {
  const { t } = useLanguage();

  return (
    <div className="top-banner">
      <Sparkles className="top-banner-sparkle" style={{ width: '1rem', height: '1rem', animation: 'spin 4s linear infinite' }} />
      <span>{t.banner?.text || '🚀 Next Cohort Enrolling! Master Full-Stack Engineering with Unlisted Masterclasses.'}</span>
      <Link href="/pricing" className="top-banner-link">
        {t.banner?.claimDiscount || t.nav?.claimDiscount || 'Claim Discount →'}
      </Link>
    </div>
  );
};

export default Banner;