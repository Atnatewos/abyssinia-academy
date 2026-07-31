/**
 * @fileoverview Skeleton Loading Placeholder
 * Animated shimmer placeholder for content loading states
 * Path: apps/web/components/shared/Skeleton.jsx
 */

/**
 * Skeleton - Shimmer loading placeholder
 * @param {object} props
 * @param {string} [props.className] - Additional CSS classes for width/height
 * @param {string} [props.variant='rectangular'] - 'text' | 'circular' | 'rectangular'
 */
const Skeleton = ({ className = '', variant = 'rectangular' }) => {
  const variantClasses = {
    text: 'h-4 rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <div
      className={`animate-shimmer bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] ${variantClasses[variant] || variantClasses.rectangular} ${className}`}
      role="status"
      aria-label="Loading content"
    />
  );
};

export default Skeleton;