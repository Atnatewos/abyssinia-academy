/**
 * @fileoverview Landing Page
 * Full landing page with hero, features, how it works, FAQ, and CTA
 * Path: apps/web/pages/index.jsx
 */

import SEOHead from '../components/shared/SEOHead';
import PageLayout from '../components/shared/PageLayout';
import HeroSection from '../components/landing/HeroSection';
import HeroVisual from '../components/landing/HeroVisual';
import StatsCounter from '../components/landing/StatsCounter';
import FeaturesGrid from '../components/landing/FeaturesGrid';
import HowItWorks from '../components/landing/HowItWorks';
import FAQAccordion from '../components/landing/FAQAccordion';
import CTABanner from '../components/landing/CTABanner';

/**
 * HomePage - Complete landing page matching the Gemini foundation
 */
const HomePage = () => {
  return (
    <>
      <SEOHead />
      <PageLayout>
        <div className="landing-sections">
          {/* Hero Section */}
          <section className="hero-section">
            <div className="hero-grid">
              <HeroSection />
              <HeroVisual />
              <div style={{ gridColumn: '1 / -1' }}>
                <StatsCounter />
              </div>
            </div>
          </section>

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