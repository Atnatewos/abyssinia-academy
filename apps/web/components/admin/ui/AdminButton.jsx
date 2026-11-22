/**
 * @fileoverview Admin Button Primitive
 *
 * Token-driven button with semantic variants. Every color resolves
 * through tailwind.config.js → themes.css, so dark/light themes and
 * rebrands propagate automatically. Preflight-safe: explicit border
 * style, font family, and background on every variant.
 *
 * Variants:
 *   primary   — gold gradient, dark ink (text-on-accent)
 *   secondary — muted surface, bordered
 *   danger    — red tint (destructive)
 *   warning   — amber tint (caution)
 *   ghost     — transparent, hover tint
 *
 * Sizes: sm | md | lg. Icon-only mode renders a square target.
 *
 * Path: apps/web/components/admin/ui/AdminButton.jsx
 */

import React from 'react';
import clsx from 'clsx';

const BASE =
  'inline-flex items-center justify-center gap-2 font-sans font-bold ' +
  'whitespace-nowrap cursor-pointer rounded-lg border border-solid ' +
  'transition-all duration-fast motion-reduce:transition-none ' +
  'disabled:opacity-50 disabled:cursor-not-allowed ' +
  'disabled:hover:translate-y-0 disabled:hover:shadow-none';

const VARIANTS = {
  primary:
    'border-transparent bg-gradient-to-br from-accent to-accent-dark text-on-accent ' +
    'hover:from-accent-light hover:to-accent hover:-translate-y-px hover:shadow-glow-gold ' +
    'active:translate-y-0 motion-reduce:hover:translate-y-0',
  secondary:
    'bg-surface-secondary border-border-medium text-text-main ' +
    'hover:bg-bg-icon-btn-hover hover:border-border-hover hover:text-accent',
  danger:
    'bg-error/10 border-error/30 text-error hover:bg-error/20 hover:border-error/50',
  warning:
    'bg-accent/10 border-accent/30 text-accent hover:bg-accent/20 hover:border-accent/50',
  ghost:
    'bg-transparent border-transparent text-text-muted ' +
    'hover:text-text-main hover:bg-bg-ghost-hover',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

const ICON_SIZES = {
  sm: 'w-7 h-7 p-0',
  md: 'w-9 h-9 p-0',
  lg: 'w-11 h-11 p-0',
};

/**
 * AdminButton — semantic action button.
 *
 * @param {object} props
 * @param {'primary'|'secondary'|'danger'|'warning'|'ghost'} [props.variant='primary']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.iconOnly=false] - Square icon target, no padding
 * @param {boolean} [props.fullWidth=false]
 * @param {boolean} [props.loading=false] - Shows spinner, disables interaction
 * @param {React.ReactNode} props.children
 */
const AdminButton = ({
  variant = 'primary',
  size = 'md',
  iconOnly = false,
  fullWidth = false,
  loading = false,
  disabled = false,
  type = 'button',
  className,
  children,
  ...rest
}) => (
  <button
    type={type}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    className={clsx(
      BASE,
      VARIANTS[variant] || VARIANTS.primary,
      iconOnly ? ICON_SIZES[size] : SIZES[size],
      fullWidth && 'w-full',
      className
    )}
    {...rest}
  >
    {loading && (
      <span
        aria-hidden="true"
        className="w-3.5 h-3.5 shrink-0 rounded-full border-2 border-solid border-current border-t-transparent animate-spin motion-reduce:animate-none"
      />
    )}
    {children}
  </button>
);

export default AdminButton;