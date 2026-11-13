// /**
//  * @fileoverview Pricing Showcase — Equal Card Grid
//  *
//  * Displays the featured course hero card + its phases.
//  * Featured course selection priority:
//  *   1. First course with badge === 'Most Popular'
//  *   2. Course with the lowest order_index (admin-set priority)
//  *   3. First course in the list
//  *
//  * The full course detail (with phases) is fetched separately via
//  * usePortalCourse because /courses (list endpoint) only returns top-level
//  * course fields.
//  *
//  * Shows a "Explore More Courses" CTA below the grid, linking to /pricing.
//  *
//  * Path: apps/web/components/landing/PricingShowcase.jsx
//  */
// import { useMemo } from 'react';
// import Link from 'next/link';
// import { Check, Zap, ArrowRight, Crown, GraduationCap } from 'lucide-react';
// import { useLanguage } from '../../context/LanguageContext';
// import { useAuth } from '../../context/AuthContext';
// import { useCourses } from '../../hooks/useCourses';
// import usePortalCourse from '../../hooks/usePortalCourse';
// import usePaymentConfig from '../../hooks/usePaymentConfig';
// import { getReferredDiscountPercent } from '../../lib/config';

// /**
//  * Select the featured course from the list.
//  * Priority: badge === 'Most Popular' > lowest order_index > first.
//  *
//  * @param {Array<object>} courses - Published courses
//  * @returns {object|null}
//  */
// const pickFeaturedCourse = (courses) => {
//   if (!Array.isArray(courses) || courses.length === 0) return null;

//   const badged = courses.find(
//     (c) => c.badge && String(c.badge).toLowerCase() === 'most popular'
//   );
//   if (badged) return badged;

//   const sorted = [...courses].sort(
//     (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
//   );
//   return sorted[0];
// };

// const PricingShowcase = () => {
//   const { t, language } = useLanguage();
//   const { isAuthenticated } = useAuth();
//   const { courses, loading: coursesLoading } = useCourses();
//   const { pricing, loading: pricingLoading } = usePaymentConfig();

//   const fullCourse = pricing?.fullCourse || {};
//   const perPhase = pricing?.perPhase || {};
//   const currency = perPhase.currency || fullCourse.currency || 'ETB';
//   const referralPercent = getReferredDiscountPercent();

//   /* Featured course — hybrid selection */
//   const featuredCourse = useMemo(
//     () => pickFeaturedCourse(courses),
//     [courses]
//   );

//   /*
//    * Fetch the featured course's full detail (with phases) using its slug.
//    * The list endpoint returns only top-level fields, so the phases must
//    * come from the detail endpoint.
//    *
//    * usePortalCourse requires a slug string; before the courses load, we
//    * pass null so the hook short-circuits.
//    */
//   const { phases: featuredPhases, loading: phasesLoading } = usePortalCourse(
//     featuredCourse?.slug || null
//   );

//   /* Featured course display price — course override > global */
//   const featuredFullPrice = useMemo(() => {
//     if (featuredCourse?.price_etb != null) {
//       return Number(featuredCourse.price_etb);
//     }
//     return fullCourse.amountETB || 0;
//   }, [featuredCourse, fullCourse.amountETB]);

//   /* Per-phase display price — use first phase's override or global */
//   const featuredPerPhasePrice = useMemo(() => {
//     if (featuredPhases && featuredPhases.length > 0) {
//       const firstPhase = featuredPhases[0];
//       if (firstPhase.price_etb != null) return Number(firstPhase.price_etb);
//     }
//     return perPhase.amountETB || 0;
//   }, [featuredPhases, perPhase.amountETB]);

//   /* Discount percent (only applies when course price comes from global) */
//   const discountPercent = useMemo(() => {
//     if (featuredCourse?.price_etb != null) return 0;
//     const original = fullCourse.originalAmountETB || 0;
//     const current = fullCourse.amountETB || 0;
//     if (original <= 0 || current <= 0) return 0;
//     return Math.round(((original - current) / original) * 100);
//   }, [featuredCourse, fullCourse.originalAmountETB, fullCourse.amountETB]);

