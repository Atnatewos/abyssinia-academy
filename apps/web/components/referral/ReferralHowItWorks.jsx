/**
 * @fileoverview Referral How It Works Component
 * Four-step explainer section for the referral program.
 * ALL display text from i18n → t.referrals.*
 * Path: apps/web/components/referral/ReferralHowItWorks.jsx
 */

import React from 'react';
import { Share2, UserPlus, Gift, Banknote } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * ReferralHowItWorks — Explains the referral program in 4 simple steps.
 */
const ReferralHowItWorks = () => {
  const { t } = useLanguage();

  const steps = [
    {
      icon: Share2,
      title: t.referrals?.step1Title || 'Share Your Link',
      description: t.referrals?.step1Desc || '',
    },
    {
      icon: UserPlus,
      title: t.referrals?.step2Title || 'They Register & Enroll',
      description: t.referrals?.step2Desc || '',
    },
    {
      icon: Gift,
      title: t.referrals?.step3Title || 'Earn Credit',
      description: t.referrals?.step3Desc || '',
    },
    {
      icon: Banknote,
      title: t.referrals?.step4Title || 'Earn Cash Commission',
      description: t.referrals?.step4Desc || '',
    },
  ];

  return (
    <div className="referral-how-it-works">
      <h3 className="referral-section-title">
        {t.referrals?.howItWorks || 'How It Works'}
      </h3>

      <div className="referral-steps-grid">
        {steps.map((step, index) => (
          <div key={index} className="referral-step-card">
            <div className="referral-step-icon">
              <step.icon size={24} />
            </div>
            <h4 className="referral-step-title">{step.title}</h4>
            <p className="referral-step-desc">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReferralHowItWorks;