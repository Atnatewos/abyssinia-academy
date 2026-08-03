/**
 * @fileoverview Phase Cart Summary Component
 * Displays selected phases count, pricing breakdown, and full course comparison
 * Supports compact mode for sticky cart bar
 * ALL display text from i18n → t.pricing.* and t.phasePurchase.cartSummary.*
 * Path: apps/web/components/checkout/PhaseCartSummary.jsx
 */

import React, { useMemo } from 'react';
import { ShoppingCart, Tag, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { calculatePhasePricing } from '../../lib/config';

/**
 * PhaseCartSummary — Shows cart total with bulk discount and full course nudge
 *
 * @param {object} props
 * @param {Array} props.selectedPhases - Array of selected phase ID strings
 * @param {boolean} props.compact - Use compact horizontal layout for sticky bar
 */
const PhaseCartSummary = ({ selectedPhases = [], compact = false }) => {
  const { t } = useLanguage();

  const pricing = useMemo(() => {
    return calculatePhasePricing(selectedPhases);
  }, [selectedPhases]);

  if (selectedPhases.length === 0) {
    return null;
  }

  if (compact) {
    const phaseWord = pricing.phaseCount === 1
      ? (t.pricing?.phaseUnit || 'phase')
      : (t.pricing?.phasesUnit || 'phases');

    return (
      <div className="phase-cart-compact">
        <div className="phase-cart-compact-info">
          <ShoppingCart size={16} />
          <span className="phase-cart-compact-count">
            {pricing.phaseCount} {phaseWord}
          </span>
          {pricing.discountPercent > 0 && (
            <span className="phase-cart-compact-discount">
              <Tag size={12} />
              {pricing.discountPercent}% {t.pricing?.offLabel || 'off'}
            </span>
          )}
        </div>
        <div className="phase-cart-compact-total">
          <span className="phase-cart-compact-label">
            {t.pricing?.totalLabel || 'Total'}:
          </span>
          <span className="phase-cart-compact-amount">
            {pricing.finalTotal.toLocaleString()} {pricing.currency}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="phase-cart-summary">
      <div className="phase-cart-row phase-cart-count">
        <ShoppingCart size={16} />
        <span>
          {t.phasePurchase?.cartSummary?.phasesSelected?.replace('{count}', pricing.phaseCount) || `${pricing.phaseCount} phase(s) selected`}
        </span>
      </div>

      <div className="phase-cart-row">
        <span>{t.phasePurchase?.cartSummary?.baseTotal || 'Subtotal'}</span>
        <span>{pricing.baseTotal.toLocaleString()} {pricing.currency}</span>
      </div>

      {pricing.discountPercent > 0 && (
        <div className="phase-cart-row phase-cart-discount">
          <span>
            <Tag size={14} />
            {t.phasePurchase?.cartSummary?.bulkDiscount?.replace('{percent}', pricing.discountPercent) || `Bulk Discount (${pricing.discountPercent}%)`}
          </span>
          <span>-{pricing.discountAmount.toLocaleString()} {pricing.currency}</span>
        </div>
      )}

      <div className="phase-cart-row phase-cart-total">
        <span>{t.phasePurchase?.cartSummary?.total || 'Total'}</span>
        <span>{pricing.finalTotal.toLocaleString()} {pricing.currency}</span>
      </div>

      {pricing.isFullCourseCheaper && (
        <div className="phase-cart-nudge">
          <ArrowRight size={14} />
          <span>
            {t.phasePurchase?.cartSummary?.fullCourseNudge?.replace('{price}', pricing.fullCoursePrice.toLocaleString()) || `Full course is only ${pricing.fullCoursePrice} ETB`}
          </span>
        </div>
      )}
    </div>
  );
};

export default PhaseCartSummary;