//   const enrollHref = isAuthenticated
//     ? '/checkout?mode=full-course'
//     : '/auth/login?redirect=/checkout?mode=full-course';

//   /* Build card array: featured course + its phase cards */
//   const allCards = useMemo(() => {
//     if (!featuredCourse) return [];

//     const cards = [];

//     /* Featured hero card */
//     cards.push({
//       id: 'featured-course',
//       type: 'full-course',
//       number: null,
//       title: featuredCourse.title,
//       subtitle:
//         t.landing?.pricingOverview?.fullCourseSubtitle ||
//         'Complete curriculum, best value',
//       price: featuredFullPrice,
//       originalPrice:
//         featuredCourse.price_etb != null
//           ? null
//           : fullCourse.originalAmountETB || null,
//       discountPercent,
//       currency,
//       features: [
//         t.landing?.pricingOverview?.featureAllPhases ||
//           'All structured phases',
//         t.landing?.pricingOverview?.featureLifetime || 'Lifetime access',
//         t.landing?.pricingOverview?.featureCertificate ||
//           'Completion certificate',
//         t.landing?.pricingOverview?.featureCommunity ||
//           'Private Telegram community',
//       ],
//       badge:
//         featuredCourse.badge ||
//         t.landing?.pricingOverview?.bestValue ||
//         'BEST VALUE',
//       badgeIcon: Crown,
//       href: enrollHref,
//       ctaText: t.landing?.pricingOverview?.enrollCta || 'Enroll Now',
//       isPremium: true,
//     });

//     /* Phase cards from the featured course */
//     (featuredPhases || []).forEach((phase, index) => {
//       const weekCount = phase.weeks ? phase.weeks.length : 0;
//       cards.push({
//         id: phase.id || `phase-${index + 1}`,
//         type: 'phase',
//         number: phase.phase_number || index + 1,
//         title:
//           language === 'am' ? phase.title_am || phase.title : phase.title,
//         subtitle: `${weekCount} ${
//           t.landing?.pricingOverview?.classes || 'classes'
//         } · ${
//           phase.duration ||
//           `${weekCount} ${t.pricing?.weeksUnit || 'Weeks'}`
//         }`,
//         price: featuredPerPhasePrice,
//         originalPrice: perPhase.originalAmountETB || null,
//         discountPercent:
//           featuredPhases[0]?.price_etb != null
//             ? 0
//             : perPhase.originalAmountETB
//             ? Math.round(
//                 ((perPhase.originalAmountETB - featuredPerPhasePrice) /
//                   perPhase.originalAmountETB) *
//                   100
//               )
//             : 0,
//         currency,
//         weekCount,
//         features: (phase.outcomes || []).slice(0, 3),
//         badge: null,
//         badgeIcon: null,
//         href: `/pricing?course=${featuredCourse.slug}`,
//         ctaText: t.landing?.pricingOverview?.viewPhase || 'View Phase',
//         isPremium: false,
//         colorIndex: index,
//       });
//     });

//     return cards;
//   }, [
//     featuredCourse,
//     featuredPhases,
//     featuredFullPrice,
//     featuredPerPhasePrice,
//     fullCourse,
//     perPhase,
//     currency,
//     discountPercent,
//     enrollHref,
//     t,
//     language,
//   ]);

//   const phaseAccentColors = [
//     'rgba(245,158,11,0.08)',
//     'rgba(59,130,246,0.08)',
//     'rgba(16,185,129,0.08)',
//     'rgba(139,92,246,0.08)',
//     'rgba(236,72,153,0.08)',
//   ];
//   const phaseBorderColors = [
//     'rgba(245,158,11,0.25)',
//     'rgba(59,130,246,0.25)',
//     'rgba(16,185,129,0.25)',
//     'rgba(139,92,246,0.25)',
//     'rgba(236,72,153,0.25)',
//   ];
//   const phaseNumberColors = [
//     '#f59e0b',
//     '#3b82f6',
//     '#10b981',
//     '#8b5cf6',
//     '#ec4899',
//   ];

