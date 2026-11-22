/**
 * @fileoverview Admin Toolbar
 *
 * Responsive search + filter + actions row used above every list.
 * Search is a controlled input; debounce lives in the page via
 * useDebouncedValue so the toolbar stays presentation-only.
 *
 * Path: apps/web/components/admin/ui/AdminToolbar.jsx
 */

import React from 'react';
import clsx from 'clsx';
import { Search } from 'lucide-react';

/**
 * AdminToolbar — search field, filter slot, action slot.
 *
 * @param {object} props
 * @param {string} [props.searchValue]
 * @param {Function} [props.onSearchChange]
 * @param {string} [props.searchPlaceholder]
 * @param {React.ReactNode} [props.filters] - Selects/tabs rendered beside search
 * @param {React.ReactNode} [props.actions] - Buttons rendered at the end
 */
const AdminToolbar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = '',
  filters,
  actions,
  className,
}) => (
  <div
    className={clsx(
      'flex flex-col gap-3 mb-5 sm:flex-row sm:items-center sm:flex-wrap',
      className
    )}
  >
    {onSearchChange && (
      <div className="relative flex-1 min-w-[12rem]">
        <Search
          size={16}
          aria-hidden="true"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none"
        />
        <input
          type="search"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="box-border w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-input border border-solid border-border-medium text-sm font-sans text-text-main outline-none transition-colors duration-fast placeholder:text-text-dim focus:border-accent"
        />
      </div>
    )}
    {filters && <div className="flex items-center gap-2 flex-wrap">{filters}</div>}
    {actions && <div className="flex items-center gap-2 sm:ml-auto">{actions}</div>}
  </div>
);

export default AdminToolbar;