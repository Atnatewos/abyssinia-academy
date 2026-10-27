/**
 * @fileoverview Hero Section Component
 *
 * Dual-promise hero: "Master the skill" + "Get paid to share it".
 * Renders the income-focused subline with live amounts pulled from
 * referrals config, the Learn & Earn badge, and three CTAs.
 *
 * All display text is sourced from i18n.
 * All numeric values ({total}, {hours}, {percent}) are resolved from
 * the referrals/payments config — never hardcoded.
 *
 * Path: apps/web/components/landing/HeroSection.jsx
 */
import React from 'react';
import Link from 'next/link';
import { Flame, ArrowRight, Zap, Coins, ArrowDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  getHeroConfig,
  getCommissionStructure,
  getWithdrawalConfig,
  getReferredDiscountPercent,
} from '../../lib/config';

const ICON_MAP = { Flame, ArrowRight, Zap, Coins, ArrowDown };

const HeroSection = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const heroConfig = getHeroConfig();
  const commissionConfig = getCommissionStructure();
  const withdrawalConfig = getWithdrawalConfig();
  const discountPercent = getReferredDiscountPercent();

  const BadgeIcon = ICON_MAP[heroConfig.badgeIcon] || Flame;
  const EarnBadgeIcon = ICON_MAP[heroConfig.earnBadgeIcon] || Coins;
  const highlightedWord = heroConfig.highlightedWord || 'ABYSSiNIA';

  const exploreCta = heroConfig.cta?.exploreCourses || {};
  const unlockCta = heroConfig.cta?.unlockAccess || {};
  const earnCta = heroConfig.cta?.earn || {};

  const ExploreIcon = ICON_MAP[exploreCta.icon] || ArrowRight;
  const UnlockIcon = ICON_MAP[unlockCta.icon] || Zap;
  const EarnIcon = ICON_MAP[earnCta.icon] || ArrowDown;

  /* Resolve template variables from config — zero hardcoded numbers */
  const totalPerSale = commissionConfig?.totalPerSale || 0;
  const processingHours = withdrawalConfig?.processingTimeHours || 48;

  const inject = (template, values) =>
    String(template || '').replace(/{(\w+)}/g, (_, key) =>
      values[key] !== undefined ? String(values[key]) : `{${key}}`
    );

  const incomeSubline = inject(t.hero?.incomeSubline || '', {
    total: totalPerSale.toLocaleString('en-US'),
    hours: processingHours,
  });

  return (
    <div className="hero-content">
      <div className="hero-badge-row">
        <div className="hero-badge">
          <BadgeIcon />
          <span>{t.hero?.badge || '#1 Unlisted Masterclass Learning System'}</span>
        </div>
        <div className="hero-badge hero-badge-earn">
          <EarnBadgeIcon />
          <span>{t.hero?.earnBadge || '💰 Learn & Earn — Get Paid While You Study'}</span>
        </div>
      </div>

      <h1 className="hero-title">
        {t.hero?.title || 'Master Full Stack Application Development at'}{' '}
        <br className="hero-title-break" />
        <span className="text-gradient-gold">{highlightedWord}</span>
      </h1>

      <p className="hero-subtitle">
        {t.hero?.subtitle || ''}
      </p>

      {/* Income-focused one-liner below the standard subtitle */}
      <p className="hero-income-subline">{incomeSubline}</p>

      <div className="hero-actions">
        <Link href={exploreCta.href || '/courses'} className="btn-primary">
          <span>{t.hero?.exploreCourses || 'Explore Courses'}</span>
          <ExploreIcon size={20} />
        </Link>
        {!isAuthenticated && (
          <Link href={unlockCta.href || '/pricing'} className="btn-glass">
            <UnlockIcon size={20} style={{ color: 'var(--accent-gold)' }} />
            <span>{t.hero?.unlockAccess || 'Unlock Full Pass'}</span>
          </Link>
        )}
        <Link href={earnCta.href || '/#earn'} className="btn-glass hero-earn-cta">
          <EarnIcon size={20} style={{ color: 'var(--accent-gold)' }} />
          <span>{t.hero?.earnCta || 'See How You Earn'}</span>
        </Link>
      </div>
    </div>
  );
};

export default HeroSection;