//   if (pricingLoading || coursesLoading || phasesLoading || !pricing) {
//     return (
//       <section className="landing-pricing-3d">
//         <div className="spinner" style={{ padding: '3rem 0' }}>
//           <div className="spinner-circle" />
//         </div>
//       </section>
//     );
//   }

//   if (!featuredCourse) {
//     return (
//       <section className="landing-pricing-3d">
//         <div className="landing-pricing-header">
//           <span className="landing-pricing-eyebrow">
//             {t.landing?.pricingOverview?.eyebrow || 'Tuition'}
//           </span>
//           <h2 className="landing-pricing-title">
//             {t.landing?.pricingOverview?.title ||
//               'Simple, Transparent Pricing'}
//           </h2>
//           <p className="landing-pricing-subtitle">
//             {t.landing?.pricingOverview?.noCoursesAvailable ||
//               'Courses will appear here soon.'}
//           </p>
//         </div>
//       </section>
//     );
//   }

//   const courseCount = courses.length;
//   const showExploreMore = courseCount > 1;

//   return (
//     <section className="landing-pricing-3d">
//       <div className="landing-pricing-header">
//         <span className="landing-pricing-eyebrow">
//           {t.landing?.pricingOverview?.eyebrow || 'Tuition'}
//         </span>
//         <h2 className="landing-pricing-title">
//           {t.landing?.pricingOverview?.title ||
//             'Simple, Transparent Pricing'}
//         </h2>
//         <p className="landing-pricing-subtitle">
//           {t.landing?.pricingOverview?.subtitle ||
//             'Choose the path that fits your goals.'}
//         </p>
//       </div>

//       <div className="landing-pricing-equal-grid">
//         {allCards.map((card) => {
//           const isFullCourse = card.type === 'full-course';
//           const accentBg = isFullCourse
//             ? 'rgba(245,158,11,0.06)'
//             : phaseAccentColors[card.colorIndex] || 'rgba(245,158,11,0.06)';
//           const accentBorder = isFullCourse
//             ? 'rgba(245,158,11,0.5)'
//             : phaseBorderColors[card.colorIndex] || 'rgba(245,158,11,0.25)';
//           const accentColor = isFullCourse
//             ? 'var(--accent-gold)'
//             : phaseNumberColors[card.colorIndex] || 'var(--accent-gold)';

