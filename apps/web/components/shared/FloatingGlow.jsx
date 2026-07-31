/**
 * @fileoverview Floating Ambient Glow Background
 * Animated gradient orbs that create the signature Abyssinia atmosphere
 * Path: apps/web/components/shared/FloatingGlow.jsx
 */

/**
 * FloatingGlow - Fixed background orbs with pulse animation
 * Present on every page for consistent atmosphere
 */
const FloatingGlow = () => {
  return (
    <div className="floating-glow-container">
      <div className="floating-glow-orb floating-glow-orb-1" />
      <div className="floating-glow-orb floating-glow-orb-2" style={{ animationDelay: '2s' }} />
      <div className="floating-glow-orb floating-glow-orb-3" style={{ animationDelay: '4s' }} />
    </div>
  );
};

export default FloatingGlow;