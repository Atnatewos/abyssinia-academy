/**
 * @fileoverview Animated Button Component
 * Gradient animated button used for primary actions like Enroll Now
 * Path: apps/web/components/shared/AnimatedButton.jsx
 */

import { Loader2 } from 'lucide-react';

/**
 * AnimatedButton - Gradient button with shimmer animation
 * @param {object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} [props.variant='primary'] - 'primary' | 'secondary' | 'outline'
 * @param {boolean} [props.loading=false] - Show loading spinner
 * @param {boolean} [props.disabled=false] - Disable button
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.type='button'] - Button type attribute
 * @param {Function} [props.onClick] - Click handler
 */
const AnimatedButton = ({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
}) => {
  const baseClasses = 'relative group overflow-hidden rounded-full p-px font-semibold text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: '',
    secondary: 'bg-slate-800 text-slate-200 hover:text-amber-400',
    outline: 'border border-amber-500/30 text-amber-500 hover:bg-amber-500/10',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${className}`}
    >
      {variant === 'primary' && (
        <span className="absolute inset-0 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 rounded-full animate-gradient" />
      )}
      <span className={`relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-full transition-all duration-300 ${
        variant === 'primary'
          ? 'bg-slate-950 text-amber-300 group-hover:bg-opacity-0 group-hover:text-slate-950 font-bold'
          : ''
      }`}>
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </span>
    </button>
  );
};

export default AnimatedButton;