//           return (
//             <div
//               key={card.id}
//               className={`landing-pricing-equal-card ${
//                 isFullCourse ? 'premium-card' : ''
//               }`}
//               style={{
//                 '--card-accent-bg': accentBg,
//                 '--card-accent-border': accentBorder,
//                 '--card-accent-color': accentColor,
//               }}
//             >
//               {card.badge && (
//                 <span className="landing-pricing-equal-badge">
//                   <card.badgeIcon size={12} />
//                   {card.badge}
//                 </span>
//               )}
//               {card.number && (
//                 <div
//                   className="landing-pricing-equal-number"
//                   style={{ background: accentColor }}
//                 >
//                   {card.number}
//                 </div>
//               )}
//               <h3 className="landing-pricing-equal-title">
//                 {isFullCourse ? (
//                   <>
//                     <Crown
//                       size={16}
//                       style={{
//                         color: 'var(--accent-gold)',
//                         marginRight: '0.375rem',
//                         display: 'inline',
//                         verticalAlign: 'middle',
//                       }}
//                     />
//                     {card.title}
//                   </>
//                 ) : (
//                   card.title
//                 )}
//               </h3>
//               <p className="landing-pricing-equal-subtitle">{card.subtitle}</p>
//               <div className="landing-pricing-equal-price-row">
//                 <span className="landing-pricing-equal-price">
//                   {card.price.toLocaleString()} {card.currency}
//                 </span>
//                 {isFullCourse && (
//                   <span className="landing-pricing-equal-per-phase">
//                     /{' '}
//                     {t.landing?.pricingOverview?.fullCourse ||
//                       'full course'}
//                   </span>
//                 )}
//               </div>
//               {card.originalPrice && card.discountPercent > 0 && (
//                 <div className="landing-pricing-equal-save-row">
//                   <span className="landing-pricing-equal-original">
//                     {card.originalPrice.toLocaleString()} {card.currency}
//                   </span>
//                   <span className="landing-pricing-equal-save">
//                     <Zap size={10} />
//                     {card.discountPercent}%{' '}
//                     {t.landing?.pricingOverview?.off || 'off'}
//                   </span>
//                 </div>
//               )}
//               <ul className="landing-pricing-equal-features">
//                 {card.features.map((feature, fi) => (
//                   <li key={fi}>
//                     <Check
//                       size={14}
//                       style={{
//                         color: isFullCourse
//                           ? 'var(--accent-gold)'
//                           : accentColor,
//                       }}
//                     />
//                     <span>{feature}</span>
//                   </li>
//                 ))}
//               </ul>
//               <Link
//                 href={card.href}
//                 className={`landing-pricing-equal-cta ${
//                   isFullCourse ? 'primary' : ''
//                 }`}
//               >
//                 <span>{card.ctaText}</span>
//                 <ArrowRight size={14} />
//               </Link>
//             </div>
//           );
//         })}
//       </div>

//       {/* Explore more courses CTA */}
//       {showExploreMore && (
//         <div className="pricing-explore-more">
//           <div className="pricing-explore-more-content">
//             <div className="pricing-explore-more-icon">
//               <GraduationCap size={22} />
//             </div>
//             <div className="pricing-explore-more-text">
//               <h3 className="pricing-explore-more-title">
//                 {t.landing?.pricingOverview?.exploreMoreHeading ||
//                   'Explore More Courses'}
//               </h3>
//               <p className="pricing-explore-more-subtitle">
//                 {(courseCount === 1
//                   ? t.landing?.pricingOverview
//                       ?.exploreMoreSubtitleSingular ||
//                     '{count} course available'
//                   : t.landing?.pricingOverview
//                       ?.exploreMoreSubtitlePlural ||
//                     '{count} courses available'
//                 ).replace('{count}', String(courseCount))}
//               </p>
//             </div>
//             <Link href="/pricing" className="pricing-explore-more-cta">
//               <span>
//                 {t.landing?.pricingOverview?.exploreMoreCta ||
//                   'See All Courses'}
//               </span>
//               <ArrowRight size={16} />
//             </Link>
//           </div>
//         </div>
//       )}

//       {/* Referral hint */}
//       <div className="pricing-referral-hint">
//         <span aria-hidden="true">🎁</span>
//         <span>
//           {(
//             t.landing?.pricingOverview?.referralHint ||
//             "Have a friend's code? Save {percent}% at checkout."
//           ).replace('{percent}', String(referralPercent))}
//         </span>
//       </div>
//     </section>
//   );
// };

// export default PricingShowcase;






/**
 * @fileoverview Pricing Showcase — Equal Card Grid
 *
 * Displays the featured course hero card + its phases. Uses a CheckoutModal
 * for full-course purchases so the modal always receives the correct
 * courseId + coursePriceEtb (matching the /pricing?course=slug behavior).
 *
 * Behavior:
 *   - Hero card CTA "Enroll Now" → opens the CheckoutModal with the
 *     featured course's price and ID
 *   - Phase cards CTA "View Phase" → navigates to /pricing?course=slug
 *     where the user can pick individual phases
 *   - Explore More Courses CTA → /pricing (catalog)
 *
 * Path: apps/web/components/landing/PricingShowcase.jsx
 */
import { useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Check, Zap, ArrowRight, Crown, GraduationCap } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../hooks/useCourses';
import usePortalCourse from '../../hooks/usePortalCourse';
import usePaymentConfig from '../../hooks/usePaymentConfig';
import { getReferredDiscountPercent } from '../../lib/config';
import CheckoutModal from '../payment/CheckoutModal';

