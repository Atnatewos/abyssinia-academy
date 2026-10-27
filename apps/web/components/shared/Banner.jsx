/**
 * @fileoverview Top Promo Banner Component
 *
 * Animated announcement bar shown on every page.
 * Copy emphasizes the income opportunity with live numbers
 * resolved from referrals/payments config.
 *
 * Path: apps/web/components/shared/Banner.jsx
 */
import { Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  getCommissionStructure,
  getWithdrawalConfig,
} from '../../lib/config';
import Link from 'next/link';

/**
 * Banner — Top promotional bar with sparkle animation.
 * Numbers ({total}, {hours}) are injected at render from config.
 */
const Banner = () => {
  const { t } = useLanguage();
  const commissionConfig = getCommissionStructure();
  const withdrawalConfig = getWithdrawalConfig();

  const totalPerSale = commissionConfig?.totalPerSale || 0;
  const processingHours = withdrawalConfig?.processingTimeHours || 48;

  const rawText =
    t.banner?.text ||
    '💰 Students earn while they learn — up to {total} ETB per sale · Withdraw in {hours}h.';

  const bannerText = rawText
    .replace('{total}', totalPerSale.toLocaleString('en-US'))
    .replace('{hours}', String(processingHours));

  const ctaLabel =
    t.banner?.claimDiscount ||
    t.nav?.claimDiscount ||
    'See How You Earn →';

  return (
    <div className="top-banner">
      <Sparkles
        className="top-banner-sparkle"
        style={{ width: '1rem', height: '1rem', animation: 'spin 4s linear infinite' }}
      />
      <span>{bannerText}</span>
      <Link href="/#earn" className="top-banner-link">
        {ctaLabel}
      </Link>
    </div>
  );
};

export default Banner;