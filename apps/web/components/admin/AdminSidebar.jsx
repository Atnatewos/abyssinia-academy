/**
 * @fileoverview Admin Sidebar Component
 * Navigation sidebar for the admin dashboard
 * Path: apps/web/components/admin/AdminSidebar.jsx
 */

import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  LayoutDashboard,
  CreditCard,
  Users,
  BookOpen,
  Settings,
  LogOut,
  Code2,
} from 'lucide-react';

/**
 * AdminSidebar - Fixed sidebar navigation for admin pages
 * Highlights the current active route
 */
const AdminSidebar = () => {
  const router = useRouter();

  const navItems = [
    {
      path: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      path: '/admin/payments',
      label: 'Payments',
      icon: CreditCard,
    },
    {
      path: '/admin/students',
      label: 'Students',
      icon: Users,
    },
    {
      path: '/admin/courses',
      label: 'Courses',
      icon: BookOpen,
    },
  ];

  /**
   * Check if a navigation item is active
   * @param {string} path - Route path
   * @param {boolean} exact - Whether to match exactly
   * @returns {boolean} Whether the route is active
   */
  const isActive = (path, exact = false) => {
    if (exact) return router.pathname === path;
    return router.pathname.startsWith(path);
  };

  /**
   * Handle admin logout
   */
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-slate-900/50 border-r border-slate-700/30 p-6 flex flex-col fixed left-0 top-0 z-30">
      {/* Brand */}
      <Link href="/admin" className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center">
          <Code2 className="w-6 h-6 text-slate-950 font-bold" />
        </div>
        <div>
          <span className="text-lg font-extrabold text-gradient-gold block leading-none">
            ABYSSiNIA
          </span>
          <span className="text-[9px] tracking-widest text-slate-400 font-medium uppercase">
            Admin Panel
          </span>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.path, item.exact);

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="pt-4 border-t border-slate-700/30 space-y-1">
        <Link
          href="/admin/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            isActive('/admin/settings')
              ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;