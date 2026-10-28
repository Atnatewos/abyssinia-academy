/**
 * @fileoverview Afaan Oromoo — Admin Namespace
 *
 * Contains admin-specific UI copy including:
 *   - Coming Soon stub labels (one per unfinished CRUD route)
 *   - Announcements composer labels
 *   - Agent management labels
 *   - God Mode UI (user detail page: wallet, agent, ban/unban, impersonation)
 *
 * All copy is config-driven — no hardcoded strings in JSX components.
 *
 * Path: packages/shared/config/i18n/om/admin.js
 */

module.exports = {
  admin: {
    comingSoon: {
      eyebrow: 'Hojii Irra Jira',
      heading: 'Amasumasun kun ijaaramaa jira',
      description:
        'Gareen keenya fuula kanaaf muuxannoo qulqullina qabu hojjechaa jira. Dhiyootti adeemsa uumuu, gulaaluu fi haquu guutuu waliin ni argama.',
      subtitle: 'Amasumasun kun dhiyootti ni dhufa',
      contactSupport: 'Amma kana barbaadda? Deeggarsa quunnami',
      supportEmail: process.env.SUPPORT_EMAIL || 'support@abyssinia-academy.com',
      footerNote: 'Gareen injinariingii irra jira — fuulli kun haaromsa dhufu keessatti ni kaka\'a.',
      defaultTitle: 'Amasumasuun dhiyootti ni dhufa',
      defaultBack: 'Deebi\'i',

      editCourse: 'Koorsii Gulaali',
      addVideo: 'Viidiyoo Dabali',
      editVideo: 'Viidiyoo Gulaali',
      addDiscussion: 'Marii Dabali',
      editDiscussion: 'Marii Gulaali',
      addDiscount: 'Koodii Hir\'isaa Haaraa',
      viewDiscount: 'Bal\'ina Hir\'isaa',
      editDiscount: 'Koodii Hir\'isaa Gulaali',
      viewAdmin: 'Bal\'ina Bulchaa',

      backToCourses: 'Gara Koorsiiwwanii Deebi\'i',
      backToVideos: 'Gara Viidiyoowwanii Deebi\'i',
      backToDiscussions: 'Gara Mariiwwanii Deebi\'i',
      backToDiscounts: 'Gara Hir\'isaawwanii Deebi\'i',
      backToAdmins: 'Gara Bulchitootaa Deebi\'i',
    },

    announcements: {
      navLabel: 'Beeksisawwan',
      pageTitle: 'Beeksisawwan',
      pageSubtitle: 'Ergaawwan gara fayyadamtoota hundaatti, fayyadamtoota galmaa\'aniitti, yookaan fayyadamtoota murtaa\'aniitti tamsaasi',
      backToDashboard: 'Gara Daashboordii Deebi\'i',

      tabCompose: 'Barreessi',
      tabHistory: 'Seenaa',

      audienceLabel: 'Ergi gara',
      audienceAll: 'Fayyadamtoota hunda',
      audienceEnrolled: 'Kan galmaa\'an qofa',
      audienceTargeted: 'Fayyadamtoota murtaa\'an',
      audienceSingle: 'Fayyadamaa tokko',

      targetedLabel: 'Fayyadamtoota filadhu',
      targetedCountSuffix: 'filataman',
      targetedPlaceholder: 'Maqaa, bilbila, yookaan imeeliyidhaan barbaadi…',
      targetedHint: 'Yoo xiqqaate qubee 2 galchi. Bu\'aa kamiyyuu cuqaasi. Fayyadamtoota barbaaddu kamiyyuu filachuu dandeessa.',
      removeUser: 'Fayyadamaa haqi',
      noResults: 'Barbaacha keetiin walsimu fayyadamaan hin jiru',
      noEmail: 'Imeelii hin qabu',

      singlePlaceholder: 'Bilbila yookaan imeelii galchi',
      singleHint: 'Lakkoofsa bilbilaa yookaan teessoo imeelii waliin walsima',

      titleLabel: 'Mata duree',
      titlePlaceholder: 'Fkn., beeksisa eegumsa koorsii haaraa',
      bodyLabel: 'Ergaa',
      bodyPlaceholder: 'Ergaa beeksisa keetii barreessi…',

      severityLabel: 'Cimina',
      severityInfo: 'Odeeffannoo',
      severitySuccess: 'Milkaa\'ina',
      severityWarning: 'Akeekkachiisa',
      severityCritical: 'Baay\'ee cimaa',

      sendBtn: 'Beeksisa Ergi',
      sending: 'Ergamaa jira…',
      cancel: 'Haqi',

      previewLabel: 'Durgoo kallattii',
      previewTitlePlaceholder: 'Mata dureen kee asitti ni mul\'ata',
      previewBodyPlaceholder: 'Ergaan kee asitti ni mul\'ata',
      previewTimeJustNow: 'Amma',
      previewAudienceLabel: 'Dhaggeeffattoota',
      previewSeverityLabel: 'Cimina',
      previewWarning: 'Fudhattoonni hundi beeksisa kana sanduuqa ergaa isaanii keessatti akka beeksisaatti ni fudhatu.',

      confirmTitle: 'Tamsaasa mirkaneessi',
      confirmBody:
        'Beeksisa kana erguu jirta. Gochi kun hin deebi\'u, yeroo tokko ergame booda hin haqamu.',
      confirmInputLabel: 'Mirkaneessuuf SEND barreessi',
      confirmBtn: 'Tamsaasa ergi',

      historyTitle: 'Seenaa tamsaasaa',
      refreshHistory: 'Haaromsi',
      historyEmpty: 'Hanga ammaatti beeksisni hin ergamne.',
      historyLoadFailed: 'Seenaa tamsaasaa fe\'uun hin danda\'amne.',
      historyColWhen: 'Yoom',
      historyColTitle: 'Mata duree',
      historyColAudience: 'Dhaggeeffattoota',
      historyColRecipients: 'Fudhattoota',
      historyColSentBy: 'Kan erge',

      timeJustNow: 'Amma',
      timeMinutesAgo: 'Daqiiqaa {count} dura',
      timeHoursAgo: 'Sa\'aatii {count} dura',
      timeDaysAgo: 'Guyyaa {count} dura',

      successToast: 'Beeksisni fudhattoota {count}tti ergame',
      validationFailed: 'Maaloo dirreewwan barbaachisoo hunda guuti',
      sendFailed: 'Beeksisa erguun hin danda\'amne. Maaloo irra deebi\'ii yaali.',
    },

    /* ── Agent Management ── */
    agentsTitle: 'Bulchiinsa Bakka Bu\'aa',
    agentsSubtitle: 'Hamma komiishinii bakka bu\'aa qindeessi fi raawwii ilaali.',
    agentName: 'Maqaa Bakka Bu\'aa',
    agentCode: 'Koodii Bakka Bu\'aa',
    agentSales: 'Gurgurtaa Waliigalaa',
    agentEarned: 'Galii Waliigalaa',
    commissionType: 'Gosa Komiishinii',
    commissionValue: 'Gatii Komiishinii',
    agentStatus: 'Haala',

    /* ═══════════════════════════════════════════════════════════════════════
       GOD MODE — User Detail Page
       Every string rendered by apps/web/pages/admin/users/[id]/index.jsx
       ═══════════════════════════════════════════════════════════════════════ */
    godMode: {
      /* Page chrome */
      backToUsers: 'Gara Fayyadamtootaa Deebi\'i',
      userDetailsTitle: 'Bal\'ina Fayyadamaa',
      loadingUser: 'Odeeffannoo fayyadamaa fe\'aa jira...',
      userNotFoundTitle: 'Fayyadamaan Hin Argamne',
      userNotFoundSubtitle: 'Fayyadamaan gaafatame hin jiru.',
      unknownUser: 'Hin beekamu',

      /* Header meta */
      joined: 'Kan makame',
      notAvailable: 'Hin jiru',
      emDash: '—',

      /* Status badges */
      statusBanned: 'dhorkame',
      statusEnrolled: 'galmaa\'e',
      statusRegistered: 'galmaa\'e qofa',

      /* Header actions */
      unenroll: 'Galmee irraa baasi',
      markEnrolled: 'Akka Galmaa\'eetti Mallattoo Godhi',

      /* Stats row */
      stats: {
        directReferrals: 'Ergamtoota Kallattii',
        teamSize: 'Guddina Garee',
        payingDirect: 'Kallattii Kaffalaa',
        lifetimeEarned: 'Galii Guutuu Jireenyaa',
      },

      /* Tabs */
      tabs: {
        overview: 'Ilaalcha Waliigalaa',
        walletAndAgent: 'Waaleetii fi Bakka Bu\'aa',
        godMode: 'God Mode',
      },

      /* Overview tab */
      overview: {
        enrollmentHistory: 'Seenaa Galmee',
        noEnrollments: 'Hanga ammaatti galmeen hin jiru.',
        referralHistory: 'Seenaa Ergamtootaa',
        noReferrals: 'Hanga ammaatti ergamtoonni hin jiran.',
        fullCoursePass: 'Paasii Koorsii Guutuu',
        phaseBundle: 'Walitti Qabaa Sadarkaa',
      },

      /* Wallet tab */
      wallet: {
        heading: 'Waaleetii',
        currentBalance: 'Hafteewwan Ammaa',
        totalEarned: 'Galii Waliigalaa',
        totalWithdrawn: 'Baasii Waliigalaa',
        pendingWithdrawal: 'Baasii Eegaa Jiru',
        manualAdjustment: 'Sirreeffama Waaleetii Harkaan',
        adjustmentHint:
          'Lakkoofsi poozatiivii waaleetii ida\'a. Lakkoofsi naagatiivii deebisa. Sirreeffamni ≥ 10,000 Birr mirkaneessuuf ADJUST barreessuu barbaachisa.',
        amountPlaceholder: 'Hamma Birr (fkn., 500 yookaan -500)',
        reasonPlaceholder: 'Sababa (yoo xiqqaate qubee 5 — odiitii keessatti galmeeffama)',
        applyAdjustment: 'Sirreeffama Raawwadhu',
        applying: 'Raawwataa jira...',
        currency: 'Birr',
      },

      /* Agent tab */
      agent: {
        heading: 'Haala Bakka Bu\'aa',
        agentCode: 'Koodii Bakka Bu\'aa',
        commissionType: 'Gosa Komiishinii',
        commissionValue: 'Gatii Komiishinii',
        agentActive: 'Bakka Bu\'aan Socho\'aa',
        yes: 'Eeyyee',
        no: 'Lakki',
        fixedType: 'dhaabbataa',
        percentageType: 'dhibbeentaa',
        overrideHeading: 'Hamma Komiishinii Jijjiiri',
        fixedOption: 'Dhaabbataa (Birr gurgurtaa tokkoof)',
        percentageOption: 'Dhibbeentaa (%)',
        overridePlaceholderFixed: 'fkn., 500',
        overridePlaceholderPercentage: 'fkn., 15',
        overrideRate: 'Hamma Jijjiiri',
        applying: 'Raawwataa jira...',
      },

      /* God Mode tab — impersonation */
      impersonation: {
        heading: 'Fakkeessuu fi Argannoo',
        hint:
          'Liinkii hojii daqiiqaa 5 uuma. Tab haaraa keessatti bana — seesshiniin bulchaa kee akka jirutti hafa.',
        generateLink: 'Liinkii Fakkeessuu Uumi',
        generateReset: 'Liinkii Jijjiirraa Jecha Darbii Uumi',
      },

      /* God Mode tab — manual enrollment */
      manualEnroll: {
        heading: 'Galmee Harkaan',
        hint:
          'Galmee kaffaltii malee argannoo koorsii guutuu kenna. Galmee maallaqa harkaa yookaan barnoota bilisaaf itti fayyadami.',
        reasonPlaceholder: 'Sababa (yoo xiqqaate qubee 5 — odiitii keessatti galmeeffama)',
        button: 'Argannoo Koorsii Guutuu Kenni',
        enrolling: 'Galmeessaa jira...',
      },

      /* God Mode tab — network & account */
      network: {
        heading: 'Neetwoorkii fi Herrega',
        orphanButton: 'Muka MLM irraa Addan Baasi',
      },

      /* Danger zone — ban form */
      ban: {
        heading: 'Kutaa Balaa — Dhorkuu',
        hint:
          'Fayyadamaa dhorka, koodii bakka bu\'aa fi ergamtootaa isaa haqa. Gochi kun odiitii keessatti galmeeffama, deebi\'isuu gocha gadiitiin ni danda\'ama.',
        reasonPlaceholder: 'Sababa dhorkuu (yoo xiqqaate qubee 5)',
        button: 'Fayyadamaa Dhorki',
      },

      /* Danger zone — unban form */
      unban: {
        heading: 'Fayyadamaan amma dhorkameera',
        bannedOnTemplate: 'Guyyaa {date} dhorkame — sababa: {reason}',
        noReason: '—',
        hint:
          'Dhorkuu hiikuun argannoo deebisa, koodii bakka bu\'aa fi ergamtootaa isaa irra deebi\'ee hojiirra oolcha. Kun galmee odiitii keessatti galmeeffama.',
        notePlaceholder: 'Galmee odiitiif yaadannoo filannoo',
        button: 'Fayyadamaa Dhorkuu Hiiki',
        unbanning: 'Dhorkuu hiikkaa jira...',
      },

      /* Toasts */
      toasts: {
        statusUpdated: 'Haalli fayyadamaa haaromfame',
        statusFailed: 'Haala haaromsuun hin danda\'amne',
        impersonationSuccess: 'Liinkiin hojii uumame — tab haaraa keessatti banaa jira',
        impersonationFailed: 'Liinkii fakkeessuu uumuun hin danda\'amne',
        resetSuccess: 'Liinkiin jijjiirraa uumame — tab haaraa keessatti banaa jira',
        resetFailed: 'Liinkii jijjiirraa uumuun hin danda\'amne',
        walletSuccessTemplate: 'Waaleetiin sirreeffame. Hafteewwan haaraa: Birr {balance}',
        walletFailed: 'Waaleetii sirreessuun hin danda\'amne',
        agentOverrideSuccess: 'Hammi bakka bu\'aa milkaa\'inaan jijjiirame',
        agentOverrideFailed: 'Hamma bakka bu\'aa jijjiiruun hin danda\'amne',
        orphanSuccess: 'Fayyadamaan muka MLM irraa addan ba\'e',
        orphanFailed: 'Fayyadamaa addan baasuun hin danda\'amne',
        banSuccess: 'Fayyadamaan milkaa\'inaan dhorkame',
        banFailed: 'Fayyadamaa dhorkuun hin danda\'amne',
        unbanSuccess: 'Fayyadamaan dhorkuu irraa milkaa\'inaan ba\'e',
        unbanFailed: 'Fayyadamaa dhorkuu irraa baasuun hin danda\'amne',
        enrollSuccess: 'Fayyadamaan harkaan galmeeffame',
        enrollFailed: 'Fayyadamaa galmeessuun hin danda\'amne',
        loadError: 'Bal\'ina fayyadamaa fe\'uun hin danda\'amne',
      },
    },
  },
};