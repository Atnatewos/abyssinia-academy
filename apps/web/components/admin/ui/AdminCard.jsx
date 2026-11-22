/**
 * @fileoverview Admin Card Primitives
 *
 * Surface shells used by every admin page:
 *   AdminCard     — bordered solid surface (sections, forms, panels)
 *   AdminStatCard — icon chip + uppercase label + large value
 *
 * All visuals resolve through the token bridge. Hover lifts the border
 * color only — layout never shifts.
 *
 * Path: apps/web/components/admin/ui/AdminCard.jsx
 */

import React from 'react';
import clsx from 'clsx';

const SURFACE =
  'box-border bg-bg-card-solid border border-solid border-border-light rounded-2xl';

/** Semantic tone → icon-chip classes (alpha-enabled tokens). */
const TONES = {
  accent: 'bg-accent/10 text-accent',
  success: 'bg-success/10 text-success',
  error: 'bg-error/10 text-error',
  info: 'bg-info/10 text-info',
  warning: 'bg-warning/10 text-warning',
  neutral: 'bg-bg-pill text-text-muted',
};

/**
 * AdminCard — generic bordered surface.
 *
 * @param {object} props
 * @param {boolean} [props.hover=false] - Border lift on hover
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export const AdminCard = ({ hover = false, className, children, ...rest }) => (
  <div
    className={clsx(
      SURFACE,
      hover && 'transition-colors duration-fast hover:border-border-main',
      className
    )}
    {...rest}
  >
    {children}
  </div>
);

/**
 * AdminStatCard — metric display with semantic icon chip.
 *
 * @param {object} props
 * @param {React.ComponentType} props.icon - Lucide icon component
 * @param {string} props.label - Uppercase micro label
 * @param {string|number} props.value - Formatted metric value
 * @param {'accent'|'success'|'error'|'info'|'warning'|'neutral'} [props.tone='accent']
 * @param {React.ReactNode} [props.meta] - Optional footer line
 */
export const AdminStatCard = ({
  icon: Icon,
  label,
  value,
  tone = 'accent',
  meta,
  className,
}) => (
  <AdminCard hover className={clsx('flex flex-col gap-3 p-5', className)}>
    <div className="flex items-center justify-between gap-3">
      <span
        className={clsx(
          'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
          TONES[tone] || TONES.accent
        )}
      >
        {Icon && <Icon size={20} aria-hidden="true" />}
      </span>
      {meta}
    </div>
    <div className="flex flex-col gap-1 min-w-0">
      <span className="text-2xs font-bold uppercase tracking-wider text-text-dim">
        {label}
      </span>
      <span className="text-3xl font-black text-text-main truncate">
        {value}
      </span>
    </div>
  </AdminCard>
);

export default AdminCard;