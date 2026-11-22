/**
 * @fileoverview Admin Tabs
 *
 * Accessible tablist with optional count pills. Keyboard navigation
 * follows the WAI-ARIA tabs pattern (arrow keys move focus + selection).
 *
 * Path: apps/web/components/admin/ui/AdminTabs.jsx
 */

import React, { useRef } from 'react';
import clsx from 'clsx';

const TAB_BASE =
  'inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-solid ' +
  'text-sm font-semibold font-sans cursor-pointer transition-all duration-fast ' +
  'motion-reduce:transition-none';

/**
 * AdminTabs — controlled tab strip.
 *
 * @param {object} props
 * @param {Array<{id:string,label:string,count?:number,icon?:React.ComponentType}>} props.tabs
 * @param {string} props.active - Active tab id
 * @param {Function} props.onChange - (id) => void
 * @param {string} [props.ariaLabel]
 */
const AdminTabs = ({ tabs = [], active, onChange, ariaLabel, className }) => {
  const listRef = useRef(null);

  const handleKeyDown = (event, index) => {
    const lastIndex = tabs.length - 1;
    let nextIndex = null;

    if (event.key === 'ArrowRight') nextIndex = index === lastIndex ? 0 : index + 1;
    if (event.key === 'ArrowLeft') nextIndex = index === 0 ? lastIndex : index - 1;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = lastIndex;

    if (nextIndex !== null) {
      event.preventDefault();
      onChange(tabs[nextIndex].id);
      const buttons = listRef.current?.querySelectorAll('[role="tab"]');
      buttons?.[nextIndex]?.focus();
    }
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      className={clsx(
        'flex flex-wrap gap-2 border-b border-solid border-border-light pb-3 mb-5',
        className
      )}
    >
      {tabs.map((tab, index) => {
        const isActive = tab.id === active;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={clsx(
              TAB_BASE,
              isActive
                ? 'text-accent bg-accent/10 border-accent/20'
                : 'text-text-dim border-transparent hover:text-text-main hover:bg-bg-ghost-hover'
            )}
          >
            {Icon && <Icon size={14} className="shrink-0" aria-hidden="true" />}
            {tab.label}
            {typeof tab.count === 'number' && (
              <span
                className={clsx(
                  'inline-flex items-center justify-center min-w-[1.25rem] h-4 px-1 rounded-full text-2xs font-extrabold',
                  isActive ? 'bg-accent/20 text-accent' : 'bg-bg-pill text-text-dim'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default AdminTabs;