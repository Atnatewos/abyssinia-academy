// /**
//  * @fileoverview Admin Layout Component
//  *
//  * Pure renderer of `packages/shared/config/admin-nav.config.js`. The
//  * component owns no navigation data and no copy — every section, path,
//  * icon, gate, and label resolves from config plus the shared i18n
//  * bundles.
//  *
//  * Label resolution chain:
//  *   1. Active locale bundle (`t`) via the config `labelKey` dot-path.
//  *   2. English base bundle (`TRANSLATIONS.en`) when the active locale
//  *      lacks the key — canonical cross-namespace keys that exist only
//  *      in English still render correctly in every locale.
//  *   3. Empty string guard — only strings ever reach the render tree,
//  *      so a namespace reshape can never crash server-side rendering.
//  *
//  * Sidebar behavior:
//  *   - md+ : fixed sidebar, always visible
//  *   - < md: slide-in drawer with overlay, closes on route change
//  *
//  * Path: apps/web/components/admin/AdminLayout.jsx
//  */

// import React, { useState, useEffect, useCallback } from 'react';
// import { useRouter } from 'next/router';
// import Link from 'next/link';
// import {
//   LayoutDashboard,
//   CreditCard,
//   Users,
//   BookOpen,
//   Briefcase,
//   Settings,
//   LogOut,
//   Code2,
//   Tag,
//   Share2,
//   TrendingUp,
//   UserCog,
//   FileText,
//   ChevronDown,
//   ChevronRight,
//   Video,
//   Menu,
//   X,
//   Banknote,
//   Network,
//   BarChart3,
//   Megaphone,
//   GraduationCap,
//   Store,
// } from 'lucide-react';
// import {
//   useLanguage,
//   TRANSLATIONS,
//   DEFAULT_LANGUAGE,
// } from '../../context/LanguageContext';
// import { getItem, removeItem } from '../../lib/storage';
// import adminNavConfig from '../../../../packages/shared/config/admin-nav.config';

// /**
//  * Icon registry — maps config icon names to lucide components.
//  * Unknown names degrade to the configured default icon.
//  */
// const ICON_REGISTRY = {
//   LayoutDashboard,
//   CreditCard,
//   Users,
//   BookOpen,
//   Briefcase,
//   Settings,
//   Tag,
//   Share2,
//   TrendingUp,
//   UserCog,
//   FileText,
//   Video,
//   Banknote,
//   Network,
//   BarChart3,
//   Megaphone,
//   GraduationCap,
//   Store,
// };

// /** English base bundle used as the universal fallback locale. */
// const ENGLISH_BUNDLE = TRANSLATIONS[DEFAULT_LANGUAGE] || {};

// /**
//  * Whether a value is a renderable, non-empty label string.
//  * @param {*} value
//  * @returns {boolean}
//  */
// const isLabelString = (value) =>
//   typeof value === 'string' && value.trim().length > 0;

// /**
//  * Resolve a dot-notation path on a translation bundle.
//  * @param {object} source
//  * @param {string|undefined} path
//  * @returns {*}
//  */
// const getByPath = (source, path) => {
//   if (!source || !path) return undefined;
//   return path.split('.').reduce((node, key) => {
//     if (node === null || node === undefined) return undefined;
//     return node[key];
//   }, source);
// };

// /**
//  * Read the persisted admin profile defensively. Corrupted storage
//  * values degrade to null instead of throwing during render.
//  * @returns {object|null}
//  */
// const readAdminProfile = () => {
//   const stored = getItem('admin_user');
//   if (!stored) return null;
//   if (typeof stored === 'object') return stored;
//   try {
//     return JSON.parse(stored);
//   } catch {
//     return null;
//   }
// };

// /**
//  * AdminLayout — Sidebar + header shell for all admin pages.
//  *
//  * @param {object} props
//  * @param {React.ReactNode} props.children - Page content to render
//  * @param {string} props.title - Page title for the header
//  * @param {string} props.subtitle - Page subtitle for the header
//  */
// const AdminLayout = ({ children, title = '', subtitle = '' }) => {
//   const router = useRouter();
//   const { t, language, toggleLanguage, supportedLanguages } = useLanguage();

//   const [adminUser, setAdminUser] = useState(null);
//   const [expandedSections, setExpandedSections] = useState({});
//   const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

//   /* Authentication gate */
//   useEffect(() => {
//     const token = getItem('admin_token');
//     if (!token) {
//       router.push('/admin/login');
//       return;
//     }
//     setAdminUser(readAdminProfile());
//   }, [router]);

