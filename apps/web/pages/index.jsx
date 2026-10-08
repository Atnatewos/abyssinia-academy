/**
 * @fileoverview Landing Page — Immersive 3D Experience
 *
 * Orchestrates the complete landing page narrative with aggressive
 * route-splitting and lazy-loading for low-bandwidth environments.
 *
 * Narrative flow (conversion-ordered):
 *   1  Hero + stats          — dual promise: master the skill, get paid to share
 *   2  SocialProofStrip      — live totals (self-hides while weak)
 *   3  IncomeBand            — 3-card opportunity strip
 *   4  EarnEngineSection     — the earnings engine: steps, calculator, rail
 *   5  PricingShowcase       — tuition after value is established
 *   6  PhaseTimeline3D       — curriculum roadmap
 *   7  CourseVideos          — instructor proof
 *   8  DiscussionVideos      — classroom proof
 *   9  RewardsShowcase       — cash-first rewards trio
 *   10 FeaturesGrid          — platform capabilities
 *   11 HowItWorks            — 5-step journey
 *   12 FAQAccordion          — objection handling (9 items + JSON-LD)
 *   13 CTABanner             — dual-CTA close
 *
 * Above-the-fold components load synchronously for instant LCP; every
 * below-the-fold section is dynamically imported with a skeleton to
 * prevent layout shift on slow connections.
 *
 * Path: apps/web/pages/index.jsx
 */
import dynamic from 'next/dynamic';
import SEOHead from '../components/shared/SEOHead';
import PageLayout from '../components/shared/PageLayout';

/* Above-the-fold components — loaded synchronously for instant LCP */
import HeroSection from '../components/landing/HeroSection';
import HeroVisual from '../components/landing/HeroVisual';
import StatsCounter from '../components/landing/StatsCounter';

/**
 * Lightweight skeleton placeholder for lazy-loaded sections.
 * Prevents Cumulative Layout Shift (CLS) while chunks download.
 */
const SectionSkeleton = () => (
  <div className="landing-section">
    <div className="section-container">
      <div className="earn-calc-skeleton" style={{ minHeight: '300px', borderRadius: '1.25rem' }} />
    </div>
  </div>
);

/* Below-the-fold components — dynamically imported for route splitting */
const PricingShowcase = dynamic(() => import('../components/landing/PricingShowcase'), {
  ssr: false,
  loading: () => <SectionSkeleton />,
});

const PhaseTimeline3D = dynamic(() => import('../components/landing/PhaseTimeline3D'), {
  ssr: false,
  loading: () => <SectionSkeleton />,
});

const CourseVideos = dynamic(() => import('../components/landing/CourseVideos'), {
  ssr: false,
  loading: () => <SectionSkeleton />,
});

const DiscussionVideos = dynamic(() => import('../components/landing/DiscussionVideos'), {
  ssr: false,
  loading: () => <SectionSkeleton />,
});

const RewardsShowcase = dynamic(() => import('../components/landing/RewardsShowcase'), {
  ssr: false,
  loading: () => <SectionSkeleton />,
});

const FeaturesGrid = dynamic(() => import('../components/landing/FeaturesGrid'), {
  ssr: false,
  loading: () => <SectionSkeleton />,
});

const IncomeBand = dynamic(() => import('../components/landing/IncomeBand'), {
  ssr: false,
  loading: () => <SectionSkeleton />,
});

const EarnEngineSection = dynamic(() => import('../components/landing/EarnEngineSection'), {
  ssr: false,
  loading: () => <SectionSkeleton />,
});

const SocialProofStrip = dynamic(() => import('../components/landing/SocialProofStrip'), {
  ssr: false,
  loading: () => null, /* renders nothing while loading; self-hides when weak */
});

const HowItWorks = dynamic(() => import('../components/landing/HowItWorks'), {
  ssr: false,
  loading: () => <SectionSkeleton />,
});

const FAQAccordion = dynamic(() => import('../components/landing/FAQAccordion'), {
  ssr: false,
  loading: () => <SectionSkeleton />,
});

const CTABanner = dynamic(() => import('../components/landing/CTABanner'), {
  ssr: false,
  loading: () => <SectionSkeleton />,
});

/**
 * HomePage — complete landing narrative.
 * Pure layout orchestration: all copy lives in i18n, all structure in
 * landing.config.js, all business numbers in referrals.config.js.
 */
const HomePage = () => {
  return (
    <>
      <SEOHead />
      <PageLayout>
        <div className="landing-sections">
          {/* 1 — Hero + stats (above fold) */}
          <section className="hero-section">
            <div className="hero-grid">
              <HeroSection />
              <HeroVisual />
              <div style={{ gridColumn: '1 / -1' }}>
                <StatsCounter />
              </div>
            </div>
          </section>

          {/* 2 — Live social proof (self-hides when totals are weak) */}
          <SocialProofStrip />

          {/* 3 — Income opportunity band */}
          <IncomeBand />

          {/* 4 — Learn & Earn engine: steps, calculator, sticky rail */}
          <EarnEngineSection />

          {/* 5 — Pricing after value is established */}
          <PricingShowcase />

          {/* 6 — Curriculum roadmap */}
          <PhaseTimeline3D />

          {/* 7 — Course videos */}
          <CourseVideos />

          {/* 8 — Discussion videos */}
          <DiscussionVideos />

          {/* 9 — Rewards (cash-first copy) */}
          <RewardsShowcase />

          {/* 10 — Features grid */}
          <section className="landing-section">
            <div className="section-container">
              <FeaturesGrid />
            </div>
          </section>

          {/* 11 — How it works (5 steps) */}
          <section className="landing-section">
            <div className="section-container">
              <HowItWorks />
            </div>
          </section>

          {/* 12 — FAQ (objection handling) */}
          <section className="landing-section">
            <div className="section-container" style={{ maxWidth: '56rem' }}>
              <FAQAccordion />
            </div>
          </section>

          {/* 13 — CTA close */}
          <section className="landing-section">
            <div className="section-container" style={{ maxWidth: '64rem' }}>
              <CTABanner />
            </div>
          </section>
        </div>
      </PageLayout>
    </>
  );
};

export default HomePage;