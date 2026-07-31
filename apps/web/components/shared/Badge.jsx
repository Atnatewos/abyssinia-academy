/**
 * @fileoverview Badge Component
 * Status indicator badges for courses, payments, enrollment
 * Path: apps/web/components/shared/Badge.jsx
 */

/**
 * Badge - Small status/category indicator
 * @param {object} props
 * @param {string} props.text - Badge text
 * @param {string} [props.variant='default'] - 'default' | 'success' | 'warning' | 'danger' | 'info'
 * @param {string} [props.className] - Additional CSS classes
 */
const Badge = ({ text, variant = 'default', className = '' }) => {
  const variantClasses = {
    default: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    danger: 'bg-red-500/10 text-red-500 border-red-500/30',
    info: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold border ${variantClasses[variant] || variantClasses.default} ${className}`}
    >
      {text}
    </span>
  );
};

export default Badge;