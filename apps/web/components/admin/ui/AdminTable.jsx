/**
 * @fileoverview Admin Table Primitives
 *
 * Two render modes sharing one visual grammar:
 *   AdminRowList — stacked card rows (users, payments, courses)
 *   AdminTable   — real <table> for dense numeric data (resellers, audit)
 *
 * Both include shape-matched skeletons and empty states so pages never
 * hand-roll loading markup again.
 *
 * Path: apps/web/components/admin/ui/AdminTable.jsx
 */

import React from 'react';
import clsx from 'clsx';
import AdminEmptyState from './AdminEmptyState';
import { AdminRowSkeleton } from './AdminSkeleton';

/** Row shell shared by list-mode entries. */
export const ADMIN_ROW =
  'box-border flex flex-col items-stretch gap-3 p-4 rounded-xl bg-bg-card ' +
  'border border-solid border-border-light transition-colors duration-fast ' +
  'hover:border-border-main md:flex-row md:items-center md:gap-4';

/**
 * AdminRowList — vertical stack of card rows with loading/empty handling.
 *
 * @param {object} props
 * @param {boolean} props.loading
 * @param {Array} props.items
 * @param {Function} props.renderItem - (item, index) => ReactNode
 * @param {Function} props.keyOf - (item) => string
 * @param {string} props.emptyTitle
 * @param {string} [props.emptyDescription]
 * @param {React.ComponentType} [props.emptyIcon]
 * @param {number} [props.skeletonRows=6]
 */
export const AdminRowList = ({
  loading,
  items = [],
  renderItem,
  keyOf,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  skeletonRows = 6,
  className,
}) => {
  if (loading) {
    return (
      <div className={clsx('flex flex-col gap-2', className)} aria-busy="true">
        {Array.from({ length: skeletonRows }).map((_, i) => (
          <AdminRowSkeleton key={`row-skeleton-${i}`} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <AdminEmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      {items.map((item, index) => (
        <div key={keyOf(item)} className={ADMIN_ROW}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
};

/** Header cell classes for table mode. */
const TH =
  'py-3 px-4 text-2xs font-bold uppercase tracking-wider text-text-muted';

/**
 * AdminTable — semantic table with sticky-style header and hover rows.
 *
 * @param {object} props
 * @param {Array<{key:string,label:string,align?:'left'|'right'|'center'}>} props.columns
 * @param {boolean} props.loading
 * @param {Array} props.rows
 * @param {Function} props.renderRow - (row) => <tr> content cells
 * @param {Function} props.keyOf
 * @param {Function} [props.onRowClick]
 * @param {string} props.emptyTitle
 */
export const AdminTable = ({
  columns = [],
  loading,
  rows = [],
  renderRow,
  keyOf,
  onRowClick,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  skeletonRows = 6,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col gap-2" aria-busy="true">
        {Array.from({ length: skeletonRows }).map((_, i) => (
          <AdminRowSkeleton key={`table-skeleton-${i}`} />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <AdminEmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  const alignClass = (align) =>
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';

  return (
    <div className="rounded-xl border border-solid border-border-light overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm font-sans">
          <thead>
            <tr className="bg-bg-input border-b border-solid border-border-medium">
              {columns.map((col) => (
                <th key={col.key} scope="col" className={clsx(TH, alignClass(col.align))}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={keyOf(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={clsx(
                  'border-b border-solid border-border-light/50 transition-colors duration-fast',
                  onRowClick && 'cursor-pointer hover:bg-bg-ghost-hover'
                )}
              >
                {renderRow(row)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/** Body cell helper for table-mode rows. */
export const AdminTd = ({ align = 'left', className, children }) => (
  <td
    className={clsx(
      'py-3 px-4 text-sm text-text-main',
      align === 'right' && 'text-right',
      align === 'center' && 'text-center',
      className
    )}
  >
    {children}
  </td>
);

export default AdminRowList;