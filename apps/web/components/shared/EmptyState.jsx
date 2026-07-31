/**
 * @fileoverview Empty State Component
 * Displayed when there's no data to show
 * Path: apps/web/components/shared/EmptyState.jsx
 */

import { Inbox } from 'lucide-react';

/**
 * EmptyState - Placeholder for empty data views
 * @param {object} props
 * @param {string} props.title - Empty state title
 * @param {string} [props.description] - Empty state description
 * @param {React.ReactNode} [props.icon] - Custom icon component
 * @param {React.ReactNode} [props.action] - Action button or link
 */
const EmptyState = ({ title, description, icon, action }) => {
  return (
    <div className="text-center py-16 px-4">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-4">
        {icon || <Inbox className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};

export default EmptyState;