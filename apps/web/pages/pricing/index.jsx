// /**
//  * @fileoverview Pricing Page
//  *
//  * Three modes:
//  *   1. Reseller   (?reseller=CODE) — single hero, reseller's price
//  *   2. Course     (?course=slug)   — full course + per-phase cart
//  *   3. Catalog    (default)        — grid of all published courses
//  *
//  * Every CheckoutModal invocation passes the resolved `coursePriceEtb`
//  * so the modal shows the correct price (600 for Full-Stack) instead of
//  * the global fallback (1,199).
//  *
//  * Path: apps/web/pages/pricing/index.jsx
//  */

// import { useState, useEffect, useMemo, useCallback } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/router';
// import {
//   Check, ArrowRight, Sparkles, BookOpen, Crown, Zap, GraduationCap,
//   Layers, ChevronDown, ChevronUp,
// } from 'lucide-react';
// import SEOHead from '../../components/shared/SEOHead';
// import PageLayout from '../../components/shared/PageLayout';
// import CheckoutModal from '../../components/payment/CheckoutModal';
// import { useLanguage } from '../../context/LanguageContext';
// import { useAuth } from '../../context/AuthContext';

// // Named exports — the hook file has no default export. Using a default
// // import here crashes the page with `useCourses is not a function`.
// import { useCourses, useCourseBySlug } from '../../hooks/useCourses';

// import useCart from '../../hooks/useCart';
// import usePaymentConfig from '../../hooks/usePaymentConfig';
// import useResellerCode from '../../hooks/useResellerCode';

// const PricingPage = () => {
//   const router = useRouter();
//   const { t, language } = useLanguage();
//   const { isAuthenticated } = useAuth();
//   const cart = useCart();
//   const { courses, loading: coursesLoading } = useCourses();
//   const { pricing, loading: pricingLoading } = usePaymentConfig();
//   const { resellerProfile, resellerCode, loading: resellerLoading } =
//     useResellerCode();

//   const slug = router.query.course;
//   const { course: courseContext, loading: courseLoading } = useCourseBySlug(
//     slug
//   );

//   const [purchaseMode, setPurchaseMode] = useState('full-course');
//   const [expandedPhase, setExpandedPhase] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const fullCourse = pricing?.fullCourse || {};
//   const perPhase = pricing?.perPhase || {};
//   const currency =
//     fullCourse.currency || perPhase.currency || 'ETB';
//   const isResellerActive = Boolean(resellerProfile && resellerCode);

//   const featuredCourse = useMemo(() => {
//     if (!courses || courses.length === 0) return null;
//     return (
//       courses.find(
//         (c) => c.badge && String(c.badge).toLowerCase() === 'most popular'
//       ) || courses[0]
//     );
//   }, [courses]);

//   const handleToggleCart = (phaseId) => cart.togglePhase(phaseId);

//   const handleOpenCheckout = useCallback(
//     (mode = 'full-course') => {
//       if (!isAuthenticated) {
//         window.location.href = `/auth/login?redirect=${encodeURIComponent(
//           router.asPath
//         )}`;
//         return;
//       }
//       setPurchaseMode(mode);
//       setIsModalOpen(true);
//     },
//     [isAuthenticated, router.asPath]
//   );

//   const handleCloseModal = () => setIsModalOpen(false);

//   if (
//     pricingLoading ||
//     coursesLoading ||
//     resellerLoading ||
//     (slug && courseLoading)
//   ) {
//     return (
//       <PageLayout>
//         <div className="spinner" style={{ padding: '5rem 0' }}>
//           <div className="spinner-circle" />
//         </div>
//       </PageLayout>
//     );
//   }

