/**
 * @fileoverview Admin Layout Component
 *
 * Consistent wrapper for all admin pages with a responsive sidebar
 * and header. Navigation sections are data-driven so a new admin
 * surface is a one-line array entry — no component edits required.
 *
 * Sidebar behavior:
 *   - md+ : fixed sidebar, always visible
 *   - < md: slide-in drawer with overlay, closes on route change
 *
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
  Briefcase,
  Settings,
  LogOut,
  Code2,
  Tag,
  Share2,
  TrendingUp,
  UserCog,
  FileText,
  ChevronDown,
  ChevronRight,
  Video,
  Menu,
  X,
  Banknote,
  Network,
  BarChart3,
  Megaphone,
  GraduationCap,
  Store,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getItem } from '../../lib/storage';

/**
 * AdminLayout — Provides the sidebar + header shell for all admin pages.
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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  /* Authentication gate */
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

  /* Close mobile drawer on route change */
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [router.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setMobileSidebarOpen(false);
    router.push('/admin/login');
  };

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const isActive = (path, exact = false) => {
    if (exact) return router.pathname === path;
    return router.pathname.startsWith(path);
  };

  /*
   * Navigation sections. Each entry is pure data so a new admin surface
   * is a one-line config edit. `superadminOnly` gates an item behind
   * adminUser.role === 'superadmin'.
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
          label: t.admin?.students || 'Students',
          icon: Users,
        },
        {
          path: '/admin/agents',
          label: t.admin?.agentsTitle || 'Agents',
          icon: Briefcase,
        },
        {
          path: '/admin/resellers',
          label: 'Resellers',
          icon: Store,
        },
        {
          path: '/admin/courses',
          label: t.admin?.courses || 'Courses',
          icon: BookOpen,
        },
        {
          path: '/admin/referrals/mlm/withdrawals',
          label: t.referrals?.mlm?.adminWithdrawalsTitle || 'MLM Withdrawals',
          icon: Banknote,
        },
      ],
    },
    {
      id: 'programs',
      label: 'Programs',
      items: [
        {
          path: '/admin/scholarships',
          label: t.scholarships?.admin?.sectionLabel || 'Scholarships',
          icon: GraduationCap,
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
          path: '/admin/referrals/mlm/stats',
          label: t.referrals?.mlm?.adminMlmStatsTitle || 'MLM Stats',
          icon: BarChart3,
        },
        {
          path: '/admin/referrals/mlm/tree',
          label: 'Network Node Radar',
          icon: Network,
        },
        {
          path: '/admin/announcements',
          label: t.admin?.announcements?.navLabel || 'Announcements',
          icon: Megaphone,
        },
        {
          path: '/admin/discussions',
          label: 'Discussions',
          icon: Video,
        },
        {
          path: '/admin/course-videos',
          label: 'Course Videos',
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
      {/* Mobile sidebar overlay */}
      <div
        className={`admin-sidebar-overlay ${mobileSidebarOpen ? 'active' : ''}`}
        onClick={() => setMobileSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        <Link
          href="/admin"
          className="admin-sidebar-brand"
          onClick={() => setMobileSidebarOpen(false)}
        >
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

        <nav className="admin-nav">
          {navSections.map((section) => {
            const isExpanded = expandedSections[section.id] !== false;

            return (
              <div key={section.id} className="admin-nav-section">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="admin-nav-section-header"
                >
                  <span>{section.label}</span>
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                {isExpanded && (
                  <div className="admin-nav-section-items">
                    {section.items.map((item) => {
                      const IconComponent = item.icon;
                      const active = isActive(item.path, item.exact);

                      if (item.superadminOnly && adminUser?.role !== 'superadmin') {
                        return null;
                      }

                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          className={`admin-nav-link ${active ? 'active' : ''}`}
                          onClick={() => setMobileSidebarOpen(false)}
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

        <div className="admin-nav-bottom">
          <Link
            href="/"
            className="admin-nav-link"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <LayoutDashboard size={18} />
            <span>View Site</span>
          </Link>
          <button onClick={handleLogout} className="admin-nav-logout">
            <LogOut size={18} />
            <span>{t.auth?.logout || 'Logout'}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="admin-main">
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              className="admin-mobile-toggle"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              aria-label={mobileSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              aria-expanded={mobileSidebarOpen}
            >
              {mobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <div>
              <h1 className="admin-header-title">{title}</h1>
              {subtitle && <p className="admin-header-subtitle">{subtitle}</p>}
            </div>
          </div>

          <div className="admin-header-actions">
            <button
              onClick={toggleLanguage}
              className="admin-header-lang-btn"
              title={language === 'en' ? 'Switch to Amharic' : 'Switch to English'}
            >
              {language === 'en' ? 'EN' : 'አማ'}
            </button>

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

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;