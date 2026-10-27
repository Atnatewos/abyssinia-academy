/**
 * @fileoverview How It Works Component
 * 4-step process cards showing the student journey
 * Step numbers from landing.config.js | Display text from i18n → t.landing.howItWorks.*
 * Path: apps/web/components/landing/HowItWorks.jsx
 */

import { useLanguage } from '../../context/LanguageContext';
import { getHowItWorksConfig } from '../../lib/config';

const HowItWorks = () => {
  const { t } = useLanguage();

  /*
   * Step structure from landing config (step numbers)
   * Display text from i18n translations
   */
  const howItWorksConfig = getHowItWorksConfig();
  const steps = howItWorksConfig.steps || [];

  const landingI18n = t.landing?.howItWorks || {};
  const sectionTag = landingI18n.sectionTag || 'How It Works';
  const heading = landingI18n.heading || 'Your 4-Step Path to Software Mastery';
  const stepTranslations = landingI18n.steps || [];

  return (
    <>
      <div className="section-header" style={{ marginBottom: '3rem' }}>
        <div className="section-tag">{sectionTag}</div>
        <h2 className="section-title">{heading}</h2>
      </div>

      <div className="steps-grid">
        {steps.map((stepItem, index) => {
          const stepI18n = stepTranslations[index] || {};

          return (
            <div key={index} className="step-card">
              <span className="step-number">{stepItem.step}</span>
              <h3 className="step-title">{stepI18n.title || ''}</h3>
              <p className="step-desc">{stepI18n.description || ''}</p>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default HowItWorks;