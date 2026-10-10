/**
 * @fileoverview Amharic — Student Profile Namespace
 *
 * Full AM parity with the English profile namespace. Covers:
 *   - Profile overview (enrollment, progress, payment history)
 *   - Profile edit form (personal info section)
 *   - Password change section (custom modal, validation messages)
 *   - Quick actions + account settings
 *
 * Template variables ({count}, {completed}, {total}, {length}) are
 * resolved at render time from config — never hardcoded.
 *
 * Path: packages/shared/config/i18n/am/profile.js
 */

module.exports = {
  profile: {
    /* ── Top-level tabs & page chrome ── */
    title: 'የኔ ፕሮፋይል',
    enrolledSince: 'አባል ከ',
    notEnrolled: 'አልተመዘገቡም',
    editProfile: 'ፕሮፋይል አርትዕ',
    changePassword: 'የይለፍ ቃል ይቀይሩ',
    backToProfile: 'ወደ ፕሮፋይል ተመለስ',
    tabOverview: 'አጠቃላይ እይታ',
    tabEdit: 'ፕሮፋይል አርትዕ',
    tabPassword: 'የይለፍ ቃል ይቀይሩ',
    tabPayments: 'የክፍያ ታሪክ',
    tabProgress: 'የትምህርት እድገት',

    /* ── Enrollment status card ── */
    enrollmentStatus: 'የምዝገባ ሁኔታ',
    enrolled: 'ተመዝግበዋል',
    notEnrolledStatus: 'በአሁኑ ጊዜ በምንም ኮርስ አልተመዘገቡም።',
    plan: 'እቅድ',
    fullCourse: 'ሙሉ ኮርስ',
    individualPhases: '{count} ምዕራፍ(ች)',
    purchasedOn: 'የተገዛበት ቀን',
    accessType: 'መዳረሻ',
    lifetime: 'የእድሜ ልክ',

    /* ── Progress cards ── */
    overallProgress: 'አጠቃላይ እድገት',
    weeksCompleted: 'ከ{total} ሳምንታት {completed} ተጠናቀዋል',
    lessonsCompleted: 'ከ{total} ትምህርቶች {completed} ተጠናቀዋል',
    phaseProgress: 'የምዕራፍ እድገት',
    completed: 'ተጠናቋል',
    inProgress: 'በሂደት ላይ',
    locked: 'ተቆልፏል',

    /* ── Payment history ── */
    paymentHistory: 'የክፍያ ታሪክ',
    noPayments: 'እስካሁን ምንም የክፍያ ታሪክ የለም።',
    paymentStatus: 'ሁኔታ',
    paymentAmount: 'መጠን',
    paymentDate: 'ቀን',
    paymentMethod: 'ዘዴ',
    viewAllPayments: 'ሁሉንም ክፍያዎች ይመልከቱ',

    /* ── Quick actions card ── */
    quickActions: 'ፈጣን እርምጃዎች',

    /* ── Account settings card ── */
    accountSettings: 'የመለያ ቅንብሮች',
    language: 'ቋንቋ',
    notifications: 'የማሳወቂያ ምርጫዎች',
    deleteAccount: 'መለያ አጥፋ',

    /* ── Edit profile page — chrome ── */
    editProfileTitle: 'ፕሮፋይል አርትዕ',
    editSubtitle: 'የግል መረጃዎን እና የይለፍ ቃልዎን ያዘምኑ',

    /* ── Edit profile — Personal information section ── */
    personalInfoSection: 'የግል መረጃ',
    fullName: 'ሙሉ ስም',
    phone: 'ስልክ ቁጥር',
    email: 'ኢሜል አድራሻ',
    emailNote: 'የኢሜል አድራሻዎን በማንኛውም ጊዜ መቀየር ይችላሉ።',
    emailInvalid: 'እባክዎን ትክክለኛ የኢሜል አራሻ ያስገቡ።',
    emailTaken: 'ይህ ኢሜል በሌላ መለያ ላይ ተጠቅሟል።',
    emailRequired: 'ኢሜል አድራሻ ያስፈልጋል።',
    uploadAvatar: 'አቫታር ያስገቡ',
    removeAvatar: 'አቫታር ያስወግዱ',
    saveChanges: 'ለውጦችን ያስቀምጡ',
    saving: 'በማስቀመጥ ላይ...',
    profileUpdated: 'ፕሮፋይል በተሳካ ሁኔታ ተዘምኗል!',
    saved: 'ፕሮፋይል በተሳካ ሁኔታ ተዘምኗል',
    saveFailed: 'ፕሮፋይልን ማዘመን አልተሳካም',
    updateError: 'ፕሮፋይል ማዘመን አልተሳካም። እባክዎ እንደገና ይሞክሩ።',
    loadError: 'ፕሮፋይል መጫን አልተሳካም። እባክዎ እንደገና ይሞክሩ።',

    /* ── Edit profile — Password change section ── */
    passwordSection: 'የይለፍ ቃል ቀይር',
    passwordSubtitle: 'መለያዎን ደህንነቱ የተጠበቀ ለማድረግ የይለፍ ቃልዎን ያዘምኑ',
    currentPassword: 'የአሁን የይለፍ ቃል',
    newPassword: 'አዲስ የይለፍ ቃል',
    confirmNewPassword: 'አዲሱን የይለፍ ቃል ያረጋግጡ',
    changePasswordBtn: 'የይለፍ ቃል ቀይር',
    changing: 'በመቀየር ላይ...',
    passwordChanged: 'የይለፍ ቃል በተሳካ ሁኔታ ተቀይሯል!',
    passwordChangeFailed: 'የይለፍ ቃል መቀየር አልተሳካም',
    currentPasswordRequired: 'የአሁን የይለፍ ቃል ያስፈልጋል',
    newPasswordRequired: 'አዲስ የይለፍ ቃል ያስፈልጋል',
    confirmPasswordRequired: 'እባክዎ አዲስ የይለፍ ቃልዎን ያረጋግጡ',
    passwordMismatch: 'የይለፍ ቃሎች አይዛመዱም።',
    /* {length} injected from env / payments config at render time */
    passwordTooShort: 'የይለፍ ቃል ቢያንስ {length} ቁምፊዎች መሆን አለበት።',
    wrongCurrentPassword: 'የአሁን የይለፍ ቃል ትክክል አይደለም',

    sameAsCurrent: 'አዲሱ የይለፍ ቃል ከአሁኑ የተለየ መሆን አለበት።',
    saveSuccessTitle: 'ለውጦች ተቀምጠዋል',
    saveErrorTitle: 'ማስቀመጥ አልተሳካም',
    passwordSuccessTitle: 'የይለፍ ቃል ተቀይሯል',
    passwordErrorTitle: 'የይለፍ ቃል ስህተት',
    okAction: 'እሺ',
    fullNameRequired: 'ሙሉ ስም ያስፈልጋል።',
    phoneRequired: 'እባክዎ ትክለኛ የስልክ ቁጥር ያስገቡ።',
    memberSince: 'አባል ከ{date} ጀምሮ',
    unsavedChanges: 'ያልተቀመጡ ለውጦች',
    passwordStrength: 'የይለፍ ቃል ጥንካሬ',
    strengthWeak: 'ደካማ',
    strengthFair: 'መካከለኛ',
    strengthStrong: 'ጠንካራ',

    /* ── Password change — custom confirmation modal (no browser dialog) ── */
    confirmTitle: 'የይለፍ ቃል ለውጥ ያረጋግጡ',
    confirmDescription:
      'የመለያዎን የይለፍ ቃል ሊቀይሩ ነው። በሚቀጥለው ጊዜ ሲገቡ አዲሱን የይለፍ ቃል መጠቀም ያስፈልግዎታል።',
    confirmAction: 'አዎ፣ የይለፍ ቃል ቀይር',
    cancelAction: 'ሰርዝ',

    /* ── Avatar upload ── */
    avatarUploadFailed: 'አቫታር መጫን አልተሳካም',
    avatarRemoveFailed: 'አቫታር ማስወገድ አልተሳካም',
    avatarInvalidType: 'እባክዎ JPEG፣ PNG ወይም WebP ምስል ያስገቡ።',
    avatarTooLarge: 'አቫታር ከ2MB በታች መሆን አለበት።',
  },
};