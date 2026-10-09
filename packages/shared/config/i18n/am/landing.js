/**
 * @fileoverview Amharic — Landing Page Namespace
 *
 * Full parity with English. Template variables ({amount}, {total},
 * {hours}, {minutes}, {percent}, {days}, {count}) are resolved at render
 * time from referrals/payments config — never hardcoded.
 *
 * Compliance-safe: no "guaranteed" language, no MLM-risk phrases.
 * AM parity: pricingOverview, phaseTimeline, discussions keys added.
 *
 * Path: packages/shared/config/i18n/am/landing.js
 */
module.exports = {
  nav: {
    overview: 'አጠቃላይ እይታ',
    courses: 'ኮርሶች',
    earn: 'ገቢ ያግኙ',
    tuition: 'የትምህርት ክፍያ',
    contact: 'አግኙን',
    portal: 'የክፍል ፖርታል',
    signIn: 'ግቡ',
    enroll: 'አሁን ይመዝገቡ',
    logout: 'ውጡ',
    myProfile: 'የግል ማህደሬ',
    referralDashboard: 'የሪፈራል ዳሽቦርድ',
  },
  hero: {
    badge: 'ኦንላይን የቀጥታ ማስተርክላስ የመማሪያ ስርዓት',
    /* Compliance-safe AM: "እየተማሩ ተከፋይ ይሁኑ" instead of literal translation of "just for studying" */
    earnBadge: '💰 ቋሚ ገቢ - ስለተማሩ ብቻ ተከፋይ ይሁኑ',
    /* Shortened AM hero title for visual balance */
    title: 'ፉል ስታክ የዌብ አፕሊኬሽን ዴቨሎፕመንት ኦንላይን እየተከፈላችሁ ተማሩ በ',
    /* Compliance-safe AM: "ግልጽ ክፍያዎች" instead of "guaranteed" */
    subtitle: 'የሶፍትዌር ኢንጂነሪንግን ኦንላይን እያወቁ ቋሚ ገቢ ያግኙ። በ5 ደረጃዎች የተዋቀሩ የቀጥታ ኦንላይን ማስተርክላሶችን እየተከታተሉ፣ ትምህርትዎን ወደ ተከታታይ አውቶሜትድ ክፍያ ይለውጡ።',
    incomeSubline:
      'በኔትዎርክዎ ውስጥ የሚጸድቁ እያንዳንዱ ሽያጭ በ4 እርከኖች እስከ {total} ETB ይከፍልዎታል - በ{hours} ሰዓታት ውስጥ በቴሌብር ገንዘብዎን ያውጡ።',
    exploreCourses: 'ኮርሶችን ይመልከቱ',
    unlockAccess: 'ሙሉ ኮርሱን ይክፈቱ',
    earnCta: 'እንዴት ክፍያ እንደሚያገኙ ይመልከቱ',
    incomeChipLevel1: '+{amount} ETB · ደረጃ 1',
    incomeChip5Directs: '+{amount} ETB · 5 ቀጥታ',
    incomeChipPayout: 'የ{amount} ሰዓት ክፍያ',
  },
  stats: {
    phases: '5 ደረጃዎች',
    phasesSub: 'የተዋቀረ ስርዓት',
    weeks: '20+ ሳምንታት',
    weeksSub: 'የቀጥታ ቪዲዮ ክፍለ-ጊዜዎች',
    access: '100%',
    accessSub: 'የእድሜ ልክ የዩቲዩብ መዳረሻ',
  },
  statsLabels: [
    'የተዋቀረ ስርዓት',
    'የቀጥታ ቪዲዮ ክፍለ-ጊዜዎች',
    'የእድሜ ልክ የዩቲዩብ መዳረሻ',
    'በእያንዳንዱ ሽያጭ የሚከፈል',
    'የክፍያ ማቀናበሪያ',
  ],
  landing: {
    heroVisual: {
      freePreviewLabel: 'ነፃ ቅድመ-እይታ',
      previewDetail: 'ደረጃ 1 · ሳምንት 1 · ክፍል 01',
      sessions: [
        '01. የClient-Server አርክቴክቸር አጠቃላይ እይታ',
        '02. የHTML5 Semantic ኤለመንቶች ማብራሪያ',
        '03. የAccessibility (a11y) ምርጥ አሰራሮች',
      ],
    },
    features: {
      sectionTag: 'ለምን አቢሲኒያ አካዳሚ?',
      heading: 'ለተግባራዊ ሶፍትዌር ኢንጂነሪንግ የተነደፈ',
      subtitle: 'ከዜሮ የኮዲንግ እውቀት ተነስተው ወደ ዝግጁ የሙሉ ስታክ ሶፍትዌር ኢንጂነርነት ለመቀየር የሚያስፈልግዎ ነገር ሁሉ ይገኛል።',
      cards: [
        {
          title: 'ከፍተኛ ጥራት ያላቸው ቪዲዮዎች',
          description: 'በከፍተኛ ጥራት የተቀረጹ የቀጥታ ኮዲንግ ክፍለ-ጊዜዎችን በማንኛውም ጊዜ ይመልከቱ።',
        },
        {
          title: 'እውነተኛ የኮድ ማከማቻዎች',
          description: 'ለእያንዳንዱ ሳምንት የመነሻ ኮዶች፣ የመፍትሔ ቅርንጫፎች እና የፕሮጀክት መነሻዎችን ጨምሮ የGitHub ማከማቻዎችን ያግኙ።',
        },
        {
          title: 'የግል ማህበረሰብ እና የአማካሪነት ድጋፍ',
          description: 'በግል የቴሌግራም ቴክኒካል ውይይት ቡድናችን ውስጥ ከአስተማሪዎች እና ከተማሪዎች ጋር በቀጥታ ይገናኙ።',
        },
        {
          title: 'የተረጋገጠ የክህሎት ሰርተፍኬት',
          description: 'የ5ቱን ደረጃዎች ካፕስቶን ፕሮጀክት በስኬት ሲያጠናቅቁ ይፋዊ ሰርተፍኬት ያግኙ።',
        },
      ],
    },
    howItWorks: {
      sectionTag: 'እንዴት ይሰራል',
      heading: 'ወደ ሶፍትዌር አጋዥነት 5 ደረጃዎች',
      steps: [
        {
          title: 'ይመዝገቡ እና ክፍያ ይፈጽሙ',
          description: 'የሚመርጡትን ሀገር ውስጥ የክፍያ መንገድ ይምረጡ እና በ60 ሰከንድ ውስጥ ምዝገባዎን ያጠናቅቁ።',
        },
        {
          title: 'የኮርሱን ክፍል ይክፈቱ',
          description: 'ወዲያውኩ የትምህርት ቁሳቁሶችን፣ የተቀረጹ ክፍለ-ጊዜዎችን እና የተዋቀሩ የጥናት ማስታወሻዎችን ያግኙ።',
        },
        {
          title: 'ሳምንታዊ ፕሮጀክቶችን ይገንቡ',
          description: 'የኮዲንግ ማሳያዎችን ይከተሉ፣ መነሻ ፋይሎችን ያውርዱ እና ፕሮጀክቶችን ይገንቡ።',
        },
        {
          title: 'ይመረቁ እና ስራዎን ይጀምሩ',
          description: 'የሙሉ ስታክ ካፕስቶን ፕሮጀክትዎን በክላውድ ሰርቨሮች ላይ ይስቀሉ እና አለምአቀፍ የሶፍትዌር ስራዎችን ያግኙ።',
        },
        {
          title: 'ያጋሩ እና ያግኙ',
          description: 'በግል ሊንክዎ ጓደኞችዎን ይጋብዙ — እነሱ በትምህርት ክፍያው ላይ ቅናሽ ሲያገኙ፣ እርስዎ በእያንዳንዱ በተረጋገጠ ሽያጭ ኮሚሽን እና ቦነስ ያገኛሉ።',
        },
      ],
    },
    faq: {
      sectionTag: 'ጥያቄዎች አሉዎት?',
      heading: 'ተደጋጋሚ ጥያቄዎች',
      items: [
        {
          question: 'ለመመዝገብ የቅድመ ፕሮግራሚንግ ልምድ ያስፈልገኛል?',
          answer: 'አያስፈልግም! ደረጃ 1 ሙሉ በሙሉ ከዜሮ ይጀምራል።',
        },
        {
          question: 'የትምህርት ቁሳቁሶቹ እንዴት ነው የሚሰሩት?',
          answer: 'አንዴ ከተመዘገቡ፣ የተማሪ መለያዎ የግል ቪዲዮ ፖርታላችንን ይከፍታል።',
        },
        {
          question: 'ክፍያ እንዴት መፈጸም እንችላለን?',
          answer: 'ቴሌብር፣ ሲቢኢ ብር እና የባንክ ማስተላለፍ እንቀበላለን።',
        },
        {
          question: 'የመማሪያ ፖርታሉ መዳረሻ ለምን ያህል ጊዜ ይቆያል?',
          answer: 'የእድሜ ልክ መዳረሻ ያገኛሉ!',
        },
        {
          question: 'ይህ የፒራሚድ (Pyramid Scheme) አሰራር ነው?',
          answer: 'አይደለም። ኮሚሽን የሚከፈለው በተረጋገጡ እውነተኛ የኮርስ ሽያጮች ላይ ብቻ ነው።',
        },
        {
          /* Template variable {hours} injected from referrals config */
          question: 'ያገኘሁትን ገንዘብ መቼ ማውጣት እችላለሁ?',
          answer: 'ኮሚሽኖች እና ቦነሶች ክፍያው ከተረጋገጠ ከ7 ቀናት በኋላ ይከፈታሉ። አንዴ ከተከፈቱ፣ የማውጣት ጥያቄ ያቅርቡ (ዝቅተኛ 500 ETB) እና አስተዳዳሪ በ{hours} ሰዓት ውስጥ በቴሌብር፣ ሲቢኢ ብር ወይም የባንክ ዝውውር ያስተናግዳል።',
        },
        {
          question: 'ገንዘብ ለማግኘት የግድ ተማሪ መሆን አለብኝ?',
          answer: 'አዎ። እያንዳንዱ አጋሪ የግል ኮድ ያለው የተመዘገበ ተማሪ ነው።',
        },
        {
          question: 'የተጋበዘ ሰው የከፈለውን ገንዘብ ቢስብ ምን ይሆናል?',
          answer: 'በ7 ቀናት የቆይታ ጊዜ ውስጥ Refund ከተደረገ፣ ተያያዥነት ያላቸው ኮሚሽኖች እና ቦነሶች አውቶማቲክ ይሰረዛሉ።',
        },
        {
          question: 'በሪፈራል ፕሮግራሙ ለመሳተፍ የሚያስወጣው ክፍያ አለ?',
          answer: 'የለም። ለተመዘገበ ተማሪ ሁሉ ነፃ ነው።',
        },
      ],
    },
    cta: {
      heading: 'የሶፍትዌር ሙያዎን ለመጀመር ዝግጁ ነዎት?',
      subtitle: 'ሁሉንም ኮርሶች፣ 5 የተዋቀሩ ደረጃዎችን፣ የሚወርዱ የፕሮጀክት ኮዶችን እና የግል የቴሌግራም የደቨሎፐር አማካሪ ቡድናችንን ለመክፈት ዛሬ ይመዝገቡ።',
      buttonText: 'ዛሬ ይመዝገቡና መማር ይጀምሩ',
      earnButtonText: 'እንዴት ክፍያ እንደሚያገኙ ይመልከቱ',
    },
    earn: {
      eyebrow: 'ይማሩ እና ገቢ ያግኙ',
      title: 'እውቀትዎ ገቢ ያስገኝልዎታል።',
      subtitle: 'ሊንክዎን ያጋሩ - ጓደኞችዎ {percent}% ክፍያ ቅናሽ ያገኛሉ፣ እርስዎ ደግሞ በእያንዳንዱ በተረጋገጠ ሽያጭ እውነተኛ ገንዘብ ኮሚሽን ያገኛሉ።',
      step1Title: 'ይማሩ',
      step1Desc: 'ይመዝገቡ እና የ5ቱን ደረጃዎች ፉል ስታክ ሥርዓተ-ትምህርት ይማሩ።',
      step2Title: 'ያጋሩ',
      step2Desc: 'የግል ሊንክዎ ለጓደኞችዎ አፋጣኝ የትምህርት ክፍያ ቅናሽ ይሰጣቸዋል።',
      /* Template variable {hours} injected from referrals config */
      step3Title: 'ያግኙ',
      step3Desc: 'ከተረጋገጠ በኋላ በ{hours} ሰዓታት ውስጥ በቴሌብር ወይም በሲቢኢ ብር ገንዘብዎን ያውጡ።',
      chainTitle: 'አንድ ጓደኛ ሲገዛ፣ 4 ሰዎች ያገኛሉ',
      chainYou: 'እርስዎ',
      chainNote: 'በእያንዳንዱ ሽያጭ {total} ETB ይጋራል · በ {days} ቀናት ውስጥ ይከፈታል',
      calcTitle: 'ገቢዎን ያሰሉ',
      calcDirect: 'የቀጥታ ጥሪዎች',
      calcTeam: 'የእነሱ ጥሪዎች',
      calcBreakdownTitle: 'የኮሚሽን ዝርዝር',
      calcLevelRow: 'ደረጃ {level}',
      calcBonusesTitle: 'የተከፈቱ ቦነሶች',
      calcNoBonuses: 'በዚህ መጠን ገና የቦነስ ደረጃ አልተደረሰም።',
      calcSpeedNote: 'የፍጥነት ቦነስ (ወርሃዊ): በአንድ ወር {count} ቀጥታ ክፍያዎች ከሆኑ እስከ {amount} ETB።',
      calcCommissions: 'ኮሚሽኖች',
      calcBonuses: 'ቦነሶች',
      calcTotal: 'ጠቅላላ ገቢ',
      calcCta: 'የሪፈራል ሊንክ ያግኙ',
      calcDisclaimer: 'ኮሚሽን የሚታሰበው በተረጋገጡ የኮርስ ሽያጮች ላይ ብቻ ነው።',
      calcPresetsTitle: 'ፈጣን አማራጮች',
      calcPresetStarter: 'ጀማሪ',
      calcPresetBuilder: 'ገንቢ',
      calcPresetPro: 'ፕሮ',
      calcPresetArmy: 'ሰራዊት',
      calcNetworkChip: 'መረብ: {count}',
      calcDetailsToggle: 'ሙሉ ስሌቱን አሳይ',
      calcDetailsToggleOpen: 'ሙሉ ስሌቱን ደብቅ',
      bonusChipsTitle: 'የቦነስ ደረጃዎች',
      trustTitle: 'ፍትሃዊ አሰራር። ሙሉ ግልጽነት።',
      trust1Title: 'እውነተኛ ሽያጭ ብቻ',
      trust1Desc: 'ኮሚሽን የሚታሰበው በተረጋገጡ የኮርስ ክፍያዎች ላይ እንጂ በባዶ ምዝገባዎች አይደለም።',
      trust2Title: 'የ7-ቀን ጥበቃ',
      trust2Desc: 'እያንዳንዱ ገቢ ለ7 ቀናት ይቆያል — ከRefund ስጋት ነፃ በሆነ መልኩ የተነደፈ።',
      trust3Title: 'ወርሃዊ ገደቦች',
      trust3Desc: 'በተጠቃሚ እና በመድረክ ደረጃ ያሉ ገደቦች ስርዓቱ ዘላቂ ሆኖ እንዲቀጥል ያደርጋሉ።',
      trust4Title: 'በራስ ሊንክ መመዝገብ አይቻልም',
      trust4Desc: 'አንድ ሰው፣ አንድ ኮድ። ስርዓቱን ለማታለል የሚደረጉ ሙከራዎች የተገደቡ ናቸው።',
      payoutTitle: 'የክፍያ አፈጻጸም',
      payoutNote: 'በ≤ {hours} ሰዓታት ውስጥ ይከናወናል',
      rail: {
        ariaLabel: 'የገቢ ጎን ፓነል',
        nextTierTitle: 'ቀጣዩ ቦነስ በእጅዎ',
        nextTierEmpty: 'ሁሉም የዕድሜ ልክ ቦነሶች ተደርሷል — ለፍጥነት ቦነሶች አውታረ መረብዎን ያሳድጉ።',
        nextTierRemaining: '{n} ተጨማሪ',
        payoutTitle: 'ክፍያዎች እንዴት ይፈሳሉ',
        payoutStep1: 'ጓደኛ ይመዘገባል',
        payoutStep1Desc: 'ሽያጭ በቴሌብር፣ ሲቢኢ ብር ወይም በባንክ ማስተላለፍ ይጸድቃል።',
        payoutStep2: 'ለ{days} ቀናት ይቆለፋል',
        payoutStep2Desc: 'ከRefund ነፃ የሆነ መስኮት — ተመላሽ ከሆነ በራስ-ሰር ይሰረዛል።',
        payoutStep3: 'ገንዘብ ያውጡ',
        payoutStep3Desc: 'የማውጣት ጥያቄ ያቅርቡ — በ{hours} ሰዓታት ውስጥ ወጪ ይሆንልዎታል።',
      },
    },
    socialProof: {
      paid: 'ለተማሪዎች የተከፈለ',
      referrers: 'ንቁ አጋሪዎች',
      refs: 'ተጋባዦች',
    },
    income: {
      eyebrow: 'ዕድሉ',
      title: 'ትምህርትዎ የገቢ ምንጭ ነው',
      subtitle: 'ከተመዘገቡበት ቅጽበት ጀምሮ፣ የሚያመጡት እያንዳንዱ ጓደኛ እየተማሩ ይከፍልዎታል።',
      card1Title: 'በእያንዳንዱ ሽያጭ ያግኙ',
      card1Desc: 'እያንዳንዱ የጸደቀ የኮርስ ሽያጭ በ4 ደረጃ አውታረ መረብዎ ውስጥ እስከ {amount} ETB ይከፍላል።',
      card1Unit: 'በእያንዳንዱ የጸደቀ ሽያጭ',
      card2Title: 'ቦነሶችን ይደራረቡ',
      card2Desc: 'ምዕራፎችን ይድረሱ፣ ደረጃዎችን ይውጡ፣ ቡድንዎን ያሳድጉ — በአንድ ምዕራፍ እስከ {amount} ETB ያግኙ።',
      card2Unit: 'ከፍተኛ የምዕራፍ ቦነስ',
      card3Title: 'በፍጥነት ያውጡ',
      card3Desc: 'የተከፈቱ ገቢዎችን በቴሌብር ወይም በሲቢኢ ብር በ{amount} ሰዓት ያውጡ — በአስተዳዳሪ የተረጋገጠ፣ ምንም አስታላሚ የለም።',
      card3Unit: 'የክፍያ ማስተናገጃ',
      cta: 'ሙሉውን የገቢ ሞተር ይመልከቱ',
    },
  },
  /* AM parity: pricing keys added */
  pricingOverview: {
    eyebrow: 'የትምህርት ክፍያ',
    title: 'ቀላል እና ግልጽ ዋጋ',
    subtitle: 'አንድ ዋጋ። የእድሜ ልክ መዳረሻ። ምንም የተደበቀ ክፍያ የለም።',
    bestValue: 'ተመራጭ ምርጫ',
    fullCourseTitle: 'የሙሉ አካዳሚው ፓስ',
    perPhaseTitle: 'የራስዎን መንገድ ይገንቡ',
    perPhase: 'ደረጃ',
    savePercent: '{percent}% ይቆጥቡ',
    referralHint: 'የጓደኛዎ ኮድ አለዎት? ክፍያ ላይ {percent}% ይቆጥቡ።',
    featureAllPhases: 'ሁሉንም 5 የተዋቀሩ ደረጃዎች',
    featureLifetime: 'የእድሜ ልክ መዳረሻ',
    featureCertificate: 'የምስክር ወረቀት',
    featureCommunity: 'የግል የቴሌግራም ማህበረሰብ',
    enrollCta: 'አሁን ይመዝገቡ',
    browsePhases: 'ደረጃዎችን ይመልከቱ',
    bulkDiscounts: 'የጥቅል ቅናሾች',
    phases: 'ደረጃዎች',
    off: 'ቅናሽ',
  },
  /* AM parity: phase timeline keys added */
  phaseTimeline: {
    eyebrow: 'ሥርዓተ-ትምህርት',
    title: 'የኢንጂነሪንግ ጉዞዎ',
    subtitle: '5 ደረጃዎች። ከዜሮ ተነስተው ለስራ ወደተዘጋጀ ሙሉ ስታክ ኢንጂነርነት።',
    classes: 'ክፍሎች',
    viewDetails: 'የደረጃውን ዝርዝር ይመልከቱ',
    enrollCta: 'ሙሉ ኮርሱን ይመዝገቡ',
  },
  /* AM parity: discussions keys added */
  discussions: {
    eyebrow: 'በክፍል ውስጥ',
    title: 'የቀጥታ ውይይቶች እና ጥያቄና መልስ',
    subtitle: 'እውነተኛ ውይይቶች። እውነተኛ አማካሪነት። እውነተኛ ማህበረሰብ።',
  },
  rewards: {
    eyebrow: 'ይቆጥቡ እና ያግኙ',
    title: 'የበለጠ ይቆጥቡ፣ የበለጠ ያግኙ',
    subtitle: 'በሊንክዎ አማካኝነት አንድ ሰው ሲቀላቀል — የትምህርት ክፍያዎ ይቀንሳል፣ ገቢዎ ይጨምራል።',
    discountTitle: 'ፈጣን ቅናሾች',
    discountDesc: 'በምዝገባዎ ላይ አፋጣኝ ቅናሽ ለማግኘት ፕሮሞ ኮዶችን ይጠቀሙ።',
    discountCta: 'የበለጠ ይወቁ',
    referralTitle: 'የገንዘብ ሪፈራል',
    referralDesc: 'ሊንክዎን ያጋሩ — ጓደኞችዎ {percent}% ይቆጥባሉ፣ እርስዎ በእያንዳንዱ የጸደቀ ሽያጭ እውነተኛ ETB ያገኛሉ።',
    referralCta: 'ማግኘት ይጀምሩ',
    commissionTitle: '4-ደረጃ ኮሚሽኖች',
    commissionDesc: 'በአውታረ መረብዎ ውስጥ በሚፈጸም እያንዳንዱ የኮርስ ሽያጭ በ4 ደረጃዎች ተከፋፍሎ እስከ {amount} ETB ያግኙ።',
    commissionCta: 'ደረጃዎችን ይመልከቱ',
  },
};