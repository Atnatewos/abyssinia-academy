/**
 * @fileoverview Afaan Oromoo — Admin Namespace
 *
 * Contains admin-specific UI copy including:
 *   - Sidebar navigation (chrome, sections, items, accessibility)
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
    /* ── NAVIGATION ── */
    nav: {
      panelSuffix: 'Paanaalii Bulchiinsaa',
      viewSite: 'Marsariitii Ilaali',
      logout: "Ba'i",

      sections: {
        main: 'Ijoo',
        management: 'Bulchiinsa',
        programs: 'Sagantaawwan',
        marketing: 'Maarkeetingii',
        insights: 'Hubannoo',
        system: 'Sirna',
      },

      dashboard: 'Daashboordii',
      payments: 'Kaffaltiiwwan',
      students: 'Barattoota',
      resellers: 'Gurgurtoota Deebisanii',
      mlmTree: 'Raadaarii Noodee Neetwoorkii',
      discussions: 'Mariiwwan',
      courseVideos: 'Viidiyoowwan Koorsii',
      analytics: 'Xiinxala',
      audit: 'Galmee Odiitii',
      settings: "Qindaa'inoota",
      admins: 'Herregoota Bulchaa',

      a11y: {
        openSidebar: 'Baraa cinaa bani',
        closeSidebar: 'Baraa cinaa cufi',
        languageToggle: 'Afaan ammaa: {language}. Afaan jijjiiruuf cuqaasi.',
      },
    },


    common: {
      actions: {
        save: 'Jijjiirama Olkaa\'i',
        saving: 'Olkaa\'aa jira...',
        cancel: 'Haqi',
        close: 'Cufi',
        delete: 'Haqi',
        edit: 'Gulaali',
        view: 'Bal\'ina Ilaali',
        create: 'Uumi',
        refresh: 'Haaromsi',
        retry: 'Irra deebi\'ii yaali',
        export: 'Ergi',
        search: 'Barbaadi',
        back: 'Deebi\'i',
        confirm: 'Mirkaneessi',
        apply: 'Raawwadhu',
        reset: 'Deebisi',
        copy: 'Garagalchi',
        copied: 'Garagalameera!',
      },
      filters: {
        all: 'Hunda',
        allStatuses: 'Haala Hunda',
        allRoles: 'Gahee Hunda',
        status: 'Haala',
        role: 'Gahee',
      },
      statuses: {
        active: 'Socho\'aa',
        inactive: 'Socho\'aa hin taane',
        pending: 'Eegaa jira',
        approved: 'Ragga\'e',
        rejected: 'Didame',
        enrolled: 'Galmaa\'e',
        registered: 'Galmaa\'e qofa',
        banned: 'Dhorkame',
        suspended: 'Dhaabbate',
        paused: 'Dhaabbate',
        disabled: 'Dhaamsame',
        expired: 'Yeroon darbe',
        published: 'Maxxanfame',
        draft: 'Brouillon',
        paid: 'Kaffalame',
        locked: 'Cufame',
      },
      pagination: {
        page: 'Fuula {page} kan {total}',
        previous: 'Fuula duraa',
        next: 'Fuula itti aanu',
        showing: '{count} kan {total} agarsiisaa',
      },
      empty: {
        title: 'Hanga ammaatti homaa hin jiru',
        filtered: 'Bu\'aan filtarii keetiin walsimu hin jiru.',
        description: 'Barbaacha yookaan filtarii kee sirreessi.',
      },
      toasts: {
        loadFailed: 'Odeeffannoo fe\'uun hin milkaa\'ine. Maaloo irra deebi\'ii yaali.',
        saved: 'Jijjiiramni milkaa\'inaan olkaa\'ame.',
        saveFailed: 'Jijjiirama olkaa\'uun hin milkaa\'ine.',
        deleted: 'Milkaa\'inaan haqame.',
        deleteFailed: 'Haquun hin milkaa\'ine.',
        actionFailed: 'Gochi hin milkaa\'ine. Maaloo irra deebi\'ii yaali.',
        copied: 'Gabatee irratti garagalame.',
        reset: 'Gara jalqabaatti deebi\'e.',
        resetFailed: 'Deebisuun hin milkaa\'ine.',
      },
      confirm: {
        deleteTitle: 'Wanticha kana haquu?',
        deleteMessage: 'Gochi kun hin deebi\'u.',
        unsavedTitle: 'Jijjiirama hin olkaa\'amne balleessuu?',
        unsavedMessage: 'Gulaalli kee ni bada.',
      },
      labels: {
        createdAt: 'Kan uumame',
        updatedAt: 'Kan haaromfame',
        joined: 'Kan makame',
        lastActive: 'Yeroo dhuma socho\'e',
        amount: 'Hamma',
        method: 'Mala',
        reference: 'Wabii',
        phone: 'Bilbila',
        email: 'Imeelii',
        name: 'Maqaa',
        notAvailable: 'Hin jiru',
        emDash: '—',
        currency: 'Birr',
      },
    },


    dashboard: {
      title: 'Daashboordii',
      subtitle: 'Ilaalcha waliigalaa fi safartuuwwan ijoo',
      stats: {
        totalStudents: 'Barattoota Waliigalaa',
        totalRevenue: 'Galii Waliigalaa',
        activeCourses: 'Koorsiiwwan Socho\'oo',
        pendingPayments: 'Kaffaltiiwwan Eegaa Jiran',
      },
      recentPayments: 'Kaffaltiiwwan Dhiyoo Eegaa Jiran',
      topReferrers: 'Ergamtoota Filatamoo',
      viewAll: 'Hunda Ilaali',
      noPendingPayments: 'Kaffaltiin eegaa jiru hin jiru',
      noReferrers: 'Hanga ammaatti odeeffannoon ergamtootaa hin jiru',
      referralsCount: 'Ergamtoota {count}',
      loadFailed: 'Odeeffannoo daashboordii fe\'uun hin milkaa\'ine.',
    },

    users: {
      title: 'Bulchiinsa Fayyadamtootaa',
      subtitle: 'Fayyadamtoota marsariitii hunda ilaali fi bulchi',
      searchPlaceholder: 'Maqaa, imeelii yookaan bilbilaan barbaadi...',
      filters: {
        allRoles: 'Gahee Hunda',
        students: 'Barattoota',
        referrers: 'Ergamtoota',
        enrolled: 'Galmaa\'an',
        registered: 'Galmaa\'an qofa',
        banned: 'Dhorkaman',
      },
      meta: {
        phone: 'Bilbila',
        joined: 'Kan makame',
        referrals: 'Ergamtoota',
        lastActive: 'Yeroo dhuma socho\'e',
      },
      emptyTitle: 'Fayyadamaan hin argamne',
      emptyFiltered: 'Fayyadamaan filtarii keetiin walsimu hin jiru.',
      viewDetails: 'Bal\'ina ilaali',
      loadFailed: 'Fayyadamtoota fe\'uun hin milkaa\'ine',
    },

    payments: {
      title: 'Bulchiinsa Kaffaltii',
      subtitle: 'Kaffaltii barattootaa gamaggami, raggaasi fi bulchi',
      tabs: {
        all: 'Kaffaltii Hunda',
        pending: 'Eegaa jira',
        approved: 'Ragga\'e',
        rejected: 'Didame',
      },
      searchPlaceholder: 'Maqaa, bilbila yookaan wabiidhaan barbaadi...',
      export: 'Ergi',
      copy: 'Garagalchi',
      reference: 'Wabii',
      viewDetails: 'Bal\'ina Ilaali',
      approve: 'Raggaasi',
      reject: 'Didi',
      emptyTitle: 'Kaffaltiin hin argamne',
      emptyFiltered: 'Kaffaltiin barbaacha keetiin walsimu hin jiru.',
      loadFailed: 'Kaffaltiiwwan fe\'uun hin milkaa\'ine',
      approveSuccess: 'Kaffaltiin milkaa\'inaan ragga\'e',
      rejectSuccess: 'Kaffaltiin milkaa\'inaan didame',
      actionFailed: 'Kaffaltii raawwachuun hin milkaa\'ine',
      confirmApproveTitle: 'Kaffaltii kana raggaasuu?',
      confirmApproveMessage: 'Barataan battalumatti argannoo koorsii argata.',
      confirmRejectTitle: 'Kaffaltii kana diduu?',
      confirmRejectMessage: 'Barataan kaffaltiin isaa fudhatama akka hin arganne beeksifama.',
    },

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

        login: {
      pageTitle: 'Seensa Bulchaa',
      heading: 'Seensa Bulchaa',
      subtitle: 'Paanaalii Bulchiinsa Abyssinia Academy',
      usernameLabel: 'Maqaa fayyadamaa',
      passwordLabel: 'Jecha darbii',
      showPassword: 'Jecha darbii agarsiisi',
      hidePassword: 'Jecha darbii dhoksi',
      submit: 'Seeni',
      submitting: 'Seenaa jira...',
      success: 'Seensi bulchaa milkaa\'e.',
      invalidCredentials: 'Seenuun hin milkaa\'ine. Odeeffannoo dogoggoraa.',
      requiredFields: 'Maaloo dirreewwan hunda guuti.',
      tooLong: 'Dheerinni odeeffannoo daangaa darbeera.',
    },

    settings: {
      pageTitle: 'Qindaa\'inoota',
      pageSubtitle: 'Qindaa\'ina gatii fi kaffaltii',
      tabPricing: 'Gatii',
      tabMethods: 'Herregoota Baankii',
      save: 'Jijjiirama Olkaa\'i',
      saving: 'Olkaa\'aa jira...',
      reset: 'Deebisi',
      resetConfirmTitle: 'Kutaa kana deebisuu?',
      resetConfirmMessage:
        'Jijjiiramni olkaa\'ame ni haqama, qindaa\'inni waliigalaa ammoo madda ijoo ta\'a.',
      resetConfirmAction: 'Gara jalqabaatti deebisi',
      pricing: {
        fullCourse: 'Gatii Koorsii Guutuu',
        perPhase: 'Gatii Sadarkaa Tokkoo',
        currentPrice: 'Gatii Ammaa (Birr)',
        originalPrice: 'Gatii Jalqabaa (Birr)',
        currentDiscount: 'Hir\'isa ammaa:',
        bulkTiers: 'Sadarkaawwan Hir\'isa Walitti Qabaa',
        phasesLabel: 'Sadarkaawwan',
        phasesArrow: 'sadarkaawwan →',
        percentLabel: 'Dhibbeentaa hir\'isaa',
        percentSuffix: '% hir\'isa',
        addTier: 'Sadarkaa Dabali',
        removeTier: 'Sadarkaa haqi',
      },
      methods: {
        heading: 'Mala Kaffaltii',
        active: 'Socho\'aa',
        inactive: 'Socho\'aa hin taane',
        accountNumber: 'Lakkoofsa Herregaa',
        accountName: 'Maqaa Herregaa',
        bankName: 'Maqaa Baankii',
      },
      toasts: {
        saved: 'Qindaa\'inoonni olkaa\'aman. Jijjiiramni fuula gatii irratti kallattiidha.',
        saveFailed: 'Qindaa\'inoota olkaa\'uun hin milkaa\'ine.',
        reset: 'Gara qindaa\'ina jalqabaatti deebi\'e.',
        resetFailed: 'Deebisuun hin milkaa\'ine.',
        loadFailed: 'Qindaa\'inoota fe\'uun hin milkaa\'ine.',
      },
    },

    discounts: {
      pageSubtitle: 'Koodiiwwan hir\'isa beeksisaa uumi fi bulchi',
      searchPlaceholder: 'Koodii yookaan ibsaan barbaadi...',
      generateBtn: 'Koodii Haaraa Uumi',
      regenerate: 'Irra deebi\'ii uumi',
      filterAll: 'Hunda',
      filterExpired: 'Yeroon darbe',
      emptyFiltered: 'Koodiin filtarii keetiin walsimu hin jiru.',
      emptyAll: 'Hanga ammaatti koodiin hir\'isaa hin jiru. Kan jalqabaa uumi!',
      minPurchase: 'Bitaa xiqqaa',
      saveFailed: 'Olkaa\'uun hin milkaa\'ine.',
      deleteFailed: 'Haquun hin milkaa\'ine.',
      deleteConfirmTitle: 'Koodii hir\'isa kana haquu?',
      deleteConfirmMessage:
        'Koodiin battalumatti hojjechuu dhaaba. Seenaan fayyadamaa odiitiif ni eegama.',
      eligibility: {
        fullCourseOnly: 'Koorsii Guutuu Qofa',
        phasesTemplate: 'Sadarkaawwan: {list}',
        fullCourseAndPhasesTemplate: 'Koorsii Guutuu + Sadarkaawwan {list}',
        allPurchases: 'Bitaa Hunda',
      },
    },

    paymentDetail: {
      title: 'Bal\'ina Kaffaltii',
      student: 'Barataa',
      phone: 'Bilbila',
      email: 'Imeelii',
      amount: 'Hamma',
      method: 'Mala',
      reference: 'Wabii',
      submitted: 'Kan dhiyaate',
      status: 'Haala',
      course: 'Koorsii',
      screenshot: 'Iskiriinii Kaffaltii',
      viewFullSize: 'Guddina guutuu ilaali',
      noScreenshot: 'Iskiriiniin hin fe\'amne',
      discountBreakdown: 'Bal\'ina Hir\'isaa',
      baseAmount: 'Hamma Bu\'uuraa',
      referralDiscount: 'Hir\'isa Ergamtootaa',
      codeDiscount: 'Koodii Hir\'isaa',
      creditApplied: 'Kireediitii Raawwate',
      finalAmount: 'Hamma Dhumaa',
      close: 'Cufi',
    },
  },
};