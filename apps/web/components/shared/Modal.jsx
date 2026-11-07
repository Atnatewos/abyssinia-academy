/**
 * @fileoverview Reusable Modal Component
 *
 * Renders an accessible dialog overlay using the platform's existing
 * design tokens. Zero Tailwind dependencies — all styling goes through
 * the shared `.modal-*` classes defined in admin.css and components.css.
 *
 * Adds a `size` prop so callers can widen the dialog without relying on
 * inline styles. Available sizes: 'sm' | 'md' | 'lg' | 'xl' | 'full'.
 *
 * Path: apps/web/components/shared/Modal.jsx
 */

import { useEffect } from 'react';
import { X } from 'lucide-react';

/* Width presets mapped to Tailwind max-widths. */
const SIZE_CLASSES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-6xl',
};

/**
 * Modal — Accessible dialog with backdrop blur.
 *
 * @param {object} props
 * @param {boolean} props.isOpen         - Whether the modal is visible
 * @param {Function} props.onClose       - Called on backdrop click, X, Escape
 * @param {React.ReactNode} props.children - Modal body content
 * @param {string}  [props.title]        - Optional aria-label fallback
 * @param {string}  [props.className]    - Extra classes for the card
 * @param {boolean} [props.showClose=true] - Show the X close button
 * @param {'sm'|'md'|'lg'|'xl'|'full'} [props.size='md'] - Width preset
 */
const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  className = '',
  showClose = true,
  size = 'md',
}) => {
  /* Escape-to-close + body scroll lock while the modal is mounted */
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

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`modal-content ${sizeClass} ${className}`.trim()}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Dialog'}
        style={{
          maxWidth: undefined,
          width: '100%',
        }}
      >
        {showClose && (
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        )}

        {children}
      </div>
    </div>
  );
};

export default Modal;