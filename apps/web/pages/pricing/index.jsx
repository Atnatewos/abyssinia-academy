/**
 * @fileoverview Pricing Page — Database-Driven
 * Uses usePaymentConfig hook for single source of truth.
 * Shows loading skeleton while fetching — no price flicker.
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
import apiClient from '../../lib/api';
import useCart from '../../hooks/useCart';
import usePortalCourse from '../../hooks/usePortalCourse';
import usePaymentConfig from '../../hooks/usePaymentConfig';

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
  const { pricing, loading: pricingLoading } = usePaymentConfig();

  const fullCourse = pricing?.fullCourse || {};
  const perPhase = pricing?.perPhase || {};

  const [purchaseMode, setPurchaseMode] = useState('full-course');
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [referralDiscountPercent, setReferralDiscountPercent] = useState(0);
  const [referralCode, setReferralCode] = useState('');
  const [appliedDiscountCode, setAppliedDiscountCode] = useState('');
  const [appliedDiscountPercent, setAppliedDiscountPercent] = useState(0);

  const discountBadgeType = useMemo(() => {
    const hasReferral = referralDiscountPercent > 0;
    const hasDiscountCode = appliedDiscountPercent > 0 && appliedDiscountCode;
    if (hasReferral && hasDiscountCode) return 'both';
    if (hasReferral) return 'referral';
    if (hasDiscountCode) return 'discount';
    return null;
  }, [referralDiscountPercent, appliedDiscountPercent, appliedDiscountCode]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchReferralDiscount = async () => {
      try {
        const response = await apiClient.get('/auth/me');
        if (response && response.success && response.data?.user) {
          const userData = response.data.user;
          if (userData.referred_by_code) setReferralCode(userData.referred_by_code);
          const discount = parseFloat(userData.referral_discount_percent || 0);
          if (discount > 0) setReferralDiscountPercent(discount);
        }
      } catch { /* silent */ }
    };
    fetchReferralDiscount();
  }, [isAuthenticated]);

  const phasesWithMeta = useMemo(() => {
    if (!coursePhases || coursePhases.length === 0) return [];
    return coursePhases.map((coursePhase, index) => {
      const purchasePhase = cart.allPhases.find((pp) => pp.number === coursePhase.number);
      const colors = PHASE_COLORS[index] || PHASE_COLORS[0];
      const weekCount = coursePhase.weeks ? coursePhase.weeks.length : 0;
      return { ...coursePhase, prerequisites: purchasePhase?.prerequisites || [], weekCount, colors };
    });
  }, [coursePhases, cart.allPhases]);

  const fullCourseFeatures = [
    { icon: Layers, text: t.pricing?.instantAccess || 'Instant access to all 5 phases' },
    { icon: Zap, text: t.pricing?.hdPlaylists || 'HD pre-recorded masterclasses' },
    { icon: Clock, text: t.pricing?.timestampsNotes || 'Timestamped breakdowns' },
    { icon: Code, text: t.pricing?.githubAssets || 'GitHub repositories' },
    { icon: Shield, text: t.pricing?.telegramCommunity || 'Telegram community' },
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
  const handleToggleExpand = (phaseId) => setExpandedPhase(expandedPhase === phaseId ? null : phaseId);
  const handleToggleCart = (phaseId) => cart.togglePhase(phaseId);

  const formatPrerequisiteMsg = (missingIds) => {
    const andLabel = t.pricing?.andLabel || ' & Phase ';
    return (t.pricing?.lockedPrerequisiteMsg || 'Complete {prerequisites} first.')
      .replace('{prerequisites}', `Phase ${missingIds.join(andLabel)}`);
  };

  /*
   * Show loading skeleton while pricing loads — no flicker
   */
  if (pricingLoading || !pricing) {
    return (
      <PageLayout>
        <div className="pricing-modern">
          <div className="spinner" style={{ padding: '5rem 0' }}>
            <div className="spinner-circle" />
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <>
      <SEOHead title={t.pricing?.heading || 'Tuition'} />
      <PageLayout>
        <CountdownBanner />
        <div className="pricing-modern">
          <header className="pricing-modern-header">
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
            <span className="pricing-modern-eyebrow">{t.pricing?.tuitionEyebrow || 'Tuition'}</span>
            <h1 className="pricing-modern-title">{t.pricing?.heading || 'Simple & Transparent Tuition'}</h1>
            <p className="pricing-modern-subtitle">{t.pricing?.subheading || 'Choose your path.'}</p>
          </header>

          {/* Full Course Card */}
          <div className="pricing-hero-card-wrapper">
            <div className={`pricing-hero-card ${purchaseMode === 'full-course' ? 'active' : ''}`}>
              <div className="pricing-hero-glow" />
              <div className="pricing-hero-content">
                <div className="pricing-hero-left">
                  <div className="pricing-hero-badges">
                    <span className="pricing-hero-badge-best"><Sparkles size={14} />{t.pricing?.bestValue || 'Best Value'}</span>
                    <span className="pricing-hero-badge-pass">{t.pricing?.fullPass || 'Full Academy Pass'}</span>
                  </div>
                  <h2 className="pricing-hero-name">{t.pricing?.masterclass || 'Full-Stack Masterclass'}</h2>
                  <ul className="pricing-hero-features">
                    {fullCourseFeatures.map((feature, index) => (
                      <li key={index}><feature.icon size={16} /><span>{feature.text}</span></li>
                    ))}
                  </ul>
                </div>
                <div className="pricing-hero-right">
                  <div className="pricing-hero-price-block">
                    <div className="pricing-hero-price">
                      <span className="pricing-hero-amount">{fullCourse.amountETB?.toLocaleString()}</span>
                      <span className="pricing-hero-currency">{fullCourse.currency || 'ETB'}</span>
                    </div>
                    {fullCourse.originalAmountETB && fullCourse.originalAmountETB > fullCourse.amountETB && (
                      <>
                        <span className="pricing-hero-save-badge">
                          Save {Math.round(((fullCourse.originalAmountETB - fullCourse.amountETB) / fullCourse.originalAmountETB) * 100)}%
                        </span>
                        <span className="pricing-hero-original">{fullCourse.originalAmountETB.toLocaleString()} {fullCourse.currency || 'ETB'}</span>
                      </>
                    )}
                  </div>
                  {!isEnrolled && (
                    <button className="pricing-btn-primary" onClick={() => handleOpenCheckout('full-course')}>
                      <Sparkles size={18} />{t.pricing?.enrollToday || 'Enroll Today'}<ArrowRight size={18} />
                    </button>
                  )}
                  {isEnrolled && (
                    <Link href="/portal" className="pricing-btn-primary">
                      <BookOpen size={18} />{t.pricing?.goToPortal || 'Go to Portal'}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Phase Timeline */}
          <div className="pricing-roadmap-section">
            <div className="pricing-roadmap-header">
              <div>
                <h2 className="pricing-roadmap-title">{t.pricing?.orBuildYourOwn || 'Build Your Own Path'}</h2>
                <p className="pricing-roadmap-subtitle">
                  {(t.pricing?.selectIndividualPhases || '{price} {currency} per phase.')
                    .replace('{price}', (perPhase.amountETB || 0).toLocaleString())
                    .replace('{currency}', perPhase.currency || 'ETB')}
                </p>
              </div>
              <button className={`pricing-roadmap-mode-btn ${purchaseMode === 'individual-phases' ? 'active' : ''}`} onClick={() => setPurchaseMode('individual-phases')}>
                {purchaseMode === 'individual-phases' ? <><Check size={16} />Custom Mode</> : <><Layers size={16} />Switch to Custom</>}
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

                return (
                  <div key={phaseId} className={`pricing-timeline-item ${isExpanded ? 'expanded' : ''}`} style={{ '--phase-accent': phase.colors.accent }}>
                    <div className="pricing-timeline-marker">
                      <div className="pricing-timeline-dot">
                        {isSelected ? <Check size={14} /> : <span>{phase.number}</span>}
                      </div>
                    </div>
                    <div className="pricing-timeline-card">
                      <button className="pricing-timeline-card-header" onClick={() => handleToggleExpand(phaseId)}>
                        <div>
                          <span className="pricing-timeline-phase-label">Phase {phase.number}</span>
                          <h3 className="pricing-timeline-phase-title">{language === 'am' ? (phase.title_am || phase.title) : phase.title}</h3>
                        </div>
                        <div className="pricing-timeline-card-header-right">
                          {isCustomMode && <span className="pricing-timeline-price-badge">{perPhase.amountETB?.toLocaleString()} {perPhase.currency || 'ETB'}</span>}
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="pricing-timeline-card-body">
                          <p className="pricing-timeline-card-desc">{language === 'am' ? (phase.description_am || phase.description) : phase.description}</p>
                          {isCustomMode && (
                            <button onClick={() => handleToggleCart(phaseId)} disabled={isLocked} className={`pricing-timeline-cart-btn ${isSelected ? 'remove' : 'add'}`}>
                              {isSelected ? 'Remove' : 'Add to Cart'}
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
                <button className="pricing-btn-primary" onClick={() => handleOpenCheckout('individual-phases')}>
                  <Sparkles size={18} />Enroll<ArrowRight size={18} />
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
          onDiscountApplied={(data) => { setAppliedDiscountCode(data.code); setAppliedDiscountPercent(data.value || 0); }}
          onDiscountRemoved={() => { setAppliedDiscountCode(''); setAppliedDiscountPercent(0); }}
        />
      </PageLayout>
    </>
  );
};

export default PricingPage;