/**
 * @fileoverview Phase Cart Summary — Database-Driven Pricing
 * Uses usePaymentConfig hook for consistent per-phase pricing.
 * Path: apps/web/components/checkout/PhaseCartSummary.jsx
 */

import React, { useMemo } from 'react';
import { ShoppingCart, Tag, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import usePaymentConfig from '../../hooks/usePaymentConfig';

const PhaseCartSummary = ({ selectedPhases = [], compact = false }) => {
  const { t } = useLanguage();
  const { pricing } = usePaymentConfig();

  const summary = useMemo(() => {
    const perPhasePrice = pricing?.perPhase?.amountETB || 0;
    const fullCoursePrice = pricing?.fullCourse?.amountETB || 0;
    const currency = pricing?.fullCourse?.currency || 'ETB';
    const bulkDiscounts = pricing?.bulkDiscounts || [];

    const phaseCount = selectedPhases.length;
    const baseTotal = perPhasePrice * phaseCount;

    const applicableTier = [...bulkDiscounts]
      .sort((a, b) => b.phases - a.phases)
      .find((tier) => phaseCount >= tier.phases);

    const discountPercent = applicableTier?.discountPercent || 0;
    const discountAmount = Math.round(baseTotal * (discountPercent / 100));
    const finalTotal = baseTotal - discountAmount;

    return {
      phaseCount,
      baseTotal,
      discountPercent,
      discountAmount,
      finalTotal,
      fullCoursePrice,
      perPhasePrice,
      currency,
      isFullCourseCheaper: fullCoursePrice < finalTotal,
    };
  }, [selectedPhases, pricing]);

  if (selectedPhases.length === 0) return null;

  if (compact) {
    return (
      <div className="phase-cart-compact">
        <div className="phase-cart-compact-info">
          <ShoppingCart size={16} />
          <span className="phase-cart-compact-count">{summary.phaseCount} phase(s)</span>
          {summary.discountPercent > 0 && (
            <span className="phase-cart-compact-discount">
              <Tag size={12} />{summary.discountPercent}% off
            </span>
          )}
        </div>
        <div className="phase-cart-compact-total">
          <span className="phase-cart-compact-amount">
            {summary.finalTotal.toLocaleString()} {summary.currency}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="phase-cart-summary">
      <div className="phase-cart-row phase-cart-count">
        <ShoppingCart size={16} />
        <span>{summary.phaseCount} phase(s) selected</span>
      </div>
      <div className="phase-cart-row">
        <span>Subtotal</span>
        <span>{summary.baseTotal.toLocaleString()} {summary.currency}</span>
      </div>
      {summary.discountPercent > 0 && (
        <div className="phase-cart-row phase-cart-discount">
          <span><Tag size={14} />Bulk Discount ({summary.discountPercent}%)</span>
          <span>-{summary.discountAmount.toLocaleString()} {summary.currency}</span>
        </div>
      )}
      <div className="phase-cart-row phase-cart-total">
        <span>Total</span>
        <span>{summary.finalTotal.toLocaleString()} {summary.currency}</span>
      </div>
      {summary.isFullCourseCheaper && (
        <div className="phase-cart-nudge">
          <ArrowRight size={14} />
          <span>Full course is only {summary.fullCoursePrice.toLocaleString()} {summary.currency}</span>
        </div>
      )}
    </div>
  );
};

export default PhaseCartSummary;