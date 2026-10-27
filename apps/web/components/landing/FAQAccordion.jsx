/**
 * @fileoverview FAQ Accordion Component
 * Expandable frequently asked questions with smooth animation
 * Item count from landing.config.js | All Q&A text from i18n → t.landing.faq.*
 * Path: apps/web/components/landing/FAQAccordion.jsx
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getFAQConfig } from '../../lib/config';

const FAQAccordion = () => {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState(0);

  /*
   * Total items from landing config
   * All question/answer text from i18n translations
   */
  const faqConfig = getFAQConfig();
  const totalItems = faqConfig.totalItems || 4;

  const landingI18n = t.landing?.faq || {};
  const sectionTag = landingI18n.sectionTag || 'Got Questions?';
  const heading = landingI18n.heading || 'Frequently Asked Questions';
  const faqItems = landingI18n.items || [];

  const itemsToRender = faqItems.slice(0, totalItems);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <>
      <div className="section-header" style={{ marginBottom: '2rem' }}>
        <div className="section-tag">{sectionTag}</div>
        <h2 className="section-title">{heading}</h2>
      </div>

      <div className="faq-list">
        {itemsToRender.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div key={index} className="faq-item">
              <button
                onClick={() => handleToggle(index)}
                className="faq-question"
                aria-expanded={isOpen}
              >
                <span>{faq.question}</span>
                <ChevronDown className={`faq-chevron ${isOpen ? 'open' : ''}`} />
              </button>

              <div className={`faq-answer-wrapper ${isOpen ? 'open' : 'closed'}`}>
                <div className="faq-answer-inner">
                  <p className="faq-answer-text">{faq.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default FAQAccordion;