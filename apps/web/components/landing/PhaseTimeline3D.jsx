/**
 * @fileoverview Phase Timeline 3D — Immersive Curriculum Roadmap
 * Database-driven per-phase pricing via usePaymentConfig hook.
 * Vertical timeline with 3D depth-on-scroll effect.
 * 
 * Path: apps/web/components/landing/PhaseTimeline3D.jsx
 */

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Check, Clock, BookOpen, Play, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import usePortalCourse from '../../hooks/usePortalCourse';
import usePaymentConfig from '../../hooks/usePaymentConfig';

/**
 * PhaseTimeline3D — Vertical 3D timeline of all phases.
 * Uses DB-first per-phase pricing.
 */
const PhaseTimeline3D = () => {
  const { t, language } = useLanguage();
  const { phases: coursePhases } = usePortalCourse('fullstack-web-engineering-masterclass');
  const { pricing, loading: pricingLoading } = usePaymentConfig();

  const perPhasePrice = pricing?.perPhase?.amountETB || 0;
  const currency = pricing?.perPhase?.currency || 'ETB';
  const cardRefs = useRef([]);

  /*
   * Intersection Observer for 3D depth animation
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.2 }
    );

    const refs = cardRefs.current;
    refs.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      refs.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [coursePhases]);

  if (pricingLoading || !pricing) {
    return (
      <section className="landing-phases-3d">
        <div className="spinner" style={{ padding: '2rem 0' }}>
          <div className="spinner-circle" />
        </div>
      </section>
    );
  }

  return (
    <section id="landing-phases" className="landing-phases-3d">
      <div className="landing-phases-header">
        <span className="landing-pricing-eyebrow">
          {t.landing?.phaseTimeline?.eyebrow || 'Curriculum'}
        </span>
        <h2 className="landing-phases-title">
          {t.landing?.phaseTimeline?.title || 'Your Engineering Journey'}
        </h2>
        <p className="landing-phases-subtitle">
          {t.landing?.phaseTimeline?.subtitle || '5 phases. Zero to deployed full-stack engineer.'}
        </p>
      </div>

      <div className="landing-phase-timeline">
        {coursePhases.map((phase, index) => {
          const outcomes = phase.outcomes || [];
          const weekCount = phase.weeks ? phase.weeks.length : 0;

          return (
            <div
              key={phase.id || `phase-${index}`}
              ref={(el) => { cardRefs.current[index] = el; }}
              className="landing-phase-card-3d"
            >
              <div className="landing-phase-number-3d">{phase.number || index + 1}</div>

              <div className="landing-phase-header-row">
                <h3 className="landing-phase-name">
                  {language === 'am' ? (phase.title_am || phase.title) : phase.title}
                </h3>
                <span className="landing-phase-price-tag">
                  {perPhasePrice.toLocaleString()} {currency}
                </span>
              </div>

              <div className="landing-phase-meta">
                <span className="landing-phase-meta-item">
                  <Clock size={12} />
                  {phase.duration || `${weekCount} ${t.pricing?.weeksUnit || 'Weeks'}`}
                </span>
                <span className="landing-phase-meta-item">
                  <BookOpen size={12} />
                  {weekCount} {t.landing?.phaseTimeline?.classes || 'classes'}
                </span>
              </div>

              <p className="landing-phase-desc">
                {language === 'am' ? (phase.description_am || phase.description) : phase.description}
              </p>

              {outcomes.length > 0 && (
                <div className="landing-phase-outcomes">
                  {outcomes.map((outcome, oi) => (
                    <span key={oi} className="landing-phase-outcome-tag">
                      <Check size={14} />
                      {outcome}
                    </span>
                  ))}
                </div>
              )}

              <Link
                href="/courses/fullstack-web-engineering-masterclass"
                className="landing-phase-preview-link"
              >
                <Play size={14} />
                {t.landing?.phaseTimeline?.viewDetails || 'View Phase Details'}
              </Link>
            </div>
          );
        })}
      </div>

      <div className="landing-phases-cta">
        <Link href="/pricing" className="landing-pricing-cta">
          <span>{t.landing?.phaseTimeline?.enrollCta || 'Enroll in Full Course'}</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
};

export default PhaseTimeline3D;