/**
 * @fileoverview Landing Page — Immersive 3D Experience
 *
 * Full landing page with hero, stats, pricing, phases, course videos,
 * discussions, rewards, features, how it works, FAQ, and CTA.
 *
 * Hero composition contract:
 *   HeroSection owns the responsive grid shell and renders HeroVisual
 *   internally as its second column. The page passes StatsCounter as
 *   the full-width stats slot. HeroVisual must NEVER be rendered here
 *   directly — a duplicate instance breaks the grid geometry.
 *
 * Path: apps/web/pages/index.jsx
 */

import SEOHead from '../components/shared/SEOHead';
import PageLayout from '../components/shared/PageLayout';
import HeroSection from '../components/landing/HeroSection';
import StatsCounter from '../components/landing/StatsCounter';
import PricingShowcase from '../components/landing/PricingShowcase';
import PhaseTimeline3D from '../components/landing/PhaseTimeline3D';
import CourseVideos from '../components/landing/CourseVideos';
import DiscussionVideos from '../components/landing/DiscussionVideos';
import RewardsShowcase from '../components/landing/RewardsShowcase';
import FeaturesGrid from '../components/landing/FeaturesGrid';
import HowItWorks from '../components/landing/HowItWorks';
import FAQAccordion from '../components/landing/FAQAccordion';
import CTABanner from '../components/landing/CTABanner';

/**
 * HomePage — Complete landing page with immersive 3D sections.
 */
const HomePage = () => {
  return (
    <>
      <SEOHead />
      <PageLayout>
        <div className="landing-sections">
          {/* Hero Section — grid shell owned by HeroSection */}
          <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 lg:pt-16">
            <HeroSection statsSlot={<StatsCounter />} />
          </section>

          {/* Pricing Showcase — 3D Equal Card Grid */}
          <PricingShowcase />

          {/* Phase Timeline — 3D Roadmap */}
          <PhaseTimeline3D />

          {/* Course Videos — About the Course (Blue Accent) */}
          <CourseVideos />

          {/* Discussion Videos — Live Q&A (Red Accent) */}
          <DiscussionVideos />

          {/* Rewards — 3D Floating Badges */}
          <RewardsShowcase />

          {/* Features */}
          <section className="landing-section">
            <div className="section-container">
              <FeaturesGrid />
            </div>
          </section>

          {/* How It Works */}
          <section className="landing-section">
            <div className="section-container">
              <HowItWorks />
            </div>
          </section>

          {/* FAQ */}
          <section className="landing-section">
            <div className="section-container" style={{ maxWidth: '56rem' }}>
              <FAQAccordion />
            </div>
          </section>

          {/* CTA Banner */}
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