/**
 * @fileoverview Reseller Price Editor
 *
 * Inline price-editing control. The reseller types their price, sees
 * a live preview of their per-sale earnings, and saves.
 *
 * Validates against config bounds BEFORE sending to the server. The
 * server also validates, so a client-side bypass can't succeed.
 *
 * Path: apps/web/components/reseller/PriceEditor.jsx
 */

import React, { useState, useEffect } from 'react';
import { Pencil, Check, X, Loader, Coins } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

const formatETB = (value) => {
  if (value === null || value === undefined) return '0';
  return Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 });
};

/**
 * PriceEditor — Inline price editing with earnings preview.
 *
 * @param {object} props
 * @param {number} props.currentPrice - Current reseller price
 * @param {number} props.minPrice - Config lower bound
 * @param {number} props.maxPrice - Config upper bound
 * @param {number} props.platformFeePercent - e.g., 30
 * @param {number} props.subSharePercent - This reseller's share (e.g., 30 if they have a parent; 100 if not)
 * @param {boolean} props.hasParent - Whether this reseller has a parent
 * @param {boolean} props.saving - Save in progress
 * @param {Function} props.onSave - Called with validated price → Promise<{ success, message? }>
 */
const PriceEditor = ({
  currentPrice,
  minPrice,
  maxPrice,
  platformFeePercent,
  subSharePercent,
  hasParent,
  saving,
  onSave,
}) => {
  const { t } = useLanguage();
  const toast = useToast();

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(currentPrice || ''));
  const [error, setError] = useState(null);

  /* Keep input in sync when the parent price changes externally */
  useEffect(() => {
    if (!editing) {
      setValue(String(currentPrice || ''));
    }
  }, [currentPrice, editing]);

  /**
   * Compute the reseller's earnings per sale at a given retail price.
   * platformFee = price * (percent/100)
   * pool = price - platformFee
   * earnings = pool * (sharePercent/100) if hasParent else pool
   *
   * @param {number} price
   * @returns {{ platformFee: number, earnings: number, parentShare: number }}
   */
  const computeEarnings = (price) => {
    const numeric = Number(price);
    if (!numeric || numeric <= 0) {
      return { platformFee: 0, earnings: 0, parentShare: 0 };
    }
    const platformFee = Math.round(numeric * (platformFeePercent / 100) * 100) / 100;
    const pool = numeric - platformFee;
    const earnings = hasParent
      ? Math.round(pool * (subSharePercent / 100) * 100) / 100
      : pool;
    const parentShare = hasParent ? pool - earnings : 0;
    return { platformFee, earnings, parentShare };
  };

  const preview = computeEarnings(editing ? value : currentPrice);

  const handleSave = async () => {
    setError(null);

    const numeric = Number(value);

    if (!Number.isFinite(numeric) || numeric <= 0) {
      setError(
        t.reseller?.errors?.invalidPrice || 'Please enter a valid price.'
      );
      return;
    }
    if (numeric < minPrice) {
      setError(
        (t.reseller?.errors?.priceBelowMin || 'Price must be at least {min} ETB.')
          .replace('{min}', String(minPrice))
      );
      return;
    }
    if (numeric > maxPrice) {
      setError(
        (t.reseller?.errors?.priceAboveMax || 'Price must be at most {max} ETB.')
          .replace('{max}', String(maxPrice))
      );
      return;
    }

    const result = await onSave(numeric);
    if (result?.success) {
      setEditing(false);
      toast.success(
        t.reseller?.store?.priceSaved || 'Price updated successfully.'
      );
    } else {
      setError(result?.message || 'Failed to update price.');
    }
  };

  const handleCancel = () => {
    setValue(String(currentPrice || ''));
    setEditing(false);
    setError(null);
  };

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl bg-bg-card-solid border border-border-light">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold text-text-main">
            {t.reseller?.store?.priceLabel || 'Your Price'}
          </span>
          <span className="text-xs text-text-muted">
            {t.reseller?.store?.priceHint ||
              'Set your own price for the Abyssinia Academy course.'}
          </span>
        </div>

        {!editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(true);
              setValue(String(currentPrice || ''));
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-medium text-xs font-bold text-text-muted hover:border-accent/40 hover:text-accent transition-colors"
          >
            <Pencil size={12} />
            {t.common?.edit || 'Edit'}
          </button>
        )}
      </div>

      {editing ? (
        <>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-input border border-border-medium focus-within:border-accent">
              <Coins size={16} className="text-text-dim shrink-0" />
              <input
                type="number"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setError(null);
                }}
                min={minPrice}
                max={maxPrice}
                step="1"
                autoFocus
                className="flex-1 bg-transparent border-0 outline-none text-base font-extrabold text-text-main"
              />
              <span className="text-xs font-bold text-text-dim">ETB</span>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent text-text-inverse disabled:opacity-50 hover:bg-accent-light transition-colors"
              title={t.common?.save || 'Save'}
            >
              {saving ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border-medium text-text-muted hover:bg-bg-ghost-hover transition-colors disabled:opacity-50"
              title={t.common?.cancel || 'Cancel'}
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-2xs text-text-dim">
            {t.reseller?.store?.priceMin?.replace('{min}', String(minPrice)) ||
              `Minimum: ${minPrice} ETB`}
            {' · '}
            {t.reseller?.store?.priceMax?.replace('{max}', String(maxPrice)) ||
              `Maximum: ${maxPrice} ETB`}
          </p>

          {error && (
            <p className="text-xs text-error font-semibold">{error}</p>
          )}
        </>
      ) : (
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-text-main">
            {formatETB(currentPrice)}
          </span>
          <span className="text-sm font-bold text-text-dim">ETB</span>
        </div>
      )}

      {/* Live earnings preview */}
      <div className="flex flex-col gap-1.5 pt-3 border-t border-border-light">
        <p className="text-xs text-text-muted">
          {t.reseller?.earnings?.title?.replace(
            '{price}',
            formatETB(editing ? Number(value) || 0 : currentPrice)
          ) || `At ${formatETB(editing ? Number(value) || 0 : currentPrice)} ETB, you earn:`}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-extrabold text-success">
            {formatETB(preview.earnings)} ETB
          </span>
          <span className="text-2xs text-text-dim">
            {hasParent
              ? `(${subSharePercent}% of pool)`
              : `(${100 - platformFeePercent}% of sale)`}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-1 text-2xs text-text-dim">
          <span>
            {t.reseller?.earnings?.platformFee || 'Platform fee'}:{' '}
            {formatETB(preview.platformFee)} ETB
          </span>
          {hasParent && (
            <span>
              {t.reseller?.earnings?.parentShare || 'Parent share'}:{' '}
              {formatETB(preview.parentShare)} ETB
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceEditor;