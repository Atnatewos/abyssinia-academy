/**
 * @fileoverview Admin Header Component
 * Top header bar for admin pages
 * Path: apps/web/components/admin/AdminHeader.jsx
 */

import { Bell } from 'lucide-react';

/**
 * AdminHeader - Top bar with page title and notifications
 * @param {object} props
 * @param {string} props.title - Current page title
 * @param {string} props.subtitle - Current page subtitle
 */
const AdminHeader = ({ title = 'Dashboard', subtitle = '' }) => {
  return (
    <header className="sticky top-0 z-20 glass-card border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{title}</h1>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
          </button>

          <div className="flex items-center gap-2 pl-3 border-l border-slate-700/30">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 text-xs font-bold">
              A
            </div>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;