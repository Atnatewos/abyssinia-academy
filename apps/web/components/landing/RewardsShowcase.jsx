/**
 * @fileoverview Rewards Showcase — Cash-First Rewards Trio
 *
 * Three 3D floating reward badges: discount codes, cash referrals,
 * and 4-level commissions. Copy emphasizes the income opportunity.
 *
 * All numeric values ({percent}, {amount}) are resolved from
 * referrals/payments config — never hardcoded.
 *
 * Path: apps/web/components/landing/RewardsShowcase.jsx
 */
import React from 'react';
import Link from 'next/link';
import { Gift, Share2, Coins, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  getCommissionStructure,
  getReferredDiscountPercent,
} from '../../lib/config';

const RewardsShowcase = () => {
  const { t } = useLanguage();
  const labels = t.landing?.rewards || {};
  const commissionConfig = getCommissionStructure();
  const discountPercent = getReferredDiscountPercent();
  const totalPerSale = commissionConfig?.totalPerSale || 0;

  const cards = [
    {
      icon: Gift,
      accentClass: 'discount',
      title: labels.discountTitle || 'Instant Discounts',
      desc: labels.discountDesc || 'Apply promo codes at checkout for instant savings on your enrollment.',
      cta: labels.discountCta || 'Learn More',
      href: '/discounts',
    },
    {
      icon: Share2,
      accentClass: 'referral',
      title: labels.referralTitle || 'Cash Referrals',
      desc: (labels.referralDesc ||
        'Share your link — friends save {percent}%, you earn real ETB on every approved sale.').replace(
        '{percent}',
        String(discountPercent)
      ),
      cta: labels.referralCta || 'Start Earning',
      href: '/#earn',
    },
    {
      icon: Coins,
      accentClass: 'commission',
      title: labels.commissionTitle || '4-Level Commissions',
      desc: (labels.commissionDesc ||
        'Earn up to {amount} ETB shared across 4 levels on every course sale in your network.').replace(
        '{amount}',
        totalPerSale.toLocaleString('en-US')
      ),
      cta: labels.commissionCta || 'View Tiers',
      href: '/#earn',
    },
  ];

  return (
    <section className="landing-rewards-3d">
      <div className="landing-rewards-header">
        <span className="landing-pricing-eyebrow">{labels.eyebrow || 'Save & Earn'}</span>
        <h2 className="landing-rewards-title">{labels.title || 'Save More, Earn More'}</h2>
        <p className="landing-rewards-subtitle">
          {labels.subtitle ||
            'Your tuition drops and your income rises — every time someone joins through your link.'}
        </p>
      </div>
      <div className="landing-rewards-grid">
        {cards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div key={card.accentClass} className="landing-reward-badge-3d">
              <div className={`landing-reward-icon ${card.accentClass}`}>
                <IconComponent size={24} />
              </div>
              <h3 className="landing-reward-name">{card.title}</h3>
              <p className="landing-reward-desc">{card.desc}</p>
              <Link href={card.href} className="landing-reward-cta">
                {card.cta}
                <ArrowRight size={14} />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RewardsShowcase;