//   /* ────────────────────────────────────────────────────────────────────────
//    * RESELLER MODE
//    * ──────────────────────────────────────────────────────────────────────── */
//   if (isResellerActive) {
//     const resellerPrice = Number(resellerProfile.price) || 0;
//     return (
//       <PageLayout>
//         <div className="pricing-modern">
//           <header className="pricing-modern-header">
//             <span className="pricing-modern-eyebrow">
//               {t.pricing?.tuitionEyebrow || 'Tuition'}
//             </span>
//             <h1 className="pricing-modern-title">
//               {t.pricing?.heading || 'Simple & Transparent Tuition'}
//             </h1>
//             <p className="pricing-modern-subtitle">
//               {t.pricing?.subheading || 'Choose your path.'}
//             </p>
//           </header>
//           <div className="pricing-hero-card-wrapper">
//             <div className="pricing-hero-card active">
//               <div className="pricing-hero-glow" />
//               <div className="pricing-hero-content">
//                 <div className="pricing-hero-left">
//                   <div className="pricing-hero-badges">
//                     <span className="pricing-hero-badge-best">
//                       <Sparkles size={14} />
//                       {t.pricing?.bestValue || 'Best Value'}
//                     </span>
//                   </div>
//                   <h2 className="pricing-hero-name">
//                     {t.pricing?.masterclass || 'Full-Stack Masterclass'}
//                   </h2>
//                 </div>
//                 <div className="pricing-hero-right">
//                   <div className="pricing-hero-price-block">
//                     <div className="pricing-hero-price">
//                       <span className="pricing-hero-amount">
//                         {resellerPrice.toLocaleString()}
//                       </span>
//                       <span className="pricing-hero-currency">
//                         {currency}
//                       </span>
//                     </div>
//                     <span
//                       className="pricing-hero-original"
//                       style={{ color: '#f59e0b', fontWeight: 600 }}
//                     >
//                       Sold by {resellerProfile.displayName}
//                     </span>
//                   </div>
//                   <button
//                     className="pricing-btn-primary"
//                     onClick={() => handleOpenCheckout('full-course')}
//                   >
//                     <Sparkles size={18} />
//                     {t.pricing?.enrollToday || 'Enroll Today'}
//                     <ArrowRight size={18} />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//         <CheckoutModal
//           isOpen={isModalOpen}
//           onClose={handleCloseModal}
//           purchaseMode="full-course"
//           selectedPhases={[]}
//           coursePhases={[]}
//           courseId={null}
//           coursePriceEtb={null}
//           resellerCode={resellerCode}
//           resellerProfile={resellerProfile}
//         />
//       </PageLayout>
//     );
//   }

//   /* ────────────────────────────────────────────────────────────────────────
//    * COURSE CONTEXT MODE (cart + phases)
//    * ──────────────────────────────────────────────────────────────────────── */
//   if (courseContext) {
//     const phases = courseContext.phases || [];
//     const coursePrice =
//       courseContext.price_etb != null
//         ? Number(courseContext.price_etb)
//         : fullCourse.amountETB || 0;
//     const phasePrice = perPhase.amountETB || 0;
//     const cartTotal = cart.selectedPhases.length * phasePrice;

//     return (
//       <PageLayout>
//         <div className="pricing-modern">
//           <Link href="/pricing" className="pricing-back-link">
//             ← {t.pricing?.backToCatalog || 'Back to All Courses'}
//           </Link>

//           <header className="pricing-modern-header">
//             <span className="pricing-modern-eyebrow">
//               {t.pricing?.tuitionEyebrow || 'Tuition'}
//             </span>
//             <h1 className="pricing-modern-title">
//               {language === 'am' && courseContext.title_am
//                 ? courseContext.title_am
//                 : courseContext.title}
//             </h1>
//             <p className="pricing-modern-subtitle">
//               {language === 'am' && courseContext.description_am
//                 ? courseContext.description_am
//                 : courseContext.description}
//             </p>
//           </header>

//           {/* Hero full-course card */}
//           <div className="pricing-hero-card-wrapper">
//             <div className="pricing-hero-card active">
//               <div className="pricing-hero-glow" />
//               <div className="pricing-hero-content">
//                 <div className="pricing-hero-left">
//                   <div className="pricing-hero-badges">
//                     {courseContext.badge && (
//                       <span className="pricing-hero-badge-best">
//                         <Crown size={14} /> {courseContext.badge}
//                       </span>
//                     )}
//                     <span className="pricing-hero-badge-pass">
//                       {t.pricing?.fullCourseLabel || 'Full Course'}
//                     </span>
//                   </div>
//                   <h2 className="pricing-hero-name">
//                     {courseContext.duration} · {courseContext.level}
//                   </h2>
//                 </div>
//                 <div className="pricing-hero-right">
//                   <div className="pricing-hero-price-block">
//                     <div className="pricing-hero-price">
//                       <span className="pricing-hero-amount">
//                         {coursePrice.toLocaleString()}
//                       </span>
//                       <span className="pricing-hero-currency">
//                         {currency}
//                       </span>
//                     </div>
//                   </div>
//                   <button
//                     className="pricing-btn-primary"
//                     onClick={() => handleOpenCheckout('full-course')}
//                   >
//                     <Sparkles size={18} />
//                     {t.pricing?.enrollToday || 'Enroll Today'}
//                     <ArrowRight size={18} />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Build your own path */}
//           <div className="pricing-roadmap-section">
//             <div className="pricing-roadmap-header">
//               <div>
//                 <h2 className="pricing-roadmap-title">
//                   {t.pricing?.orBuildYourOwn || 'Or Build Your Own Path'}
//                 </h2>
//                 <p className="pricing-roadmap-subtitle">
//                   {(
//                     t.pricing?.selectIndividualPhases ||
//                     'Select individual phases at {price} {currency} each.'
//                   )
//                     .replace('{price}', phasePrice.toLocaleString())
//                     .replace('{currency}', currency)}
//                 </p>
//               </div>
//             </div>

//             <div className="pricing-timeline">
//               {phases.map((phase, idx) => {
//                 const phaseId =
//                   phase.id || `phase-${phase.phase_number || idx + 1}`;
//                 const isSelected = cart.isPhaseSelected(phaseId);
//                 const isExpanded = expandedPhase === phaseId;

//                 return (
//                   <div key={phaseId} className="pricing-timeline-card">
//                     <button
//                       className="pricing-timeline-card-header"
//                       onClick={() =>
//                         setExpandedPhase(isExpanded ? null : phaseId)
//                       }
//                     >
//                       <div>
//                         <span className="pricing-timeline-phase-label">
//                           {t.pricing?.phaseLabel || 'Phase'}{' '}
//                           {phase.phase_number || idx + 1}
//                         </span>
//                         <h3 className="pricing-timeline-phase-title">
//                           {phase.title}
//                         </h3>
//                       </div>
//                       <div className="pricing-timeline-card-header-right">
//                         <span className="pricing-timeline-price-badge">
//                           {phasePrice.toLocaleString()} {currency}
//                         </span>
//                         {isExpanded ? (
//                           <ChevronUp size={18} />
//                         ) : (
//                           <ChevronDown size={18} />
//                         )}
//                       </div>
//                     </button>
//                     {isExpanded && (
//                       <div className="pricing-timeline-card-body">
//                         <p className="pricing-timeline-card-desc">
//                           {phase.description}
//                         </p>
//                         <button
//                           onClick={() => handleToggleCart(phaseId)}
//                           className={`pricing-timeline-cart-btn ${
//                             isSelected ? 'remove' : 'add'
//                           }`}
//                         >
//                           {isSelected
//                             ? 'Remove'
//                             : `Add to Cart — ${phasePrice.toLocaleString()} ${currency}`}
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Sticky cart */}
//           {cart.selectedPhases.length > 0 && (
//             <div className="pricing-sticky-cart">
//               <div className="pricing-sticky-cart-inner">
//                 <div>
//                   <span
//                     style={{
//                       fontSize: '0.75rem',
//                       color: 'var(--text-muted)',
//                       display: 'block',
//                     }}
//                   >
//                     {cart.selectedPhases.length}{' '}
//                     {t.pricing?.phasesUnit || 'phases'} selected
//                   </span>
//                   <span
//                     style={{
//                       fontSize: '1.25rem',
//                       fontWeight: 800,
//                       color: 'var(--text-main)',
//                     }}
//                   >
//                     {cartTotal.toLocaleString()} {currency}
//                   </span>
//                 </div>
//                 <button
//                   className="pricing-btn-primary"
//                   onClick={() => handleOpenCheckout('individual-phases')}
//                 >
//                   <Sparkles size={18} />
//                   {t.pricing?.enrollToday || 'Enroll'}
//                   <ArrowRight size={18} />
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Modal — coursePriceEtb passed so the modal shows 600, not 1199 */}
//         <CheckoutModal
//           isOpen={isModalOpen}
//           onClose={handleCloseModal}
//           purchaseMode={purchaseMode}
//           selectedPhases={
//             purchaseMode === 'individual-phases' ? cart.selectedPhases : []
//           }
//           coursePhases={phases}
//           courseId={courseContext.id}
//           coursePriceEtb={courseContext.price_etb}
//           resellerCode=""
//           resellerProfile={null}
//         />
//       </PageLayout>
//     );
//   }

