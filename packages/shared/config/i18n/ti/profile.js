/**
 * @fileoverview Tigrinya — Student Profile Namespace
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
 * Path: packages/shared/config/i18n/ti/profile.js
 */

module.exports = {
  profile: {
    /* ── Top-level tabs & page chrome ── */
    title: 'መግለጺይ',
    enrolledSince: 'ኣባል ካብ',
    notEnrolled: 'ዘይተመዘገበ',
    editProfile: 'መግለጺ ኣስተዳድር',
    changePassword: 'መሕለፊ ቃል ቀይር',
    backToProfile: 'ናብ መግለጺ ተመለስ',
    tabOverview: 'ጠቕላላ ትሕዝቶ',
    tabEdit: 'መግለጺ ኣስተዳድር',
    tabPassword: 'መሕለፊ ቃል ቀይር',
    tabPayments: 'ታሪኽ ክፍሊት',
    tabProgress: 'ምዕባለ ትምህርቲ',

    /* ── Enrollment status card ── */
    enrollmentStatus: 'ኩነታት ምዝገባ',
    enrolled: 'ተመዝጊቡ',
    notEnrolledStatus: 'ኣብ ሕጂ ኣብ ዝኾነ ትምህርቲ ኣይተመዘገብካን።',
    plan: 'ውጥን',
    fullCourse: 'ምሉእ ትምህርቲ',
    individualPhases: '{count} ምዕራፍ(ታት)',
    purchasedOn: 'ዝተገዝአሉ',
    accessType: 'ኣክሰስ',
    lifetime: 'ዕድሚ ዘለዎ',

    /* ── Progress cards ── */
    overallProgress: 'ሓፈሻዊ ምዕባለ',
    weeksCompleted: '{completed} ካብ {total} ሰሙናት ተዛዚሙ',
    lessonsCompleted: '{completed} ካብ {total} ትምህርትታት ተዛዚሙ',
    phaseProgress: 'ምዕባለ ምዕራፍ',
    completed: 'ተዛዚሙ',
    inProgress: 'ኣብ ምስራሕ',
    locked: 'ተዓጽዩ',

    /* ── Payment history ── */
    paymentHistory: 'ታሪኽ ክፍሊት',
    noPayments: 'ክሳብ ሕጂ ታሪኽ ክፍሊት የለን።',
    paymentStatus: 'ኩነታት',
    paymentAmount: 'መጠን',
    paymentDate: 'መዓልቲ',
    paymentMethod: 'ኣገባብ',
    viewAllPayments: 'ኩሎም ክፍሊታት ተመልከት',

    /* ── Quick actions card ── */
    quickActions: 'ቅልጡፍ ተግባራት',

    /* ── Account settings card ── */
    accountSettings: 'ቅንብራት ሕሳብ',
    language: 'ቋንቋ',
    notifications: 'ምርጫታት ምልክታ',
    deleteAccount: 'ሕሳብ ኣጥፍእ',

    /* ── Edit profile page — chrome ── */
    editProfileTitle: 'መግለጺ ኣስተዳድር',
    editSubtitle: 'ብሕታዊ ሓበሬታኻን መሕለፊ ቃልካን ኣሓድስ',

    /* ── Edit profile — Personal information section ── */
    personalInfoSection: 'ብሕታዊ ሓበሬታ',
    fullName: 'ምሉእ ስም',
    phone: 'ቑጽሪ ተሌፎን',
    email: 'ኣድራሻ ኢመይል',
    emailNote: 'ኣድራሻ ኢመይልካ ብዝኾነ ግዜ ከተሓድስ ትኽእል።',
    emailInvalid: 'በጃኻ ግቡእ ኣድራሻ ኢመይል ኣእቱ።',
    emailTaken: 'እዚ ኢመይል ብኻልእ ሕሳብ ተጠቒሙ እዩ።',
    emailRequired: 'ኣድራሻ ኢመይል ኣስፈላጊ እዩ።',
    uploadAvatar: 'ኣቫታር ጽዓን',
    removeAvatar: 'ኣቫታር ኣውጽእ',
    saveChanges: 'ለውጥታት ኣቐምጥ',
    saving: 'ይቕመጥ ኣሎ...',
    profileUpdated: 'መግለጺ ብዓወት ተሓዲሱ!',
    saved: 'መግለጺ ብዓወት ተሓዲሱ',
    saveFailed: 'መግለጺ ምሕዳስ ኣይተኻእለን',
    updateError: 'መግለጺ ምሕዳስ ኣይተኻእለን። በጃኻ እንደገና ፈትን።',
    loadError: 'መግለጺ ምጽዓን ኣይተኻእለን። በጃኻ እንደገና ፈትን።',

    /* ── Edit profile — Password change section ── */
    passwordSection: 'መሕለፊ ቃል ቀይር',
    passwordSubtitle: 'ሕሳብካ ውሑስ ንምግባር መሕለፊ ቃልካ ኣሓድስ',
    currentPassword: 'ናይ ሕጂ መሕለፊ ቃል',
    newPassword: 'ሓድሽ መሕለፊ ቃል',
    confirmNewPassword: 'ሓድሽ መሕለፊ ቃል ኣረጋግጽ',
    changePasswordBtn: 'መሕለፊ ቃል ቀይር',
    changing: 'ይቕየር ኣሎ...',
    passwordChanged: 'መሕለፊ ቃል ብዓወት ተቐይሩ!',
    passwordChangeFailed: 'መሕለፊ ቃል ምቕያር ኣይተኻእለን',
    currentPasswordRequired: 'ናይ ሕጂ መሕለፊ ቃል ኣስፈላጊ እዩ',
    newPasswordRequired: 'ሓድሽ መሕለፊ ቃል ኣስፈላጊ እዩ',
    confirmPasswordRequired: 'በጃኻ ሓድሽ መሕለፊ ቃልካ ኣረጋግጽ',
    passwordMismatch: 'መሕለፊ ቃላት ኣይሰማማዑን።',
    /* {length} injected from env / payments config at render time */
    passwordTooShort: 'መሕለፊ ቃል ብውሕዱ ትሕቲ {length} ፊደላት ክኸውን ኣለዎ።',
    wrongCurrentPassword: 'ናይ ሕጂ መሕለፊ ቃል ጌጋ እዩ',

    sameAsCurrent: 'ሓድሽ መሕለፊ ቃል ካብቲ ናይ ሕጂ ዝተፈልየ ክኸውን ኣለዎ።',
    saveSuccessTitle: 'ለውጥታት ተቐሚጡ',
    saveErrorTitle: 'ምቕማጥ ኣይተኻእለን',
    fullNameRequired: 'ምሉእ ስም ኣስፈላጊ እዩ።',
    phoneRequired: 'በጃኻ ግቡእ ቑጽሪ ተሌፎን ኣቕርብ።',
    memberSince: 'ኣባል ካብ {date}',
    unsavedChanges: 'ዘይተቐመጠ ለውጥታት',
    passwordStrength: 'ሓይሊ መሕለፊ ቃል',
    strengthWeak: 'ድኹም',
    strengthFair: 'ማእከላይ',
    strengthStrong: 'ሓያል',

    /* ── Password change — custom confirmation modal (no browser dialog) ── */
    confirmTitle: 'ምቕያር መሕለፊ ቃል ኣረጋግጽ',
    confirmDescription:
      'መሕለፊ ቃል ሕሳብካ ክትቅይር ትኸውን። ዝቕጽል ግዜ ክትኣቱ ሓድሽ መሕለፊ ቃል ክትጥቀም ኣለካ።',
    confirmAction: 'እወ፣ መሕለፊ ቃል ቀይር',
    cancelAction: 'ሰርዝ',

    /* ── Avatar upload ── */
    avatarUploadFailed: 'ኣቫታር ምጽዓን ኣይተኻእለን',
    avatarRemoveFailed: 'ኣቫታር ምውጋድ ኣይተኻእለን',
    avatarInvalidType: 'በጃኻ ስእሊ JPEG, PNG, ወይ WebP ጽዓን።',
    avatarTooLarge: 'ኣቫታር ትሕቲ 2MB ክኸውን ኣለዎ።',
  },
};