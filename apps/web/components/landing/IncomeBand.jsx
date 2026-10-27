/**
 * @fileoverview Income Opportunity Band
 *
 * Three-card strip between the hero and pricing that surfaces the
 * income opportunity at a glance: earn per sale / stack bonuses /
 * cash out fast.
 *
 * Every displayed number resolves from referrals/payments config and
 * carries its own unit suffix from config ('ETB' for money, 'h' for
 * time) so a payout-hours card can never render as currency again.
 * Cards stretch to equal height for a balanced three-column row.
 *
 * Path: apps/web/components/landing/IncomeBand.jsx
 */
import React from 'react';
import Link from 'next/link';
import { Coins, TrendingUp, Zap, ArrowDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  getLandingIncomeBandConfig,
  getCommissionStructure,
  getBonusConfig,
  getWithdrawalConfig,
  getLandingEarnConfig,
} from '../../lib/config';

const ICON_MAP = { Coins, TrendingUp, Zap };

/**
 * Resolve an amountKey from the config graph.
 * Legacy aliases are accepted so older config revisions keep working.
 *
 * @param {string} amountKey
 * @param {object} commissionConfig
 * @param {object} bonusConfig
 * @param {object} withdrawalConfig
 * @returns {number}
 */
const resolveAmount = (amountKey, commissionConfig, bonusConfig, withdrawalConfig) => {
  switch (amountKey) {
    case 'totalPerSale':
    case 'level1Rate':
      return commissionConfig?.totalPerSale || 0;
    case 'maxMilestoneBonus': {
      const tiers = bonusConfig?.milestone?.tiers || [];
      const topTier = tiers[tiers.length - 1];
      return topTier?.amountETB || 0;
    }
    case 'payoutHours':
    case 'payoutProcessing':
      return withdrawalConfig?.processingTimeHours || 0;
    default:
      return 0;
  }
};

const IncomeBand = () => {
  const { t } = useLanguage();
  const bandConfig = getLandingIncomeBandConfig();
  const earnConfig = getLandingEarnConfig();
  const commissionConfig = getCommissionStructure();
  const bonusConfig = getBonusConfig();
  const withdrawalConfig = getWithdrawalConfig();

  if (bandConfig?.enabled === false) return null;

  const labels = t.landing?.income || {};
  const anchorId = earnConfig?.anchorId || 'earn';
  const cards = bandConfig.cards || [];

  return (
    <section id={bandConfig.anchorId || 'income-opportunity'} className="landing-income-band">
      <div className="landing-pricing-header">
        <span className="landing-pricing-eyebrow">{labels.eyebrow || 'The Opportunity'}</span>
        <h2 className="landing-pricing-title">
          {labels.title || 'Your Education Is An Income Stream'}
        </h2>
        <p className="landing-pricing-subtitle">
          {labels.subtitle ||
            'From the moment you enroll, the platform pays you for every friend you bring in.'}
        </p>
      </div>

      <div className="income-band-grid">
        {cards.map((card) => {
          const IconComponent = ICON_MAP[card.icon] || Coins;
          const copyKey = card.copyKey || 'card1';
          const amount = resolveAmount(
            card.amountKey,
            commissionConfig,
            bonusConfig,
            withdrawalConfig
          );
          const unitSuffix = card.unitSuffix || '';
          const suffixClass =
            unitSuffix === 'h' ? 'income-band-amount-unit income-band-amount-unit-tight' : 'income-band-amount-unit';
          const title = labels[`${copyKey}Title`] || '';
          const unit = labels[`${copyKey}Unit`] || '';
          const desc = (labels[`${copyKey}Desc`] || '').replace(
            /{amount}/g,
            amount.toLocaleString('en-US')
          );

          return (
            <div key={card.copyKey || card.amountKey} className="income-band-card">
              <div className="income-band-icon">
                <IconComponent size={22} />
              </div>
              <div className="income-band-amount">
                {amount.toLocaleString('en-US')}
                <span className={suffixClass}>{unitSuffix}</span>
              </div>
              <h3 className="income-band-title">{title}</h3>
              <p className="income-band-unit">{unit}</p>
              <p className="income-band-desc">{desc}</p>
            </div>
          );
        })}
      </div>

      <div className="income-band-cta">
        <Link href={`/#${anchorId}`} className="btn-glass">
          <ArrowDown size={18} style={{ color: 'var(--accent-gold)' }} />
          <span>{labels.cta || 'See the Full Earnings Engine'}</span>
        </Link>
      </div>
    </section>
  );
};

export default IncomeBand;