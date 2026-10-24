/**
 * @fileoverview Oromo — Landing Page Namespace
 *
 * Complete display text for the landing page including the
 * income-opportunity narrative surfaced in the hero and the
 * income band between hero and pricing.
 *
 * Template variables ({amount}, {total}, {hours}, {minutes}, {percent},
 * {days}, {count}) are resolved at render time from referrals/payments
 * config — never hardcoded into the string.
 *
 * Compliance-safe: no "guaranteed" language, no MLM-risk phrases.
 *
 * Path: packages/shared/config/i18n/om/landing.js
 */
module.exports = {
  nav: {
    overview: 'Ilaalcha Waliigalaa',
    courses: 'Koorsiiwwan',
    earn: 'Galii',
    tuition: 'Kaffaltii Barnootaa',
    contact: 'Nu Qunnamaa',
    portal: 'Portaalii Kutaa Barnootaa',
    signIn: 'Seeni',
    enroll: 'Amma Galmaa\'i',
    logout: 'Ba\'i',
    myProfile: 'Piroofaayilii Koo',
    referralDashboard: 'Daashboordii Ergaa',
  },
  hero: {
    badge: 'Sirna Barnootaa Maastarkilaasii Kallattii Onlaayinii',
    /* Compliance-safe: "While You Study" instead of "Just for Studying" */
    earnBadge: '💰 Galii Yeroo Yeroon - Barachuuf Qofa Kaffalamaa',
    title: 'Misooma Aplikeeshinii Weebii Istakii Guutuu Onlaayiniin Baradhu, Kanaanis Kaffalamni',
    /* Compliance-safe: "transparent payouts" instead of "guaranteed payouts" */
    subtitle: 'Barnoota kee madda galii yeroo yeroon ta\'eetti jijjiiri. Sirna barnootaa kutaa 5 maastarkilaasii kallattii onlaayinii keessatti argadhu, akkasumas dandeettii teeknoolojii kee ol kaasuun kaffaltii ifa ta\'e argadhu.',
    /* Income-focused subline: numbers injected from referrals config */
    incomeSubline:
      'Gurgurtaan mirkanaa\'e hunda networkii kee keessatti sadarkaa 4 keessatti hanga {total} Birrii siif kaffala - sa\'aatii {hours} keessatti Telebirr irraa ba\'i.',
    exploreCourses: 'Koorsiiwwan Ilaali',
    unlockAccess: 'Paasii Guutuu Bani',
    earnCta: 'Akkaataa Itti Argamu Ilaali',
    /* Labels for the floating chips over the IDE card. {amount} is injected. */
    incomeChipLevel1: '+{amount} Birrii · Sadarkaa 1',
    incomeChip5Directs: '+{amount} Birrii · Kallattii 5',
    incomeChipPayout: 'Kaffaltii sa\'aatii {amount}',
  },
  stats: {
    phases: 'Kutaa Barnootaa 5',
    phasesSub: 'Sirna Qophaa\'e',
    weeks: 'Torban 20+',
    weeksSub: 'Afaanii Kallattii Viidiyoo',
    access: '100%',
    accessSub: 'Hayyama YouTube Guutuu',
  },
  statsLabels: [
    'Sirna Qophaa\'e',
    'Afaanii Kallattii Viidiyoo',
    'Hayyama YouTube Guutuu',
    'Gurgurtaa tokkoon tokkoon qoodame',
    'Sirna Kaffaltii',
  ],
  landing: {
    heroVisual: {
      freePreviewLabel: 'DURSA BILISAA',
      previewDetail: 'Kutaa 1 · Torban 1 · Kutaa 01',
      sessions: [
        '01. Ilaalcha Waliigalaa Arkiteekcharii Maamila-Adeemsaa',
        '02. Elementoota Semantikii HTML5 Ibsa',
        '03. Barmoota Gaarii (a11y)',
      ],
    },
    features: {
      sectionTag: 'Maaliif Akademii Abisiiniyaa?',
      heading: 'Injinariingii Softweerii Hojii Qofaaf Qophaa\'e',
      subtitle: 'Beekumsa koodii zeeroo irraa injinariin istakii guutuu hojii qofaaf qophaa\'u ta\'uuf wanti barbaachisu hunda.',
      cards: [
        {
          title: 'Afaanii Kallattii Viidiyoo HD',
          description: 'Yeroo kamiyyuu afaanii kallattii koodii HD qulqullina qabu taphachiisi. Deebisii, saffisi, yookaan mata-duree ulfaataa fedhii keetiin ilaali.',
        },
        {
          title: 'Kuusaa Koodii Dhugaa',
          description: 'Torban tokkoon tokkoon repo GitHub, booilerpleetii, damee furmaataa fi jalqaba hojii dabalatee argadhu.',
        },
        {
          title: 'Hawaasa Gorsaa Dhuunfaa',
          description: 'Garee marii teekniikii Telegram dhuunfaa keenya keessatti barsiisota fi hiriyyoota injinariingii wajjin kallattiin wal qunnami.',
        },
        {
          title: 'Ragaa Dandeettii Mirkanaa\'e',
          description: 'Piroojektii xumuraa kutaa barnootaa 5 kee milkaa\'inaan xumuruu fi gamaaggamuu booda ragaa injinariingii Akademii Abisiiniyaa ofiishiyaalaa argadhu.',
        },
      ],
    },
    howItWorks: {
      sectionTag: 'Akkaataa Itti Hojjetu',
      heading: 'Karaa 5 Sadarkaa Bulchiinsa Softweerii',
      steps: [
        {
          title: 'Galmaa\'i & Kaffaltii Kaffali',
          description: 'Mala kaffaltii naannoo filatamaa (Telebirr, CBE Birr, Ergisa Baankii) filadhu, sekondii 60 keessatti galmee xumuri.',
        },
        {
          title: 'Kutaa Koorsii Bani',
          description: 'Maddoota koorsii fi maastarkilaasii, adda baasii yeroo fi yaadannoo barnootaa qophaa\'e battalumatti argadhu.',
        },
        {
          title: 'Piroojektii Torbanii Ijaari',
          description: 'Agarsiisa koodii qulqulluu hordofi, qabeenya jalqabaa buusi, piroojektii sadarkaa poortfoooliyoo torban torbaniin ijaari.',
        },
        {
          title: 'Eebbaa & Hojii Jalqabi',
          description: 'Piroojektii xumuraa istakii guutuu kee gara serveroota cloud ergi, poortfoooliyoo GitHub kee agarsiisi, hojii softweerii addunyaa argadhu.',
        },
        {
          title: 'Qoodi & Galii Argadhu',
          description: 'Hiriyyoota kee liinkii dhuunfaa keetiin affeeri — isaan kaffaltii barnootaa irraa qusatu, atis gurgurtaa mirkanaa\'e hunda irratti komiishinii fi boonasii argatta.',
        },
      ],
    },
    faq: {
      sectionTag: 'Gaaffii Qabdaa?',
      heading: 'Gaaffiiwwan Yeroo Baay\'ee Gaafataman',
      items: [
        {
          question: 'Galmaa\'uuf muuxannoo sagantaa duraan qabaachuun barbaachisaa dhaa?',
          answer: 'Hin barbaachisu! Kutaan 1 guutummaatti zeeroo irraa ka\'a — mala weebii, HTML5, arkiteekcharii bifa CSS3 fi bu\'uura Git tarkaanfiin tarkaanfiin ni hammata.',
        },
        {
          question: 'Maddoonni koorsii akkamitti hojjetu?',
          answer: 'Yeroo galmaa\'tu, herregni barataa kee liinkii galmee viidiyoo dhuunfaa keenya bana. Yeroo kamiyyuu kompiitara yookaan mobaayila irra afaanii kallattii HD 24/7 taphachiisuu dandeessa.',
        },
        {
          question: 'Akkamitti kaffaluu dandeenya?',
          answer: 'Telebirr, CBE Birr fi Ergisa Baankii fudhanna. Maaloo suuraa mirkaneessaa kaffaltii yookaan lakkoofsa gurgurtaa dhiyeessi. Kaffaltii kee erga mirkaneessine booda hayyama koorsii guutuu argatta.',
        },
        {
          question: 'Portaalii barnootaa hangam argachuu nan danda\'a?',
          answer: 'Hayyama guutuu guyyaa jireenyaa keessan argatta! Afaanii kallattii duraan waraabaman ilaaluu, template koodii buusuu fi haaromsa koorsii gara fuulduraa kaffaltii dabalataa malee argachuu dandeessa.',
        },
        {
          question: 'Kun sirna piraamiidii dhaa?',
          answer: 'Miti. Komiishiniin gurgurtaa koorsii dhugaa mirkanaa\'e irratti qofa kaffalama — walitti qabuu qofa irratti hin kaffalamu. Sarkeettiin sadarkaa 4 irratti daangeffama, kaffaltiin hundi daangaa ji\'aan daangeffama.',
        },
        {
          /* Template variable {hours} injected from referrals config */
          question: 'Galiin koo yoom ba\'uu nan danda\'a?',
          answer: 'Komiishinii fi boonasiin kaffaltii ulaagaa booda guyyaa 7 booda banama. Erga baname booda, ba\'iinsa gaafadhu (xiqqaan 500 Birr), bulchiinsi sa\'aatii {hours} keessatti Telebirr, CBE Birr yookaan ergisa baankiidhaan raawwata.',
        },
        {
          question: 'Galii argachuuf barataa ta\'uun barbaachisaa dhaa?',
          answer: 'Eeyyee. Namni ergaa kennu hundi koodii dhuunfaa qabu barataa galmaa\'e dha. Kun networkiin barattoota dhugaa irratti ijaarame akka ta\'u godha, galmee duwwaa irratti hin ta\'u.',
        },
        {
          question: 'Yoo bittaan ergame deebi\'e maal ta\'a?',
          answer: 'Yoo deebiin guyyaa 7 cufiinsaa keessatti ta\'e, komiishiniin fi boonasiin wal qabatu ofumaan ni deebi\'u. Erga baname booda galii dhaabbataa dha.',
        },
        {
          question: 'Pirograama ergaa irratti hirmaachuun maal kaffala?',
          answer: 'Homaa. Barataa galmaa\'e hundaaf bilisa dha. Koodiin kee yeroo jalqabaa Daashboordii Ergaa kee bantu ofumaan uumama.',
        },
      ],
    },
    cta: {
      heading: 'Hojii Softweerii Kee Jalqabuuf Qophii Dhaa?',
      subtitle: 'Har\'a galmaa\'i koorsiiwwan hunda, kutaa barnootaa 5 qophaa\'an, kuusaa koodii piroojektii buufamaa fi garee gorsaa developparaa Telegram dhuunfaa keenya banuuf.',
      buttonText: 'Har\'a Galmaa\'i & Barachuu Jalqabi',
      earnButtonText: 'Akkaataa Itti Argamu Ilaali',
    },
    earn: {
      eyebrow: 'Baradhu & Galii Argadhu',
      title: 'Beekumsi Kee Ni Kaffala. Dhugaadhumatti.',
      subtitle: 'Liinkii kee qoodi - hiriyyoonni kee galmee isaaniirraa {percent}% hir\'isa argatu, atis gurgurtaa mirkanaa\'e hunda irratti maallaqa dhugaa argatta.',
      step1Title: 'Baradhu',
      step1Desc: 'Galmaa\'i, sirna barnootaa istakii guutuu kutaa 5 keessatti dandeettii argadhu.',
      step2Title: 'Qoodi',
      step2Desc: 'Liinkiin dhuunfaan kee hiriyyootaaf kaffaltii barnootaa irratti hir\'isa battalumatti kenna.',
      /* Template variable {hours} injected from referrals config */
      step3Title: 'Galii Argadhu',
      step3Desc: 'Mirkaneessaa booda sa\'aatii {hours} keessatti Telebirr yookaan CBE Birriidhaan ba\'i.',
      chainTitle: 'Yeroo hiriyyaan tokko bite, namoonni 4 galii argatu',
      chainYou: 'ATI',
      chainNote: 'Gurgurtaa tokkoon tokkoon {total} Birrii qoodame · guyyaa {days} keessatti banama',
      calcTitle: 'Galii kee tilmaami',
      calcDirect: 'Affeerraawwan kallattii',
      calcTeam: 'Affeerraawwan isaanii',
      calcBreakdownTitle: 'Adda baasii komiishinii',
      calcLevelRow: 'Sadarkaa {level}',
      calcBonusesTitle: 'Boonasiiwwan banaman',
      calcNoBonuses: 'Hanga ammaatti guddina kanaan sadarkaan boonasii hin geenye.',
      calcSpeedNote: 'Boonasii saffisaa (ji\'aan): hanga {amount} Birrii yoo kallattiin {count} ji\'a tokko keessatti kaffalan.',
      calcCommissions: 'Komiishiniiwwan',
      calcBonuses: 'Boonasiiwwan',
      calcTotal: 'Galii waliigalaa',
      calcCta: 'Liinkii Ergaa Koo Argadhu',
      calcDisclaimer: 'Komiishiniin gurgurtaa koorsii mirkanaa\'e qofa irratti hojiirra oola.',
      calcPresetsTitle: 'Qindaa\'ina saffisaa',
      calcPresetStarter: 'Jalqabaa',
      calcPresetBuilder: 'Ijaaraa',
      calcPresetPro: 'Piroofeshinaal',
      calcPresetArmy: 'Waraana',
      calcNetworkChip: 'network: {count}',
      calcDetailsToggle: 'Herrega guutuu agarsiisi',
      calcDetailsToggleOpen: 'Herrega guutuu dhoksi',
      bonusChipsTitle: 'Sadarkaa boonasii',
      trustTitle: 'Taphni Haqa Qabeessa. Ifa Ta\'ina Guutuu.',
      trust1Title: 'Gurgurtaa dhugaa qofa',
      trust1Desc: 'Komiishiniin kaffaltii koorsii mirkanaa\'e irratti ka\'a, galmee irratti gonkumaa hin ka\'u.',
      trust2Title: 'Eegumsa guyyaa 7',
      trust2Desc: 'Galiin hundi guyyaa 7f cufama — sirnaan deebisuu irraa nagaa dha.',
      trust3Title: 'Daangaa ji\'aa',
      trust3Desc: 'Daangaan fayyadamaa fi dirree waliigalaa sirni kun itti fufiinsa qabaachuu akka danda\'u godha.',
      trust4Title: 'Of-erguu hin jiru',
      trust4Desc: 'Nama tokko, koodii tokko. Networkii taphatuun dhorkaa dha.',
      payoutTitle: 'Kaffaltiiwwan',
      payoutNote: 'raawwatama ≤ sa\'aatii {hours}',
      rail: {
        ariaLabel: 'Paanaalii cinaa galii',
        nextTierTitle: 'Boonasiin itti aanu naannoo dhihoo',
        nextTierEmpty: 'Boonasiiwwan jireenyaa hunda geenye — boonasii saffisaaf networkii kee guddisi.',
        nextTierRemaining: 'dabalata {n}',
        payoutTitle: 'Akkamitti kaffaltiin yaa\'u',
        payoutStep1: 'Hiriyyaan galmaa\'a',
        payoutStep1Desc: 'Gurgurtaan Telebirr, CBE Birr yookaan ergisa baankiidhaan mirkanaa\'a.',
        payoutStep2: 'Guyyaa {days} cufame',
        payoutStep2Desc: 'Yeroo deebisuu irraa nagaa — yoo deebi\'e ofumaan ni deebi\'a.',
        payoutStep3: 'Ba\'i',
        payoutStep3Desc: 'Ba\'iinsa gaafadhu — sa\'aatii {hours} keessatti raawwatama.',
      },
    },
    socialProof: {
      paid: 'barattootaaf kaffalame',
      referrers: 'ergitoota socho\'aa',
      refs: 'ergaa',
    },
    /* ── Income Band — 3-card opportunity strip ──
     * Unit labels are resolved per card; titles/descriptions use
     * {amount} placeholders injected from referrals config.
     */
    income: {
      eyebrow: 'Carraa',
      title: 'Barnootni Kee Madda Galii Dha',
      subtitle: 'Yeroo ati galmaa\'tu irraa kaasee, dirreen kun hiriyyaa tokkoon tokkoon ati fidduuf siif kaffala — utuu barachaa jirtu.',
      card1Title: 'Gurgurtaa tokkoon tokkoon galii argadhu',
      card1Desc: 'Gurgurtaan koorsii mirkanaa\'e hundi hanga {amount} Birrii kaffala, sadarkaa 4 networkii kee keessatti qoodame.',
      card1Unit: 'gurgurtaa mirkanaa\'e tokkoon tokkoon',
      card2Title: 'Boonasiiwwan walitti qabi',
      card2Desc: 'Sadarkaa ga\'i, ulfina ol ka\'i, garee kee guddisi — hanga {amount} Birrii boonasii sadarkaa tokkoon tokkoon argadhu.',
      card2Unit: 'boonasii sadarkaa ol\'aanaa',
      card3Title: 'Saffisaan ba\'i',
      card3Desc: 'Galii baname gara Telebirr yookaan CBE Birr sa\'aatii {amount} keessatti ba\'i — bulchiinsi mirkaneesse, giddu-galeessa hin qabu.',
      card3Unit: 'sirna kaffaltii',
      cta: 'Injinii Galii Guutuu Ilaali',
    },
  },
  pricingOverview: {
    eyebrow: 'Kaffaltii Barnootaa',
    title: 'Gatii Salphaa, Ifa Ta\'e',
    subtitle: 'Gatii tokko. Hayyama jireenyaa. Kaffaltii dhokataa hin qabu.',
    bestValue: 'GATII GAARII',
    fullCourseTitle: 'Paasii Akademii Guutuu',
    perPhaseTitle: 'Karaa Kee Ijaari',
    perPhase: 'kutaa barnootaa',
    savePercent: '{percent}% Qusadhu',
    referralHint: 'Koodii hiriyyaa qabdaa? Kaffaltii irratti {percent}% qusadhu.',
    featureAllPhases: 'Kutaa barnootaa 5 qophaa\'an hunda',
    featureLifetime: 'Hayyama jireenyaa',
    featureCertificate: 'Waraqaa ragaa xumuraa',
    featureCommunity: 'Hawaasa Telegram dhuunfaa',
    enrollCta: 'Amma Galmaa\'i',
    browsePhases: 'Kutaa Barnootaa Ilaali',
    bulkDiscounts: 'Hir\'isa Baay\'ee',
    phases: 'kutaa barnootaa',
    off: 'hir\'isaa',
  },
  phaseTimeline: {
    eyebrow: 'Sirna Barnootaa',
    title: 'Imala Injinariingii Kee',
    subtitle: 'Kutaa barnootaa 5. Zeeroo irraa hanga injinariin istakii guutuu ramadame.',
    classes: 'kutaalee barnootaa',
    viewDetails: 'Ibsa Kutaa Barnootaa Ilaali',
    enrollCta: 'Koorsii Guutuu Keessatti Galmaa\'i',
  },
  discussions: {
    eyebrow: 'Kutaa Barnootaa Keessatti',
    title: 'Marii Kallattii & Gaffii-Deebii',
    subtitle: 'Marii dhugaa. Gorsa dhugaa. Hawaasa dhugaa.',
  },
  rewards: {
    eyebrow: 'Qusadhu & Galii Argadhu',
    title: 'Baay\'ee Qusadhu, Baay\'ee Argadhu',
    subtitle: 'Kaffaltiin barnootaa kee hir\'isa, galiin kee immoo dabala — yeroo nama tokko liinkii keetiin makamu hunda.',
    discountTitle: 'Hir\'isaawwan Battalumaa',
    discountDesc: 'Kaffaltii irratti koodii beeberaa hojiirra oolchiitii galmee keetti qusannoo battalumaa argadhu.',
    discountCta: 'Dabalata Baradhu',
    referralTitle: 'Ergaa Maallaqaa',
    referralDesc: 'Liinkii kee qoodi — hiriyyoonni kee {percent}% qusatu, atis gurgurtaa mirkanaa\'e hunda irratti Birrii dhugaa argatta.',
    referralCta: 'Galii Argachuu Jalqabi',
    commissionTitle: 'Komiishiniiwwan Sadarkaa 4',
    commissionDesc: 'Gurgurtaa koorsii networkii kee keessa jiru hunda irratti hanga {amount} Birrii sadarkaa 4 keessatti qoodame argadhu.',
    commissionCta: 'Sadarkaa Ilaali',
  },
};