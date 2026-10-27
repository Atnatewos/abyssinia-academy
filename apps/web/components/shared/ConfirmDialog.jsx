/**
 * @fileoverview Confirmation Dialog Component
 * Custom confirm dialog replacing browser's confirm()
 * Path: apps/web/components/shared/ConfirmDialog.jsx
 */

import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

/**
 * ConfirmDialog - Custom confirmation dialog (replaces browser confirm())
 * @param {object} props
 * @param {boolean} props.isOpen - Whether dialog is visible
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onConfirm - Confirm action handler
 * @param {string} props.title - Dialog title
 * @param {string} props.message - Dialog message
 * @param {string} [props.confirmText='Confirm'] - Confirm button text
 * @param {string} [props.cancelText='Cancel'] - Cancel button text
 * @param {string} [props.variant='warning'] - 'warning' | 'danger'
 * @param {boolean} [props.loading=false] - Show loading on confirm button
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  loading = false,
}) => {
  const variantStyles = {
    warning: 'bg-amber-500 hover:bg-amber-400',
    danger: 'bg-red-500 hover:bg-red-400',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showClose={false}>
      <div className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
        </div>

        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
          {title}
        </h3>

        <p className="text-sm text-slate-600 dark:text-slate-400">
          {message}
        </p>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2 rounded-xl text-slate-950 text-sm font-bold transition-colors disabled:opacity-50 ${variantStyles[variant] || variantStyles.warning}`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;