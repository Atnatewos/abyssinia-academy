/**
 * @fileoverview How It Works Component
 * 4-step process cards showing the student journey
 * Path: apps/web/components/landing/HowItWorks.jsx
 */

import { useLanguage } from '../../context/LanguageContext';

const HowItWorks = () => {
  const { t } = useLanguage();

  const steps = [
    { step: '01', title: 'Register & Pay Tuition', description: 'Choose your preferred local payment method (Telebirr, CBE Birr, Bank Transfer) and complete enrollment in 60 seconds.' },
    { step: '02', title: 'Unlock Course Classroom', description: 'Gain instant access to unlisted YouTube video masterclasses, timestamped breakdowns, and structured study notes.' },
    { step: '03', title: 'Build Weekly Projects', description: 'Follow raw coding demonstrations, download starter assets, and build portfolio-grade projects week by week.' },
    { step: '04', title: 'Graduate & Launch Career', description: 'Deploy your full-stack capstone project to cloud servers, showcase your GitHub portfolio, and land global software jobs.' },
  ];

  return (
    <>
      <div className="section-header" style={{ marginBottom: '3rem' }}>
        <div className="section-tag">How It Works</div>
        <h2 className="section-title">Your 4-Step Path to Software Mastery</h2>
      </div>
      <div className="steps-grid">
        {steps.map((stepItem, index) => (
          <div key={index} className="step-card">
            <span className="step-number">{stepItem.step}</span>
            <h3 className="step-title">{stepItem.title}</h3>
            <p className="step-desc">{stepItem.description}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default HowItWorks;