//   /* ────────────────────────────────────────────────────────────────────────
//    * CATALOG MODE (default)
//    * ──────────────────────────────────────────────────────────────────────── */
//   return (
//     <PageLayout>
//       <div className="pricing-modern">
//         <header className="pricing-modern-header">
//           <span className="pricing-modern-eyebrow">
//             {t.pricing?.courseGridEyebrow || 'Course Catalog'}
//           </span>
//           <h1 className="pricing-modern-title">
//             {t.pricing?.courseGridTitle || 'Explore Our Courses'}
//           </h1>
//           <p className="pricing-modern-subtitle">
//             {t.pricing?.courseGridSubtitle ||
//               'Every course is a complete learning journey.'}
//           </p>
//         </header>

//         <div className="landing-pricing-equal-grid">
//           {courses.map((course) => {
//             const isFeatured = course.id === featuredCourse?.id;
//             const coursePrice =
//               course.price_etb != null
//                 ? Number(course.price_etb)
//                 : fullCourse.amountETB || 0;
//             return (
//               <Link
//                 key={course.id}
//                 href={`/pricing?course=${course.slug}`}
//                 className={`landing-pricing-equal-card ${
//                   isFeatured ? 'premium-card' : ''
//                 }`}
//               >
//                 {course.badge && (
//                   <span className="landing-pricing-equal-badge">
//                     <Crown size={12} /> {course.badge}
//                   </span>
//                 )}
//                 <h3 className="landing-pricing-equal-title">
//                   {language === 'am' && course.title_am
//                     ? course.title_am
//                     : course.title}
//                 </h3>
//                 <p className="landing-pricing-equal-subtitle">
//                   {course.level} · {course.duration}
//                 </p>
//                 <div className="landing-pricing-equal-price-row">
//                   <span className="landing-pricing-equal-price">
//                     {coursePrice.toLocaleString()} {currency}
//                   </span>
//                   <span className="landing-pricing-equal-per-phase">
//                     / {t.pricing?.perCourse || 'per course'}
//                   </span>
//                 </div>
//                 <div className="landing-pricing-equal-cta primary">
//                   <span>
//                     {t.pricing?.courseCard?.viewDetails || 'View Details'}
//                   </span>
//                   <ArrowRight size={14} />
//                 </div>
//               </Link>
//             );
//           })}
//         </div>
//       </div>
//     </PageLayout>
//   );
// };

// export default PricingPage;





/**
 * @fileoverview Pricing Page
 *
 * Three modes:
 *   1. Reseller   (?reseller=CODE) — single hero, reseller's price
 *   2. Course     (?course=slug)   — full course + per-phase cart
 *   3. Catalog    (default)        — grid of all published courses
 *
 * Every course-context hero card and catalog card renders the exact same
 * visual DNA as the landing page hero: crown + title + subtitle + price +
 * optional save badge + 4 feature checkmarks.
 *
 * Path: apps/web/pages/pricing/index.jsx
 */

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Sparkles, ArrowRight, Crown, Check, Zap,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import CheckoutModal from '../../components/payment/CheckoutModal';
import CourseCard from '../../components/pricing/CourseCard';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useCourses, useCourseBySlug } from '../../hooks/useCourses';
import useCart from '../../hooks/useCart';
import usePaymentConfig from '../../hooks/usePaymentConfig';
import useResellerCode from '../../hooks/useResellerCode';

