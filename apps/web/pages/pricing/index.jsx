/**
 * @fileoverview Pricing Page — Fully Config-Driven with Referral & Discount Support
 * Modern timeline-based phase selection with sticky cart sidebar.
 * Fetches pricing from admin settings database on every page load.
 * Fetches referral discount from /auth/me on every page load.
 * Shows applied discount code badge alongside referral badge.
 * ALL display text from i18n → t.pricing.* and t.phasePurchase.*
 * ALL data from admin_settings DB → payments.config.js fallback.
 * Path: apps/web/pages/pricing/index.jsx
 */

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Check, ArrowRight, Sparkles, Clock, BookOpen, Code,
  Layers, ChevronDown, ChevronUp, ShoppingCart, Shield, Zap,
} from 'lucide-react';
import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import PhaseCartSummary from '../../components/checkout/PhaseCartSummary';
import CountdownBanner from '../../components/pricing/CountdownBanner';
import CheckoutModal from '../../components/payment/CheckoutModal';
import DiscountCodeBadge from '../../components/discount/DiscountCodeBadge';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getPricing, getCountdownTimerConfig } from '../../lib/config';
import apiClient from '../../lib/api';
import useCart from '../../hooks/useCart';
import usePortalCourse from '../../hooks/usePortalCourse';

const PHASE_COLORS = [
  { accent: '#f59e0b', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)' },
  { accent: '#3b82f6', bg: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.2)' },
  { accent: '#10b981', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.2)' },
  { accent: '#8b5cf6', bg: 'rgba(139,92,246,0.06)', border: 'rgba(139,92,246,0.2)' },
  { accent: '#ec4899', bg: 'rgba(236,72,153,0.06)', border: 'rgba(236,72,153,0.2)' },
];

