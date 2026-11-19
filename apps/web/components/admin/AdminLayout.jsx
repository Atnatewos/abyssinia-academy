/**
 * @fileoverview Admin Layout Component
 *
 * Pure renderer of `packages/shared/config/admin-nav.config.js`. The
 * component owns no navigation data and no copy — every section, path,
 * icon, gate, and label resolves from config plus the shared i18n
 * bundles.
 *
 * Label resolution chain:
 *   1. Active locale bundle (`t`) via the config `labelKey` dot-path.
 *   2. English base bundle (`TRANSLATIONS.en`) when the active locale
 *      lacks the key — canonical cross-namespace keys that exist only
 *      in English still render correctly in every locale.
 *   3. Empty string guard — only strings ever reach the render tree,
 *      so a namespace reshape can never crash server-side rendering.
 *
 * Sidebar behavior:
 *   - md+ : fixed sidebar, always visible
 *   - < md: slide-in drawer with overlay, closes on route change
 *
 * Path: apps/web/components/admin/AdminLayout.jsx
 */

import React, { useState, useEffect, useCallback } from 'react';
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
import {
  useLanguage,
  TRANSLATIONS,
  DEFAULT_LANGUAGE,
} from '../../context/LanguageContext';
import { getItem, removeItem } from '../../lib/storage';
import adminNavConfig from '../../../../packages/shared/config/admin-nav.config';

/**
 * Icon registry — maps config icon names to lucide components.
 * Unknown names degrade to the configured default icon.
 */
const ICON_REGISTRY = {
  LayoutDashboard,
  CreditCard,
  Users,
  BookOpen,
  Briefcase,
  Settings,
  Tag,
  Share2,
  TrendingUp,
  UserCog,
  FileText,
  Video,
  Banknote,
  Network,
  BarChart3,
  Megaphone,
  GraduationCap,
  Store,
};

/** English base bundle used as the universal fallback locale. */
const ENGLISH_BUNDLE = TRANSLATIONS[DEFAULT_LANGUAGE] || {};

/**
 * Whether a value is a renderable, non-empty label string.
 * @param {*} value
 * @returns {boolean}
 */
const isLabelString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

/**
 * Resolve a dot-notation path on a translation bundle.
 * @param {object} source
 * @param {string|undefined} path
 * @returns {*}
 */
const getByPath = (source, path) => {
  if (!source || !path) return undefined;
  return path.split('.').reduce((node, key) => {
    if (node === null || node === undefined) return undefined;
    return node[key];
  }, source);
};

/**
 * Read the persisted admin profile defensively. Corrupted storage
 * values degrade to null instead of throwing during render.
 * @returns {object|null}
 */
const readAdminProfile = () => {
  const stored = getItem('admin_user');
  if (!stored) return null;
  if (typeof stored === 'object') return stored;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

/**
 * AdminLayout — Sidebar + header shell for all admin pages.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Page content to render
 * @param {string} props.title - Page title for the header
 * @param {string} props.subtitle - Page subtitle for the header
 */
const AdminLayout = ({ children, title = '', subtitle = '' }) => {
  const router = useRouter();
  const { t, language, toggleLanguage, supportedLanguages } = useLanguage();

  const [adminUser, setAdminUser] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  /* Authentication gate */
  useEffect(() => {
    const token = getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    setAdminUser(readAdminProfile());
  }, [router]);

  /* Close mobile drawer on route change */
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [router.pathname]);

  const handleLogout = () => {
    removeItem('admin_token');
    removeItem('admin_user');
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

  /**
   * Resolve a config labelKey: active locale first, English base second,
   * empty string last. Guarantees a renderable string for any key shape.
   * @param {string} key - Dot-notation i18n path from the nav config
   * @returns {string}
   */
  const label = useCallback(
    (key) => {
      const active = getByPath(t, key);
      if (isLabelString(active)) return active;
      const fallback = getByPath(ENGLISH_BUNDLE, key);
      return isLabelString(fallback) ? fallback : '';
    },
    [t]
  );

  /**
   * Resolve an icon component from the registry with a safe default.
   * @param {string} name - Config icon name
   * @returns {React.ComponentType}
   */
  const resolveIcon = (name) =>
    ICON_REGISTRY[name] ||
    ICON_REGISTRY[adminNavConfig.defaultIcon] ||
    LayoutDashboard;

  const currentLanguageName =
    supportedLanguages.find((entry) => entry.code === language)?.nativeLabel ||
    language;

  const languageToggleLabel = label(
    adminNavConfig.a11y.languageToggleKey
  ).replace('{language}', currentLanguageName);

  const brandName = isLabelString(adminNavConfig.brand?.name)
    ? adminNavConfig.brand.name
    : '';

  return (
    <div className="admin-layout">
      {/* Mobile sidebar overlay */}
      <div
        className={`admin-sidebar-overlay ${mobileSidebarOpen ? 'active' : ''}`}
        onClick={() => setMobileSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}
      >
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
              <span className="text-gradient-gold">{brandName}</span>
            </span>
            <span className="admin-sidebar-suffix">
              {label(adminNavConfig.chrome.panelSuffixKey)}
            </span>
          </div>
        </Link>

        <nav className="admin-nav">
          {adminNavConfig.sections.map((section) => {
            const isExpanded = expandedSections[section.id] !== false;
            return (
              <div key={section.id} className="admin-nav-section">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="admin-nav-section-header"
                  aria-expanded={isExpanded}
                >
                  <span>{label(section.labelKey)}</span>
                  {isExpanded ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </button>
                {isExpanded && (
                  <div className="admin-nav-section-items">
                    {section.items.map((item) => {
                      const IconComponent = resolveIcon(item.icon);
                      const active = isActive(item.path, item.exact);

                      if (
                        item.superadminOnly &&
                        adminUser?.role !== 'superadmin'
                      ) {
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
                          <span>{label(item.labelKey)}</span>
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
            <span>{label(adminNavConfig.chrome.viewSiteKey)}</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="admin-nav-logout"
          >
            <LogOut size={18} />
            <span>{label(adminNavConfig.chrome.logoutKey)}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="admin-main">
        <header className="admin-header">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="admin-mobile-toggle"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              aria-label={label(
                mobileSidebarOpen
                  ? adminNavConfig.a11y.closeSidebarKey
                  : adminNavConfig.a11y.openSidebarKey
              )}
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
              type="button"
              onClick={toggleLanguage}
              className="admin-header-lang-btn"
              title={languageToggleLabel}
              aria-label={languageToggleLabel}
            >
              {language.toUpperCase()}
            </button>
            <div className="admin-header-user">
              <div className="admin-header-avatar">
                {(adminUser?.username || '').charAt(0).toUpperCase()}
              </div>
              <span className="admin-header-username">
                {adminUser?.username || ''}
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