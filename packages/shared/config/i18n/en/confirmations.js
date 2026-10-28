/**
 * @fileoverview English — Confirmations Namespace
 *
 * Every confirmation dialog string used by the platform. Consumed by:
 *   - apps/web/lib/api.js (interceptor default messages)
 *   - apps/web/components/shared/ConfirmDialog.jsx (button labels)
 *   - apps/web/pages/admin/users/[id]/index.jsx (God Mode actions)
 *
 * Adding a new confirmation pattern means adding an entry here and
 * referencing it by key from api.js or a page's `useConfirm()` call.
 *
 * Path: packages/shared/config/i18n/en/confirmations.js
 */

module.exports = {
  confirmations: {
    /* ── Default button labels + fallbacks ── */
    defaults: {
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      processingText: 'Processing...',
      requireInputPrefix: 'Type',
      requireInputSuffix: 'to confirm:',
      fallbackTitle: 'Confirm',
      cancelledMessage: 'Action cancelled by user.',
    },

    /* ── Interceptor-driven actions (matched by URL pattern) ── */
    actions: {
      /* Deletes */
      deleteCourse: {
        title: 'Delete this course permanently?',
        message: 'All lessons, enrollments, and payment history for this course will be permanently removed. This cannot be undone.',
        confirmText: 'Delete Course',
        variant: 'danger',
      },
      deleteVideo: {
        title: 'Delete this video?',
        message: 'The video will be removed from the curriculum.',
        confirmText: 'Delete Video',
        variant: 'danger',
      },
      deleteDiscussion: {
        title: 'Delete this discussion?',
        message: 'The discussion video will be removed.',
        confirmText: 'Delete',
        variant: 'danger',
      },
      deleteDiscount: {
        title: 'Delete this discount code?',
        message: 'Students who saved this code will no longer be able to use it.',
        confirmText: 'Delete Code',
        variant: 'danger',
      },
      deleteLesson: {
        title: 'Delete this lesson?',
        message: 'The lesson content will be removed.',
        confirmText: 'Delete',
        variant: 'danger',
      },
      deletePhase: {
        title: 'Delete this phase?',
        message: 'All weeks and lessons in this phase will be removed.',
        confirmText: 'Delete Phase',
        variant: 'danger',
      },
      deleteWeek: {
        title: 'Delete this week?',
        message: 'All lessons in this week will be removed.',
        confirmText: 'Delete',
        variant: 'danger',
      },
      deleteAdmin: {
        title: 'Delete this admin account?',
        message: 'They will lose access to the admin panel immediately.',
        confirmText: 'Delete Admin',
        variant: 'danger',
      },
      deleteGeneric: {
        title: 'Delete this item?',
        message: 'This action cannot be undone.',
        confirmText: 'Delete',
        variant: 'danger',
      },

      /* Payments */
      approvePayment: {
        title: 'Approve this payment?',
        message: 'The student will be enrolled immediately and agent/MLM commissions will fire.',
        confirmText: 'Approve',
        variant: 'warning',
      },
      rejectPayment: {
        title: 'Reject this payment?',
        message: 'The student will be notified and will not gain access.',
        confirmText: 'Reject',
        variant: 'danger',
      },
      bulkApprovePayments: {
        title: 'Bulk approve payments?',
        message: 'Every selected payment will be approved and all commissions will fire.',
        confirmText: 'Bulk Approve',
        variant: 'warning',
      },

      /* Withdrawals */
      processWithdrawal: {
        title: 'Process this withdrawal?',
        message: 'Approving marks it as paid. Rejecting returns funds to the wallet.',
        confirmText: 'Process',
        variant: 'warning',
      },
      requestWithdrawal: {
        title: 'Request a withdrawal?',
        message: 'An admin will process it. The amount is reserved from your wallet.',
        confirmText: 'Submit Request',
        variant: 'warning',
      },

      /* Bulk user actions */
      bulkUserAction: {
        title: 'Apply bulk action to users?',
        message: 'This affects multiple accounts at once.',
        confirmText: 'Apply to All',
        variant: 'warning',
      },

      /* Settings */
      saveSettings: {
        title: 'Save settings?',
        message: 'Pricing changes go live on the public site immediately.',
        confirmText: 'Save Changes',
        variant: 'warning',
      },
      resetSettings: {
        title: 'Reset settings to defaults?',
        message: 'This section will revert to default values.',
        confirmText: 'Reset',
        variant: 'danger',
      },

      /* Announcements */
      broadcastAnnouncement: {
        title: 'Broadcast this announcement?',
        message: 'Every recipient will receive this notification. It cannot be recalled once sent.',
        confirmText: 'Send Broadcast',
        variant: 'warning',
      },

      /* Student-facing */
      submitPayment: {
        title: 'Submit payment proof?',
        message: 'An admin will review your payment and approve access.',
        confirmText: 'Submit Payment',
        variant: 'warning',
      },
      changePassword: {
        title: 'Change your password?',
        message: 'You will need to use the new password for your next login.',
        confirmText: 'Change Password',
        variant: 'warning',
      },
      saveProfile: {
        title: 'Save profile changes?',
        message: 'Your profile information will be updated.',
        confirmText: 'Save',
        variant: 'default',
      },

      /* ── God Mode — admin user detail page (imperative useConfirm) ── */
      godmodeEnroll: {
        title: 'Mark user as enrolled?',
        message: 'The user will gain full course access immediately.',
        confirmText: 'Mark Enrolled',
        variant: 'warning',
      },
      godmodeUnenroll: {
        title: 'Unenroll this user?',
        message: 'The user will lose course access. Referral earnings stay intact.',
        confirmText: 'Unenroll',
        variant: 'danger',
      },
      godmodeImpersonate: {
        title: 'Generate impersonation link?',
        message: 'A 5-minute magic link will be generated. You will open it in a new tab — your admin session stays logged in.',
        confirmText: 'Generate Link',
        variant: 'warning',
      },
      godmodePasswordReset: {
        title: 'Generate password reset link?',
        message: 'A one-time link will be generated for this user. They can use it to set a new password.',
        confirmText: 'Generate Reset Link',
        variant: 'warning',
      },
      godmodeWalletAdjust: {
        title: 'Confirm wallet adjustment',
        messageTemplate: 'You are about to {direction} {amount} ETB. Reason: "{reason}". This is logged in the audit trail.',
        confirmText: 'Apply Adjustment',
        variant: 'warning',
      },
      godmodeWalletAdjustLarge: {
        title: 'Large wallet adjustment — confirm amount',
        messageTemplate: 'You are about to {direction} {amount} ETB. Reason: "{reason}". This is logged in the audit trail.',
        confirmText: 'Apply Adjustment',
        variant: 'danger',
        requireInput: 'ADJUST',
      },
      godmodeAgentOverride: {
        title: 'Override agent commission rate?',
        messageTemplate: 'The new rate will be {value} {unit} per sale. This will affect all future commissions for this agent.',
        confirmText: 'Override Rate',
        variant: 'warning',
      },
      godmodeOrphan: {
        title: 'Orphan this user from the MLM tree?',
        message: 'All ancestor links will be removed. The user keeps their own downline. This action is logged and cannot be undone.',
        confirmText: 'Orphan User',
        variant: 'danger',
        requireInput: 'ORPHAN',
      },
      godmodeBan: {
        title: 'Ban this user?',
        message: 'They will lose access immediately. Their agent and referral codes will be revoked. This is logged but reversible from the Unban action.',
        confirmText: 'Ban User',
        variant: 'danger',
        requireInput: 'BAN',
      },
      godmodeUnban: {
        title: 'Unban this user?',
        message: 'They will regain access to the platform. Their agent and referral codes will be re-enabled so they can earn again.',
        confirmText: 'Unban User',
        variant: 'warning',
        requireInput: 'UNBAN',
      },
      godmodeManualEnroll: {
        title: 'Grant full course access without payment?',
        messageTemplate: 'The user will be enrolled in the Full Course without a payment record. Reason: "{reason}". This is logged in the audit trail.',
        confirmText: 'Grant Access',
        variant: 'warning',
      },
    },
  },
};