/**
 * @fileoverview Oromo — Student Profile Namespace
 *
 * Template variables ({count}, {completed}, {total}, {length}) are
 * resolved at render time from config — never hardcoded into strings.
 *
 * Path: packages/shared/config/i18n/om/profile.js
 */

module.exports = {
  profile: {
    /* ── Top-level tabs & page chrome ── */
    title: 'Piroofaayilii Koo',
    enrolledSince: 'Miseensa erga',
    notEnrolled: 'Hin Galmaa\'ne',
    editProfile: 'Piroofaayilii Gulaali',
    changePassword: 'Jecha Darbii Jijjiiri',
    backToProfile: 'Gara Piroofaayiliitti Deebi\'i',
    tabOverview: 'Ilaalcha Waliigalaa',
    tabEdit: 'Piroofaayilii Gulaali',
    tabPassword: 'Jecha Darbii Jijjiiri',
    tabPayments: 'Seenaa Kaffaltii',
    tabProgress: 'Adeemsa Barnootaa',

    /* ── Enrollment status card ── */
    enrollmentStatus: 'Haala Galmee',
    enrolled: 'Galmaa\'e',
    notEnrolledStatus: 'Yeroo ammaa koorsii kamiyyuu keessatti hin galmaa\'ne.',
    plan: 'Karoora',
    fullCourse: 'Koorsii Guutuu',
    individualPhases: 'Kutaa Barnootaa {count}',
    purchasedOn: 'Kan bitame',
    accessType: 'Hayyama',
    lifetime: 'Jireenyaa',

    /* ── Progress cards ── */
    overallProgress: 'Adeemsa Waliigalaa',
    weeksCompleted: 'Torban {completed} / {total} xumurame',
    lessonsCompleted: 'Barnoota {completed} / {total} xumurame',
    phaseProgress: 'Adeemsa Kutaa Barnootaa',
    completed: 'Xumurame',
    inProgress: 'Hojii Irra Jira',
    locked: 'Cufameera',

    /* ── Payment history ── */
    paymentHistory: 'Seenaa Kaffaltii',
    noPayments: 'Hanga ammaatti seenaan kaffaltii hin jiru.',
    paymentStatus: 'Haala',
    paymentAmount: 'Hamma',
    paymentDate: 'Guyyaa',
    paymentMethod: 'Mala',
    viewAllPayments: 'Kaffaltiiwwan Hunda Ilaali',

    /* ── Quick actions card ── */
    quickActions: 'Gochaawwan Saffisaa',

    /* ── Account settings card ── */
    accountSettings: 'Qindaa\'ina Herregaa',
    language: 'Afaan',
    notifications: 'Filannoo Beeksisaa',
    deleteAccount: 'Herrega Haqi',

    /* ── Edit profile page — chrome ── */
    editProfileTitle: 'Piroofaayilii Gulaali',
    editSubtitle: 'Odeeffannoo dhuunfaa fi jecha darbii kee haaromsi',

    /* ── Edit profile — Personal information section ── */
    personalInfoSection: 'Odeeffannoo Dhuunfaa',
    fullName: 'Maqaa Guutuu',
    phone: 'Lakkoofsa Bilbilaa',
    email: 'Teessoo Imeelii',
    emailNote: 'Teessoo imeelii kee yeroo kamiyyuu haaromsuu dandeessa.',
    emailInvalid: 'Maaloo teessoo imeelii sirrii galchi.',
    emailTaken: 'Imeeliin kun duraan herrega biraatiin fayyadamaa jira.',
    emailRequired: 'Teessoon imeelii barbaachisa.',
    uploadAvatar: 'Avaataarii Olkaa\'i',
    removeAvatar: 'Avaataarii Haqi',
    saveChanges: 'Jijjiirama Olkaa\'i',
    saving: 'Olkaa\'aa jira...',
    profileUpdated: 'Piroofaayiliin milkaa\'inaan haaromfame!',
    saved: 'Piroofaayiliin milkaa\'inaan haaromfame',
    saveFailed: 'Piroofaayilii haaromsuu hin dandeenye',
    updateError: 'Piroofaayilii haaromsuu hin dandeenye. Maaloo irra deebi\'ii yaali.',
    loadError: 'Piroofaayilii fe\'uu hin dandeenye. Maaloo irra deebi\'ii yaali.',

    /* ── Edit profile — Password change section ── */
    passwordSection: 'Jecha Darbii Jijjiiri',
    passwordSubtitle: 'Herrega kee nagaa taasisuuf jecha darbii kee haaromsi',
    currentPassword: 'Jecha Darbii Ammaa',
    newPassword: 'Jecha Darbii Haaraa',
    confirmNewPassword: 'Jecha Darbii Haaraa Mirkaneessi',
    changePasswordBtn: 'Jecha Darbii Jijjiiri',
    changing: 'Jijjiiramaa jira...',
    passwordChanged: 'Jechi darbii milkaa\'inaan jijjiirame!',
    passwordChangeFailed: 'Jecha darbii jijjiiruu hin dandeenye',
    currentPasswordRequired: 'Jechi darbii ammaa barbaachisa',
    newPasswordRequired: 'Jechi darbii haaraan barbaachisa',
    confirmPasswordRequired: 'Maaloo jecha darbii haaraa kee mirkaneessi',
    passwordMismatch: 'Jechoonni darbii wal hin fudhanne.',
    /* {length} injected from env / payments config at render time */
    passwordTooShort: 'Jechi darbii qubee {length} ol ta\'uu qaba.',
    wrongCurrentPassword: 'Jechi darbii ammaa sirrii miti',

    sameAsCurrent: 'Jechi darbii haaraan kan ammaa irraa adda ta\'uu qaba.',
    saveSuccessTitle: 'Jijjiiramni Olkaa\'ame',
    saveErrorTitle: 'Olkaa\'uun Hin Milkoofne',
    fullNameRequired: 'Maqaan guutuun barbaachisa.',
    phoneRequired: 'Maaloo lakkoofsa bilbilaa sirrii dhiyeessi.',
    memberSince: 'Miseensa erga {date}',
    unsavedChanges: 'Jijjiirama hin olkaa\'amne',
    passwordStrength: 'Cimina jecha darbii',
    strengthWeak: 'Laafaa',
    strengthFair: 'Giddu-galeessa',
    strengthStrong: 'Cimaa',

    /* ── Password change — custom confirmation modal (no browser dialog) ── */
    confirmTitle: 'Jijjiirama Jecha Darbii Mirkaneessi',
    confirmDescription:
      'Jecha darbii herrega kee jijjiiruuf jirta. Yeroo itti aanu seenu jecha darbii haaraa fayyadamuu qabda.',
    confirmAction: 'Eeyyee, Jecha Darbii Jijjiiri',
    cancelAction: 'Haqi',

    /* ── Avatar upload ── */
    avatarUploadFailed: 'Avaataarii olkaa\'uu hin dandeenye',
    avatarRemoveFailed: 'Avaataarii haquu hin dandeenye',
    avatarInvalidType: 'Maaloo suuraa JPEG, PNG, yookaan WebP olkaa\'i.',
    avatarTooLarge: 'Avaataariin 2MB gadi ta\'uu qaba.',
  },
};