const PricingPage = () => {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { isAuthenticated, isEnrolled } = useAuth();
  const cart = useCart();
  const { phases: coursePhases } = usePortalCourse('fullstack-web-engineering-masterclass');

  /*
   * Pricing state — starts with static config, then updates from DB.
   * Admin changes appear immediately after page load.
   */
  const [pricing, setPricing] = useState(() => getPricing());
  const fullCourse = pricing.fullCourse || {};
  const perPhase = pricing.perPhase || {};
  const timerConfig = getCountdownTimerConfig();

  /*
   * Fetch pricing from the admin settings database on every page load.
   * This connects the admin settings page to the public pricing page.
   * If the database is unreachable, the static config values remain.
   */
  useEffect(() => {
    const fetchPricingFromDB = async () => {
      try {
        const response = await fetch('/api/settings/public');
        const data = await response.json();

        if (data && data.success && data.data && data.data.pricing) {
          setPricing(data.data.pricing);
        }
      } catch {
        /*
         * Silent — keep using static config values.
         * Database is optional; config files are the fallback.
         */
      }
    };

    fetchPricingFromDB();
  }, []);

  const [purchaseMode, setPurchaseMode] = useState('full-course');
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /*
   * Referral discount state — fetched fresh from API every time
   */
  const [referralDiscountPercent, setReferralDiscountPercent] = useState(0);
  const [referralCode, setReferralCode] = useState('');

  /*
   * Discount code state — persisted from the checkout modal
   * so the badge remains visible on the pricing page after applying a code.
   */
  const [appliedDiscountCode, setAppliedDiscountCode] = useState('');
  const [appliedDiscountPercent, setAppliedDiscountPercent] = useState(0);

  /*
   * Determine which discount badge type to show.
   * Priority: both > referral > discount > none
   */
  const discountBadgeType = useMemo(() => {
    const hasReferral = referralDiscountPercent > 0;
    const hasDiscountCode = appliedDiscountPercent > 0 && appliedDiscountCode;

    if (hasReferral && hasDiscountCode) return 'both';
    if (hasReferral) return 'referral';
    if (hasDiscountCode) return 'discount';
    return null;
  }, [referralDiscountPercent, appliedDiscountPercent, appliedDiscountCode]);

  /*
   * Fetch the user's referral discount from the server on every page load.
   * This ensures the discount is ALWAYS visible even if the user registered
   * days/weeks ago and the AuthContext cache doesn't have the latest data.
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchReferralDiscount = async () => {
      try {
        const response = await apiClient.get('/auth/me');

        if (response && response.success && response.data?.user) {
          const userData = response.data.user;

          if (userData.referred_by_code) {
            setReferralCode(userData.referred_by_code);
          }

          const discount = parseFloat(userData.referral_discount_percent || 0);
          if (discount > 0) {
            setReferralDiscountPercent(discount);
          }
        }
      } catch {
        /* Silent — referral discount is optional */
      }
    };

    fetchReferralDiscount();
  }, [isAuthenticated]);

  /*
   * Merge course phase data with purchase prerequisites
   */
  const phasesWithMeta = useMemo(() => {
    if (!coursePhases || coursePhases.length === 0) return [];
    return coursePhases.map((coursePhase, index) => {
      const purchasePhase = cart.allPhases.find((pp) => pp.number === coursePhase.number);
      const colors = PHASE_COLORS[index] || PHASE_COLORS[0];
      const weekCount = coursePhase.weeks
        ? coursePhase.weeks.length
        : (coursePhase.weekNumbers ? coursePhase.weekNumbers.length : 0);
      return { ...coursePhase, prerequisites: purchasePhase?.prerequisites || [], weekCount, colors };
    });
  }, [coursePhases, cart.allPhases]);

  const fullCourseFeatures = [
    { icon: Layers, text: t.pricing?.instantAccess || 'Instant access to all 5 phases & course modules' },
    { icon: Zap, text: t.pricing?.hdPlaylists || 'Unlisted HD YouTube pre-recorded video masterclasses' },
    { icon: Clock, text: t.pricing?.timestampsNotes || 'Timestamped session breakdowns & lecture notes' },
    { icon: Code, text: t.pricing?.githubAssets || 'GitHub source code repositories & starter kits' },
    { icon: Shield, text: t.pricing?.telegramCommunity || 'Private Telegram developer mentorship community' },
  ];

  const handleOpenCheckout = (mode = 'full-course') => {
    if (!isAuthenticated) {
      const params = mode === 'individual-phases' && cart.selectedPhases.length > 0
        ? `mode=individual-phases&phases=${cart.selectedPhases.join(',')}`
        : 'mode=full-course';
      window.location.href = `/auth/register?redirect=${encodeURIComponent(`/pricing?checkout&${params}`)}`;
      return;
    }
    setPurchaseMode(mode);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleToggleExpand = (phaseId) => {
    setExpandedPhase(expandedPhase === phaseId ? null : phaseId);
  };

  const handleToggleCart = (phaseId) => {
    cart.togglePhase(phaseId);
  };

  const formatPrerequisiteMsg = (missingIds) => {
    const andLabel = t.pricing?.andLabel || ' & Phase ';
    return (t.pricing?.lockedPrerequisiteMsg || 'Complete {prerequisites} first to unlock this phase.')
      .replace('{prerequisites}', `Phase ${missingIds.join(andLabel)}`);
  };

  return (
    <>
      <SEOHead title={t.pricing?.heading || 'Tuition'} />
      <PageLayout>

        {timerConfig.enabled !== false && <CountdownBanner />}

        <div className="pricing-modern">

          <header className="pricing-modern-header">

            {/* ── Discount Badges Row ── */}
            {discountBadgeType && (
              <div style={{ marginBottom: '1rem' }}>
                <DiscountCodeBadge
                  type={discountBadgeType}
                  referralPercent={referralDiscountPercent}
                  discountPercent={appliedDiscountPercent}
                  discountCode={appliedDiscountCode}
                />
              </div>
            )}

            <span className="pricing-modern-eyebrow">
              {t.pricing?.tuitionEyebrow || 'Tuition'}
            </span>
            <h1 className="pricing-modern-title">
              {t.pricing?.heading || 'Simple & Transparent Tuition'}
            </h1>
            <p className="pricing-modern-subtitle">
              {t.pricing?.subheading || 'Choose the learning path that fits your goals.'}
            </p>
          </header>

          {/* Full Course Hero Card */}
          <div className="pricing-hero-card-wrapper">
            <div className={`pricing-hero-card ${purchaseMode === 'full-course' ? 'active' : ''}`}>
              <div className="pricing-hero-glow" />
              <div className="pricing-hero-content">
                <div className="pricing-hero-left">
                  <div className="pricing-hero-badges">
                    <span className="pricing-hero-badge-best">
                      <Sparkles size={14} />
                      {t.pricing?.bestValue || 'Best Value'}
                    </span>
                    <span className="pricing-hero-badge-pass">
                      {t.pricing?.fullPass || 'Full Academy Access Pass'}
                    </span>
                  </div>
                  <h2 className="pricing-hero-name">
                    {t.pricing?.masterclass || 'Full-Stack Software Masterclass'}
                  </h2>
                  <p className="pricing-hero-desc">
                    {t.pricing?.allPhasesValue || 'All 5 phases'} ·{' '}
                    {fullCourse.originalAmountETB
                      ? `${fullCourse.originalAmountETB.toLocaleString()} ${fullCourse.currency || 'ETB'} ${t.pricing?.valueLabel || 'value'}`
                      : (t.pricing?.completeCurriculum || 'Complete curriculum')}
                  </p>
                  <ul className="pricing-hero-features">
                    {fullCourseFeatures.map((feature, index) => (
                      <li key={index}><feature.icon size={16} /><span>{feature.text}</span></li>
                    ))}
                  </ul>
                </div>
                <div className="pricing-hero-right">
                  <div className="pricing-hero-price-block">
                    {fullCourse.discountPercentage > 0 && (
                      <span className="pricing-hero-save-badge">
                        {(t.pricing?.savePercent || 'Save {percent}%').replace('{percent}', fullCourse.discountPercentage)}
                      </span>
                    )}
                    <div className="pricing-hero-price">
                      <span className="pricing-hero-amount">{fullCourse.amountETB?.toLocaleString() || '2,499'}</span>
                      <span className="pricing-hero-currency">{fullCourse.currency || 'ETB'}</span>
                    </div>
                    {fullCourse.discountPercentage > 0 && (
                      <span className="pricing-hero-original">{fullCourse.originalAmountETB?.toLocaleString()} {fullCourse.currency || 'ETB'}</span>
                    )}
                  </div>
                  <button className={`pricing-hero-select-btn ${purchaseMode === 'full-course' ? 'selected' : ''}`} onClick={() => setPurchaseMode('full-course')}>
                    {purchaseMode === 'full-course' ? <><Check size={18} />{t.pricing?.selected || 'Selected'}</> : t.pricing?.selectFullCourse || 'Select Full Course'}
                  </button>
                  {purchaseMode === 'full-course' && !isEnrolled && (
                    <button className="pricing-btn-primary" style={{ width: '100%', marginTop: '0.75rem' }} onClick={() => handleOpenCheckout('full-course')}>
                      <Sparkles size={18} />{t.pricing?.enrollToday || 'Enroll Today'}<ArrowRight size={18} />
                    </button>
                  )}
                  {isEnrolled && (
                    <Link href="/portal" className="pricing-btn-primary" style={{ width: '100%', marginTop: '0.75rem' }}>
                      <BookOpen size={18} />{t.pricing?.goToPortal || 'Go to Classroom Portal'}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Phase Timeline Roadmap */}
          <div className="pricing-roadmap-section">
            <div className="pricing-roadmap-header">
              <div>
                <h2 className="pricing-roadmap-title">{t.pricing?.orBuildYourOwn || 'Or Build Your Own Path'}</h2>
                <p className="pricing-roadmap-subtitle">
                  {(t.pricing?.selectIndividualPhases || 'Select individual phases at {price} {currency} each.')
                    .replace('{price}', (perPhase.amountETB || 750).toLocaleString())
                    .replace('{currency}', perPhase.currency || 'ETB')}
                </p>
              </div>
              <button className={`pricing-roadmap-mode-btn ${purchaseMode === 'individual-phases' ? 'active' : ''}`} onClick={() => setPurchaseMode('individual-phases')}>
                {purchaseMode === 'individual-phases' ? <><Check size={16} />{t.pricing?.customModeActive || 'Custom Mode Active'}</> : <><Layers size={16} />{t.pricing?.switchToCustom || 'Switch to Custom'}</>}
              </button>
            </div>

            <div className="pricing-timeline">
              <div className="pricing-timeline-line" />
              {phasesWithMeta.map((phase) => {
                const phaseId = phase.id || `phase-${phase.number}`;
                const isSelected = cart.isPhaseSelected(phaseId);
                const selectability = cart.canSelectPhase(phaseId);
                const isExpanded = expandedPhase === phaseId;
                const isLocked = !selectability.canSelect && !isSelected;
                const isCustomMode = purchaseMode === 'individual-phases';
                const outcomes = phase.outcomes || [];

                return (
                  <div key={phaseId} className={`pricing-timeline-item ${isExpanded ? 'expanded' : ''} ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''}`} style={{ '--phase-accent': phase.colors.accent, '--phase-bg': phase.colors.bg, '--phase-border': phase.colors.border }}>
                    <div className="pricing-timeline-marker">
                      <div className="pricing-timeline-dot">
                        {isSelected ? <Check size={14} /> : isLocked ? <span className="pricing-timeline-dot-locked">!</span> : <span>{phase.number}</span>}
                      </div>
                    </div>
                    <div className="pricing-timeline-card">
                      <button className="pricing-timeline-card-header" onClick={() => handleToggleExpand(phaseId)}>
                        <div className="pricing-timeline-card-header-left">
                          <span className="pricing-timeline-phase-label">{t.pricing?.phaseLabel || 'Phase'} {phase.number}</span>
                          <h3 className="pricing-timeline-phase-title">{language === 'am' ? (phase.title_am || phase.title) : phase.title}</h3>
                          <div className="pricing-timeline-phase-meta">
                            <span><Clock size={12} /> {phase.duration || `${phase.weekCount} ${t.pricing?.weeksUnit || 'Weeks'}`}</span>
                            <span><BookOpen size={12} /> {phase.weekCount} {t.pricing?.weeksUnit || 'weeks'}</span>
                            <span><Code size={12} /> {outcomes.length} {t.pricing?.objectives || 'objectives'}</span>
                          </div>
                        </div>
                        <div className="pricing-timeline-card-header-right">
                          {isCustomMode && <span className="pricing-timeline-price-badge">{(perPhase.amountETB || 750).toLocaleString()} {perPhase.currency || 'ETB'}</span>}
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="pricing-timeline-card-body">
                          <p className="pricing-timeline-card-desc">{language === 'am' ? (phase.description_am || phase.description) : phase.description}</p>
                          {outcomes.length > 0 && (
                            <div className="pricing-timeline-outcomes">
                              <span className="pricing-timeline-outcomes-label"><Layers size={13} />{t.courses?.phaseOutcomes || 'Key Learning Focus'}</span>
                              <div className="pricing-timeline-outcomes-grid">
                                {outcomes.map((outcome, oi) => (<div key={oi} className="pricing-timeline-outcome-chip"><Check size={12} /><span>{outcome}</span></div>))}
                              </div>
                            </div>
                          )}
                          {isLocked && selectability.missingPrerequisites?.length > 0 && (
                            <div className="pricing-timeline-locked-msg"><span>{formatPrerequisiteMsg(selectability.missingPrerequisites)}</span></div>
                          )}
                          {isCustomMode && (
                            <button onClick={() => handleToggleCart(phaseId)} disabled={isLocked} className={`pricing-timeline-cart-btn ${isSelected ? 'remove' : 'add'} ${isLocked ? 'disabled' : ''}`}>
                              {isSelected ? <><Check size={15} />{t.pricing?.removeFromCart || 'Remove from Cart'}</> : isLocked ? <><span>🔒</span>{t.pricing?.prerequisitesRequired || 'Prerequisites Required'}</> : <><ShoppingCart size={15} />{(t.pricing?.addToCart || 'Add to Cart — {price} {currency}').replace('{price}', (perPhase.amountETB || 750).toLocaleString()).replace('{currency}', perPhase.currency || 'ETB')}</>}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {purchaseMode === 'individual-phases' && cart.selectedPhases.length > 0 && (
            <div className="pricing-sticky-cart">
              <div className="pricing-sticky-cart-inner">
                <PhaseCartSummary selectedPhases={cart.selectedPhases} compact />
                <button className="pricing-btn-primary pricing-sticky-cta" onClick={() => handleOpenCheckout('individual-phases')}>
                  <Sparkles size={18} />{t.pricing?.enrollToday || 'Enroll Today'}<ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        <CheckoutModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          purchaseMode={purchaseMode}
          selectedPhases={purchaseMode === 'individual-phases' ? cart.selectedPhases : []}
          coursePhases={coursePhases || []}
          referralDiscountPercent={referralDiscountPercent}
          referralCode={referralCode}
          onDiscountApplied={(data) => {
            if (data) {
              setAppliedDiscountCode(data.code || '');
              setAppliedDiscountPercent(data.value || 0);
            }
          }}
          onDiscountRemoved={() => {
            setAppliedDiscountCode('');
            setAppliedDiscountPercent(0);
          }}
        />
      </PageLayout>
    </>
  );
};

export default PricingPage;