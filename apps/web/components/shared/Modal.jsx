/**
 * @fileoverview Reusable Modal Component
 * Glassmorphism modal with backdrop blur for overlays
 * Path: apps/web/components/shared/Modal.jsx
 */

import { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Modal - Accessible modal dialog with glassmorphism styling
 * @param {object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Close handler
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} [props.title] - Modal title
 * @param {string} [props.className] - Additional classes for content wrapper
 * @param {boolean} [props.showClose=true] - Show close button
 */
const Modal = ({ isOpen, onClose, children, title, className = '', showClose = true }) => {
  /**
   * Close modal on Escape key press
   */
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`glass-card rounded-3xl max-w-lg w-full border-amber-500/40 relative shadow-2xl z-10 max-h-[90vh] overflow-y-auto custom-scrollbar ${className}`}
        style={{ padding: '1.5rem' }}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Dialog'}
      >
        {showClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-sm transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {children}
      </div>
    </div>
  );
};

export default Modal;