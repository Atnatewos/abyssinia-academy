/**
 * @fileoverview Admin Skeleton Primitives
 *
 * Shape-matched loading placeholders. The shimmer animation resolves
 * through the token bridge (animate-shimmer + bg-skeleton tokens) so
 * light/dark themes stay consistent.
 *
 * Exports: AdminSkeletonBase, AdminRowSkeleton, AdminStatSkeleton
 *
 * Path: apps/web/components/admin/ui/AdminSkeleton.jsx
 */

import React from 'react';
import clsx from 'clsx';

/**
 * Base shimmer block — compose shapes from width/height utilities.
 */
export const AdminSkeletonBase = ({ className, ...rest }) => (
  <span
    aria-hidden="true"
    className={clsx(
      'block rounded-md bg-bg-skeleton-strong animate-pulse motion-reduce:animate-none',
      className
    )}
    {...rest}
  />
);

/**
 * Row skeleton matching the AdminRowList geometry:
 * avatar circle + two text lines + trailing action square.
 */
export const AdminRowSkeleton = () => (
  <div className="box-border flex items-center gap-4 p-4 rounded-xl bg-bg-card border border-solid border-border-light">
    <AdminSkeletonBase className="w-10 h-10 rounded-full shrink-0" />
    <div className="flex flex-col gap-2 flex-1 min-w-0">
      <AdminSkeletonBase className="h-3.5 w-2/5" />
      <AdminSkeletonBase className="h-3 w-3/5" />
    </div>
    <AdminSkeletonBase className="hidden md:block h-5 w-16 rounded-full shrink-0" />
    <AdminSkeletonBase className="w-8 h-8 rounded-lg shrink-0" />
  </div>
);

/**
 * Stat-card skeleton matching AdminStatCard geometry.
 */
export const AdminStatSkeleton = () => (
  <div className="box-border flex flex-col gap-3 p-5 rounded-2xl bg-bg-card-solid border border-solid border-border-light">
    <AdminSkeletonBase className="w-10 h-10 rounded-lg" />
    <AdminSkeletonBase className="h-2.5 w-20" />
    <AdminSkeletonBase className="h-7 w-24" />
  </div>
);

export default AdminSkeletonBase;