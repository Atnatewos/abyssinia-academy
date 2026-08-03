/**
 * @fileoverview Discount Breakdown Component
 * Shows line-by-line breakdown of all applied discounts in checkout.
 * ALL display text from i18n → t.discounts.*, t.referrals.*, t.checkout.*
 * Path: apps/web/components/discount/DiscountBreakdown.jsx
 */

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * DiscountBreakdown — Shows original price, referral discount, discount code,
 * credit applied, and final price with savings.
 *
 * @param {object} props
 * @param {number} props.basePrice - Original price before discounts
 * @param {object} props.breakdown - From calculateCombinedDiscount()
 * @param {string} props.discountCode - The applied discount code (if any)
 * @param {number} props.referralPercent - Referral discount percentage
 * @param {string} props.currency - Currency code
 */
const DiscountBreakdown = ({
  basePrice = 0,
  breakdown = {},
  discountCode = '',
  referralPercent = 0,
  currency = 'ETB',
}) => {
  const { t } = useLanguage();

  const totalSaved = basePrice - (breakdown.finalPrice || basePrice);
  const savedPercent = basePrice > 0
    ? Math.round((totalSaved / basePrice) * 100)
    : 0;

  return (
    <div className="discount-breakdown">
      {/* Original Price */}
      <div className="discount-breakdown-row">
        <span>{t.checkout?.tuitionFee || 'Tuition Fee'}</span>
        <span>{basePrice.toLocaleString()} {currency}</span>
      </div>

      {/* Referral Discount */}
      {breakdown.referralDiscount > 0 && (
        <div className="discount-breakdown-row discount">
          <span>
            {(t.referrals?.referralDiscount || 'Referral Discount ({percent}%)')
              .replace('{percent}', referralPercent)}
          </span>
          <span>-{breakdown.referralDiscount.toLocaleString()} {currency}</span>
        </div>
      )}

      {/* Discount Code */}
      {breakdown.discountCodeDiscount > 0 && discountCode && (
        <div className="discount-breakdown-row discount">
          <span>
            {(t.discounts?.discountCodeLineItem || 'Discount Code ({code})')
              .replace('{code}', discountCode)}
          </span>
          <span>-{breakdown.discountCodeDiscount.toLocaleString()} {currency}</span>
        </div>
      )}

      {/* Credit Applied */}
      {breakdown.creditApplied > 0 && (
        <div className="discount-breakdown-row discount">
          <span>{t.referrals?.creditApplied || 'Credit Applied'}</span>
          <span>-{breakdown.creditApplied.toLocaleString()} {currency}</span>
        </div>
      )}

      {/* Divider */}
      <div className="discount-breakdown-divider" />

      {/* Final Price */}
      <div className="discount-breakdown-row total">
        <span>{t.referrals?.youPay || 'You Pay'}</span>
        <span className="discount-breakdown-final">
          {(breakdown.finalPrice || basePrice).toLocaleString()} {currency}
        </span>
      </div>

      {/* Savings Summary */}
      {totalSaved > 0 && (
        <div className="discount-breakdown-savings">
          {(t.referrals?.youSaved || 'You saved {amount} ETB ({percent}% off!)')
            .replace('{amount}', totalSaved.toLocaleString())
            .replace('{percent}', savedPercent)}
        </div>
      )}

      {/* Cap Warning */}
      {breakdown.wasCapped && (
        <div className="discount-breakdown-capped">
          Maximum combined discount of {savedPercent}% reached.
        </div>
      )}
    </div>
  );
};

export default DiscountBreakdown;