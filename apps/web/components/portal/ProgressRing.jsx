/**
 * @fileoverview Circular Progress Ring Component
 * Visual SVG indicator for week/phase completion status
 * Path: apps/web/components/portal/ProgressRing.jsx
 */
import React from 'react';

/**
 * ProgressRing - Renders a circular SVG progress indicator
 * @param {object} props
 * @param {number} props.progress - Completion percentage (0-100)
 * @param {number} [props.size=24] - Width and height of the SVG in pixels
 * @param {number} [props.strokeWidth=3] - Thickness of the ring stroke
 * @param {string} [props.color='var(--accent-gold)'] - Color of the progress fill
 */
const ProgressRing = ({ progress, size = 24, strokeWidth = 3, color = 'var(--accent-gold)' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="progress-ring" aria-label={`${progress}% complete`}>
      {/* Background track */}
      <circle
        className="progress-ring-bg"
        stroke="rgba(51, 65, 85, 0.3)"
        fill="transparent"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      {/* Progress fill */}
      <circle
        className="progress-ring-fill"
        stroke={color}
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        r={radius}
        cx={size / 2}
        cy={size / 2}
        style={{
          transition: 'stroke-dashoffset 0.5s ease-in-out',
          transform: `rotate(-90deg)`,
          transformOrigin: '50% 50%',
        }}
      />
    </svg>
  );
};

export default ProgressRing;