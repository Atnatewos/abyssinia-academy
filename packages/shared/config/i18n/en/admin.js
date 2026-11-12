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

      /* ── Course management (admin panel) ── */
      courses: {
        pageTitle: 'Courses Management',
        pageSubtitle: 'Manage course catalog and content',
        newCourseBtn: 'New Course',
        searchPlaceholder: 'Search courses...',
        allLevels: 'All Levels',

        createTitle: 'Create New Course',
        createSubtitle: 'Add a course to the academy catalog',
        editTitle: 'Edit Course',
        editSubtitle: 'Update this course',
        detailTitle: 'Course Details',
        detailSubtitle: 'View and manage this course',

        /* Sections */
        sections: {
          identity: 'Course Identity',
          pricing: 'Pricing & Delivery',
          visibility: 'Visibility',
          phases: 'Phases',
          weeks: 'Weeks',
          lessons: 'Lessons',
        },

        /* Field labels */
        fields: {
          titleEn: 'Title (English)',
          titleAm: 'Title (Amharic)',
          slug: 'Slug',
          slugHint: 'Auto-generated from title. Edit only if you need a custom URL.',
          descriptionEn: 'Description (English)',
          descriptionAm: 'Description (Amharic)',
          priceEtb: 'Price (ETB)',
          priceHint: 'Optional. Overrides the platform default for this course.',
          priceHintPhase: 'Optional. Overrides the platform default for this phase.',
          duration: 'Duration',
          level: 'Level',
          badge: 'Badge',
          icon: 'Icon',
          orderIndex: 'Order Index',
          orderIndexHint: 'Lower number appears first.',
          phaseNumber: 'Phase Number',
          phaseNumberHint: 'Sequential order within the course.',
          subtitleEn: 'Subtitle (English)',
          subtitleAm: 'Subtitle (Amharic)',
          outcomesLabel: 'Learning Outcomes',
          outcomesHint: 'One outcome per line',
          publishCheckbox: 'Publish this course (visible on the public site)',
          publishHint: 'Leave unchecked to save as a draft. You can publish later from the course detail page.',
          publishPhaseCheckbox: 'Publish this phase (visible to students)',
          weekTitle: 'Week title',
          weekTitlePlaceholder: 'e.g. HTML5 Semantics & Web Mechanics',
          lessonTitleEn: 'Title (English)',
          lessonTitleAm: 'Title (Amharic)',
          lessonDuration: 'Duration',
          lessonYoutube: 'YouTube ID or URL',
          lessonYoutubeHint: 'Any YouTube URL format will be normalized to an 11-character ID.',
          lessonNotes: 'Notes',
          lessonSessions: 'Sessions (timestamps)',
          lessonResources: 'Resources',
          sessionName: 'Session name',
          sessionTime: 'MM:SS',
          resourceName: 'File name',
          resourceType: 'Type',
          resourceUrl: 'URL (optional)',
          freePreview: 'Free preview',
          published: 'Published',
          draft: 'Draft',
        },

        /* Levels dropdown */
        levels: {
          beginner: 'Beginner',
          intermediate: 'Intermediate',
          advanced: 'Advanced',
          beginnerToAdvanced: 'Beginner to Advanced',
          intermediateToAdvanced: 'Intermediate to Advanced',
        },

        /* Actions */
        actions: {
          create: 'Create Course',
          createPhase: 'Create Phase',
          createLesson: 'Create Lesson',
          createWeek: 'Create Week',
          save: 'Save Changes',
          cancel: 'Cancel',
          creating: 'Creating...',
          saving: 'Saving...',
          edit: 'Edit',
          delete: 'Delete',
          publish: 'Publish',
          unpublish: 'Unpublish',
          addPhase: 'Add Phase',
          addWeek: 'Add Week',
          addLesson: 'Add Lesson',
          addSession: 'Add Session',
          addResource: 'Add Resource',
          backToCourses: 'Back to Courses',
          backToCourse: 'Back to Course',
          viewWeeks: 'View weeks',
          close: 'Close',
        },

        /* Price display */
        priceDisplay: {
          custom: '{amount} ETB',
          global: '— Uses global pricing',
          globalShort: 'Global price',
          perPhaseGlobal: 'Global per-phase price',
          perPhaseCustom: '{amount} ETB',
        },

        /* Validation */
        validation: {
          titleRequired: 'Title is required.',
          slugRequired: 'Slug is required.',
          slugFormat: 'Only lowercase letters, numbers, and hyphens.',
          descriptionRequired: 'Description is required.',
          subtitleRequired: 'Subtitle is required.',
          durationRequired: 'Duration is required.',
          youtubeRequired: 'YouTube ID or URL is required.',
          priceNonNegative: 'Price must be zero or positive.',
          fixHighlighted: 'Please fix the highlighted fields.',
          noChanges: 'No changes to save.',
          sessionNameRequired: 'Session name is required.',
          sessionTimeRequired: 'Time is required.',
          resourceNameRequired: 'Resource name is required.',
        },

        /* Toasts */
        toasts: {
          created: 'Course created successfully.',
          updated: 'Course updated successfully.',
          deleted: 'Course deleted.',
          phaseCreated: 'Phase created.',
          phaseUpdated: 'Phase updated.',
          phaseDeleted: 'Phase deleted.',
          weekCreated: 'Week created.',
          weekDeleted: 'Week deleted.',
          lessonCreated: 'Lesson created.',
          lessonUpdated: 'Lesson updated.',
          lessonDeleted: 'Lesson deleted.',
          coursePublished: 'Course published.',
          courseUnpublished: 'Course unpublished.',
          phasePublished: 'Phase published.',
          phaseUnpublished: 'Phase unpublished.',
          weekPublished: 'Week published.',
          weekUnpublished: 'Week unpublished.',
          lessonPublished: 'Lesson published.',
          lessonUnpublished: 'Lesson unpublished.',
          createFailed: 'Failed to create course.',
          updateFailed: 'Failed to update course.',
          deleteFailed: 'Failed to delete course.',
          loadFailed: 'Failed to load course.',
          toggleFailed: 'Failed to toggle.',
        },

        /* Empty states */
        empty: {
          noCourses: 'No courses created yet.',
          noSearchResults: 'No courses match your filters.',
          noPhases: 'No phases yet. Click "Add Phase" to create the first one.',
          noWeeks: 'No weeks yet. Click "Add Week" to create the first one.',
          noLessons: 'No lessons yet.',
          courseNotFound: 'Course Not Found',
          courseNotFoundDesc: 'This course was deleted or never existed.',
          phaseNotFound: 'Phase Not Found',
          phaseNotFoundDesc: 'This phase was deleted or never existed.',
        },

        /* Meta row */
        meta: {
          slug: 'Slug',
          level: 'Level',
          duration: 'Duration',
          price: 'Price',
          status: 'Status',
          weekCount: '{count} week',
          weekCountPlural: '{count} weeks',
          outcomeCount: '{count} outcome',
          outcomeCountPlural: '{count} outcomes',
          lessonCount: '{count} lesson',
          lessonCountPlural: '{count} lessons',
          phaseLabel: 'Phase {number}: {title}',
          weekLabel: 'Week {number}: {title}',
        },
      },
    },
  },
};