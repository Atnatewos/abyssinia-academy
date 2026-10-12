/**
 * @fileoverview English — Admin Namespace
 *
 * Contains admin-specific UI copy including:
 *   - Coming Soon stub labels (one per unfinished CRUD route)
 *   - Announcements composer labels (audience, severity, preview, modals)
 *   - Targeted user picker labels (search, chips, empty states)
 *   - History tab labels (columns, pagination, empty state)
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

    announcements: {
      /* Nav + page chrome */
      navLabel: 'Announcements',
      pageTitle: 'Announcements',
      pageSubtitle: 'Broadcast messages to all users, enrolled users, or specific users',
      backToDashboard: 'Back to Dashboard',

      /* Tabs */
      tabCompose: 'Compose',
      tabHistory: 'History',

      /* Composer labels */
      audienceLabel: 'Send to',
      audienceAll: 'All users',
      audienceEnrolled: 'Enrolled only',
      audienceTargeted: 'Specific users',
      audienceSingle: 'Single user',

      /* Targeted user picker */
      targetedLabel: 'Pick users',
      targetedCountSuffix: 'selected',
      targetedPlaceholder: 'Search by name, phone, or email…',
      targetedHint: 'Type at least 2 characters. Click any result to add it. You can pick as many users as you need.',
      removeUser: 'Remove user',
      noResults: 'No users match your search',
      noEmail: 'No email',

      singlePlaceholder: 'Enter phone or email',
      singleHint: 'Matches either phone number or email address',

      titleLabel: 'Title',
      titlePlaceholder: 'e.g., New course launch announcement',
      bodyLabel: 'Message',
      bodyPlaceholder: 'Write your announcement message…',

      severityLabel: 'Severity',
      severityInfo: 'Info',
      severitySuccess: 'Success',
      severityWarning: 'Warning',
      severityCritical: 'Critical',

      /* Actions */
      sendBtn: 'Send Announcement',
      sending: 'Sending…',
      cancel: 'Cancel',

      /* Preview panel */
      previewLabel: 'Live preview',
      previewTitlePlaceholder: 'Your title will appear here',
      previewBodyPlaceholder: 'Your message will appear here',
      previewTimeJustNow: 'Just now',
      previewAudienceLabel: 'Audience',
      previewSeverityLabel: 'Severity',
      previewWarning: 'All recipients will receive this announcement as a notification in their inbox.',

      /* Confirm modal */
      confirmTitle: 'Confirm broadcast',
      confirmBody:
        'You are about to send this announcement. This action cannot be undone and cannot be recalled once delivered.',
      confirmInputLabel: 'Type SEND to confirm',
      confirmBtn: 'Send broadcast',

      /* History tab */
      historyTitle: 'Broadcast history',
      refreshHistory: 'Refresh',
      historyEmpty: 'No announcements have been sent yet.',
      historyLoadFailed: 'Failed to load broadcast history.',
      historyColWhen: 'When',
      historyColTitle: 'Title',
      historyColAudience: 'Audience',
      historyColRecipients: 'Recipients',
      historyColSentBy: 'Sent by',

      /* Relative time formatting for history */
      timeJustNow: 'Just now',
      timeMinutesAgo: '{count}m ago',
      timeHoursAgo: '{count}h ago',
      timeDaysAgo: '{count}d ago',

      /* Toasts + errors */
      successToast: 'Announcement sent to {count} recipient(s)',
      validationFailed: 'Please fill in all required fields',
      sendFailed: 'Failed to send announcement. Please try again.',
    },
  },
};