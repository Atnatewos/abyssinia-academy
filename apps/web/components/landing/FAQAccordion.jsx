/**
 * @fileoverview FAQ Accordion Component
 * Expandable frequently asked questions with smooth animation
 * Path: apps/web/components/landing/FAQAccordion.jsx
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQAccordion = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqItems = [
    { question: 'Do I need prior programming experience to enroll?', answer: 'No! Phase 1 starts from total scratch—covering web mechanics, HTML5, CSS3 layout architecture, and Git basics step-by-step.' },
    { question: 'How do unlisted YouTube videos work?', answer: 'Once enrolled, your student account unlocks our private video portal embed links. You can stream high-definition recorded live sessions 24/7 on any desktop or mobile device.' },
    { question: 'What payment options are accepted in Ethiopia?', answer: 'We support Telebirr, CBE Birr, and bank transfer. Upload your payment screenshot and transaction reference for manual verification.' },
    { question: 'How long do I have access to the learning portal?', answer: 'You receive lifetime access! You can review past recorded sessions, download code templates, and access future course updates at no extra charge.' },
  ];

  return (
    <>
      <div className="section-header" style={{ marginBottom: '2rem' }}>
        <div className="section-tag">Got Questions?</div>
        <h2 className="section-title">Frequently Asked Questions</h2>
      </div>
      <div className="faq-list">
        {faqItems.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="faq-item">
              <button onClick={() => setOpenIndex(isOpen ? -1 : index)} className="faq-question">
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