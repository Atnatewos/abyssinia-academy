/**
 * @fileoverview Admin Navigation Configuration
 *
 * Single source of truth for the admin sidebar STRUCTURE: sections,
 * items, paths, icons, ordering, and access gates. The AdminLayout
 * component is a pure renderer of this data — adding a new admin
 * surface is a one-entry edit here, with zero component changes.
 *
 * Translation contract:
 *   This file contains NO copy. Every label is a `labelKey` dot-path
 *   into the shared i18n bundles. AdminLayout resolves each key against
 *   the active locale, then the English base bundle, so a key missing
 *   from one locale still renders its English canonical value.
 *
 *   Nav-specific copy lives in `admin.nav.*` (all four locales).
 *   Canonical cross-namespace keys are referenced directly:
 *     admin.agentsTitle, admin.courses.pageTitle,
 *     admin.announcements.navLabel, referrals.dashboardTitle,
 *     referrals.mlm.adminWithdrawalsTitle, referrals.mlm.adminMlmStatsTitle,
 *     discounts.adminTitle, scholarships.admin.sectionLabel
 *
 * Icon contract:
 *   `icon` is a string name resolved through the lucide registry inside
 *   AdminLayout. Unknown names degrade to `defaultIcon` — a config typo
 *   can never crash the sidebar.
 *
 * Access contract:
 *   `superadminOnly: true` hides the item unless adminUser.role ===
 *   'superadmin'. `exact: true` restricts active-state matching to the
 *   exact path (used for the dashboard root).
 *
 * Path: packages/shared/config/admin-nav.config.js
 */

'use strict';

const adminNavConfig = {
  /* ── Brand wordmark (product identity, not translatable copy) ──────── */
  brand: {
    name: 'ABYSSiNIA',
  },

  /* ── Icon fallback for unknown registry names ──────────────────────── */
  defaultIcon: 'LayoutDashboard',

  /* ── Panel chrome label keys ───────────────────────────────────────── */
  chrome: {
    panelSuffixKey: 'admin.nav.panelSuffix',
    viewSiteKey: 'admin.nav.viewSite',
    logoutKey: 'admin.nav.logout',
  },

  /* ── Accessibility label keys ──────────────────────────────────────── */
  a11y: {
    openSidebarKey: 'admin.nav.a11y.openSidebar',
    closeSidebarKey: 'admin.nav.a11y.closeSidebar',
    languageToggleKey: 'admin.nav.a11y.languageToggle',
  },

  /* ── Navigation sections (rendered top to bottom) ──────────────────── */
  sections: [
    {
      id: 'main',
      labelKey: 'admin.nav.sections.main',
      items: [
        {
          path: '/admin',
          exact: true,
          icon: 'LayoutDashboard',
          labelKey: 'admin.nav.dashboard',
        },
      ],
    },
    {
      id: 'management',
      labelKey: 'admin.nav.sections.management',
      items: [
        {
          path: '/admin/payments',
          icon: 'CreditCard',
          labelKey: 'admin.nav.payments',
        },
        {
          path: '/admin/users',
          icon: 'Users',
          labelKey: 'admin.nav.students',
        },
        {
          path: '/admin/agents',
          icon: 'Briefcase',
          labelKey: 'admin.agentsTitle',
        },
        {
          path: '/admin/resellers',
          icon: 'Store',
          labelKey: 'admin.nav.resellers',
        },
        {
          path: '/admin/courses',
          icon: 'BookOpen',
          labelKey: 'admin.courses.pageTitle',
        },
        {
          path: '/admin/referrals/mlm/withdrawals',
          icon: 'Banknote',
          labelKey: 'referrals.mlm.adminWithdrawalsTitle',
        },
      ],
    },
    {
      id: 'programs',
      labelKey: 'admin.nav.sections.programs',
      items: [
        {
          path: '/admin/scholarships',
          icon: 'GraduationCap',
          labelKey: 'scholarships.admin.sectionLabel',
        },
      ],
    },
    {
      id: 'marketing',
      labelKey: 'admin.nav.sections.marketing',
      items: [
        {
          path: '/admin/discounts',
          icon: 'Tag',
          labelKey: 'discounts.adminTitle',
        },
        {
          path: '/admin/referrals',
          icon: 'Share2',
          labelKey: 'referrals.dashboardTitle',
        },
        {
          path: '/admin/referrals/mlm/stats',
          icon: 'BarChart3',
          labelKey: 'referrals.mlm.adminMlmStatsTitle',
        },
        {
          path: '/admin/referrals/mlm/tree',
          icon: 'Network',
          labelKey: 'admin.nav.mlmTree',
        },
        {
          path: '/admin/announcements',
          icon: 'Megaphone',
          labelKey: 'admin.announcements.navLabel',
        },
        {
          path: '/admin/discussions',
          icon: 'Video',
          labelKey: 'admin.nav.discussions',
        },
        {
          path: '/admin/course-videos',
          icon: 'Video',
          labelKey: 'admin.nav.courseVideos',
        },
      ],
    },
    {
      id: 'insights',
      labelKey: 'admin.nav.sections.insights',
      items: [
        {
          path: '/admin/analytics',
          icon: 'TrendingUp',
          labelKey: 'admin.nav.analytics',
        },
        {
          path: '/admin/audit',
          icon: 'FileText',
          labelKey: 'admin.nav.audit',
        },
      ],
    },
    {
      id: 'system',
      labelKey: 'admin.nav.sections.system',
      items: [
        {
          path: '/admin/settings',
          icon: 'Settings',
          labelKey: 'admin.nav.settings',
        },
        {
          path: '/admin/admins',
          icon: 'UserCog',
          superadminOnly: true,
          labelKey: 'admin.nav.admins',
        },
      ],
    },
  ],
};

module.exports = adminNavConfig;