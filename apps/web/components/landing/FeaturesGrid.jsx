/**
 * @fileoverview Features Grid Component
 * Displays the four key platform features in a responsive card grid
 * Icons from landing.config.js | Display text from i18n → t.landing.features.*
 * Path: apps/web/components/landing/FeaturesGrid.jsx
 */

import { Video, Code2, MessageSquare, Award } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getFeaturesConfig } from '../../lib/config';

const ICON_MAP = {
  Video,
  Code2,
  MessageSquare,
  Award,
};

const FeaturesGrid = () => {
  const { t } = useLanguage();

  /*
   * Card structure from landing config (icon names)
   * Display text from i18n translations
   */
  const featuresConfig = getFeaturesConfig();
  const cards = featuresConfig.cards || [];

  const landingI18n = t.landing?.features || {};
  const sectionTag = landingI18n.sectionTag || 'Why Abyssinia Academy?';
  const heading = landingI18n.heading || 'Designed for Practical Software Engineering';
  const subtitle = landingI18n.subtitle || '';
  const cardTranslations = landingI18n.cards || [];

  return (
    <>
      <div className="section-header" style={{ marginBottom: '3rem' }}>
        <div className="section-tag">{sectionTag}</div>
        <h2 className="section-title">{heading}</h2>
        <p className="section-subtitle">{subtitle}</p>
      </div>

      <div className="features-grid">
        {cards.map((feature, index) => {
          const IconComponent = ICON_MAP[feature.icon] || Code2;
          const cardI18n = cardTranslations[index] || {};

          return (
            <div key={index} className="feature-card">
              <div className="feature-card-icon">
                <IconComponent />
              </div>
              <h3 className="feature-card-title">{cardI18n.title || ''}</h3>
              <p className="feature-card-desc">{cardI18n.description || ''}</p>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default FeaturesGrid;