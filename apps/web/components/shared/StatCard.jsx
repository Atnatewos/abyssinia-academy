/**
 * @fileoverview Stat Card Component
 *
 * A small, reusable stat tile used across dashboards and hero cards.
 * Renders an icon, a label, a large value, and optional subtext.
 *
 * Built entirely with Tailwind utilities. All colors resolve through
 * design-system CSS custom properties bridged in tailwind.config.js.
 *
 * Path: apps/web/components/shared/StatCard.jsx
 */

import React from 'react';

/**
 * StatCard — compact stat tile with icon, label, value, and subtext.
 *
 * @param {object} props
 * @param {React.ComponentType} [props.icon] - Lucide icon component
 * @param {string} props.label - Short uppercase label (e.g. "Next Lesson")
 * @param {string|number} props.value - Primary value (large text)
 * @param {string} [props.subtext] - Optional secondary line
 * @param {'default'|'accent'|'success'|'warning'} [props.tone='default'] - Color tone
 * @param {string} [props.className] - Extra wrapper classes
 */
const StatCard = ({
  icon: Icon,
  label,
  value,
  subtext,
  tone = 'default',
  className = '',
}) => {
  const toneStyles = {
    default: {
      iconBg: 'bg-bg-pill border-border-light text-text-muted',
      valueText: 'text-text-main',
    },
    accent: {
      iconBg: 'bg-accent/10 border-accent/30 text-accent',
      valueText: 'text-accent',
    },
    success: {
      iconBg: 'bg-success/10 border-success/30 text-success',
      valueText: 'text-success',
    },
    warning: {
      iconBg: 'bg-warning/10 border-warning/30 text-warning',
      valueText: 'text-warning',
    },
  };

  const styles = toneStyles[tone] || toneStyles.default;

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl bg-bg-card border border-border-light ${className}`}
    >
      {Icon && (
        <div
          className={`w-11 h-11 rounded-lg border flex items-center justify-center shrink-0 ${styles.iconBg}`}
        >
          <Icon size={18} />
        </div>
      )}
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="text-2xs font-bold uppercase tracking-wider text-text-dim">
          {label}
        </span>
        <span className={`text-lg font-extrabold leading-tight truncate ${styles.valueText}`}>
          {value}
        </span>
        {subtext && (
          <span className="text-2xs text-text-muted truncate">{subtext}</span>
        )}
      </div>
    </div>
  );
};

export default StatCard;