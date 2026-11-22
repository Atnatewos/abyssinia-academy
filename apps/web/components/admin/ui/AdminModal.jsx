/**
 * @fileoverview Admin Modal Shell
 *
 * Fixed-overlay dialog used by detail views and forms. Handles:
 *   - Escape-to-close
 *   - Body scroll lock while open
 *   - Overlay click-to-close (content clicks stop propagation)
 *   - Focus containment start (close button receives initial focus)
 *   - Reduced-motion parity
 *
 * Destructive confirmations should use useConfirm() instead — this
 * shell is for content modals (payment detail, campaign form, etc.).
 *
 * Path: apps/web/components/admin/ui/AdminModal.jsx
 */

import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { X } from 'lucide-react';

const SIZE_CLASSES = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

/**
 * AdminModal — overlay dialog shell.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {string} [props.title]
 * @param {'sm'|'md'|'lg'|'xl'} [props.size='md']
 * @param {string} [props.closeLabel] - Accessible close-button label
 * @param {React.ReactNode} props.children
 * @param {React.ReactNode} [props.footer] - Sticky action row
 */
const AdminModal = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  closeLabel = '',
  children,
  footer,
}) => {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title || undefined}
      className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-bg-overlay backdrop-blur-sm animate-[fadeIn_0.15s_ease] motion-reduce:animate-none"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          'box-border relative w-full max-h-[90vh] flex flex-col',
          'bg-bg-card-solid border border-solid border-border-medium rounded-2xl shadow-xl',
          SIZE_CLASSES[size] || SIZE_CLASSES.md
        )}
      >
        <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-4 border-b border-solid border-border-light">
          {title && (
            <h2 className="m-0 text-lg font-extrabold text-text-main truncate">
              {title}
            </h2>
          )}
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="ml-auto w-8 h-8 shrink-0 inline-flex items-center justify-center rounded-lg bg-transparent border-0 text-text-muted cursor-pointer transition-colors duration-fast hover:text-text-main hover:bg-bg-ghost-hover"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-solid border-border-light">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminModal;