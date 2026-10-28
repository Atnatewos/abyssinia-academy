/**
 * @fileoverview Confirmation Dialog Component
 *
 * Default button labels come from the shared i18n confirmations
 * namespace. Parent can override any label per-use.
 *
 * Path: apps/web/components/shared/ConfirmDialog.jsx
 */

import { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import Modal from './Modal';
import { useLanguage } from '../../context/LanguageContext';

const VARIANT_CONFIG = {
  default: { Icon: Info, tone: 'default' },
  warning: { Icon: AlertTriangle, tone: 'warning' },
  danger: { Icon: AlertCircle, tone: 'danger' },
  success: { Icon: CheckCircle2, tone: 'success' },
};

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = 'warning',
  loading = false,
  requireInput = null,
}) => {
  const { t } = useLanguage();
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (isOpen) setInputValue('');
  }, [isOpen]);

  const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.warning;
  const IconComponent = config.Icon;

  const inputRequired =
    typeof requireInput === 'string' && requireInput.length > 0;
  const inputMatches = !inputRequired || inputValue === requireInput;
  const confirmDisabled = loading || !inputMatches;

  const resolvedConfirmText =
    confirmText || t.confirmations?.defaults?.confirmText || 'Confirm';
  const resolvedCancelText =
    cancelText || t.confirmations?.defaults?.cancelText || 'Cancel';
  const resolvedProcessing =
    t.confirmations?.defaults?.processingText || 'Processing...';
  const prefix = t.confirmations?.defaults?.requireInputPrefix || 'Type';
  const suffix = t.confirmations?.defaults?.requireInputSuffix || 'to confirm:';

  return (
    <Modal isOpen={isOpen} onClose={onClose} showClose={false}>
      <div className={`confirm-dialog confirm-dialog-${config.tone}`}>
        <div className={`confirm-dialog-icon confirm-dialog-icon-${config.tone}`}>
          <IconComponent size={24} />
        </div>

        <h3 className="confirm-dialog-title">{title}</h3>
        {message && <p className="confirm-dialog-message">{message}</p>}

        {inputRequired && (
          <div className="confirm-dialog-input-block">
            <label className="confirm-dialog-input-label">
              {prefix} <strong>{requireInput}</strong> {suffix}
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="confirm-dialog-input"
              autoComplete="off"
              autoFocus
              disabled={loading}
            />
          </div>
        )}

        <div className="confirm-dialog-actions">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="confirm-dialog-btn confirm-dialog-btn-cancel"
          >
            {resolvedCancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={`confirm-dialog-btn confirm-dialog-btn-${config.tone}`}
          >
            {loading ? resolvedProcessing : resolvedConfirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;