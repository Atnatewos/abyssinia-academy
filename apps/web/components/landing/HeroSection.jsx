/**
 * @fileoverview Hero Section Component
 * Main hero banner with badge, heading, subtitle, and call-to-action buttons
 * Path: apps/web/components/landing/HeroSection.jsx
 */

import Link from 'next/link';
import { Flame, ArrowRight, Zap } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

const HeroSection = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  return (
    <div className="hero-content">
      <div className="hero-badge">
        <Flame />
        <span>{t.hero?.badge || '#1 Unlisted YouTube Masterclass Learning System'}</span>
      </div>

      <h1 className="hero-title">
        {t.hero?.title || 'Master Full Stack Application Development at'}{' '}
        <br className="hero-title-break" />
        <span className="text-gradient-gold">ABYSSiNIA</span>
      </h1>

      <p className="hero-subtitle">
        {t.hero?.subtitle || 'A step-by-step 5-phase engineering curriculum.'}
      </p>

      <div className="hero-actions">
        <Link href="/courses" className="btn-primary">
          <span>{t.hero?.exploreCourses || 'Explore Courses'}</span>
          <ArrowRight size={20} />
        </Link>

        {!isAuthenticated && (
          <Link href="/pricing" className="btn-glass">
            <Zap size={20} style={{ color: 'var(--accent-gold)' }} />
            <span>{t.hero?.unlockAccess || 'Unlock Full Pass'}</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default HeroSection;