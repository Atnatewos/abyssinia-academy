/**
 * @fileoverview Discount Code Badge Component
 * Small badge displayed on pricing cards when a referral or discount is active.
 * Shows the discount percentage with a visual indicator.
 * ALL display text from i18n → t.referrals.* and t.discounts.*
 * Path: apps/web/components/discount/DiscountCodeBadge.jsx
 */

import React from 'react';
import { Tag, Gift, Percent } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * DiscountCodeBadge — Visual badge showing active discount information.
 * Used on the pricing page and checkout modal to indicate applied discounts.
 *
 * @param {object} props
 * @param {string} props.type - 'referral' | 'discount' | 'both'
 * @param {number} props.referralPercent - Referral discount percentage
 * @param {number} props.discountPercent - Discount code percentage
 * @param {string} props.discountCode - The applied discount code (if any)
 */
const DiscountCodeBadge = ({
  type = 'referral',
  referralPercent = 0,
  discountPercent = 0,
  discountCode = '',
}) => {
  const { t } = useLanguage();

  /*
   * Determine what to display based on type
   */
  let icon = Tag;
  let message = '';
  let className = 'discount-badge';

  if (type === 'referral' && referralPercent > 0) {
    icon = Gift;
    message = (t.referrals?.discountApplied || 'You\'ll receive {percent}% off your enrollment.')
      .replace('{percent}', String(referralPercent));
    className += ' discount-badge-referral';
  } else if (type === 'discount' && discountPercent > 0) {
    icon = Percent;
    message = (t.discounts?.codeApplied || 'Code applied!') + ` (${discountPercent}% off)`;
    className += ' discount-badge-code';
  } else if (type === 'both') {
    icon = Gift;
    const totalPercent = referralPercent + discountPercent;
    message = `${totalPercent}% ${t.discounts?.youSave || 'total savings'}!`;
    className += ' discount-badge-both';
  }

  if (!message) return null;

  return (
    <div className={className}>
      {React.createElement(icon, { size: 14 })}
      <span>{message}</span>
      {discountCode && type === 'discount' && (
        <span className="discount-badge-code-name">{discountCode}</span>
      )}
    </div>
  );
};

export default DiscountCodeBadge;