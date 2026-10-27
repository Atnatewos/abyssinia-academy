/**
 * @fileoverview Tigrinya — Landing Page Namespace
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
 * Path: packages/shared/config/i18n/ti/landing.js
 */
module.exports = {
  nav: {
    overview: 'ጠቕላላ ትሕዝቶ',
    courses: 'ትምህርትታት',
    earn: 'ኣታዊ',
    tuition: 'ክፍሊት ትምህርቲ',
    contact: 'ተራኸበና',
    portal: 'ፖርታል ክላስሩም',
    signIn: 'እተ',
    enroll: 'ሕጂ ተመዝገብ',
    logout: 'ውጻእ',
    myProfile: 'መግለጺይ',
    referralDashboard: 'ዳሽቦርድ ሪፈራል',
  },
  hero: {
    badge: 'ኦንላይን ቀጥታ ማስተርክላስ ስርዓት ትምህርቲ',
    /* Compliance-safe: "While You Study" instead of "Just for Studying" */
    earnBadge: '💰 ቀጻሊ ኣታዊ - ንምትምሃር ጥራይ ክፍሊት ተኸፍል',
    title: 'ኦንላይን ምሉእ ስታክ ዌብ ኣፕሊኬሽን ዴቨሎፕመንት ተምሃር እሞ ኣብ',
    /* Compliance-safe: "transparent payouts" instead of "guaranteed payouts" */
    subtitle: 'ትምህርትኻ ናብ ቀጻሊ ዝርከብ ኣታዊ ምንጪ ቀይሮ። ናይ 5 ምዕራፋት ስነ-መሕንዚ ስርዓተ ትምህርቲ ብኦንላይን ቀጥታ ማስተርክላስ ተኸፍት፣ ክንዲ እትዓቢ ዓቐብካ ድማ ግሉጽ ክፍሊት ተቐበል።',
    /* Income-focused subline: numbers injected from referrals config */
    incomeSubline:
      'ኣብ መርበብካ ዝተረጋገጸ ነፍሲ ወከፍ ሽያጭ ክሳብ {total} ብር ኣብ 4 ደረጃታት ይኸፍለካ - ብተለቢር ውሽጢ {hours} ሰዓት ኣውጽእ።',
    exploreCourses: 'ትምህርትታት ተመልከት',
    unlockAccess: 'ምሉእ ፓስ ክፈት',
    earnCta: 'ከመይ ከም እትኣትው ተመልከት',
    /* Labels for the floating chips over the IDE card. {amount} is injected. */
    incomeChipLevel1: '+{amount} ብር · ደረጃ 1',
    incomeChip5Directs: '+{amount} ብር · 5 ቀጥታ',
    incomeChipPayout: 'ክፍሊት {amount} ሰዓት',
  },
  stats: {
    phases: '5 ምዕራፋት',
    phasesSub: 'ዝተዋቕረ ስርዓት',
    weeks: '20+ ሰሙናት',
    weeksSub: 'ቀጥታ ክፍለ-ግዜ ቪድዮ',
    access: '100%',
    accessSub: 'ዕድሚ ዘለዎ ኣክሰስ ዩትዩብ',
  },
  statsLabels: [
    'ዝተዋቕረ ስርዓት',
    'ቀጥታ ክፍለ-ግዜ ቪድዮ',
    'ዕድሚ ዘለዎ ኣክሰስ ዩትዩብ',
    'ኣብ ነፍሲ ወከፍ ሽያጭ ተኻፊሉ',
    'ምስራሕ ክፍሊት',
  ],
  landing: {
    heroVisual: {
      freePreviewLabel: 'ናጻ ቅድመ-ርእይቶ',
      previewDetail: 'ምዕራፍ 1 · ሰሙን 1 · ክላስ 01',
      sessions: [
        '01. ሓፈሻዊ ትሕዝቶ ኣርኪቴክቸር ክላይንት-ሰርቨር',
        '02. ኤችቲኤምኤል5 ሴማንቲክ ኤለመንታት ብዝርዝር',
        '03. ምርኩስነት (a11y) ዝበለጹ ልምድታት',
      ],
    },
    features: {
      sectionTag: 'ስለምንታይ አቢሲኒያ ኣካዳሚ?',
      heading: 'ንተግባራዊ ስነ-መሕንዚ ሶፍትዌር ዝተዘጋገነ',
      subtitle: 'ካብ ዜሮ ፍልጠት ኮዲንግ ናብ ንስራሕ ዝበቕዐ ምሉእ-ስታክ መሃንዲስ ንምልዋጥ ዘድልየካ ኩሉ።',
      cards: [
        {
          title: 'HD ክፍለ-ግዜ ቪድዮ',
          description: 'ግሉጽ HD ቀዲሙ ዝተቐረጸ ቀጥታ ኮዲንግ ክፍለ-ግዜ ብዝኾነ ግዜ ተመልከት። መልስ፣ ኣቛርጽ፣ ወይ ኣጸጋሚ ኣርእስታት ብዝደለኻዮ ፍጥነት ተመልከት።',
        },
        {
          title: 'ናይ ሓቂ ሪፖዚቶሪታት ኮድ',
          description: 'ንነፍሲ ወከፍ ሰሙን ናይ GitHub ሪፖዚቶሪታት፣ ሓዊስካ ቦይለርፕሌት ሴታፕ፣ መፍትሒ ቅርንጫፋት፣ ከምኡ\'ውን መጀመርታ ዕዮታት ኣክሰስ ግበር።',
        },
        {
          title: 'ብሕታዊ ማሕበር ምምራሕ',
          description: 'ምስ ኣሰልጣኒታትን ብጾት መሃንዲስን ብቐጥታ ኣብ ብሕታዊ ጉጅለ ዝርርብ ቴክኒካዊ ቴለግራምና ተራኸብ።',
        },
        {
          title: 'ዝተረጋገጸ ምስክር ወረቐት ክእለት',
          description: 'ናይ 5 ምዕራፋት ናይ መወዳእታ ፕሮጀክትካ ብዓወት ምስ ኣጠናቐቕካን ምስ ተገምገመን ወግዓዊ ናይ አቢሲኒያ ኣካዳሚ ስነ-መሕንዚ ምስክር ወረቐት ርኸብ።',
        },
      ],
    },
    howItWorks: {
      sectionTag: 'ከመይ ይሰርሕ',
      heading: 'ናብ ብልሕነት ሶፍትዌር መንገዲ 5 ስጉምትታት',
      steps: [
        {
          title: 'ተመዝገብ እሞ ክፍሊት ትምህርቲ ክፈል',
          description: 'እቲ እትመርጾ ናይ ከባቢ ኣገባብ ክፍሊት (ተለቢር፣ CBE ብር፣ ትራንስፈር ባንክ) ምረጽ እሞ ብ60 ሰከንድ ምዝገባኻ ኣጠናቕ።',
        },
        {
          title: 'ክላስሩም ትምህርቲ ክፈት',
          description: 'ናብ ቁሳቁስ ትምህርትን ማስተርክላስን፣ ብግዜ ዝተኸፍለ ትሕዝቶን ዝተዋቕረ መዘኻኸሪ ትምህርትን ብቕጽበት ኣክሰስ ርኸብ።',
        },
        {
          title: 'ሰሙናዊ ፕሮጀክትታት ስራሕ',
          description: 'ንጹር ምርኢት ኮዲንግ ተኸተል፣ መጀመርታ ኣሰተታት ኣውርድ፣ እሞ ንሰሙን ብሰሙን ንፖርትፎሊዮ ዝበቕዐ ፕሮጀክትታት ስራሕ።',
        },
        {
          title: 'ተመርቐል እሞ ሞያኻ ጀምር',
          description: 'ናይ ምሉእ-ስታክ ናይ መወዳእታ ፕሮጀክትካ ናብ ሰርቨራት ክላውድ ኣዝርዝር፣ ናይ GitHub ፖርትፎሊዮኻ ኣርኢ፣ እሞ ዓለምለኻዊ ስራሕ ሶፍትዌር ርኸብ።',
        },
        {
          title: 'ኣካፍል እሞ ተኣታው',
          description: 'ብሕታዊ ሊንክካ ዓርኪታትካ ዓዝዞም — ንሳቶም ካብ ክፍሊት ትምህርቲ ይብቅዑ እሞ ንስኻ ኣብ ነፍሲ ወከፍ ዝተረጋገጸ ሽያጭ ኮሚሽንን ሽልማትን ትኣትው።',
        },
      ],
    },
    faq: {
      sectionTag: 'ሕቶታት ኣለካ ድዩ?',
      heading: 'ብተደጋጋሚ ዝሕተቱ ሕቶታት',
      items: [
        {
          question: 'ንምዝገባ ቅድመ-ፍልጠት ፕሮግራሚንግ የድሊ ድዩ?',
          answer: 'ኣይፋል! ምዕራፍ 1 ካብ ምሉእ ዜሮ ይጅምር — ሜካኒክስ ወብ፣ HTML5፣ ኣርኪቴክቸር ላይኡት CSS3፣ ከምኡ\'ውን መሰረታዊ ናይ Git ብስጉምቲ ይሽፍን።',
        },
        {
          question: 'ቁሳቁስ ትምህርቲ ከመይ ይሰርሕ?',
          answer: 'ምስ ተመዘገብካ ሕሳብ ተምሃራይካ ናይ ብሕታዊ ፖርታል ቪድዮ ኢምበድ ሊንክ ይኸፍት። ቀዲሙ ዝተቐረጸ ቀጥታ ክፍለ-ግዜ ብ HD ኣብ ዝኾነ ኮምፒዩተር ወይ ሞባይል 24/7 ተመልከት።',
        },
        {
          question: 'ከመይ ክንከፍል ንኽእል?',
          answer: 'ተለቢር፣ CBE ብር፣ ከምኡ\'ውን ትራንስፈር ባንክ ንቕበል። በጃኻ ስክሪንሾት ምርግጋጽ ክፍሊት ወይ ቑጽሪ ግብይት ኣቕርብ። ክፍሊትካ ምስ ተረጋገጸ ምሉእ ኣክሰስ ትምህርቲ ክትረክብ ኢኻ።',
        },
        {
          question: 'ናብ ፖርታል ትምህርቲ ክንደይ ግዜ ኣክሰስ ኣለኒ?',
          answer: 'ዕድሚ ዘለዎ ኣክሰስ ትረክብ! ዝሓለፉ ዝተቐረጹ ክፍለ-ግዜ፣ ኣብነታት ኮድ ኣውርድ፣ ከምኡ\'ውን ዝመጹ ምሕደሳት ትምህርቲ ብዘይ ተወሳኺ ክፍሊት ተመልከት።',
        },
        {
          question: 'እዚ ናይ ፒራሚድ ስርዓት ድዩ?',
          answer: 'ኣይፋል። ኮሚሽናት ኣብ ናይ ሓቂ፣ ዝተረጋገጸ ሽያጭ ትምህርቲ ጥራይ ይኽፈሉ — ብምልኣት ጥራይ ፈጺሙ ኣይኮነን። ሰንሰለት ክሳብ 4 ደረጃታት ጥራይ ተደረት እዩ እሞ ነፍሲ ወከፍ ክፍሊት ብወርሓዊ ገደብ ተደረት እዩ።',
        },
        {
          /* Template variable {hours} injected from referrals config */
          question: 'ኣታዊይ መዓስ ክኣውጽ እኽእል?',
          answer: 'ኮሚሽናትን ሽልማታትን ድሕሪ 7 መዓልታት ካብ እቲ ብቑዕ ክፍሊት ይኽፈቱ። ምስ ተኸፍተ ምውጻእ ሕተት (ትሕቲ ዝነኣሰ 500 ብር) እሞ ኣማሓዳሪ ብተለቢር፣ CBE ብር፣ ወይ ትራንስፈር ባንክ ውሽጢ {hours} ሰዓት ይሰርሖ።',
        },
        {
          question: 'ንምእታው ተምሃራይ ክኸውን ኣለኒ ድዩ?',
          answer: 'እወ። ነፍሲ ወከፍ መወከል ብሕታዊ ኮድ ዘለዎ ዝተመዘገበ ተምሃራይ እዩ። እዚ መርበብ ኣብ ናይ ሓቂ ተምሃሮ ጥራይ ከም ዝህረጽ ይገብር፣ ኣብ ባዶ ምዝገባታት ኣይኮነን።',
        },
        {
          question: 'ዝተወከለ ግዝያ እንተተመልሰ እንታይ ይኸውን?',
          answer: 'ኣብ ውሽጢ ናይ 7 መዓልታት ናይ ምዕጻው ግዜ ምልስ እንተተፈጸመ ተመሳሳሊ ኮሚሽናትን ሽልማታትን ብራስኡ ይመለሱ። ድሕሪ ምኽፋት ኣታዊ ወሰናይ እዩ።',
        },
        {
          question: 'ኣብ ፕሮግራም ሪፈራል ምእታው ዋጋ ኣለዎ ድዩ?',
          answer: 'ኣይፋል። ንነፍሲ ወከፍ ዝተመዘገበ ተምሃራይ ናጻ እዩ። ኮድካ ንመጀመርታ ግዜ ዳሽቦርድ ሪፈራልካ ምስ ከፈትካ ብራስኡ ይፍጠር።',
        },
      ],
    },
    cta: {
      heading: 'ሞያ ሶፍትዌርካ ንምጅማር ድሉው ዲኻ?',
      subtitle: 'ሎሚ ተመዝገብ እሞ ኩሎም ትምህርትታት፣ 5 ዝተዋቕሩ ምዕራፋት፣ ተወሳኺ ሪፖዚቶሪታት ኮድ ፕሮጀክት፣ ከምኡ\'ውን ብሕታዊ ጉጅለ ምምራሕ ዴቨሎፐር ቴለግራምና ክፈት።',
      buttonText: 'ሎሚ ተመዝገብ እሞ ትምህርቲ ጀምር',
      earnButtonText: 'ከመይ ከም እትኣትው ተመልከት',
    },
    earn: {
      eyebrow: 'ተምሃር እሞ ተኣታው',
      title: 'ፍልጠትካ ይኸፍለካ። ብሓቂ።',
      subtitle: 'ሊንክካ ኣካፍል - ዓርኪታትካ ካብ ምዝገባኦም {percent}% ቅናሽ ይረኽቡ፣ ንስኻ ድማ ኣብ ነፍሲ ወከፍ ዝተረጋገጸ ሽያጭ ናይ ሓቂ ገንዘብ ትኣትው።',
      step1Title: 'ተምሃር',
      step1Desc: 'ተመዝገብ እሞ ናይ 5 ምዕራፋት ምሉእ-ስታክ ስርዓተ ትምህርቲ ተኣምር።',
      step2Title: 'ኣካፍል',
      step2Desc: 'ብሕታዊ ሊንክካ ንዓርኪታትካ ብቕጽበት ቅናሽ ክፍሊት ትምህርቲ ይህቦም።',
      /* Template variable {hours} injected from referrals config */
      step3Title: 'ተኣታው',
      step3Desc: 'ውሽጢ {hours} ሰዓት ካብ ምርግጋጽ ብተለቢር ወይ CBE ብር ኣውጽእ።',
      chainTitle: 'ሓደ ዓርኪ ምስ ገደሰ 4 ሰባት ይኣትዉ',
      chainYou: 'ንስኻ',
      chainNote: 'ኣብ ነፍሲ ወከፍ ሽያጭ {total} ብር ተኻፊሉ · ውሽጢ {days} መዓልታት ይኸፈት',
      calcTitle: 'ኣታዊኻ ግምት ኣብጽሕ',
      calcDirect: 'ቀጥታ ዕድመታት',
      calcTeam: 'ዕድመታቶም',
      calcBreakdownTitle: 'ዝርዝር ኮሚሽን',
      calcLevelRow: 'ደረጃ {level}',
      calcBonusesTitle: 'ዝተኸፈቱ ሽልማታት',
      calcNoBonuses: 'ኣብዚ መጠን እዚ ክሳብ ሕጂ ዝበጽሐ ደረጃ ሽልማት የለን።',
      calcSpeedNote: 'ሽልማት ፍጥነት (ወርሓዊ)፦ ክሳብ {amount} ብር ኣብ ሓደ ወርሒ {count} ቀጥታ እንተኸፊሉ።',
      calcCommissions: 'ኮሚሽናት',
      calcBonuses: 'ሽልማታት',
      calcTotal: 'ጠቕላላ ኣታዊ',
      calcCta: 'ሊንክ ሪፈራለይ ርኸብ',
      calcDisclaimer: 'ኮሚሽናት ኣብ ዝተረጋገጸ ሽያጭ ትምህርቲ ጥራይ ይተግብሩ።',
      calcPresetsTitle: 'ቅድመ-ቅንብራት ቅልጡፍ',
      calcPresetStarter: 'ጀማሪ',
      calcPresetBuilder: 'ሃናጺ',
      calcPresetPro: 'ፕሮ',
      calcPresetArmy: 'ሰራዊት',
      calcNetworkChip: 'መርበብ፦ {count}',
      calcDetailsToggle: 'ምሉእ ሕሳብ ኣርኢ',
      calcDetailsToggleOpen: 'ምሉእ ሕሳብ ሕበእ',
      bonusChipsTitle: 'መደዳ ሽልማት',
      trustTitle: 'ፍትሓዊ ጸወታ። ምሉእ ግሉጽነት።',
      trust1Title: 'ናይ ሓቂ ሽያጭ ጥራይ',
      trust1Desc: 'ኮሚሽናት ኣብ ዝተረጋገጸ ክፍሊት ትምህርቲ ይንቀሳቐሱ፣ ኣብ ምዝገባ ፈጺሙ ኣይኮነን።',
      trust2Title: 'ናይ 7 መዓልታት ሓለዋ',
      trust2Desc: 'ነፍሲ ወከፍ ኣታዊ ን7 መዓልታት ይዕጸው — ብንድዚን ንምልሳስ ውሑስ እዩ።',
      trust3Title: 'ወርሓዊ ገደባት',
      trust3Desc: 'ንተጠቃሚ ብብሕቲን ንመድረኽ ብሓፈሻን ዝኾኑ ገደባት ስርዓቱ ቀጻሊ ክኸውን ይገብሩ።',
      trust4Title: 'ዘይፍቐደ ራስኻ ምውካል',
      trust4Desc: 'ሓደ ሰብ፣ ሓደ ኮድ። ነቲ መርበብ ምጥሓስ ተኸልኪሉ።',
      payoutTitle: 'ክፍሊታት',
      payoutNote: 'ይሰርሕ ≤ {hours} ሰዓት',
      rail: {
        ariaLabel: 'ጎናዊ ፓነል ኣታዊ',
        nextTierTitle: 'ዝቐጸለ ሽልማት ቀረባ',
        nextTierEmpty: 'ኩሎም ዕድሚ ዘለዎም ሽልማታት ተበጺሖም — ንሽልማት ፍጥነት መርበብካ ኣዕብይ።',
        nextTierRemaining: 'ተወሳኺ {n}',
        payoutTitle: 'ክፍሊት ከመይ ይፈስስ',
        payoutStep1: 'ዓርኪ ይመዝገብ',
        payoutStep1Desc: 'ሽያጭ ብተለቢር፣ CBE ብር፣ ወይ ትራንስፈር ባንክ ተረጋጊጹ።',
        payoutStep2: 'ን{days} መዓልታት ተዓጽዩ',
        payoutStep2Desc: 'ውሑስ ናይ ምልሳስ ግዜ — እንተተመልሰ ብራስኡ ይመለስ።',
        payoutStep3: 'ኣውጽእ',
        payoutStep3Desc: 'ምውጻእ ሕተት — ውሽጢ {hours} ሰዓት ይሰርሕ።',
      },
    },
    socialProof: {
      paid: 'ንተምሃሮ ተኸፊሉ',
      referrers: 'ንጡፋት መወከልቲ',
      refs: 'ሪፈራላት',
    },
    /* ── Income Band — 3-card opportunity strip ──
     * Unit labels are resolved per card; titles/descriptions use
     * {amount} placeholders injected from referrals config.
     */
    income: {
      eyebrow: 'እቲ ዕድል',
      title: 'ትምህርትኻ ናይ ኣታዊ መፍሰሲ እዩ',
      subtitle: 'ካብቲ እትመዝገበሉ ግዜ ጀሚሩ እቲ መድረኽ ንኣካፋልኻ ንነፍሲ ወከፍ ዓርኪ ይኸፍለካ — እናተማህርካ።',
      card1Title: 'ኣብ ነፍሲ ወከፍ ሽያጭ ተኣታው',
      card1Desc: 'ኣብ ነፍሲ ወከፍ ዝተረጋገጸ ሽያጭ ትምህርቲ ክሳብ {amount} ብር ይኸፍል፣ ኣብ 4 ደረጃታት መርበብካ ተኻፊሉ።',
      card1Unit: 'ኣብ ነፍሲ ወከፍ ዝተረጋገጸ ሽያጭ',
      card2Title: 'ሽልማታት ኣኽትር',
      card2Desc: 'ደረጃታት ብጽፍካ፣ ማዕርጋት ዓብካ፣ ጋንታኻ ኣዕብያ፣ ክሳብ {amount} ብር ኣብ ነፍሲ ወከፍ ደረጃ ሽልማት ተኣታው።',
      card2Unit: 'ዝለዓለ ሽልማት ደረጃ',
      card3Title: 'ብቕልጡፍ ኣውጽእ',
      card3Desc: 'ዝተኸፈተ ኣታዊ ናብ ተለቢር ወይ CBE ብር ውሽጢ {amount} ሰዓት ኣውጽእ — ብኣማሓዳሪ ዝተረጋገጸ፣ ብዘይ ማእከላይ ሰብ።',
      card3Unit: 'ምስራሕ ክፍሊት',
      cta: 'ምሉእ ስርዓት ኣታዊ ተመልከት',
    },
  },
  pricingOverview: {
    eyebrow: 'ክፍሊት ትምህርቲ',
    title: 'ቀሊል፣ ግሉጽ ዋጋ',
    subtitle: 'ሓደ ዋጋ። ዕድሚ ዘለዎ ኣክሰስ። ዘይተሓብአ ክፍሊት የለን።',
    bestValue: 'ዝበለጸ ዋጋ',
    fullCourseTitle: 'ምሉእ ፓስ ኣካዳሚ',
    perPhaseTitle: 'መንገድኻ ስራሕ',
    perPhase: 'ምዕራፍ',
    savePercent: '{percent}% ብቐጥታ',
    referralHint: 'ኮድ ዓርኪ ኣለካ? ኣብ ቅድመ-ክፍሊት {percent}% ብቐጥታ።',
    featureAllPhases: 'ኩሎም 5 ዝተዋቕሩ ምዕራፋት',
    featureLifetime: 'ዕድሚ ዘለዎ ኣክሰስ',
    featureCertificate: 'ምስክር ወረቐት ምዝዛም',
    featureCommunity: 'ብሕታዊ ማሕበር ቴለግራም',
    enrollCta: 'ሕጂ ተመዝገብ',
    browsePhases: 'ምዕራፋት ተመልከት',
    bulkDiscounts: 'ብዙሕ ቅናሻት',
    phases: 'ምዕራፋት',
    off: 'ቅናሽ',
  },
  phaseTimeline: {
    eyebrow: 'ስርዓተ ትምህርቲ',
    title: 'ጉዕዞ ስነ-መሕንዚኻ',
    subtitle: '5 ምዕራፋት። ካብ ዜሮ ክሳብ ዝተዘርዘረ ምሉእ-ስታክ መሃንዲስ።',
    classes: 'ክላሳት',
    viewDetails: 'ዝርዝር ምዕራፍ ተመልከት',
    enrollCta: 'ኣብ ምሉእ ትምህርቲ ተመዝገብ',
  },
  discussions: {
    eyebrow: 'ኣብ ውሽጢ ክላስሩም',
    title: 'ቀጥታ ዝርርብን ሕቶን መልስን',
    subtitle: 'ናይ ሓቂ ዝርርብ። ናይ ሓቂ ምምራሕ። ናይ ሓቂ ማሕበር።',
  },
  rewards: {
    eyebrow: 'ቅዳሕ እሞ ተኣታው',
    title: 'ብዙሕ ቅዳሕ፣ ብዙሕ ተኣታው',
    subtitle: 'ክፍሊት ትምህርትኻ ይወርድ እሞ ኣታዊኻ ይዓቢ — ሓደ ሰብ ብሊንክካ ምስ ተጸምበረ ብነፍሲ ወከፍ ግዜ።',
    discountTitle: 'ፈጣን ቅናሻት',
    discountDesc: 'ኣብ ቅድመ-ክፍሊት ኮዳት ማስተዋወቂያ ተግብር እሞ ኣብ ምዝገባኻ ፈጣን ቅዳሕ ርኸብ።',
    discountCta: 'ተወሳኺ ፍለጥ',
    referralTitle: 'ናይ ገንዘብ ሪፈራላት',
    referralDesc: 'ሊንክካ ኣካፍል — ዓርኪታትካ {percent}% ይብቅዑ፣ ንስኻ ድማ ኣብ ነፍሲ ወከፍ ዝተረጋገጸ ሽያጭ ናይ ሓቂ ብር ትኣትው።',
    referralCta: 'ምእታው ጀምር',
    commissionTitle: 'ናይ 4 ደረጃታት ኮሚሽናት',
    commissionDesc: 'ኣብ መርበብካ ኣብ ነፍሲ ወከፍ ሽያጭ ትምህርቲ ክሳብ {amount} ብር ኣብ 4 ደረጃታት ተኻፊሉ ተኣታው።',
    commissionCta: 'ደረጃታት ተመልከት',
  },
};