/**
 * @fileoverview Pricing Showcase — Equal Card Grid
 * All cards same size, same weight. Full course card + auto-generated phase cards.
 * Remove a phase from phases/index.js → card disappears. Add → card appears.
 * Full course card has premium gold glow and "Best Value" badge.
 * All pricing auto-calculated from payments.config.js — zero hardcoded values.
 * 
 * Path: apps/web/components/landing/PricingShowcase.jsx
 */

import { useMemo } from 'react';
import Link from 'next/link';
import { Sparkles, Check, Zap, Clock, BookOpen, ArrowRight, Crown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getPricing } from '../../lib/config';
import usePortalCourse from '../../hooks/usePortalCourse';

/**
 * PricingShowcase — Equal grid of pricing cards.
 * Full course card + one card per phase from the course config.
 */
const PricingShowcase = () => {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { phases: coursePhases } = usePortalCourse('fullstack-web-engineering-masterclass');

  const pricing = useMemo(() => getPricing(), []);
  const fullCourse = pricing.fullCourse || {};
  const perPhase = pricing.perPhase || {};
  const perPhasePrice = perPhase.amountETB || 750;
  const currency = perPhase.currency || 'ETB';

  /*
   * Auto-calculate discount percentage from config — never hardcoded
   */
  const discountPercent = useMemo(() => {
    const original = fullCourse.originalAmountETB || 0;
    const current = fullCourse.amountETB || 0;
    if (original <= 0 || current <= 0) return 0;
    return Math.round(((original - current) / original) * 100);
  }, [fullCourse.originalAmountETB, fullCourse.amountETB]);

  const enrollHref = isAuthenticated
    ? '/checkout?mode=full-course'
    : '/auth/login?redirect=/checkout?mode=full-course';

  /*
   * Build the complete card array: Full Course + all phases from config
   */
  const allCards = useMemo(() => {
    const cards = [];

    /*
     * Card 0: Full Course (Premium)
     */
    cards.push({
      id: 'full-course',
      type: 'full-course',
      number: null,
      title: fullCourse.description || 'Full Academy Pass — All Phases',
      subtitle: t.landing?.pricingOverview?.fullCourseSubtitle || 'Complete curriculum, best value',
      price: fullCourse.amountETB || 2499,
      originalPrice: fullCourse.originalAmountETB || null,
      discountPercent,
      currency,
      features: [
        t.landing?.pricingOverview?.featureAllPhases || 'All structured phases',
        t.landing?.pricingOverview?.featureLifetime || 'Lifetime access',
        t.landing?.pricingOverview?.featureCertificate || 'Completion certificate',
        t.landing?.pricingOverview?.featureCommunity || 'Private Telegram community',
      ],
      badge: t.landing?.pricingOverview?.bestValue || 'BEST VALUE',
      badgeIcon: Crown,
      href: enrollHref,
      ctaText: t.landing?.pricingOverview?.enrollCta || 'Enroll Now',
      isPremium: true,
    });

    /*
     * Cards 1-5: Individual Phases (auto-generated from course config)
     * If a phase is removed from phases/index.js, it disappears here automatically
     */
    (coursePhases || []).forEach((phase, index) => {
      const weekCount = phase.weeks
        ? phase.weeks.length
        : (phase.weekNumbers ? phase.weekNumbers.length : 0);

      cards.push({
        id: phase.id || `phase-${index + 1}`,
        type: 'phase',
        number: phase.number || index + 1,
        title: language === 'am' ? (phase.title_am || phase.title) : phase.title,
        subtitle: `${weekCount} ${t.landing?.pricingOverview?.classes || 'classes'} · ${phase.duration || `${weekCount} ${t.pricing?.weeksUnit || 'Weeks'}`}`,
        price: perPhasePrice,
        originalPrice: perPhase.originalAmountETB || null,
        discountPercent: perPhase.originalAmountETB
          ? Math.round(((perPhase.originalAmountETB - perPhasePrice) / perPhase.originalAmountETB) * 100)
          : 0,
        currency,
        weekCount,
        features: (phase.outcomes || []).slice(0, 3),
        badge: null,
        badgeIcon: null,
        href: `/courses/fullstack-web-engineering-masterclass`,
        ctaText: t.landing?.pricingOverview?.viewPhase || 'View Phase',
        isPremium: false,
        colorIndex: index,
      });
    });

    return cards;
  }, [coursePhases, fullCourse, perPhasePrice, currency, discountPercent, enrollHref, t, language]);

  /*
   * Phase accent colors for variety
   */
  const phaseAccentColors = [
    'rgba(245,158,11,0.08)',   // Gold
    'rgba(59,130,246,0.08)',   // Blue
    'rgba(16,185,129,0.08)',   // Green
    'rgba(139,92,246,0.08)',   // Purple
    'rgba(236,72,153,0.08)',   // Pink
  ];

  const phaseBorderColors = [
    'rgba(245,158,11,0.25)',
    'rgba(59,130,246,0.25)',
    'rgba(16,185,129,0.25)',
    'rgba(139,92,246,0.25)',
    'rgba(236,72,153,0.25)',
  ];

  const phaseNumberColors = [
    '#f59e0b',
    '#3b82f6',
    '#10b981',
    '#8b5cf6',
    '#ec4899',
  ];

  return (
    <section className="landing-pricing-3d">
      <div className="landing-pricing-header">
        <span className="landing-pricing-eyebrow">
          {t.landing?.pricingOverview?.eyebrow || 'Tuition'}
        </span>
        <h2 className="landing-pricing-title">
          {t.landing?.pricingOverview?.title || 'Simple, Transparent Pricing'}
        </h2>
        <p className="landing-pricing-subtitle">
          {t.landing?.pricingOverview?.subtitle || 'Choose the path that fits your goals. All prices in Ethiopian Birr.'}
        </p>
      </div>

      {/* ── Equal Card Grid ── */}
      <div className="landing-pricing-equal-grid">
        {allCards.map((card) => {
          const isFullCourse = card.type === 'full-course';
          const accentBg = isFullCourse
            ? 'rgba(245,158,11,0.06)'
            : phaseAccentColors[card.colorIndex] || 'rgba(245,158,11,0.06)';
          const accentBorder = isFullCourse
            ? 'rgba(245,158,11,0.5)'
            : phaseBorderColors[card.colorIndex] || 'rgba(245,158,11,0.25)';
          const accentColor = isFullCourse
            ? 'var(--accent-gold)'
            : phaseNumberColors[card.colorIndex] || 'var(--accent-gold)';

          return (
            <div
              key={card.id}
              className={`landing-pricing-equal-card ${isFullCourse ? 'premium-card' : ''}`}
              style={{
                '--card-accent-bg': accentBg,
                '--card-accent-border': accentBorder,
                '--card-accent-color': accentColor,
              }}
            >
              {/* Badge */}
              {card.badge && (
                <span className="landing-pricing-equal-badge">
                  <card.badgeIcon size={12} />
                  {card.badge}
                </span>
              )}

              {/* Phase Number (for phase cards) */}
              {card.number && (
                <div
                  className="landing-pricing-equal-number"
                  style={{ background: accentColor }}
                >
                  {card.number}
                </div>
              )}

              {/* Title */}
              <h3 className="landing-pricing-equal-title">
                {isFullCourse ? (
                  <>
                    <Crown size={16} style={{ color: 'var(--accent-gold)', marginRight: '0.375rem', display: 'inline', verticalAlign: 'middle' }} />
                    {card.title}
                  </>
                ) : (
                  card.title
                )}
              </h3>
              <p className="landing-pricing-equal-subtitle">{card.subtitle}</p>

              {/* Price */}
              <div className="landing-pricing-equal-price-row">
                <span className="landing-pricing-equal-price">
                  {card.price.toLocaleString()} {card.currency}
                </span>
                {isFullCourse && (
                  <span className="landing-pricing-equal-per-phase">
                    / {t.landing?.pricingOverview?.fullCourse || 'full course'}
                  </span>
                )}
              </div>

              {/* Original Price + Save Badge */}
              {card.originalPrice && card.discountPercent > 0 && (
                <div className="landing-pricing-equal-save-row">
                  <span className="landing-pricing-equal-original">
                    {card.originalPrice.toLocaleString()} {card.currency}
                  </span>
                  <span className="landing-pricing-equal-save">
                    <Zap size={10} />
                    {card.discountPercent}% {t.landing?.pricingOverview?.off || 'off'}
                  </span>
                </div>
              )}

              {/* Features */}
              <ul className="landing-pricing-equal-features">
                {card.features.map((feature, fi) => (
                  <li key={fi}>
                    <Check size={14} style={{ color: isFullCourse ? 'var(--accent-gold)' : accentColor }} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link
                href={card.href}
                className={`landing-pricing-equal-cta ${isFullCourse ? 'primary' : ''}`}
              >
                <span>{card.ctaText}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PricingShowcase;