//   /* Close mobile drawer on route change */
//   useEffect(() => {
//     setMobileSidebarOpen(false);
//   }, [router.pathname]);

//   const handleLogout = () => {
//     removeItem('admin_token');
//     removeItem('admin_user');
//     setMobileSidebarOpen(false);
//     router.push('/admin/login');
//   };

//   const toggleSection = (sectionId) => {
//     setExpandedSections((prev) => ({
//       ...prev,
//       [sectionId]: !prev[sectionId],
//     }));
//   };

//   const isActive = (path, exact = false) => {
//     if (exact) return router.pathname === path;
//     return router.pathname.startsWith(path);
//   };

//   /**
//    * Resolve a config labelKey: active locale first, English base second,
//    * empty string last. Guarantees a renderable string for any key shape.
//    * @param {string} key - Dot-notation i18n path from the nav config
//    * @returns {string}
//    */
//   const label = useCallback(
//     (key) => {
//       const active = getByPath(t, key);
//       if (isLabelString(active)) return active;
//       const fallback = getByPath(ENGLISH_BUNDLE, key);
//       return isLabelString(fallback) ? fallback : '';
//     },
//     [t]
//   );

//   /**
//    * Resolve an icon component from the registry with a safe default.
//    * @param {string} name - Config icon name
//    * @returns {React.ComponentType}
//    */
//   const resolveIcon = (name) =>
//     ICON_REGISTRY[name] ||
//     ICON_REGISTRY[adminNavConfig.defaultIcon] ||
//     LayoutDashboard;

//   const currentLanguageName =
//     supportedLanguages.find((entry) => entry.code === language)?.nativeLabel ||
//     language;

//   const languageToggleLabel = label(
//     adminNavConfig.a11y.languageToggleKey
//   ).replace('{language}', currentLanguageName);

//   const brandName = isLabelString(adminNavConfig.brand?.name)
//     ? adminNavConfig.brand.name
//     : '';

//   return (
//     <div className="admin-layout">
//       {/* Mobile sidebar overlay */}
//       <div
//         className={`admin-sidebar-overlay ${mobileSidebarOpen ? 'active' : ''}`}
//         onClick={() => setMobileSidebarOpen(false)}
//         aria-hidden="true"
//       />

//       {/* Sidebar */}
//       <aside
//         className={`admin-sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}
//       >
//         <Link
//           href="/admin"
//           className="admin-sidebar-brand"
//           onClick={() => setMobileSidebarOpen(false)}
//         >
//           <div className="admin-sidebar-logo">
//             <Code2 />
//           </div>
//           <div>
//             <span className="admin-sidebar-name">
//               <span className="text-gradient-gold">{brandName}</span>
//             </span>
//             <span className="admin-sidebar-suffix">
//               {label(adminNavConfig.chrome.panelSuffixKey)}
//             </span>
//           </div>
//         </Link>

//         <nav className="admin-nav">
//           {adminNavConfig.sections.map((section) => {
//             const isExpanded = expandedSections[section.id] !== false;
//             return (
//               <div key={section.id} className="admin-nav-section">
//                 <button
//                   type="button"
//                   onClick={() => toggleSection(section.id)}
//                   className="admin-nav-section-header"
//                   aria-expanded={isExpanded}
//                 >
//                   <span>{label(section.labelKey)}</span>
//                   {isExpanded ? (
//                     <ChevronDown size={14} />
//                   ) : (
//                     <ChevronRight size={14} />
//                   )}
//                 </button>
//                 {isExpanded && (
//                   <div className="admin-nav-section-items">
//                     {section.items.map((item) => {
//                       const IconComponent = resolveIcon(item.icon);
//                       const active = isActive(item.path, item.exact);

//                       if (
//                         item.superadminOnly &&
//                         adminUser?.role !== 'superadmin'
//                       ) {
//                         return null;
//                       }

//                       return (
//                         <Link
//                           key={item.path}
//                           href={item.path}
//                           className={`admin-nav-link ${active ? 'active' : ''}`}
//                           onClick={() => setMobileSidebarOpen(false)}
//                         >
//                           <IconComponent size={18} />
//                           <span>{label(item.labelKey)}</span>
//                         </Link>
//                       );
//                     })}
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </nav>

//         <div className="admin-nav-bottom">
//           <Link
//             href="/"
//             className="admin-nav-link"
//             target="_blank"
//             rel="noopener noreferrer"
//             onClick={() => setMobileSidebarOpen(false)}
//           >
//             <LayoutDashboard size={18} />
//             <span>{label(adminNavConfig.chrome.viewSiteKey)}</span>
//           </Link>
//           <button
//             type="button"
//             onClick={handleLogout}
//             className="admin-nav-logout"
//           >
//             <LogOut size={18} />
//             <span>{label(adminNavConfig.chrome.logoutKey)}</span>
//           </button>
//         </div>
//       </aside>

//       {/* Main content */}
//       <div className="admin-main">
//         <header className="admin-header">
//           <div className="flex items-center gap-3">
//             <button
//               type="button"
//               className="admin-mobile-toggle"
//               onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
//               aria-label={label(
//                 mobileSidebarOpen
//                   ? adminNavConfig.a11y.closeSidebarKey
//                   : adminNavConfig.a11y.openSidebarKey
//               )}
//               aria-expanded={mobileSidebarOpen}
//             >
//               {mobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
//             </button>
//             <div>
//               <h1 className="admin-header-title">{title}</h1>
//               {subtitle && <p className="admin-header-subtitle">{subtitle}</p>}
//             </div>
//           </div>

//           <div className="admin-header-actions">
//             <button
//               type="button"
//               onClick={toggleLanguage}
//               className="admin-header-lang-btn"
//               title={languageToggleLabel}
//               aria-label={languageToggleLabel}
//             >
//               {language.toUpperCase()}
//             </button>
//             <div className="admin-header-user">
//               <div className="admin-header-avatar">
//                 {(adminUser?.username || '').charAt(0).toUpperCase()}
//               </div>
//               <span className="admin-header-username">
//                 {adminUser?.username || ''}
//               </span>
//             </div>
//           </div>
//         </header>

//         <main className="admin-content">{children}</main>
//       </div>
//     </div>
//   );
// };

// export default AdminLayout;
















/**
 * @fileoverview Admin Layout Shell — Isolated Tailwind Namespace
 *
 * Pure renderer of `packages/shared/config/admin-nav.config.js`.
 * Owns no navigation data and no copy: sections, paths, icons, gates,
 * and labels resolve from config plus the shared i18n bundles through
 * the centralized label resolver (lib/admin/labels.js).
 *
 * Why the `adm-*` class namespace:
 *   Legacy admin stylesheets define broad selectors (.admin-sidebar,
 *   .admin-main, .admin-header…) with fixed widths and display rules
 *   that conflict with a responsive Tailwind shell. Every structural
 *   class here uses the unique `adm-` prefix, which no legacy selector
 *   matches — the shell is immune to the old cascade while unmigrated
 *   pages keep their legacy styling inside it.
 *
 * Responsive contract:
 *   - lg+ : fixed 16rem sidebar; content column offset by the same width
 *   - < lg: sidebar becomes a slide-in drawer over a blurred overlay;
 *           closes on route change, overlay click, or Escape; body
 *           scroll locks while open; focus returns to the menu button
 *   - Header: sticky glass bar with page title/subtitle, language cycle,
 *           and the authenticated admin identity chip
 *
 * All visuals resolve through the token bridge
 * (tailwind.config.js → themes.css): dark/light themes and rebrands
 * propagate automatically.
 *
 * Path: apps/web/components/admin/AdminLayout.jsx
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import clsx from 'clsx';
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
import { getItem, removeItem } from '../../lib/storage';
import { resolveLabel, interpolate } from '../../lib/admin/labels';
import adminNavConfig from '../../../../packages/shared/config/admin-nav.config';

/* ── Icon registry: config string names → lucide components ────────── */
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

/* ── Structural recipes (adm-* namespace, token-bridge values) ─────── */

const SHELL = 'adm-shell min-h-screen flex bg-bg-main text-text-main font-sans';

const OVERLAY =
  'adm-overlay fixed inset-0 z-sticky bg-bg-overlay backdrop-blur-sm lg:hidden ' +
  'transition-opacity duration-slow motion-reduce:transition-none';

const SIDEBAR =
  'adm-sidebar fixed inset-y-0 left-0 z-overlay w-72 max-w-[85vw] lg:w-64 lg:max-w-none ' +
  'box-border flex flex-col bg-bg-secondary border-r border-solid border-border-light ' +
  'p-5 overflow-y-auto overscroll-contain transition-transform duration-slow ease-out ' +
  'motion-reduce:transition-none';

const NAV_LINK =
  'adm-nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ' +
  'no-underline border border-solid transition-colors duration-fast ' +
  'motion-reduce:transition-none';

