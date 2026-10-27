/**
 * @fileoverview Discount Code Input Component
 * Input field with apply/remove functionality and validation feedback.
 * ALL display text from i18n → t.discounts.*
 * Path: apps/web/components/discount/DiscountCodeInput.jsx
 */

import React, { useState, useCallback } from 'react';
import { Tag, X, Check, Loader } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import useDiscountCode from '../../hooks/useDiscountCode';

/**
 * DiscountCodeInput — Allows users to enter, validate, and apply discount codes.
 *
 * @param {object} props
 * @param {object} props.purchaseInfo - { amount, courseType, selectedPhases }
 * @param {function} props.onDiscountApplied - Callback when discount is applied
 * @param {function} props.onDiscountRemoved - Callback when discount is removed
 */
const DiscountCodeInput = ({
  purchaseInfo = {},
  onDiscountApplied,
  onDiscountRemoved,
}) => {
  const { t } = useLanguage();
  const {
    code,
    discountData,
    isApplied,
    isValidating,
    validationError,
    validateCode,
    applyCode,
    removeCode,
  } = useDiscountCode();

  const [inputValue, setInputValue] = useState('');

  /**
   * Handle the apply button click
   */
  const handleApply = useCallback(async () => {
    if (!inputValue.trim()) return;

    const result = await validateCode(inputValue.trim(), purchaseInfo);

    if (result.success && result.data) {
      applyCode(inputValue.trim().toUpperCase());
      if (onDiscountApplied) {
        onDiscountApplied(result.data);
      }
    }
  }, [inputValue, validateCode, purchaseInfo, applyCode, onDiscountApplied]);

  /**
   * Handle the remove button click
   */
  const handleRemove = useCallback(() => {
    removeCode();
    setInputValue('');
    if (onDiscountRemoved) {
      onDiscountRemoved();
    }
  }, [removeCode, onDiscountRemoved]);

  /**
   * Handle Enter key press
   */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    }
  }, [handleApply]);

  /*
   * If a code is already applied, show the applied state
   */
  if (isApplied && discountData) {
    return (
      <div className="discount-code-input applied">
        <div className="discount-code-applied-badge">
          <Check size={14} />
          <span>
            {(t.discounts?.discountCodeLineItem || 'Discount Code ({code})')
              .replace('{code}', code)}
          </span>
        </div>
        <div className="discount-code-applied-amount">
          <span className="discount-code-applied-save">
            {t.discounts?.youSave || 'You save'}: {discountData.discountAmount.toLocaleString()} ETB
          </span>
          <button
            onClick={handleRemove}
            className="discount-code-remove-btn"
            title={t.discounts?.removeCode || 'Remove'}
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="discount-code-input">
      <div className="discount-code-input-row">
        <div className="discount-code-input-field">
          <Tag size={14} className="discount-code-input-icon" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.discounts?.enterCode || 'Enter discount code'}
            className="discount-code-input-text"
            disabled={isValidating}
            maxLength={20}
          />
        </div>
        <button
          onClick={handleApply}
          disabled={isValidating || !inputValue.trim()}
          className="discount-code-apply-btn"
        >
          {isValidating ? (
            <Loader size={14} className="animate-spin" />
          ) : (
            t.discounts?.applyCode || 'Apply'
          )}
        </button>
      </div>

      {/* Validation Error */}
      {validationError && (
        <p className="discount-code-error">{validationError}</p>
      )}
    </div>
  );
};

export default DiscountCodeInput;