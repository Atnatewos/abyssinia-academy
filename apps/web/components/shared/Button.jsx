/**
 * @fileoverview Standard Button Component
 * Versatile button with multiple variants
 * Path: apps/web/components/shared/Button.jsx
 */

import { Loader2 } from 'lucide-react';

/**
 * Button - Standard button with variants
 * @param {object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} [props.variant='primary'] - 'primary' | 'secondary' | 'outline' | 'ghost'
 * @param {string} [props.size='md'] - 'sm' | 'md' | 'lg'
 * @param {boolean} [props.loading=false] - Show loading spinner
 * @param {boolean} [props.disabled=false] - Disable button
 * @param {boolean} [props.fullWidth=false] - Make button full width
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.type='button'] - Button type attribute
 * @param {Function} [props.onClick] - Click handler
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  type = 'button',
  onClick,
}) => {
  const baseClasses = 'font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg',
    secondary: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700',
    outline: 'border border-amber-500/30 text-amber-500 hover:bg-amber-500/10',
    ghost: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${sizeClasses[size] || sizeClasses.md} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;