/**
 * Select the featured course from the list.
 * Priority: badge === 'Most Popular' > lowest order_index > first.
 */
const pickFeaturedCourse = (courses) => {
  if (!Array.isArray(courses) || courses.length === 0) return null;

  const badged = courses.find(
    (c) => c.badge && String(c.badge).toLowerCase() === 'most popular'
  );
  if (badged) return badged;

  const sorted = [...courses].sort(
    (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
  );
  return sorted[0];
};

const PricingShowcase = () => {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { courses, loading: coursesLoading } = useCourses();
  const { pricing, loading: pricingLoading } = usePaymentConfig();

  const fullCourse = pricing?.fullCourse || {};
  const perPhase = pricing?.perPhase || {};
  const currency = perPhase.currency || fullCourse.currency || 'ETB';
  const referralPercent = getReferredDiscountPercent();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const featuredCourse = useMemo(
    () => pickFeaturedCourse(courses),
    [courses]
  );

  const { phases: featuredPhases, loading: phasesLoading } = usePortalCourse(
    featuredCourse?.slug || null
  );

  const featuredFullPrice = useMemo(() => {
    if (featuredCourse?.price_etb != null) {
      return Number(featuredCourse.price_etb);
    }
    return fullCourse.amountETB || 0;
  }, [featuredCourse, fullCourse.amountETB]);

  const featuredPerPhasePrice = useMemo(() => {
    if (featuredPhases && featuredPhases.length > 0) {
      const firstPhase = featuredPhases[0];
      if (firstPhase.price_etb != null) return Number(firstPhase.price_etb);
    }
    return perPhase.amountETB || 0;
  }, [featuredPhases, perPhase.amountETB]);

  const discountPercent = useMemo(() => {
    if (featuredCourse?.price_etb != null) return 0;
    const original = fullCourse.originalAmountETB || 0;
    const current = fullCourse.amountETB || 0;
    if (original <= 0 || current <= 0) return 0;
    return Math.round(((original - current) / original) * 100);
  }, [featuredCourse, fullCourse.originalAmountETB, fullCourse.amountETB]);

  /**
   * Open the checkout modal with the featured course context. If the user
   * isn't authenticated, redirect to login first and preserve the return
   * path so they land back on the landing page after logging in.
   */
  const handleOpenCheckout = useCallback(() => {
    if (!isAuthenticated) {
      window.location.href = `/auth/login?redirect=${encodeURIComponent('/')}`;
      return;
    }
    setIsModalOpen(true);
  }, [isAuthenticated]);

  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);

  /* Build the display card list. */
  const allCards = useMemo(() => {
    if (!featuredCourse) return [];

    const cards = [];

    cards.push({
      id: 'featured-course',
      type: 'full-course',
      number: null,
      title: featuredCourse.title,
      subtitle:
        t.landing?.pricingOverview?.fullCourseSubtitle ||
        'Complete curriculum, best value',
      price: featuredFullPrice,
      originalPrice:
        featuredCourse.price_etb != null
          ? null
          : fullCourse.originalAmountETB || null,
      discountPercent,
      currency,
      features: [
        t.landing?.pricingOverview?.featureAllPhases || 'All structured phases',
        t.landing?.pricingOverview?.featureLifetime || 'Lifetime access',
        t.landing?.pricingOverview?.featureCertificate || 'Completion certificate',
        t.landing?.pricingOverview?.featureCommunity || 'Private Telegram community',
      ],
      badge:
        featuredCourse.badge ||
        t.landing?.pricingOverview?.bestValue ||
        'BEST VALUE',
      badgeIcon: Crown,
      isPremium: true,
    });

    (featuredPhases || []).forEach((phase, index) => {
      const weekCount = phase.weeks ? phase.weeks.length : 0;
      cards.push({
        id: phase.id || `phase-${index + 1}`,
        type: 'phase',
        number: phase.phase_number || index + 1,
        title:
          language === 'am' ? phase.title_am || phase.title : phase.title,
        subtitle: `${weekCount} ${
          t.landing?.pricingOverview?.classes || 'classes'
        } · ${
          phase.duration || `${weekCount} ${t.pricing?.weeksUnit || 'Weeks'}`
        }`,
        price: featuredPerPhasePrice,
        originalPrice: perPhase.originalAmountETB || null,
        discountPercent:
          featuredPhases[0]?.price_etb != null
            ? 0
            : perPhase.originalAmountETB
            ? Math.round(
                ((perPhase.originalAmountETB - featuredPerPhasePrice) /
                  perPhase.originalAmountETB) *
                  100
              )
            : 0,
        currency,
        weekCount,
        features: (phase.outcomes || []).slice(0, 3),
        badge: null,
        badgeIcon: null,
        slug: featuredCourse.slug,
        ctaText: t.landing?.pricingOverview?.viewPhase || 'View Phase',
        isPremium: false,
        colorIndex: index,
      });
    });

    return cards;
  }, [
    featuredCourse,
    featuredPhases,
    featuredFullPrice,
    featuredPerPhasePrice,
    fullCourse,
    perPhase,
    currency,
    discountPercent,
    t,
    language,
  ]);

  const phaseAccentColors = [
    'rgba(245,158,11,0.08)',
    'rgba(59,130,246,0.08)',
    'rgba(16,185,129,0.08)',
    'rgba(139,92,246,0.08)',
    'rgba(236,72,153,0.08)',
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

  if (pricingLoading || coursesLoading || phasesLoading || !pricing) {
    return (
      <section className="landing-pricing-3d">
        <div className="spinner" style={{ padding: '3rem 0' }}>
          <div className="spinner-circle" />
        </div>
      </section>
    );
  }

  if (!featuredCourse) {
    return (
      <section className="landing-pricing-3d">
        <div className="landing-pricing-header">
          <span className="landing-pricing-eyebrow">
            {t.landing?.pricingOverview?.eyebrow || 'Tuition'}
          </span>
          <h2 className="landing-pricing-title">
            {t.landing?.pricingOverview?.title ||
              'Simple, Transparent Pricing'}
          </h2>
          <p className="landing-pricing-subtitle">
            {t.landing?.pricingOverview?.noCoursesAvailable ||
              'Courses will appear here soon.'}
          </p>
        </div>
      </section>
    );
  }

  const courseCount = courses.length;
  const showExploreMore = courseCount > 1;

  return (
    <section className="landing-pricing-3d">
      <div className="landing-pricing-header">
        <span className="landing-pricing-eyebrow">
          {t.landing?.pricingOverview?.eyebrow || 'Tuition'}
        </span>
        <h2 className="landing-pricing-title">
          {t.landing?.pricingOverview?.title ||
            'Simple, Transparent Pricing'}
        </h2>
        <p className="landing-pricing-subtitle">
          {t.landing?.pricingOverview?.subtitle ||
            'Choose the path that fits your goals.'}
        </p>
      </div>

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

          /*
           * Hero card CTA opens the checkout modal (with courseId).
           * Phase card CTA navigates to /pricing?course=slug to pick phases.
           */
          const ctaContent = (
            <>
              <span>
                {isFullCourse
                  ? t.landing?.pricingOverview?.enrollCta || 'Enroll Now'
                  : card.ctaText}
              </span>
              <ArrowRight size={14} />
            </>
          );

          return (
            <div
              key={card.id}
              className={`landing-pricing-equal-card ${
                isFullCourse ? 'premium-card' : ''
              }`}
              style={{
                '--card-accent-bg': accentBg,
                '--card-accent-border': accentBorder,
                '--card-accent-color': accentColor,
              }}
            >
              {card.badge && (
                <span className="landing-pricing-equal-badge">
                  <card.badgeIcon size={12} />
                  {card.badge}
                </span>
              )}
              {card.number && (
                <div
                  className="landing-pricing-equal-number"
                  style={{ background: accentColor }}
                >
                  {card.number}
                </div>
              )}
              <h3 className="landing-pricing-equal-title">
                {isFullCourse ? (
                  <>
                    <Crown
                      size={16}
                      style={{
                        color: 'var(--accent-gold)',
                        marginRight: '0.375rem',
                        display: 'inline',
                        verticalAlign: 'middle',
                      }}
                    />
                    {card.title}
                  </>
                ) : (
                  card.title
                )}
              </h3>
              <p className="landing-pricing-equal-subtitle">{card.subtitle}</p>
              <div className="landing-pricing-equal-price-row">
                <span className="landing-pricing-equal-price">
                  {card.price.toLocaleString()} {card.currency}
                </span>
                {isFullCourse && (
                  <span className="landing-pricing-equal-per-phase">
                    /{' '}
                    {t.landing?.pricingOverview?.fullCourse || 'full course'}
                  </span>
                )}
              </div>
              {card.originalPrice && card.discountPercent > 0 && (
                <div className="landing-pricing-equal-save-row">
                  <span className="landing-pricing-equal-original">
                    {card.originalPrice.toLocaleString()} {card.currency}
                  </span>
                  <span className="landing-pricing-equal-save">
                    <Zap size={10} />
                    {card.discountPercent}%{' '}
                    {t.landing?.pricingOverview?.off || 'off'}
                  </span>
                </div>
              )}
              <ul className="landing-pricing-equal-features">
                {card.features.map((feature, fi) => (
                  <li key={fi}>
                    <Check
                      size={14}
                      style={{
                        color: isFullCourse
                          ? 'var(--accent-gold)'
                          : accentColor,
                      }}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA: hero = button (opens modal), phase = link (navigates) */}
              {isFullCourse ? (
                <button
                  type="button"
                  onClick={handleOpenCheckout}
                  className="landing-pricing-equal-cta primary"
                  style={{ cursor: 'pointer', border: 'none', font: 'inherit' }}
                >
                  {ctaContent}
                </button>
              ) : (
                <Link
                  href={`/pricing?course=${card.slug}`}
                  className="landing-pricing-equal-cta"
                >
                  {ctaContent}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {showExploreMore && (
        <div className="pricing-explore-more">
          <div className="pricing-explore-more-content">
            <div className="pricing-explore-more-icon">
              <GraduationCap size={22} />
            </div>
            <div className="pricing-explore-more-text">
              <h3 className="pricing-explore-more-title">
                {t.landing?.pricingOverview?.exploreMoreHeading ||
                  'Explore More Courses'}
              </h3>
              <p className="pricing-explore-more-subtitle">
                {(courseCount === 1
                  ? t.landing?.pricingOverview?.exploreMoreSubtitleSingular ||
                    '{count} course available'
                  : t.landing?.pricingOverview?.exploreMoreSubtitlePlural ||
                    '{count} courses available'
                ).replace('{count}', String(courseCount))}
              </p>
            </div>
            <Link href="/pricing" className="pricing-explore-more-cta">
              <span>
                {t.landing?.pricingOverview?.exploreMoreCta ||
                  'See All Courses'}
              </span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      <div className="pricing-referral-hint">
        <span aria-hidden="true">🎁</span>
        <span>
          {(
            t.landing?.pricingOverview?.referralHint ||
            "Have a friend's code? Save {percent}% at checkout."
          ).replace('{percent}', String(referralPercent))}
        </span>
      </div>

      {/* The checkout modal — always mounted with correct featured-course context */}
      <CheckoutModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        purchaseMode="full-course"
        selectedPhases={[]}
        coursePhases={featuredPhases || []}
        courseId={featuredCourse.id}
        coursePriceEtb={featuredCourse.price_etb}
        resellerCode=""
        resellerProfile={null}
      />
    </section>
  );
};

export default PricingShowcase;