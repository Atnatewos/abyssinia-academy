/**
 * @fileoverview Toast Notification Component
 * Custom toast notifications - no browser alerts
 * Path: apps/web/components/shared/Toast.jsx
 */

import { useToast } from '../../context/ToastContext';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

/**
 * Individual toast item
 * @param {object} props - Toast props
 */
const ToastItem = ({ id, message, type, onClose }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  };

  const borderColors = {
    success: 'border-emerald-500/30',
    error: 'border-red-500/30',
    warning: 'border-amber-500/30',
    info: 'border-blue-500/30',
  };

  return (
    <div
      className={`glass-card rounded-xl p-4 flex items-start gap-3 shadow-2xl border animate-slide-up ${borderColors[type] || borderColors.info}`}
      style={{
        minWidth: '320px',
        maxWidth: '420px',
      }}
    >
      <span className="shrink-0 mt-0.5">{icons[type] || icons.info}</span>
      <p className="text-sm text-slate-700 dark:text-slate-200 flex-1">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

/**
 * Toast container - renders all active toasts
 */
const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

export default ToastContainer;