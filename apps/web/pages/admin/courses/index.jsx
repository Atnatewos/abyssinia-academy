/**
 * @fileoverview Admin Courses Page
 * Course management placeholder page
 * Path: apps/web/pages/admin/courses/index.jsx
 */

import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  LayoutDashboard, CreditCard, Users, BookOpen, Settings, LogOut, Code2,
} from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';

/**
 * AdminCoursesPage - Placeholder for course management
 */
const AdminCoursesPage = () => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin/login');
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/admin/payments', label: 'Payments', icon: CreditCard },
    { path: '/admin/students', label: 'Students', icon: Users },
    { path: '/admin/courses', label: 'Courses', icon: BookOpen },
  ];

  const isActive = (path, exact) => {
    if (exact) return router.pathname === path;
    return router.pathname.startsWith(path);
  };

  return (
    <>
      <SEOHead title="Manage Courses" />
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <Link href="/admin" className="admin-sidebar-brand">
            <div className="admin-sidebar-logo"><Code2 /></div>
            <div>
              <span className="admin-sidebar-name"><span className="text-gradient-gold">ABYSSiNIA</span></span>
              <span className="admin-sidebar-suffix">Admin Panel</span>
            </div>
          </Link>
          <nav className="admin-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} href={item.path} className={`admin-nav-link ${isActive(item.path, item.exact) ? 'active' : ''}`}>
                  <Icon /><span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="admin-nav-bottom">
            <Link href="/admin/settings" className={`admin-nav-link ${isActive('/admin/settings', false) ? 'active' : ''}`}>
              <Settings /><span>Settings</span>
            </Link>
            <button onClick={handleLogout} className="admin-nav-logout">
              <LogOut /><span>Logout</span>
            </button>
          </div>
        </aside>

        <div className="admin-main">
          <header className="admin-header">
            <div>
              <h1 className="admin-header-title">Courses</h1>
              <p className="admin-header-subtitle">Manage course content</p>
            </div>
          </header>
          <main className="admin-content">
            <div className="empty-state">
              <BookOpen size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
              <h3 className="empty-state-title">Course Management</h3>
              <p className="empty-state-desc">Course management features coming soon.</p>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminCoursesPage;