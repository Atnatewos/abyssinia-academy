/**
 * @fileoverview Gold Gradient Text Component
 * Path: apps/web/components/shared/GradientText.jsx
 */

const GradientText = ({ children, as: Tag = 'span', className = '' }) => {
  return (
    <Tag className={`text-gradient-gold ${className}`}>
      {children}
    </Tag>
  );
};

export default GradientText;