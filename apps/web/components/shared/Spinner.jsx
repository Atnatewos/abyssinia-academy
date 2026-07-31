/**
 * @fileoverview Loading Spinner Component
 * Animated spinning indicator for loading states
 * Path: apps/web/components/shared/Spinner.jsx
 */

/**
 * Spinner - Animated loading spinner
 * @param {object} props
 * @param {string} [props.size='md'] - 'sm' | 'md' | 'lg'
 * @param {string} [props.className] - Additional CSS classes
 */
const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size] || sizeClasses.md} border-2 border-slate-700 border-t-amber-500 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
};

export default Spinner;