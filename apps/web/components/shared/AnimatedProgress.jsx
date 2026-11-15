/**
 * @fileoverview Animated Progress Bar
 *
 * A tiny, theme-aware progress bar that animates from 0 to its target
 * percentage on mount. Used inside hero cards and stat surfaces.
 *
 * Built entirely with Tailwind utilities. No external CSS.
 *
 * Path: apps/web/components/shared/AnimatedProgress.jsx
 */

import { useState, useEffect } from 'react';

/**
 * AnimatedProgress — horizontal progress bar with mount animation.
 *
 * @param {object} props
 * @param {number} props.percent - Target percentage (0-100)
 * @param {'accent'|'success'} [props.tone='accent'] - Bar color tone
 * @param {'sm'|'md'} [props.size='md'] - Bar height
 * @param {boolean} [props.showLabel=false] - Show percentage label above
 * @param {string} [props.className] - Extra wrapper classes
 */
const AnimatedProgress = ({
  percent = 0,
  tone = 'accent',
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  const [animatedPercent, setAnimatedPercent] = useState(0);

  const safePercent = Math.min(100, Math.max(0, Math.round(Number(percent) || 0)));

  useEffect(() => {
    /* Defer one tick so the bar animates on mount rather than instantly */
    const timer = setTimeout(() => setAnimatedPercent(safePercent), 50);
    return () => clearTimeout(timer);
  }, [safePercent]);

  const toneClass =
    tone === 'success'
      ? 'bg-gradient-to-r from-success to-emerald-400'
      : 'bg-gradient-to-r from-accent to-accent-light';

  const heightClass = size === 'sm' ? 'h-1.5' : 'h-2';

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-2xs">
          <span className="text-text-muted font-semibold">Progress</span>
          <span className="text-text-main font-bold font-mono">{safePercent}%</span>
        </div>
      )}
      <div className={`${heightClass} w-full rounded-full bg-bg-pill border border-border-light overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${toneClass}`}
          style={{ width: `${animatedPercent}%` }}
        />
      </div>
    </div>
  );
};

export default AnimatedProgress;