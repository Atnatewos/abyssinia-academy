/**
 * @fileoverview Sub-Reseller Invite Modal
 *
 * Modal for inviting a new sub-reseller. The parent enters either an
 * email or phone number, chooses the share % (via slider), and submits.
 *
 * The share % controls how much of the RESELLER POOL goes to the sub.
 * Live preview shows exactly what both parties earn per sale.
 *
 * Path: apps/web/components/reseller/SubResellerInviteModal.jsx
 */

import React, { useState, useMemo, useEffect } from 'react';
import { UserPlus, Loader, AlertCircle } from 'lucide-react';
import Modal from '../shared/Modal';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { useLanguage } from '../../context/LanguageContext';

const formatETB = (value) => {
  if (value === null || value === undefined) return '0';
  return Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 });
};

/**
 * SubResellerInviteModal — Invite form for adding a sub-reseller.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {object} props.config - { minSharePercent, maxSharePercent, defaultSharePercent, platformFeePercent, defaultPrice }
 * @param {Function} props.onInvite - (identifier, subSharePercent) => Promise<{ success, message? }>
 * @param {boolean} props.inviting
 * @param {string|null} props.inviteError
 */
const SubResellerInviteModal = ({
  isOpen,
  onClose,
  config,
  onInvite,
  inviting,
  inviteError,
}) => {
  const { t } = useLanguage();

  const minShare = config?.minSharePercent ?? 10;
  const maxShare = config?.maxSharePercent ?? 70;
  const defaultShare = config?.defaultSharePercent ?? 30;
  const platformFeePercent = config?.platformFeePercent ?? 30;
  const defaultPrice = config?.defaultPrice ?? 1000;

  const [identifier, setIdentifier] = useState('');
  const [sharePercent, setSharePercent] = useState(defaultShare);
  const [error, setError] = useState(null);

  /* Reset form when modal reopens */
  useEffect(() => {
    if (isOpen) {
      setIdentifier('');
      setSharePercent(defaultShare);
      setError(null);
    }
  }, [isOpen, defaultShare]);

  const preview = useMemo(() => {
    const platformFee =
      Math.round(defaultPrice * (platformFeePercent / 100) * 100) / 100;
    const pool = defaultPrice - platformFee;
    const subShare = Math.round(pool * (sharePercent / 100) * 100) / 100;
    const parentShare = pool - subShare;
    return { platformFee, pool, subShare, parentShare };
  }, [defaultPrice, platformFeePercent, sharePercent]);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError(null);

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      setError(
        t.reseller?.invite?.identifierRequired ||
          'Email or phone number is required.'
      );
      return;
    }

    const result = await onInvite(cleanIdentifier, sharePercent);
    if (result?.success) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex flex-col gap-5 p-2">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shrink-0">
            <UserPlus size={20} />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <h2 className="text-lg font-extrabold text-text-main">
              {t.reseller?.invite?.title || 'Invite a Sub-Reseller'}
            </h2>
            <p className="text-xs text-text-muted leading-relaxed">
              {t.reseller?.invite?.intro ||
                'How much of your earnings will you share with your sub-reseller?'}
            </p>
          </div>
        </div>

        {/* Identifier input */}
        <Input
          label={t.reseller?.invite?.identifierLabel || 'Email or phone number'}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder={
            t.reseller?.invite?.identifierPlaceholder ||
            'e.g., abebe@example.com or 0911223344'
          }
          disabled={inviting}
          error={error}
        />

        {/* Share % slider */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-text-main">
              {t.reseller?.invite?.sliderLabel || 'Their share'}
            </label>
            <span className="text-lg font-extrabold text-accent">
              {sharePercent}%
            </span>
          </div>

          <input
            type="range"
            min={minShare}
            max={maxShare}
            step="1"
            value={sharePercent}
            onChange={(e) => setSharePercent(Number(e.target.value))}
            disabled={inviting}
            className="w-full accent-amber-500 cursor-pointer"
          />

          <div className="flex items-center justify-between text-2xs text-text-dim">
            <span>
              {t.reseller?.invite?.sliderMin?.replace('{min}', String(minShare)) ||
                `Min ${minShare}%`}
            </span>
            <span>
              {t.reseller?.invite?.defaultHint?.replace(
                '{default}',
                String(defaultShare)
              ) || `Default ${defaultShare}%`}
            </span>
            <span>
              {t.reseller?.invite?.sliderMax?.replace('{max}', String(maxShare)) ||
                `Max ${maxShare}%`}
            </span>
          </div>
        </div>

        {/* Live preview */}
        <div className="flex flex-col gap-2 p-4 rounded-xl bg-bg-input border border-border-light">
          <p className="text-2xs font-bold uppercase tracking-wider text-text-muted">
            {(t.reseller?.invite?.previewTitle || 'Preview at {price} ETB sale').replace(
              '{price}',
              formatETB(defaultPrice)
            )}
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-text-muted">
                {t.reseller?.invite?.salePrice || 'Sale price'}
              </span>
              <span className="font-bold text-text-main">
                {formatETB(defaultPrice)} ETB
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">
                {t.reseller?.invite?.platformFee || 'Platform fee'}
              </span>
              <span className="font-bold text-text-main">
                {formatETB(preview.platformFee)} ETB
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">
                {t.reseller?.invite?.resellerPool || 'Reseller pool'}
              </span>
              <span className="font-bold text-text-main">
                {formatETB(preview.pool)} ETB
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">
                {t.reseller?.invite?.yourShare || 'Your share'}
              </span>
              <span className="font-bold text-accent">
                {formatETB(preview.parentShare)} ETB
              </span>
            </div>
          </div>

          <div className="flex justify-between pt-2 border-t border-border-light text-sm">
            <span className="text-text-muted">
              {t.reseller?.invite?.theirShare || 'They earn'}
            </span>
            <span className="font-extrabold text-success">
              {formatETB(preview.subShare)} ETB
            </span>
          </div>
        </div>

        {/* Invite error */}
        {inviteError && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-error/10 border border-error/20">
            <AlertCircle size={14} className="text-error shrink-0 mt-0.5" />
            <span className="text-xs text-error font-semibold">
              {inviteError}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={inviting}>
            {t.common?.cancel || 'Cancel'}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={inviting || !identifier.trim()}
          >
            {inviting ? (
              <>
                <Loader size={14} className="animate-spin" />
                {t.common?.sending || 'Sending...'}
              </>
            ) : (
              <>
                <UserPlus size={14} />
                {t.reseller?.invite?.submitButton || 'Send Invitation'}
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SubResellerInviteModal;