const SECTION_HEADER =
  'adm-section-header flex items-center justify-between w-full px-3 py-2 rounded-md ' +
  'bg-transparent border-0 cursor-pointer font-sans text-2xs font-bold uppercase ' +
  'tracking-widest text-text-dim transition-colors duration-fast hover:text-text-muted';

const HEADER_ICON_BUTTON =
  'adm-icon-btn inline-flex items-center justify-center w-9 h-9 shrink-0 rounded-lg ' +
  'bg-transparent border border-solid border-border-light cursor-pointer text-text-muted ' +
  'transition-colors duration-fast hover:text-text-main hover:bg-bg-ghost-hover';

/**
 * Read the persisted admin profile defensively. Corrupted storage
 * values degrade to null instead of throwing during render.
 *
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
 * AdminLayout — Sidebar + header shell for every admin page.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Page content
 * @param {string} [props.title] - Header page title
 * @param {string} [props.subtitle] - Header page subtitle
 */
const AdminLayout = ({ children, title = '', subtitle = '' }) => {
  const router = useRouter();
  const { t, language, toggleLanguage, supportedLanguages } = useLanguage();

  const [adminUser, setAdminUser] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuButtonRef = useRef(null);
  const sidebarRef = useRef(null);

  /* Authentication gate */
  useEffect(() => {
    const token = getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    setAdminUser(readAdminProfile());
  }, [router]);

  /* Close the drawer whenever the route changes */
  useEffect(() => {
    setDrawerOpen(false);
  }, [router.pathname]);

  /* Drawer ergonomics: Escape closes, scroll locks, focus returns */
  useEffect(() => {
    if (!drawerOpen) return undefined;

    const handleKey = (event) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };

    document.addEventListener('keydown', handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    /* Move focus into the drawer for keyboard users */
    const firstFocusable = sidebarRef.current?.querySelector(
      'a[href], button:not([disabled])'
    );
    firstFocusable?.focus();

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
      menuButtonRef.current?.focus();
    };
  }, [drawerOpen]);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const handleLogout = useCallback(() => {
    removeItem('admin_token');
    removeItem('admin_user');
    setDrawerOpen(false);
    router.push('/admin/login');
  }, [router]);

  const toggleSection = useCallback((sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  }, []);

  const isActive = useCallback(
    (path, exact = false) => {
      if (exact) return router.pathname === path;
      return router.pathname.startsWith(path);
    },
    [router.pathname]
  );

  /** Config labelKey → active locale → English base → string guard. */
  const label = useCallback((key) => resolveLabel(t, key), [t]);

  /** Unknown icon names degrade to the configured default. */
  const resolveIcon = (name) =>
    ICON_REGISTRY[name] ||
    ICON_REGISTRY[adminNavConfig.defaultIcon] ||
    LayoutDashboard;

  const currentLanguageName =
    supportedLanguages.find((entry) => entry.code === language)?.nativeLabel ||
    language;

  const languageToggleLabel = interpolate(
    label(adminNavConfig.a11y.languageToggleKey),
    { language: currentLanguageName }
  );

  const brandName =
    typeof adminNavConfig.brand?.name === 'string'
      ? adminNavConfig.brand.name
      : '';

  return (
    <div className={SHELL}>
      {/* Mobile drawer overlay */}
      <div
        aria-hidden="true"
        onClick={closeDrawer}
        className={clsx(
          OVERLAY,
          drawerOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        )}
      />

      {/* Sidebar / drawer */}
      <aside
        ref={sidebarRef}
        aria-label={label(adminNavConfig.chrome.panelSuffixKey)}
        className={clsx(
          SIDEBAR,
          drawerOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full shadow-none',
          'lg:translate-x-0 lg:shadow-none'
        )}
      >
        {/* Brand + mobile close */}
        <div className="flex items-center justify-between gap-2 mb-7">
          <Link
            href="/admin"
            onClick={closeDrawer}
            className="flex items-center gap-3 no-underline group min-w-0"
          >
            <span className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-accent-light via-accent to-accent-dark flex items-center justify-center shadow-glow-gold-sm transition-transform duration-fast group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
              <Code2 className="w-6 h-6 text-on-accent" aria-hidden="true" />
            </span>
            <span className="flex flex-col leading-none min-w-0">
              <span className="text-lg font-extrabold tracking-tight truncate">
                <span className="text-gradient-gold">{brandName}</span>
              </span>
              <span className="mt-1 text-2xs font-medium uppercase tracking-widest text-text-dim truncate">
                {label(adminNavConfig.chrome.panelSuffixKey)}
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={closeDrawer}
            aria-label={label(adminNavConfig.a11y.closeSidebarKey)}
            className={clsx(HEADER_ICON_BUTTON, 'lg:hidden')}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Navigation sections */}
        <nav className="flex-1 flex flex-col gap-0.5" aria-label="Admin">
          {adminNavConfig.sections.map((section) => {
            const isExpanded = expandedSections[section.id] !== false;

            return (
              <div key={section.id} className="mb-1">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  aria-expanded={isExpanded}
                  className={SECTION_HEADER}
                >
                  <span>{label(section.labelKey)}</span>
                  {isExpanded ? (
                    <ChevronDown size={14} aria-hidden="true" />
                  ) : (
                    <ChevronRight size={14} aria-hidden="true" />
                  )}
                </button>

                {isExpanded && (
                  <div className="flex flex-col gap-0.5 pl-1 mt-0.5">
                    {section.items.map((item) => {
                      if (
                        item.superadminOnly &&
                        adminUser?.role !== 'superadmin'
                      ) {
                        return null;
                      }

                      const IconComponent = resolveIcon(item.icon);
                      const active = isActive(item.path, item.exact);

                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          onClick={closeDrawer}
                          aria-current={active ? 'page' : undefined}
                          className={clsx(
                            NAV_LINK,
                            active
                              ? 'bg-accent/10 text-accent border-accent/20 font-semibold'
                              : 'text-text-muted border-transparent hover:text-text-main hover:bg-bg-ghost-hover'
                          )}
                        >
                          <IconComponent
                            size={18}
                            className="shrink-0"
                            aria-hidden="true"
                          />
                          <span className="truncate">{label(item.labelKey)}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="pt-4 mt-2 border-t border-solid border-border-light flex flex-col gap-0.5">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeDrawer}
            className={clsx(
              NAV_LINK,
              'text-text-muted border-transparent hover:text-text-main hover:bg-bg-ghost-hover'
            )}
          >
            <LayoutDashboard size={18} className="shrink-0" aria-hidden="true" />
            <span>{label(adminNavConfig.chrome.viewSiteKey)}</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className={clsx(
              NAV_LINK,
              'w-full bg-transparent cursor-pointer font-sans text-error',
              'border-transparent hover:bg-error/10'
            )}
          >
            <LogOut size={18} className="shrink-0" aria-hidden="true" />
            <span>{label(adminNavConfig.chrome.logoutKey)}</span>
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="adm-main flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Sticky glass header */}
        <header className="adm-header sticky top-0 z-above flex items-center justify-between gap-3 px-4 py-3 md:px-6 bg-bg-card backdrop-blur-glass border-b border-solid border-border-light">
          <div className="flex items-center gap-3 min-w-0">
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setDrawerOpen((prev) => !prev)}
              aria-expanded={drawerOpen}
              aria-label={label(
                drawerOpen
                  ? adminNavConfig.a11y.closeSidebarKey
                  : adminNavConfig.a11y.openSidebarKey
              )}
              className={clsx(HEADER_ICON_BUTTON, 'lg:hidden')}
            >
              {drawerOpen ? (
                <X size={18} aria-hidden="true" />
              ) : (
                <Menu size={18} aria-hidden="true" />
              )}
            </button>
            <div className="min-w-0">
              <h1 className="m-0 text-lg md:text-xl font-extrabold text-text-main truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="m-0 mt-0.5 text-xs text-text-dim truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={toggleLanguage}
              title={languageToggleLabel}
              aria-label={languageToggleLabel}
              className="px-3 py-1.5 rounded-lg bg-surface-secondary border border-solid border-border-light cursor-pointer font-sans text-xs font-bold text-text-muted transition-colors duration-fast hover:text-text-main hover:bg-bg-icon-btn-hover"
            >
              {language.toUpperCase()}
            </button>

            <div className="flex items-center gap-2 pl-2.5 border-l border-solid border-border-light">
              <span className="w-8 h-8 rounded-lg bg-accent/10 border border-solid border-accent/20 flex items-center justify-center text-accent text-xs font-bold shrink-0">
                {(adminUser?.username || '').charAt(0).toUpperCase()}
              </span>
              <span className="hidden sm:inline text-sm font-semibold text-text-muted max-w-[10rem] truncate">
                {adminUser?.username || ''}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="adm-content flex-1 p-4 md:p-6 min-w-0">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;