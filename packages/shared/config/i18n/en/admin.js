/**
 * @fileoverview English — Admin Namespace
 *
 * Contains admin-specific UI copy including:
 *   - Coming Soon stub labels (one per unfinished CRUD route)
 *   - Shared stub copy (eyebrow, heading, description, CTAs)
 *
 * All copy is config-driven — no hardcoded strings in JSX components.
 *
 * Path: packages/shared/config/i18n/en/admin.js
 */

module.exports = {
  admin: {
    comingSoon: {
      eyebrow: 'Work in Progress',
      heading: 'This feature is being built',
      description:
        'Our team is crafting a polished experience for this page. It will be available soon with full create, edit, and delete flows.',
      subtitle: 'This feature is coming soon',
      contactSupport: 'Need this now? Contact support',
      supportEmail: 'support@abyssinia-academy.com',
      footerNote: 'Engineering team is on it — this page will be live in a future update.',
      defaultTitle: 'Feature Coming Soon',
      defaultBack: 'Back',

      /* Per-route titles */
      editCourse: 'Edit Course',
      addVideo: 'Add Video',
      editVideo: 'Edit Video',
      addDiscussion: 'Add Discussion',
      editDiscussion: 'Edit Discussion',
      addDiscount: 'New Discount Code',
      viewDiscount: 'Discount Details',
      editDiscount: 'Edit Discount Code',
      viewAdmin: 'Administrator Details',

      /* Per-route back button labels */
      backToCourses: 'Back to Courses',
      backToVideos: 'Back to Videos',
      backToDiscussions: 'Back to Discussions',
      backToDiscounts: 'Back to Discounts',
      backToAdmins: 'Back to Administrators',
    },
  },
};