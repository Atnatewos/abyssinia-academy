/**
 * @fileoverview Scholarship System — English Translations
 *
 * Every user-facing string for the scholarship program lives here.
 * Zero hardcoded copy in the component tree.
 *
 * Namespaces:
 *   scholarships.page.*        — public + student-facing pages
 *   scholarships.form.*        — application form
 *   scholarships.status.*      — status labels (pending, approved, etc.)
 *   scholarships.notifications.* — notification titles + bodies
 *   scholarships.admin.*       — admin panel
 *   scholarships.documents.*   — document type labels
 *   scholarships.banner.*      — auth page banner
 *
 * Path: packages/shared/config/i18n/en/scholarships.js
 */

module.exports = {
  scholarships: {
    /* ── Public pages ── */
    page: {
      title: 'Scholarships',
      subtitle: 'Financial assistance for aspiring developers',
      listingTitle: 'Available Scholarships',
      listingSubtitle: 'Apply for a scholarship to unlock your learning journey',
      detailTitle: 'Scholarship Details',
      noActiveCampaigns: 'No scholarships are currently open for applications.',
      applyButton: 'Apply for This Scholarship',
      applyClosedButton: 'Applications Closed',
      appliedButton: 'You Have Applied',
      viewApplicationButton: 'View My Application',
      quotaLabel: '{remaining} of {total} spots remaining',
      quotaFull: 'All spots filled',
      registrationFeeLabel: 'Registration Fee',
      registrationFeeFree: 'Free',
      grantsFullCourse: 'Full Course Access',
      grantsPhases: 'Access to Selected Phases',
      openUntil: 'Applications close on {date}',
      openIndefinitely: 'Open until quota is filled',
      deadlineLabel: 'Application Deadline',
    },

    /* ── Application form ── */
    form: {
      title: 'Apply for Scholarship',
      subtitle: 'Tell us why this scholarship matters to you',
      motivationLabel: 'Motivation Statement',
      motivationPlaceholder: 'Explain why you deserve this scholarship, what you hope to learn, and how it will impact your future...',
      motivationHint: '{count} / {max} characters (minimum {min})',
      motivationTooShort: 'Motivation must be at least {min} characters.',
      motivationTooLong: 'Motivation cannot exceed {max} characters.',
      documentsLabel: 'Supporting Documents',
      documentUploadHint: 'JPEG, PNG, WebP, or PDF. Max {size} MB each.',
      documentTypeRequired: 'Required',
      documentTypeOptional: 'Optional',
      uploadButton: 'Upload File',
      replaceButton: 'Replace File',
      removeButton: 'Remove',
      submitButton: 'Submit Application',
      submitting: 'Submitting...',
      cancelButton: 'Cancel',
      submitSuccess: 'Application submitted successfully. You will be notified when it has been reviewed.',
      submitFailed: 'Failed to submit application. Please try again.',
      alreadyApplied: 'You have already applied for this scholarship.',
      loginRequired: 'You must be logged in to apply.',
      bannedUser: 'Your account is not eligible to apply for scholarships.',
    },

    /* ── Application statuses ── */
    status: {
      pending: 'Pending Review',
      pendingPayment: 'Approved — Awaiting Payment',
      approved: 'Approved',
      rejected: 'Rejected',
      withdrawn: 'Withdrawn',
      revoked: 'Revoked',
      pendingDescription: 'Your application is being reviewed. You will be notified when a decision is made.',
      pendingPaymentDescription: 'Your application was approved! Pay the registration fee to activate your enrollment.',
      approvedDescription: 'Congratulations! Your enrollment is active.',
      rejectedDescription: 'Your application was not approved.',
      withdrawnDescription: 'You withdrew this application.',
      revokedDescription: 'This scholarship has been revoked.',
      payFeeButton: 'Pay Registration Fee ({amount} ETB)',
      withdrawButton: 'Withdraw Application',
      withdrawConfirmTitle: 'Withdraw Application?',
      withdrawConfirmBody: 'This action cannot be undone. You will not be able to reapply to this campaign.',
      withdrawSuccess: 'Application withdrawn.',
      withdrawFailed: 'Failed to withdraw application.',
    },

    /* ── Documents ── */
    documents: {
      studentId: 'Student ID',
      transcript: 'Academic Transcript',
      recommendationLetter: 'Recommendation Letter',
      incomeProof: 'Proof of Income',
      other: 'Other Document',
    },

    /* ── Auth page banner ── */
    banner: {
      title: '🎓 Scholarship Available',
      message: 'Apply for the {campaign} scholarship and get free access to {grant}.',
      grantFullCourse: 'the full course',
      grantPhases: '{count} phase(s)',
      applyNow: 'Apply Now',
      learnMore: 'Learn More',
      dismiss: 'Dismiss',
    },

    /* ── Profile page ── */
    profile: {
      pageTitle: 'My Scholarships',
      pageSubtitle: 'Track your scholarship applications',
      empty: 'You have not applied for any scholarships yet.',
      browseLink: 'Browse Scholarships',
      tableHeaderCampaign: 'Campaign',
      tableHeaderApplied: 'Applied On',
      tableHeaderStatus: 'Status',
      tableHeaderActions: 'Actions',
      viewDetails: 'View Details',
    },

    /* ── Notifications ── */
    notifications: {
      applied: {
        title: 'Application Submitted',
        body: 'Your scholarship application for {campaign} was submitted successfully. We will review it shortly.',
      },
      approved: {
        title: '🎉 Scholarship Approved!',
        body: 'Congratulations! Your application for {campaign} was approved. Your enrollment is now active.',
      },
      feeDue: {
        title: 'Scholarship Approved — Payment Required',
        body: 'Your application for {campaign} was approved. Pay the {amount} ETB registration fee to activate your enrollment.',
      },
      feePaid: {
        title: '✓ Enrollment Activated',
        body: 'Your registration fee was received. Welcome to {campaign}! Your course access is now active.',
      },
      rejected: {
        title: 'Application Not Approved',
        body: 'Unfortunately, your application for {campaign} was not approved. Reason: {reason}',
      },
      revoked: {
        title: 'Scholarship Revoked',
        body: 'Your scholarship for {campaign} has been revoked. Reason: {reason}',
      },
      withdrawn: {
        title: 'Application Withdrawn',
        body: 'You have withdrawn your application for {campaign}.',
      },
      appReceived: {
        title: 'New Scholarship Application',
        body: '{applicant} applied for {campaign}. Review it in the admin panel.',
      },
    },

    /* ── Admin panel ── */
    admin: {
      sectionLabel: 'Scholarships',
      campaignsNavLabel: 'Scholarship Campaigns',
      applicationsNavLabel: 'Applications',

      campaignsTitle: 'Scholarship Campaigns',
      campaignsSubtitle: 'Create and manage scholarship offerings',

      /* Campaign list */
      campaignsEmpty: 'No campaigns yet. Create your first one!',
      createCampaign: 'Create Campaign',
      searchPlaceholder: 'Search campaigns by name or slug...',
      filterAll: 'All',
      filterActive: 'Active',
      filterPaused: 'Paused',
      filterClosed: 'Closed',

      /* Campaign form */
      formCreateTitle: 'Create Scholarship Campaign',
      formEditTitle: 'Edit Scholarship Campaign',
      formName: 'Campaign Name',
      formNameAm: 'Campaign Name (Amharic)',
      formSlug: 'URL Slug',
      formSlugHint: 'Used in the public URL: /scholarships/<slug>',
      formDescription: 'Description',
      formDescriptionAm: 'Description (Amharic)',
      formGrantType: 'What does this scholarship grant?',
      formGrantFullCourse: 'Full Course Access',
      formGrantSpecificPhases: 'Specific Phases Only',
      formPhasesLabel: 'Select Phases',
      formFee: 'Registration Fee (ETB)',
      formFeeHint: 'Set to 0 for a completely free scholarship.',
      formQuota: 'Maximum Recipients',
      formOpenAt: 'Applications Open',
      formCloseAt: 'Applications Close',
      formCloseAtHint: 'Leave empty for open-ended campaigns.',
      formActive: 'Campaign is Active',
      formCoverImage: 'Cover Image',
      formDocumentsLabel: 'Required Documents',
      formSaveButton: 'Save Campaign',
      formSaving: 'Saving...',
      formCancel: 'Cancel',
      formSuccessCreated: 'Campaign created.',
      formSuccessUpdated: 'Campaign updated.',
      formError: 'Failed to save. Please try again.',
      formSlugError: 'A campaign with this slug already exists.',
      formInvalidPhase: 'One or more selected phases are not valid.',

      /* Application review */
      applicationsTitle: 'Scholarship Applications',
      applicationsSubtitle: 'Review and process applications for {campaign}',
      applicationsEmpty: 'No applications match your filters.',
      applicationSearchPlaceholder: 'Search by applicant name, phone, or email...',
      filterPending: 'Pending',
      filterApproved: 'Approved',
      filterRejected: 'Rejected',
      filterAll: 'All',
      applicantColumn: 'Applicant',
      appliedColumn: 'Applied',
      statusColumn: 'Status',
      actionsColumn: 'Actions',
      viewButton: 'View',

      /* Application detail modal */
      detailTitle: 'Application Details',
      detailApplicant: 'Applicant',
      detailCampaign: 'Campaign',
      detailStatus: 'Status',
      detailAppliedOn: 'Applied On',
      detailMotivation: 'Motivation Statement',
      detailDocuments: 'Supporting Documents',
      detailAdminNotes: 'Admin Notes (internal)',
      detailRejectionReason: 'Rejection Reason (shown to applicant)',
      detailReviewButton: 'Approve Application',
      detailRejectButton: 'Reject Application',
      detailRevokeButton: 'Revoke Scholarship',
      detailConfirmApproveTitle: 'Approve Application?',
      detailConfirmApproveBody: 'This will grant {grant} to {applicant}. {feeNote}',
      detailConfirmApproveFeeNote: 'They will be asked to pay {amount} ETB before access is granted.',
      detailConfirmApproveFreeNote: 'They will receive immediate access.',
      detailConfirmRejectTitle: 'Reject Application?',
      detailConfirmRejectBody: 'You must provide a reason. The applicant will be notified.',
      detailConfirmRevokeTitle: 'Revoke Scholarship?',
      detailConfirmRevokeBody: 'This will remove the applicant\'s access. Progress is preserved for audit.',
      approveSuccess: 'Application approved.',
      rejectSuccess: 'Application rejected.',
      revokeSuccess: 'Scholarship revoked.',
      approveFailed: 'Failed to approve.',
      rejectFailed: 'Failed to reject.',
      revokeFailed: 'Failed to revoke.',
      reasonRequired: 'A reason is required to reject an application.',

      /* Stats */
      statsTotalCampaigns: 'Total Campaigns',
      statsActiveCampaigns: 'Active Campaigns',
      statsPendingApplications: 'Pending Applications',
      statsApprovedRecipients: 'Approved Recipients',
    },

        /*
     * ═══════════════════════════════════════════════════════════════
     * WAVE 5 ADDITIONS — UI copy for components shipped in Wave 5
     * ═══════════════════════════════════════════════════════════════
     */

    /* ── Shared card labels ── */
    card: {
      spotsRemaining: '{remaining} of {total} spots left',
      spotsFilled: 'All spots filled',
      fullCourse: 'Full Course Access',
      phases: '{count} Phase(s)',
      registrationFree: 'Free Registration',
      registrationFee: '{amount} ETB Registration',
      viewDetails: 'View Details',
      applied: 'Applied',
      applyNow: 'Apply Now',
      closed: 'Applications Closed',
      full: 'Quota Full',
      endsOn: 'Ends {date}',
      noDeadline: 'Open until filled',
    },

    /* ── Browse page ── */
    browse: {
      pageTitle: 'Scholarships',
      pageSubtitle: 'Financial assistance for aspiring developers',
      sectionTitle: 'Available Scholarships',
      sectionSubtitle: 'Applications reviewed on a rolling basis',
      emptyTitle: 'No Scholarships Available',
      emptyDescription: 'Check back soon — new campaigns are announced regularly.',
      loadingLabel: 'Loading scholarships...',
      errorTitle: 'Could not load scholarships',
      errorDescription: 'Please refresh the page and try again.',
      retryButton: 'Try Again',
    },

    /* ── Detail page ── */
    detail: {
      backLink: 'Back to Scholarships',
      aboutTitle: 'About This Scholarship',
      grantTitle: 'What You Will Get',
      grantFullCourse: 'Complete access to all 5 phases',
      grantFullCourseDesc: 'Every video, every project, every mentor session — from day one to capstone.',
      grantPhases: 'Access to specific phases',
      grantPhasesDesc: 'You will unlock the exact phases listed below for this campaign.',
      eligibilityTitle: 'Who Can Apply',
      eligibilityOpen: 'Open to all registered students',
      eligibilityOpenDesc: 'Create an account first, then submit your application.',
      eligibilityBanned: 'Your account is not eligible',
      eligibilityBannedDesc: 'Please contact support if you believe this is a mistake.',
      eligibilityAlreadyApplied: 'You have already applied',
      eligibilityAlreadyAppliedDesc: 'Track the status in your profile.',
      applicationStatusTitle: 'Your Application',
      documentsTitle: 'Required Documents',
      documentRequired: 'Required',
      documentOptional: 'Optional',
      applyCta: 'Apply for This Scholarship',
      viewApplicationCta: 'View My Application',
      payFeeCta: 'Pay Registration Fee ({amount} ETB)',
      withdrawnNotice: 'You withdrew this application on {date}.',
      rejectionNotice: 'Reason: {reason}',
      loadingLabel: 'Loading scholarship...',
      notFoundTitle: 'Scholarship Not Found',
      notFoundDescription: 'This scholarship may have closed or been renamed.',
      backToBrowse: 'Browse Other Scholarships',
    },

    /* ── Application form (modal) ── */
    formModal: {
      title: 'Apply for Scholarship',
      subtitle: 'Tell us why this scholarship matters to you',
      motivationLabel: 'Motivation Statement',
      motivationPlaceholder: 'Share your story. What brought you here, what will you build, and how will this scholarship change your path?',
      motivationCounter: '{count} / {max} characters (minimum {min})',
      documentsLabel: 'Supporting Documents',
      documentsHint: 'Upload JPEG, PNG, WebP, or PDF. Max {size} MB each.',
      documentUploadLabel: 'Upload {type}',
      documentReplaceLabel: 'Replace {type}',
      documentRemoveLabel: 'Remove',
      documentUploadingLabel: 'Uploading...',
      submitButton: 'Submit Application',
      submitButtonLoading: 'Submitting...',
      cancelButton: 'Cancel',
      closeAriaLabel: 'Close form',
      validationMotivationRequired: 'Please write a motivation statement.',
      validationMotivationShort: 'Motivation must be at least {min} characters.',
      validationRequiredDocMissing: 'Required document "{type}" is missing.',
      validationUploadInProgress: 'Please wait for all uploads to complete.',
      submitConfirmTitle: 'Submit Application?',
      submitConfirmBody: 'Once submitted, you cannot edit or re-apply to this campaign. Make sure your motivation statement is final.',
      submitConfirmButton: 'Yes, Submit',
      submitSuccessTitle: 'Application Submitted',
      submitSuccessBody: 'We have received your application. You will be notified when it has been reviewed.',
      submitErrorTitle: 'Submission Failed',
    },

    /* ── My applications page ── */
    myApplications: {
      pageTitle: 'My Scholarships',
      pageSubtitle: 'Track your applications and enrollment status',
      emptyTitle: 'No Applications Yet',
      emptyDescription: 'Browse available scholarships and submit your first application.',
      emptyCta: 'Browse Scholarships',
      loadingLabel: 'Loading your applications...',
      campaignLabel: 'Campaign',
      appliedLabel: 'Applied',
      statusLabel: 'Status',
      actionsLabel: 'Actions',
      viewApplicationLabel: 'View Details',
      viewCampaignLabel: 'View Campaign',
      withdrawButton: 'Withdraw Application',
      withdrawConfirmTitle: 'Withdraw Application?',
      withdrawConfirmBody: 'This cannot be undone. You will not be able to re-apply to this campaign.',
      withdrawConfirmButton: 'Yes, Withdraw',
      withdrawSuccessTitle: 'Application Withdrawn',
      withdrawSuccessBody: 'Your application has been withdrawn.',
      withdrawErrorTitle: 'Withdrawal Failed',
      payFeeButton: 'Pay Fee',
    },

    /* ── Scholarship banner (auth pages) ── */
    banner: {
      ariaLabel: 'Scholarship announcement',
      dismissAriaLabel: 'Dismiss announcement',
      headline: 'New Scholarship Available',
      grantFullCourseMessage: 'Get full-course access to {campaign} — completely free for {quota} students.',
      grantPhasesMessage: 'Get free access to selected phases of {campaign} — limited to {quota} students.',
      applyNowButton: 'Apply Now',
      learnMoreButton: 'Learn More',
      spotsLeft: '{remaining} of {quota} spots left',
      loadingLabel: 'Loading scholarship announcement...',
    },

    /* ── Status labels (extended) ── */
    statusLabel: {
      pending: 'Pending Review',
      pendingPayment: 'Awaiting Payment',
      approved: 'Approved',
      rejected: 'Not Approved',
      withdrawn: 'Withdrawn',
      revoked: 'Revoked',
    },
  },
};