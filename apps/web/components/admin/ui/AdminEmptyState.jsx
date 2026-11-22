/**
 * @fileoverview Admin Empty State
 *
 * Consistent zero-data presentation: icon chip + title + guidance +
 * optional CTA. Used by every list/table primitive so pages never
 * render bare "No data" paragraphs again.
 *
 * Path: apps/web/components/admin/ui/AdminEmptyState.jsx
 */

import React from 'react';
import clsx from 'clsx';
import { Inbox } from 'lucide-react';

/**
 * AdminEmptyState — centered empty placeholder.
 *
 * @param {object} props
 * @param {React.ComponentType} [props.icon]
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {React.ReactNode} [props.action] - CTA button slot
 */
const AdminEmptyState = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}) => (
  <div
    className={clsx(
      'flex flex-col items-center justify-center gap-4 py-16 px-4 text-center',
      'rounded-2xl border border-dashed border-border-medium bg-bg-input/40',
      className
    )}
  >
    <span className="w-14 h-14 rounded-2xl bg-accent/10 border border-solid border-accent/25 text-accent flex items-center justify-center">
      <Icon size={26} aria-hidden="true" />
    </span>
    <div className="flex flex-col gap-1 max-w-sm">
      <h3 className="m-0 text-base font-extrabold text-text-main">{title}</h3>
      {description && (
        <p className="m-0 text-sm text-text-muted leading-relaxed">{description}</p>
      )}
    </div>
    {action}
  </div>
);

export default AdminEmptyState;