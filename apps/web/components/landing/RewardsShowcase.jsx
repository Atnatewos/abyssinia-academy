/**
 * @fileoverview Rewards Showcase — 3D Floating Badges
 * Displays discount codes, referral rewards, and cash commission info.
 * All data from payments.config.js and referrals.config.js — zero hardcoded values.
 * 
 * Path: apps/web/components/landing/RewardsShowcase.jsx
 */

import Link from 'next/link';
import { Tag, Gift, Coins, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getDiscountConfig, getReferralConfig } from '../../lib/config';

/**
 * RewardsShowcase — Three floating 3D badges explaining the savings ecosystem.
 */
const RewardsShowcase = () => {
  const { t } = useLanguage();
  const discountConfig = getDiscountConfig();
  const referralConfig = getReferralConfig();

  const rewards = [
    {
      icon: <Tag size={24} />,
      iconClass: 'discount',
      title: t.landing?.rewards?.discountTitle || 'Discount Codes',
      description: t.landing?.rewards?.discountDesc || 'Apply promo codes at checkout for instant savings on your enrollment.',
      cta: t.landing?.rewards?.discountCta || 'Learn More',
      href: '/pricing',
    },
    {
      icon: <Gift size={24} />,
      iconClass: 'referral',
      title: t.landing?.rewards?.referralTitle || 'Referral Rewards',
      description: (t.landing?.rewards?.referralDesc || 'Share your link, friends get {percent}% off, you earn credit toward your courses.')
        .replace('{percent}', referralConfig.referredDiscount?.fixedPercent || referralConfig.referrerTiers?.[0]?.creditPercent || 10),
      cta: t.landing?.rewards?.referralCta || 'Start Referring',
      href: '/profile/referrals',
    },
    {
      icon: <Coins size={24} />,
      iconClass: 'commission',
      title: t.landing?.rewards?.commissionTitle || 'Cash Commission',
      description: t.landing?.rewards?.commissionDesc || 'Earn real cash when your referrals exceed your course price. Higher tiers = higher rewards.',
      cta: t.landing?.rewards?.commissionCta || 'View Tiers',
      href: '/profile/referrals',
    },
  ];

  return (
    <section className="landing-rewards-3d">
      <div className="landing-rewards-header">
        <span className="landing-pricing-eyebrow">
          {t.landing?.rewards?.eyebrow || 'Save & Earn'}
        </span>
        <h2 className="landing-rewards-title">
          {t.landing?.rewards?.title || 'Save More, Earn More'}
        </h2>
        <p className="landing-rewards-subtitle">
          {t.landing?.rewards?.subtitle || 'Multiple ways to reduce your tuition and earn rewards.'}
        </p>
      </div>

      <div className="landing-rewards-grid">
        {rewards.map((reward, index) => (
          <div key={index} className="landing-reward-badge-3d">
            <div className={`landing-reward-icon ${reward.iconClass}`}>
              {reward.icon}
            </div>
            <h3 className="landing-reward-name">{reward.title}</h3>
            <p className="landing-reward-desc">{reward.description}</p>
            <Link href={reward.href} className="landing-reward-cta">
              {reward.cta}
              <ArrowRight size={14} />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RewardsShowcase;