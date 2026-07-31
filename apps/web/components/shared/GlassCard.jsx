/**
 * @fileoverview Glassmorphism Card Component
 * Reusable card with frosted glass effect and hover animation
 * Path: apps/web/components/shared/GlassCard.jsx
 */

/**
 * GlassCard - Frosted glass container with optional hover lift
 * @param {object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.hover=true] - Enable hover lift animation
 * @param {boolean} [props.noPadding=false] - Remove default padding
 * @param {Function} [props.onClick] - Click handler
 */
const GlassCard = ({ children, className = '', hover = true, noPadding = false, onClick }) => {
  return (
    <div
      className={`
        glass-card
        ${hover ? 'glass-card-hover' : ''}
        ${!noPadding ? 'p-6' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick(e); } : undefined}
    >
      {children}
    </div>
  );
};

export default GlassCard;