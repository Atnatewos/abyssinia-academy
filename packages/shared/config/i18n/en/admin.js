/**
 * @fileoverview English — Admin Namespace
 *
 * Contains admin-specific UI copy including:
 *   - Coming Soon stub labels (one per unfinished CRUD route)
 *   - Announcements composer labels
 *   - Agent management labels
 *   - God Mode UI (user detail page: wallet, agent, ban/unban, impersonation)
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
      supportEmail: process.env.SUPPORT_EMAIL || 'support@abyssinia-academy.com',
      footerNote: 'Engineering team is on it — this page will be live in a future update.',
      defaultTitle: 'Feature Coming Soon',
      defaultBack: 'Back',

      editCourse: 'Edit Course',
      addVideo: 'Add Video',
      editVideo: 'Edit Video',
      addDiscussion: 'Add Discussion',
      editDiscussion: 'Edit Discussion',
      addDiscount: 'New Discount Code',
      viewDiscount: 'Discount Details',
      editDiscount: 'Edit Discount Code',
      viewAdmin: 'Administrator Details',

      backToCourses: 'Back to Courses',
      backToVideos: 'Back to Videos',
      backToDiscussions: 'Back to Discussions',
      backToDiscounts: 'Back to Discounts',
      backToAdmins: 'Back to Administrators',
    },

    announcements: {
      navLabel: 'Announcements',
      pageTitle: 'Announcements',
      pageSubtitle: 'Broadcast messages to all users, enrolled users, or specific users',
      backToDashboard: 'Back to Dashboard',

      tabCompose: 'Compose',
      tabHistory: 'History',

      audienceLabel: 'Send to',
      audienceAll: 'All users',
      audienceEnrolled: 'Enrolled only',
      audienceTargeted: 'Specific users',
      audienceSingle: 'Single user',

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

      sendBtn: 'Send Announcement',
      sending: 'Sending…',
      cancel: 'Cancel',

      previewLabel: 'Live preview',
      previewTitlePlaceholder: 'Your title will appear here',
      previewBodyPlaceholder: 'Your message will appear here',
      previewTimeJustNow: 'Just now',
      previewAudienceLabel: 'Audience',
      previewSeverityLabel: 'Severity',
      previewWarning: 'All recipients will receive this announcement as a notification in their inbox.',

      confirmTitle: 'Confirm broadcast',
      confirmBody:
        'You are about to send this announcement. This action cannot be undone and cannot be recalled once delivered.',
      confirmInputLabel: 'Type SEND to confirm',
      confirmBtn: 'Send broadcast',

      historyTitle: 'Broadcast history',
      refreshHistory: 'Refresh',
      historyEmpty: 'No announcements have been sent yet.',
      historyLoadFailed: 'Failed to load broadcast history.',
      historyColWhen: 'When',
      historyColTitle: 'Title',
      historyColAudience: 'Audience',
      historyColRecipients: 'Recipients',
      historyColSentBy: 'Sent by',

      timeJustNow: 'Just now',
      timeMinutesAgo: '{count}m ago',
      timeHoursAgo: '{count}h ago',
      timeDaysAgo: '{count}d ago',

      successToast: 'Announcement sent to {count} recipient(s)',
      validationFailed: 'Please fill in all required fields',
      sendFailed: 'Failed to send announcement. Please try again.',
    },

    /* ── Agent Management ── */
    agentsTitle: 'Agent Management',
    agentsSubtitle: 'Configure agent commission rates and view performance.',
    agentName: 'Agent Name',
    agentCode: 'Agent Code',
    agentSales: 'Total Sales',
    agentEarned: 'Total Earned',
    commissionType: 'Commission Type',
    commissionValue: 'Commission Value',
    agentStatus: 'Status',

    /* ═══════════════════════════════════════════════════════════════════════
       GOD MODE — User Detail Page
       Every string rendered by apps/web/pages/admin/users/[id]/index.jsx
       ═══════════════════════════════════════════════════════════════════════ */
    godMode: {
      /* Page chrome */
      backToUsers: 'Back to Users',
      userDetailsTitle: 'User Details',
      loadingUser: 'Loading user information...',
      userNotFoundTitle: 'User Not Found',
      userNotFoundSubtitle: 'The requested user does not exist.',
      unknownUser: 'Unknown',

      /* Header meta */
      joined: 'Joined',
      notAvailable: 'N/A',
      emDash: '—',

      /* Status badges */
      statusBanned: 'banned',
      statusEnrolled: 'enrolled',
      statusRegistered: 'registered',

      /* Header actions */
      unenroll: 'Unenroll',
      markEnrolled: 'Mark Enrolled',

      /* Stats row */
      stats: {
        directReferrals: 'Direct Referrals',
        teamSize: 'Team Size',
        payingDirect: 'Paying Direct',
        lifetimeEarned: 'Lifetime Earned',
      },

      /* Tabs */
      tabs: {
        overview: 'Overview',
        walletAndAgent: 'Wallet & Agent',
        godMode: 'God Mode',
      },

      /* Overview tab */
      overview: {
        enrollmentHistory: 'Enrollment History',
        noEnrollments: 'No enrollments yet.',
        referralHistory: 'Referral History',
        noReferrals: 'No referrals yet.',
        fullCoursePass: 'Full Course Pass',
        phaseBundle: 'Phase Bundle',
      },

      /* Wallet tab */
      wallet: {
        heading: 'Wallet',
        currentBalance: 'Current Balance',
        totalEarned: 'Total Earned',
        totalWithdrawn: 'Total Withdrawn',
        pendingWithdrawal: 'Pending Withdrawal',
        manualAdjustment: 'Manual Wallet Adjustment',
        adjustmentHint:
          'Positive numbers credit the wallet. Negative numbers claw back. Adjustments ≥ 10,000 ETB require typing ADJUST to confirm.',
        amountPlaceholder: 'Amount in ETB (e.g., 500 or -500)',
        reasonPlaceholder: 'Reason (min 5 chars — logged in audit)',
        applyAdjustment: 'Apply Adjustment',
        applying: 'Applying...',
        currency: 'ETB',
      },

      /* Agent tab */
      agent: {
        heading: 'Agent Status',
        agentCode: 'Agent Code',
        commissionType: 'Commission Type',
        commissionValue: 'Commission Value',
        agentActive: 'Agent Active',
        yes: 'Yes',
        no: 'No',
        fixedType: 'fixed',
        percentageType: 'percentage',
        overrideHeading: 'Override Commission Rate',
        fixedOption: 'Fixed (ETB per sale)',
        percentageOption: 'Percentage (%)',
        overridePlaceholderFixed: 'e.g., 500',
        overridePlaceholderPercentage: 'e.g., 15',
        overrideRate: 'Override Rate',
        applying: 'Applying...',
      },

      /* God Mode tab — impersonation */
      impersonation: {
        heading: 'Impersonation & Access',
        hint:
          'Generates a 5-minute magic link. Opens in a new tab — your admin session stays logged in.',
        generateLink: 'Generate Impersonation Link',
        generateReset: 'Generate Password Reset Link',
      },

      /* God Mode tab — manual enrollment */
      manualEnroll: {
        heading: 'Manual Enrollment',
        hint:
          'Grants full course access without a payment record. Use for cash enrollments or scholarships.',
        reasonPlaceholder: 'Reason (min 5 chars — logged in audit)',
        button: 'Grant Full Course Access',
        enrolling: 'Enrolling...',
      },

      /* God Mode tab — network & account */
      network: {
        heading: 'Network & Account',
        orphanButton: 'Orphan from MLM Tree',
      },

      /* Danger zone — ban form */
      ban: {
        heading: 'Danger Zone — Ban',
        hint:
          'Bans the user and revokes their agent + referral codes. This action is logged and reversible from the Unban action below.',
        reasonPlaceholder: 'Ban reason (min 5 chars)',
        button: 'Ban User',
      },

      /* Danger zone — unban form */
      unban: {
        heading: 'User is currently banned',
        bannedOnTemplate: 'Banned on {date} — reason: {reason}',
        noReason: '—',
        hint:
          'Unbanning restores access and re-enables their agent and referral codes. This is logged in the audit trail.',
        notePlaceholder: 'Optional note for the audit log',
        button: 'Unban User',
        unbanning: 'Unbanning...',
      },

      /* Toasts */
      toasts: {
        statusUpdated: 'User status updated',
        statusFailed: 'Failed to update status',
        impersonationSuccess: 'Magic link generated — opening in new tab',
        impersonationFailed: 'Failed to generate impersonation link',
        resetSuccess: 'Reset link generated — opening in new tab',
        resetFailed: 'Failed to generate reset link',
        walletSuccessTemplate: 'Wallet adjusted. New balance: {balance} ETB',
        walletFailed: 'Failed to adjust wallet',
        agentOverrideSuccess: 'Agent rate overridden successfully',
        agentOverrideFailed: 'Failed to override agent rate',
        orphanSuccess: 'User orphaned from MLM tree',
        orphanFailed: 'Failed to orphan user',
        banSuccess: 'User banned successfully',
        banFailed: 'Failed to ban user',
        unbanSuccess: 'User unbanned successfully',
        unbanFailed: 'Failed to unban user',
        enrollSuccess: 'User manually enrolled',
        enrollFailed: 'Failed to enroll user',
        loadError: 'Failed to load user details',
      },
    },
  },
};