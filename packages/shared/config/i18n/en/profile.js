/**
 * @fileoverview English — Student Profile Namespace
 *
 * Complete display text for the student profile experience including:
 *   - Profile overview (enrollment, progress, payment history)
 *   - Profile edit form (personal info section)
 *   - Password change section (custom modal, validation messages)
 *   - Quick actions + account settings
 *
 * Template variables ({count}, {completed}, {total}, {length}) are
 * resolved at render time from config — never hardcoded into strings.
 *
 * Path: packages/shared/config/i18n/en/profile.js
 */

module.exports = {
  profile: {
    /* ── Top-level tabs & page chrome ── */
    title: 'My Profile',
    enrolledSince: 'Member since',
    notEnrolled: 'Not Enrolled',
    editProfile: 'Edit Profile',
    changePassword: 'Change Password',
    backToProfile: 'Back to Profile',
    tabOverview: 'Overview',
    tabEdit: 'Edit Profile',
    tabPassword: 'Change Password',
    tabPayments: 'Payment History',
    tabProgress: 'Learning Progress',

    /* ── Enrollment status card ── */
    enrollmentStatus: 'Enrollment Status',
    enrolled: 'Enrolled',
    notEnrolledStatus: 'You are not currently enrolled in any course.',
    plan: 'Plan',
    fullCourse: 'Full Course',
    individualPhases: '{count} Phase(s)',
    purchasedOn: 'Purchased on',
    accessType: 'Access',
    lifetime: 'Lifetime',

    /* ── Progress cards ── */
    overallProgress: 'Overall Progress',
    weeksCompleted: '{completed} of {total} weeks completed',
    lessonsCompleted: '{completed} of {total} lessons done',
    phaseProgress: 'Phase Progress',
    completed: 'Completed',
    inProgress: 'In Progress',
    locked: 'Locked',

    /* ── Payment history ── */
    paymentHistory: 'Payment History',
    noPayments: 'No payment history yet.',
    paymentStatus: 'Status',
    paymentAmount: 'Amount',
    paymentDate: 'Date',
    paymentMethod: 'Method',
    viewAllPayments: 'View All Payments',

    /* ── Quick actions card ── */
    quickActions: 'Quick Actions',

    /* ── Account settings card ── */
    accountSettings: 'Account Settings',
    language: 'Language',
    notifications: 'Notification Preferences',
    deleteAccount: 'Delete Account',

    /* ── Edit profile page — chrome ── */
    editProfileTitle: 'Edit Profile',
    editSubtitle: 'Update your personal information and password',

    /* ── Edit profile — Personal information section ── */
    personalInfoSection: 'Personal Information',
    fullName: 'Full Name',
    phone: 'Phone Number',
    email: 'Email Address',
    emailNote: 'You can update your email address at any time.',
    emailInvalid: 'Please enter a valid email address.',
    emailTaken: 'This email is already used by another account.',
    emailRequired: 'Email address is required.',
    uploadAvatar: 'Upload Avatar',
    removeAvatar: 'Remove Avatar',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    profileUpdated: 'Profile updated successfully!',
    saved: 'Profile updated successfully',
    saveFailed: 'Failed to update profile',
    updateError: 'Failed to update profile. Please try again.',
    loadError: 'Failed to load profile. Please try again.',

    /* ── Edit profile — Password change section ── */
    passwordSection: 'Change Password',
    passwordSubtitle: 'Update your password to keep your account secure',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    changePasswordBtn: 'Change Password',
    changing: 'Changing...',
    passwordChanged: 'Password changed successfully!',
    passwordChangeFailed: 'Failed to change password',
    currentPasswordRequired: 'Current password is required',
    newPasswordRequired: 'New password is required',
    confirmPasswordRequired: 'Please confirm your new password',
    passwordMismatch: 'Passwords do not match.',
    /* {length} injected from env / payments config at render time */
    passwordTooShort: 'Password must be at least {length} characters.',
    wrongCurrentPassword: 'Current password is incorrect',

    sameAsCurrent: 'New password must be different from the current one.',
    saveSuccessTitle: 'Changes Saved',
    saveErrorTitle: 'Save Failed',
    fullNameRequired: 'Full name is required.',
    phoneRequired: 'Please provide a valid phone number.',
    memberSince: 'Member since {date}',
    unsavedChanges: 'Unsaved changes',
    passwordStrength: 'Password strength',
    strengthWeak: 'Weak',
    strengthFair: 'Fair',
    strengthStrong: 'Strong',

    /* ── Password change — custom confirmation modal (no browser dialog) ── */
    confirmTitle: 'Confirm Password Change',
    confirmDescription:
      'You are about to change your account password. You will need to use the new password next time you log in.',
    confirmAction: 'Yes, Change Password',
    cancelAction: 'Cancel',

    /* ── Avatar upload ── */
    avatarUploadFailed: 'Failed to upload avatar',
    avatarRemoveFailed: 'Failed to remove avatar',
    avatarInvalidType: 'Please upload a JPEG, PNG, or WebP image.',
    avatarTooLarge: 'Avatar must be under 2MB.',
  },
};