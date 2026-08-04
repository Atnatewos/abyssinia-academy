/**
 * @fileoverview Hero Section Component
 * Main hero banner with badge, heading, subtitle, and call-to-action buttons
 * Display text from i18n → t.hero.* | Structure from landing.config.js
 * Path: apps/web/components/landing/HeroSection.jsx
 */

import React from 'react';
import Link from 'next/link';
import { Flame, ArrowRight, Zap } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getHeroConfig } from '../../lib/config';

/*
 * Icon registry — maps config icon name strings to lucide-react components
 * Used to dynamically render the correct icon based on landing.config.js
 */
const ICON_MAP = {
  Flame,
  ArrowRight,
  Zap,
};

/**
 * HeroSection — Main landing page hero banner
 * All display text from i18n translation keys
 * All visual structure (icons, links, highlighted word) from landing.config.js
 */
const HeroSection = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  /*
   * Hero structure from landing config
   * Contains only language-agnostic data: icon names, URLs, proper nouns
   */
  const heroConfig = getHeroConfig();

  /*
   * Resolve the badge icon dynamically from config
   * Falls back to Flame icon if config key doesn't match
   */
  const BadgeIcon = ICON_MAP[heroConfig.badgeIcon] || Flame;

  /*
   * Highlighted brand word — same across all languages
   */
  const highlightedWord = heroConfig.highlightedWord || 'ABYSSiNIA';

  /*
   * CTA button configuration — links and icon names
   */
  const exploreCta = heroConfig.cta?.exploreCourses || {};
  const unlockCta = heroConfig.cta?.unlockAccess || {};

  const ExploreIcon = ICON_MAP[exploreCta.icon] || ArrowRight;
  const UnlockIcon = ICON_MAP[unlockCta.icon] || Zap;

  return (
    <div className="hero-content">
      {/* Badge — icon from config, text from i18n */}
      <div className="hero-badge">
        <BadgeIcon />
        <span>{t.hero?.badge || '#1 Unlisted Masterclass Learning System'}</span>
      </div>

      {/* Heading — split across two lines with highlighted brand word */}
      <h1 className="hero-title">
        {t.hero?.title || 'Master Full Stack Application Development at'}{' '}
        <br className="hero-title-break" />
        <span className="text-gradient-gold">{highlightedWord}</span>
      </h1>

      {/* Subtitle — from i18n */}
      <p className="hero-subtitle">
        {t.hero?.subtitle || ''}
      </p>

      {/* CTA Buttons — links from config, text from i18n */}
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
      </div>
    </div>
  );
};

export default HeroSection;