const PricingPage = () => {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const cart = useCart();
  const { courses, loading: coursesLoading } = useCourses();
  const { pricing, loading: pricingLoading } = usePaymentConfig();
  const { resellerProfile, resellerCode, loading: resellerLoading } =
    useResellerCode();

  const slug = router.query.course;
  const { course: courseContext, loading: courseLoading } = useCourseBySlug(slug);

  const [purchaseMode, setPurchaseMode] = useState('full-course');
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fullCourse = pricing?.fullCourse || {};
  const perPhase = pricing?.perPhase || {};
  const currency = fullCourse.currency || perPhase.currency || 'ETB';
  const isResellerActive = Boolean(resellerProfile && resellerCode);

  const featuredCourse = useMemo(() => {
    if (!courses || courses.length === 0) return null;
    return (
      courses.find(
        (c) => c.badge && String(c.badge).toLowerCase() === 'most popular'
      ) || courses[0]
    );
  }, [courses]);

  const featureBullets = useMemo(
    () => [
      t.landing?.pricingOverview?.featureAllPhases || 'All structured phases',
      t.landing?.pricingOverview?.featureLifetime || 'Lifetime access',
      t.landing?.pricingOverview?.featureCertificate || 'Completion certificate',
      t.landing?.pricingOverview?.featureCommunity || 'Private Telegram community',
    ],
    [t]
  );

  const handleToggleCart = (phaseId) => cart.togglePhase(phaseId);

  const handleOpenCheckout = useCallback(
    (mode = 'full-course') => {
      if (!isAuthenticated) {
        window.location.href = `/auth/login?redirect=${encodeURIComponent(
          router.asPath
        )}`;
        return;
      }
      setPurchaseMode(mode);
      setIsModalOpen(true);
    },
    [isAuthenticated, router.asPath]
  );

  const handleCloseModal = () => setIsModalOpen(false);

  if (
    pricingLoading ||
    coursesLoading ||
    resellerLoading ||
    (slug && courseLoading)
  ) {
    return (
      <PageLayout>
        <div className="spinner" style={{ padding: '5rem 0' }}>
          <div className="spinner-circle" />
        </div>
      </PageLayout>
    );
  }

  /* ────────────────────────────────────────────────────────────────────────
   * RESELLER MODE
   * ──────────────────────────────────────────────────────────────────────── */
  if (isResellerActive) {
    const resellerPrice = Number(resellerProfile.price) || 0;
    return (
      <PageLayout>
        <div className="pricing-modern">
          <header className="pricing-modern-header">
            <span className="pricing-modern-eyebrow">
              {t.pricing?.tuitionEyebrow || 'Tuition'}
            </span>
            <h1 className="pricing-modern-title">
              {t.pricing?.heading || 'Simple & Transparent Tuition'}
            </h1>
            <p className="pricing-modern-subtitle">
              {t.pricing?.subheading || 'Choose your path.'}
            </p>
          </header>
          <div className="pricing-hero-card-wrapper">
            <div className="pricing-hero-card active">
              <div className="pricing-hero-glow" />
              <div className="pricing-hero-content">
                <div className="pricing-hero-left">
                  <div className="pricing-hero-badges">
                    <span className="pricing-hero-badge-best">
                      <Sparkles size={14} />
                      {t.pricing?.bestValue || 'Best Value'}
                    </span>
                  </div>
                  <h2 className="pricing-hero-name">
                    {t.pricing?.masterclass || 'Full-Stack Masterclass'}
                  </h2>
                </div>
                <div className="pricing-hero-right">
                  <div className="pricing-hero-price-block">
                    <div className="pricing-hero-price">
                      <span className="pricing-hero-amount">
                        {resellerPrice.toLocaleString()}
                      </span>
                      <span className="pricing-hero-currency">{currency}</span>
                    </div>
                    <span
                      className="pricing-hero-original"
                      style={{ color: '#f59e0b', fontWeight: 600 }}
                    >
                      Sold by {resellerProfile.displayName}
                    </span>
                  </div>
                  <button
                    className="pricing-btn-primary"
                    onClick={() => handleOpenCheckout('full-course')}
                  >
                    <Sparkles size={18} />
                    {t.pricing?.enrollToday || 'Enroll Today'}
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <CheckoutModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          purchaseMode="full-course"
          selectedPhases={[]}
          coursePhases={[]}
          courseId={null}
          coursePriceEtb={null}
          resellerCode={resellerCode}
          resellerProfile={resellerProfile}
        />
      </PageLayout>
    );
  }

  /* ────────────────────────────────────────────────────────────────────────
   * COURSE CONTEXT MODE — hero card now matches the landing page card
   * ──────────────────────────────────────────────────────────────────────── */
  if (courseContext) {
    const phases = courseContext.phases || [];
    const coursePrice =
      courseContext.price_etb != null
        ? Number(courseContext.price_etb)
        : fullCourse.amountETB || 0;
    const originalPrice =
      courseContext.price_etb == null
        ? fullCourse.originalAmountETB || null
        : null;
    const discountPercent =
      originalPrice && originalPrice > coursePrice && coursePrice > 0
        ? Math.round(((originalPrice - coursePrice) / originalPrice) * 100)
        : 0;
    const phasePrice = perPhase.amountETB || 0;
    const cartTotal = cart.selectedPhases.length * phasePrice;

    return (
      <PageLayout>
        <div className="pricing-modern">
          <Link href="/pricing" className="pricing-back-link">
            ← {t.pricing?.backToCatalog || 'Back to All Courses'}
          </Link>

          <header className="pricing-modern-header">
            <span className="pricing-modern-eyebrow">
              {t.pricing?.tuitionEyebrow || 'Tuition'}
            </span>
            <h1 className="pricing-modern-title">
              {language === 'am' && courseContext.title_am
                ? courseContext.title_am
                : courseContext.title}
            </h1>
            <p className="pricing-modern-subtitle">
              {language === 'am' && courseContext.description_am
                ? courseContext.description_am
                : courseContext.description}
            </p>
          </header>

          {/* Hero card — full visual DNA (crown, title, subtitle, save, features) */}
          <div className="pricing-hero-card-wrapper">
            <div className="pricing-hero-card active">
              <div className="pricing-hero-glow" />
              <div className="pricing-hero-content">
                <div className="pricing-hero-left">
                  <div className="pricing-hero-badges">
                    {courseContext.badge && (
                      <span className="pricing-hero-badge-best">
                        <Crown size={14} /> {courseContext.badge}
                      </span>
                    )}
                    <span className="pricing-hero-badge-pass">
                      {t.pricing?.fullCourseLabel || 'Full Course'}
                    </span>
                  </div>

                  <h2 className="pricing-hero-name">
                    <Crown
                      size={20}
                      style={{
                        color: 'var(--accent-gold)',
                        marginRight: '0.5rem',
                        display: 'inline',
                        verticalAlign: 'middle',
                      }}
                    />
                    {language === 'am' && courseContext.title_am
                      ? courseContext.title_am
                      : courseContext.title}
                  </h2>

                  <p
                    style={{
                      fontSize: '0.9375rem',
                      lineHeight: 1.6,
                      color: 'var(--text-muted)',
                      marginTop: '0.5rem',
                      marginBottom: '1rem',
                      maxWidth: '32rem',
                    }}
                  >
                    {language === 'am' && courseContext.description_am
                      ? courseContext.description_am
                      : courseContext.description}
                  </p>

                  {/* Feature bullets — same 4 as landing page */}
                  <ul className="landing-pricing-equal-features" style={{ marginTop: 0 }}>
                    {featureBullets.map((feature, idx) => (
                      <li key={idx}>
                        <Check
                          size={14}
                          style={{ color: 'var(--accent-gold)' }}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pricing-hero-right">
                  <div className="pricing-hero-price-block">
                    <div className="pricing-hero-price">
                      <span className="pricing-hero-amount">
                        {coursePrice.toLocaleString()}
                      </span>
                      <span className="pricing-hero-currency">{currency}</span>
                    </div>
                    <span className="pricing-hero-per-phase">
                      / {t.landing?.pricingOverview?.fullCourse || 'full course'}
                    </span>
                    {discountPercent > 0 && (
                      <>
                        <span className="pricing-hero-save-badge">
                          <Zap size={10} /> {discountPercent}% off
                        </span>
                        <span className="pricing-hero-original">
                          {originalPrice.toLocaleString()} {currency}
                        </span>
                      </>
                    )}
                  </div>
                  <button
                    className="pricing-btn-primary"
                    onClick={() => handleOpenCheckout('full-course')}
                  >
                    <Sparkles size={18} />
                    {t.pricing?.enrollToday || 'Enroll Today'}
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Build your own path */}
          <div className="pricing-roadmap-section">
            <div className="pricing-roadmap-header">
              <div>
                <h2 className="pricing-roadmap-title">
                  {t.pricing?.orBuildYourOwn || 'Or Build Your Own Path'}
                </h2>
                <p className="pricing-roadmap-subtitle">
                  {(
                    t.pricing?.selectIndividualPhases ||
                    'Select individual phases at {price} {currency} each.'
                  )
                    .replace('{price}', phasePrice.toLocaleString())
                    .replace('{currency}', currency)}
                </p>
              </div>
            </div>

            <div className="pricing-timeline">
              {phases.map((phase, idx) => {
                const phaseId =
                  phase.id || `phase-${phase.phase_number || idx + 1}`;
                const isSelected = cart.isPhaseSelected(phaseId);
                const isExpanded = expandedPhase === phaseId;

                return (
                  <div key={phaseId} className="pricing-timeline-card">
                    <button
                      className="pricing-timeline-card-header"
                      onClick={() =>
                        setExpandedPhase(isExpanded ? null : phaseId)
                      }
                    >
                      <div>
                        <span className="pricing-timeline-phase-label">
                          {t.pricing?.phaseLabel || 'Phase'}{' '}
                          {phase.phase_number || idx + 1}
                        </span>
                        <h3 className="pricing-timeline-phase-title">
                          {phase.title}
                        </h3>
                      </div>
                      <div className="pricing-timeline-card-header-right">
                        <span className="pricing-timeline-price-badge">
                          {phasePrice.toLocaleString()} {currency}
                        </span>
                        {isExpanded ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="pricing-timeline-card-body">
                        <p className="pricing-timeline-card-desc">
                          {phase.description}
                        </p>
                        <button
                          onClick={() => handleToggleCart(phaseId)}
                          className={`pricing-timeline-cart-btn ${
                            isSelected ? 'remove' : 'add'
                          }`}
                        >
                          {isSelected
                            ? 'Remove'
                            : `Add to Cart — ${phasePrice.toLocaleString()} ${currency}`}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {cart.selectedPhases.length > 0 && (
            <div className="pricing-sticky-cart">
              <div className="pricing-sticky-cart-inner">
                <div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      display: 'block',
                    }}
                  >
                    {cart.selectedPhases.length}{' '}
                    {t.pricing?.phasesUnit || 'phases'} selected
                  </span>
                  <span
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: 'var(--text-main)',
                    }}
                  >
                    {cartTotal.toLocaleString()} {currency}
                  </span>
                </div>
                <button
                  className="pricing-btn-primary"
                  onClick={() => handleOpenCheckout('individual-phases')}
                >
                  <Sparkles size={18} />
                  {t.pricing?.enrollToday || 'Enroll'}
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        <CheckoutModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          purchaseMode={purchaseMode}
          selectedPhases={
            purchaseMode === 'individual-phases' ? cart.selectedPhases : []
          }
          coursePhases={phases}
          courseId={courseContext.id}
          coursePriceEtb={courseContext.price_etb}
          resellerCode=""
          resellerProfile={null}
        />
      </PageLayout>
    );
  }

  /* ────────────────────────────────────────────────────────────────────────
   * CATALOG MODE (default)
   * ──────────────────────────────────────────────────────────────────────── */
  return (
    <PageLayout>
      <div className="pricing-modern">
        <header className="pricing-modern-header">
          <span className="pricing-modern-eyebrow">
            {t.pricing?.courseGridEyebrow || 'Course Catalog'}
          </span>
          <h1 className="pricing-modern-title">
            {t.pricing?.courseGridTitle || 'Explore Our Courses'}
          </h1>
          <p className="pricing-modern-subtitle">
            {t.pricing?.courseGridSubtitle ||
              'Every course is a complete learning journey.'}
          </p>
        </header>

        <div className="landing-pricing-equal-grid">
          {courses.map((course) => {
            const isFeatured = course.id === featuredCourse?.id;
            const coursePrice =
              course.price_etb != null
                ? Number(course.price_etb)
                : fullCourse.amountETB || 0;
            const originalPrice =
              course.price_etb == null
                ? fullCourse.originalAmountETB || null
                : null;

            return (
              <CourseCard
                key={course.id}
                course={course}
                coursePrice={coursePrice}
                originalPrice={originalPrice}
                currency={currency}
                isFeatured={isFeatured}
                features={featureBullets}
                viewDetailsLabel={t.pricing?.enrollToday || 'Enroll Now'}
                perCourseLabel={
                  t.landing?.pricingOverview?.fullCourse || 'full course'
                }
              />
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
};

export default PricingPage;