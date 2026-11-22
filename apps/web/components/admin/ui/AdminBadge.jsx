/**
 * @fileoverview Admin Status Badge
 *
 * One semantic mapper for every status string in the platform.
 * Replaces all bespoke badge CSS (status-badge, role-badge, phase-badge)
 * with token-driven Tailwind classes.
 *
 * Semantics:
 *   success — enrolled, approved, active, paid, published
 *   info    — registered, verified, processing
 *   warning — pending, paused, draft, locked
 *   error   — banned, rejected, suspended, expired, revoked, failed
 *   neutral — unknown / unmapped values
 *
 * Path: apps/web/components/admin/ui/AdminBadge.jsx
 */

import React from 'react';
import clsx from 'clsx';

const BASE =
  'inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-solid ' +
  'text-2xs font-bold capitalize whitespace-nowrap';

const TONE_CLASSES = {
  success: 'bg-success/10 text-success border-success/30',
  info: 'bg-info/10 text-info border-info/30',
  warning: 'bg-accent/10 text-accent border-accent/30',
  error: 'bg-error/10 text-error border-error/30',
  neutral: 'bg-bg-pill text-text-muted border-border-medium',
};

const STATUS_TONES = {
  enrolled: 'success',
  approved: 'success',
  active: 'success',
  paid: 'success',
  published: 'success',
  completed: 'success',
  refunded: 'info',
  registered: 'info',
  paymentverified: 'info',
  verified: 'info',
  processing: 'info',
  pending: 'warning',
  paused: 'warning',
  draft: 'warning',
  locked: 'warning',
  refundpending: 'warning',
  banned: 'error',
  rejected: 'error',
  suspended: 'error',
  expired: 'error',
  revoked: 'error',
  failed: 'error',
  disabled: 'error',
  withdrawn: 'neutral',
  closed: 'neutral',
};

/**
 * Map any status string to its semantic tone.
 * @param {string} status
 * @returns {'success'|'info'|'warning'|'error'|'neutral'}
 */
export const statusTone = (status) => {
  const key = String(status || '').toLowerCase().replace(/[\s_-]/g, '');
  return STATUS_TONES[key] || 'neutral';
};

/**
 * AdminBadge — semantic pill.
 *
 * @param {object} props
 * @param {string} [props.status] - Auto-mapped status string
 * @param {'success'|'info'|'warning'|'error'|'neutral'} [props.tone] - Explicit override
 * @param {boolean} [props.pulse=false] - Live indicator dot
 * @param {React.ReactNode} props.children - Display label (falls back to status)
 */
const AdminBadge = ({ status, tone, pulse = false, className, children }) => {
  const resolvedTone = tone || statusTone(status);

  return (
    <span className={clsx(BASE, TONE_CLASSES[resolvedTone], className)}>
      {pulse && (
        <span
          aria-hidden="true"
          className="w-1.5 h-1.5 rounded-full bg-current animate-pulse motion-reduce:animate-none"
        />
      )}
      {children ?? status}
    </span>
  );
};

export default AdminBadge;