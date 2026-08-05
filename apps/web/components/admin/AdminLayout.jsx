/**
 * @fileoverview Admin Layout Component
 * Consistent wrapper for all admin pages with sidebar and header.
 * Extracts shared sidebar/header logic so individual pages don't repeat it.
 * Path: apps/web/components/admin/AdminLayout.jsx
 */

import React, { useState, useEffect } from 'react';
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
  Tag,
  Share2,
  TrendingUp,
  Shield,
  UserCog,
  FileText,
  ChevronDown,
  ChevronRight,
  Video,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getItem } from '../../lib/storage';

/**
 * AdminLayout — Provides the sidebar + header shell for all admin pages.
 * Each page renders its content as children inside this layout.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Page content to render
 * @param {string} props.title - Page title for the header
 * @param {string} props.subtitle - Page subtitle for the header
 */
const AdminLayout = ({ children, title = 'Dashboard', subtitle = '' }) => {
  const router = useRouter();
  const { t, language, toggleLanguage } = useLanguage();
  const [adminUser, setAdminUser] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  /*
   * Check authentication on mount
   */
  useEffect(() => {
    const token = getItem('admin_token');
    const user = getItem('admin_user');

    if (!token) {
      router.push('/admin/login');
      return;
    }

    if (user) {
      setAdminUser(typeof user === 'string' ? JSON.parse(user) : user);
    }
  }, [router]);

  /**
   * Handle admin logout
   */
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin/login');
  };

  /**
   * Toggle a sidebar section expand/collapse
   */
  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  /**
   * Check if a route is currently active
   */
  const isActive = (path, exact = false) => {
    if (exact) return router.pathname === path;
    return router.pathname.startsWith(path);
  };

  /*
   * Navigation items grouped by section
   */
  const navSections = [
    {
      id: 'main',
      label: 'Main',
      items: [
        {
          path: '/admin',
          label: t.admin?.dashboard || 'Dashboard',
          icon: LayoutDashboard,
          exact: true,
        },
      ],
    },
    {
      id: 'management',
      label: 'Management',
      items: [
        {
          path: '/admin/payments',
          label: t.admin?.payments || 'Payments',
          icon: CreditCard,
        },
        {
          path: '/admin/users',
          label: t.admin?.students || 'Users',
          icon: Users,
        },
        {
          path: '/admin/courses',
          label: t.admin?.courses || 'Courses',
          icon: BookOpen,
        },
      ],
    },
    {
      id: 'marketing',
      label: 'Marketing',
      items: [
        {
          path: '/admin/discounts',
          label: t.discounts?.adminTitle || 'Discount Codes',
          icon: Tag,
        },
        {
          path: '/admin/referrals',
          label: t.referrals?.dashboardTitle || 'Referrals',
          icon: Share2,
        },
        {
          path: '/admin/discussions',
          label: 'Discussions',
          icon: Video,
        },
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      items: [
        {
          path: '/admin/analytics',
          label: 'Analytics',
          icon: TrendingUp,
        },
        {
          path: '/admin/audit',
          label: 'Audit Logs',
          icon: FileText,
        },
      ],
    },
    {
      id: 'system',
      label: 'System',
      items: [
        {
          path: '/admin/settings',
          label: t.admin?.settings || 'Settings',
          icon: Settings,
        },
        {
          path: '/admin/admins',
          label: 'Admin Accounts',
          icon: UserCog,
          superadminOnly: true,
        },
      ],
    },
  ];

  return (
    <div className="admin-layout">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        {/* Brand */}
        <Link href="/admin" className="admin-sidebar-brand">
          <div className="admin-sidebar-logo">
            <Code2 />
          </div>
          <div>
            <span className="admin-sidebar-name">
              <span className="text-gradient-gold">ABYSSiNIA</span>
            </span>
            <span className="admin-sidebar-suffix">Admin Panel</span>
          </div>
        </Link>

        {/* Navigation Sections */}
        <nav className="admin-nav">
          {navSections.map((section) => {
            const isExpanded = expandedSections[section.id] !== false;
            const hasActiveChild = section.items.some((item) =>
              isActive(item.path, item.exact)
            );

            return (
              <div key={section.id} className="admin-nav-section">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="admin-nav-section-header"
                >
                  <span>{section.label}</span>
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                {/* Section Items */}
                {isExpanded && (
                  <div className="admin-nav-section-items">
                    {section.items.map((item) => {
                      const IconComponent = item.icon;
                      const active = isActive(item.path, item.exact);

                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          className={`admin-nav-link ${active ? 'active' : ''}`}
                        >
                          <IconComponent size={18} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="admin-nav-bottom">
          <Link href="/" className="admin-nav-link" target="_blank" rel="noopener noreferrer">
            <LayoutDashboard size={18} />
            <span>View Site</span>
          </Link>
          <button onClick={handleLogout} className="admin-nav-logout">
            <LogOut size={18} />
            <span>{t.auth?.logout || 'Logout'}</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div>
            <h1 className="admin-header-title">{title}</h1>
            {subtitle && <p className="admin-header-subtitle">{subtitle}</p>}
          </div>

          <div className="admin-header-actions">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="admin-header-lang-btn"
              title={language === 'en' ? 'Switch to Amharic' : 'Switch to English'}
            >
              {language === 'en' ? 'EN' : 'አማ'}
            </button>

            {/* Admin Avatar */}
            <div className="admin-header-user">
              <div className="admin-header-avatar">
                {(adminUser?.username || 'A').charAt(0).toUpperCase()}
              </div>
              <span className="admin-header-username">
                {adminUser?.username || 'Admin'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;