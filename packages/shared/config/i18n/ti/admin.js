/**
 * @fileoverview ትግርኛ — Admin Namespace
 *
 * Contains admin-specific UI copy including:
 *   - Coming Soon stub labels (one per unfinished CRUD route)
 *   - Announcements composer labels
 *   - Agent management labels
 *   - God Mode UI (user detail page: wallet, agent, ban/unban, impersonation)
 *
 * All copy is config-driven — no hardcoded strings in JSX components.
 *
 * Path: packages/shared/config/i18n/ti/admin.js
 */

module.exports = {
  admin: {
    comingSoon: {
      eyebrow: 'ኣብ ስራሕ ይገበር ኣሎ',
      heading: 'እዚ ባህሪ ይስራሕ ኣሎ',
      description:
        'ጋንታና ንዚ ገጽ ዝተጣርየ ተመክሮ ንምስራሕ ይጽዕር ኣሎ። ብቕሩብ ግዜ ምሉእ ምፍጣር፣ ምሕዳስን ምስራዝን ሒደታት ጋር ክርከብ እዩ።',
      subtitle: 'እዚ ባህሪ ብቕሩብ ግዜ ይመጽእ',
      contactSupport: 'ሕጂ እዚ የድልየካ? ደገፍ ተራኸብ',
      supportEmail: process.env.SUPPORT_EMAIL || 'support@abyssinia-academy.com',
      footerNote: 'ጋንታ ምህንድስና ኣብኡ ኣሎ — እዚ ገጽ ኣብ ዝመጽእ ምሕዳስ ክነቅሕ እዩ።',
      defaultTitle: 'ባህሪ ብቕሩብ ግዜ ይመጽእ',
      defaultBack: 'ተመለስ',

      editCourse: 'ኮርስ ኣርትዕ',
      addVideo: 'ቪድዮ ወስኽ',
      editVideo: 'ቪድዮ ኣርትዕ',
      addDiscussion: 'ምይይጥ ወስኽ',
      editDiscussion: 'ምይይጥ ኣርትዕ',
      addDiscount: 'ሓድሽ ኮድ ቅናሽ',
      viewDiscount: 'ዝርዝር ቅናሽ',
      editDiscount: 'ኮድ ቅናሽ ኣርትዕ',
      viewAdmin: 'ዝርዝር ኣማሓዳሪ',

      backToCourses: 'ናብ ኮርሳት ተመለስ',
      backToVideos: 'ናብ ቪድዮታት ተመለስ',
      backToDiscussions: 'ናብ ምይይጣት ተመለስ',
      backToDiscounts: 'ናብ ቅናሻት ተመለስ',
      backToAdmins: 'ናብ ኣማሓደርቲ ተመለስ',
    },

    announcements: {
      navLabel: 'ምልክታት',
      pageTitle: 'ምልክታት',
      pageSubtitle: 'ናብ ኩሎም ተጠቀምቲ፣ ናብ ዝተመዝገቡ ተጠቀምቲ ወይ ናብ ዝተወሰኑ ተጠቀምቲ መልእኽትታት ኣመሓላልፍ',
      backToDashboard: 'ናብ ዳሽቦርድ ተመለስ',

      tabCompose: 'ጽሓፍ',
      tabHistory: 'ታሪኽ',

      audienceLabel: 'ላእኽ ናብ',
      audienceAll: 'ኩሎም ተጠቀምቲ',
      audienceEnrolled: 'ዝተመዝገቡ ጥራይ',
      audienceTargeted: 'ዝተወሰኑ ተጠቀምቲ',
      audienceSingle: 'ሓደ ተጠቃሚ',

      targetedLabel: 'ተጠቀምቲ ምረጽ',
      targetedCountSuffix: 'ተመሪጾም',
      targetedPlaceholder: 'ብስም፣ ብተሌፎን ወይ ብኢመይል ድለ…',
      targetedHint: 'እንተወሓደ 2 ፊደላት ኣእቱ። ንምውሳኽ ዝኾነ ውጽኢት ጠውቕ። ክንደይ ተጠቀምቲ ከም ትደሊ ክትመርጽ ትኽእል።',
      removeUser: 'ተጠቃሚ ኣውጽእ',
      noResults: 'ምስ ምድላይካ ዝሰማማዕ ተጠቃሚ የለን',
      noEmail: 'ኢመይል የለን',

      singlePlaceholder: 'ተሌፎን ወይ ኢመይል ኣእቱ',
      singleHint: 'ምስ ቁጽሪ ተሌፎን ወይ ኣድራሻ ኢመይል ይሰማማዕ',

      titleLabel: 'ኣርእስቲ',
      titlePlaceholder: 'ኣብነት፣ ሓድሽ መጀመርታ ኮርስ ምልክት',
      bodyLabel: 'መልእኽቲ',
      bodyPlaceholder: 'መልእኽቲ ምልክትካ ጽሓፍ…',

      severityLabel: 'ህጹጽነት',
      severityInfo: 'ሓበሬታ',
      severitySuccess: 'ዓወት',
      severityWarning: 'መጠንቀቕታ',
      severityCritical: 'ህጹጽ',

      sendBtn: 'ምልክት ላእኽ',
      sending: 'ይለእኽ ኣሎ…',
      cancel: 'ሰርዝ',

      previewLabel: 'ቀጥታ ቅድመ ትርኢት',
      previewTitlePlaceholder: 'ኣርእስትኻ ኣብዚ ክረአ እዩ',
      previewBodyPlaceholder: 'መልእኽትኻ ኣብዚ ክረአ እዩ',
      previewTimeJustNow: 'ሕጂ',
      previewAudienceLabel: 'ተመልከትቲ',
      previewSeverityLabel: 'ህጹጽነት',
      previewWarning: 'ኩሎም ተቐበልቲ ነዚ ምልክት ኣብ ሳጹን መልእኽቶም ከም ምልክት ክቕበልዎ እዮም።',

      confirmTitle: 'ስርጭት ኣረጋግጽ',
      confirmBody:
        'ነዚ ምልክት ክትልእኽ ኢኻ። እዚ ተግባር ክምለስ ኣይኽእልን እሞ ሓንሳብ ምስ ተላእከ ክምለስ ኣይኽእልን።',
      confirmInputLabel: 'ንምርግጋጽ SEND ጽሓፍ',
      confirmBtn: 'ስርጭት ላእኽ',

      historyTitle: 'ታሪኽ ስርጭት',
      refreshHistory: 'ኣሓድስ',
      historyEmpty: 'ክሳብ ሕጂ ዝኾነ ምልክት ኣይተላእከን።',
      historyLoadFailed: 'ታሪኽ ስርጭት ምጽዓን ኣይተኻእለን።',
      historyColWhen: 'መዓስ',
      historyColTitle: 'ኣርእስቲ',
      historyColAudience: 'ተመልከትቲ',
      historyColRecipients: 'ተቐበልቲ',
      historyColSentBy: 'ዝተላእከ ብ',

      timeJustNow: 'ሕጂ',
      timeMinutesAgo: 'ቅድሚ {count} ደቓይቕ',
      timeHoursAgo: 'ቅድሚ {count} ሰዓት',
      timeDaysAgo: 'ቅድሚ {count} መዓልቲ',

      successToast: 'ምልክት ናብ {count} ተቐበልቲ ተላእከ',
      validationFailed: 'በጃኻ ኩሎም ኣስፈላጊ መስኮታት ምላእ',
      sendFailed: 'ምልክት ምልኣኽ ኣይተኻእለን። በጃኻ እንደገና ፈትን።',
    },

    /* ── Agent Management ── */
    agentsTitle: 'ምሕደራ ወኪል',
    agentsSubtitle: 'መጠን ኮሚሽን ወኪል ኣዋቕር እሞ ኣፈጻጽማ ተመልከት።',
    agentName: 'ስም ወኪል',
    agentCode: 'ኮድ ወኪል',
    agentSales: 'ጠቕላላ ሽያጭ',
    agentEarned: 'ጠቕላላ ኣታዊ',
    commissionType: 'ዓይነት ኮሚሽን',
    commissionValue: 'ዋጋ ኮሚሽን',
    agentStatus: 'ኩነታት',

    /* ═══════════════════════════════════════════════════════════════════════
       GOD MODE — User Detail Page
       Every string rendered by apps/web/pages/admin/users/[id]/index.jsx
       ═══════════════════════════════════════════════════════════════════════ */
    godMode: {
      /* Page chrome */
      backToUsers: 'ናብ ተጠቀምቲ ተመለስ',
      userDetailsTitle: 'ዝርዝር ተጠቃሚ',
      loadingUser: 'ሓበሬታ ተጠቃሚ ይጽዕን ኣሎ...',
      userNotFoundTitle: 'ተጠቃሚ ኣይተረኸበን',
      userNotFoundSubtitle: 'ዝተሓተተ ተጠቃሚ የለን።',
      unknownUser: 'ዘይተፈልጠ',

      /* Header meta */
      joined: 'ዝተጸምበረሉ',
      notAvailable: 'የለን',
      emDash: '—',

      /* Status badges */
      statusBanned: 'ዝተኸልከለ',
      statusEnrolled: 'ዝተመዝገበ',
      statusRegistered: 'ዝተመዝገበ ጥራይ',

      /* Header actions */
      unenroll: 'ካብ ምዝገባ ኣውጽእ',
      markEnrolled: 'ከም ዝተመዝገበ ምልክት ግበር',

      /* Stats row */
      stats: {
        directReferrals: 'ቀጥታ ሪፈራላት',
        teamSize: 'ዓቐን ጋንታ',
        payingDirect: 'ዝኸፍሉ ቀጥታ',
        lifetimeEarned: 'ኣታዊ ዕድሚ ህይወት',
      },

      /* Tabs */
      tabs: {
        overview: 'ጠቕላላ ትርኢት',
        walletAndAgent: 'ዋሌትን ወኪልን',
        godMode: 'God Mode',
      },

      /* Overview tab */
      overview: {
        enrollmentHistory: 'ታሪኽ ምዝገባ',
        noEnrollments: 'ክሳብ ሕጂ ምዝገባ የለን።',
        referralHistory: 'ታሪኽ ሪፈራል',
        noReferrals: 'ክሳብ ሕጂ ሪፈራል የለን።',
        fullCoursePass: 'ምሉእ ፓስ ኮርስ',
        phaseBundle: 'ጥርዓት ደረጃ',
      },

      /* Wallet tab */
      wallet: {
        heading: 'ዋሌት',
        currentBalance: 'ህሉው ተረፍ ሂሳብ',
        totalEarned: 'ጠቕላላ ኣታዊ',
        totalWithdrawn: 'ጠቕላላ ወጻኢ',
        pendingWithdrawal: 'ኣብ ትጽቢት ዘሎ ወጻኢ',
        manualAdjustment: 'ብኢድ ምትዕርራይ ዋሌት',
        adjustmentHint:
          'ኣወንታዊ ቁጽርታት ነቲ ዋሌት ይውስኹ። ኣሉታዊ ቁጽርታት ይመልሱ። ≥ 10,000 ብር ምትዕርራያት ንምርግጋጽ ADJUST ምጽሓፍ ይሓትታሉ።',
        amountPlaceholder: 'መጠን ብብር (ኣብነት፣ 500 ወይ -500)',
        reasonPlaceholder: 'ምኽንያት (እንተወሓደ 5 ፊደላት — ኣብ ኦዲት ይመዝገብ)',
        applyAdjustment: 'ምትዕርራይ ተግብር',
        applying: 'ይትግበር ኣሎ...',
        currency: 'ብር',
      },

      /* Agent tab */
      agent: {
        heading: 'ኩነታት ወኪል',
        agentCode: 'ኮድ ወኪል',
        commissionType: 'ዓይነት ኮሚሽን',
        commissionValue: 'ዋጋ ኮሚሽን',
        agentActive: 'ወኪል ንጡፍ',
        yes: 'እወ',
        no: 'ኣይኮነን',
        fixedType: 'ቀዋሚ',
        percentageType: 'ብመቶኛ',
        overrideHeading: 'መጠን ኮሚሽን ቅይር',
        fixedOption: 'ቀዋሚ (ብሽያጭ ብር)',
        percentageOption: 'መቶኛ (%)',
        overridePlaceholderFixed: 'ኣብነት፣ 500',
        overridePlaceholderPercentage: 'ኣብነት፣ 15',
        overrideRate: 'መጠን ቅይር',
        applying: 'ይትግበር ኣሎ...',
      },

      /* God Mode tab — impersonation */
      impersonation: {
        heading: 'ምስላን መእተውን',
        hint:
          'ናይ 5 ደቓይቕ ሊንክ ስሒር ይፈጥር። ኣብ ሓድሽ ታብ ይኽፈት — ክፍለ ግዜ ኣማሓዳሪኻ ከም ዘሎ ይጸንሕ።',
        generateLink: 'ሊንክ ምስላ ፍጠር',
        generateReset: 'ሊንክ ምቅይራ መሕለፊ ቃል ፍጠር',
      },

      /* God Mode tab — manual enrollment */
      manualEnroll: {
        heading: 'ብኢድ ምዝገባ',
        hint:
          'ብዘይ መዝገብ ክፍሊት ምሉእ መእተዊ ኮርስ ይህብ። ንጥሬ ገንዘብ ምዝገባታት ወይ ንናጻ ትምህርቲ ተጠቐመሉ።',
        reasonPlaceholder: 'ምኽንያት (እንተወሓደ 5 ፊደላት — ኣብ ኦዲት ይመዝገብ)',
        button: 'ምሉእ መእተዊ ኮርስ ሃብ',
        enrolling: 'ይምዝገብ ኣሎ...',
      },

      /* God Mode tab — network & account */
      network: {
        heading: 'ኔትወርክን ኣካውንትን',
        orphanButton: 'ካብ ዛፍ MLM ጥር',
      },

      /* Danger zone — ban form */
      ban: {
        heading: 'ኣደገኛ ክፍሊ — ምኽልካል',
        hint:
          'ነቲ ተጠቃሚ ይኽልክል እሞ ኮድታት ወኪልን ሪፈራልን ይስርዝ። እዚ ተግባር ይመዝገብ እሞ ካብ ታሕቲ ካብ ዘሎ ተግባር ምእላይ ክምለስ ይኽእል።',
        reasonPlaceholder: 'ምኽንያት ምኽልካል (እንተወሓደ 5 ፊደላት)',
        button: 'ተጠቃሚ ኣኽልክል',
      },

      /* Danger zone — unban form */
      unban: {
        heading: 'ተጠቃሚ ሕጂ ተኸልኪሉ ኣሎ',
        bannedOnTemplate: 'ብ{date} ተኸልኪሉ — ምኽንያት: {reason}',
        noReason: '—',
        hint:
          'ምእላይ መእተዊ ይመልስ እሞ ኮድታት ወኪልን ሪፈራልን እንደገና የንቀሳቕስ። እዚ ኣብ መዝገብ ኦዲት ይመዝገብ።',
        notePlaceholder: 'ንመዝገብ ኦዲት ኣማራጺ መዘኻኸሪ',
        button: 'ተጠቃሚ ካብ ምኽልካል ኣልይ',
        unbanning: 'ካብ ምኽልካል ይኣልይ ኣሎ...',
      },

      /* Toasts */
      toasts: {
        statusUpdated: 'ኩነታት ተጠቃሚ ተሓዲሱ',
        statusFailed: 'ኩነታት ምሕዳስ ኣይተኻእለን',
        impersonationSuccess: 'ሊንክ ስሒር ተፈጢሩ — ኣብ ሓድሽ ታብ ይኽፈት ኣሎ',
        impersonationFailed: 'ሊንክ ምስላ ምፍጣር ኣይተኻእለን',
        resetSuccess: 'ሊንክ ምቅይራ ተፈጢሩ — ኣብ ሓድሽ ታብ ይኽፈት ኣሎ',
        resetFailed: 'ሊንክ ምቅይራ ምፍጣር ኣይተኻእለን',
        walletSuccessTemplate: 'ዋሌት ተስተኻኺሉ። ሓድሽ ተረፍ ሂሳብ: {balance} ብር',
        walletFailed: 'ዋሌት ምስትኽኻል ኣይተኻእለን',
        agentOverrideSuccess: 'መጠን ወኪል ብዓወት ተቐይሩ',
        agentOverrideFailed: 'መጠን ወኪል ምቕያር ኣይተኻእለን',
        orphanSuccess: 'ተጠቃሚ ካብ ዛፍ MLM ተጠሪሩ',
        orphanFailed: 'ተጠቃሚ ምጥራር ኣይተኻእለን',
        banSuccess: 'ተጠቃሚ ብዓወት ተኸልኪሉ',
        banFailed: 'ተጠቃሚ ምኽልካል ኣይተኻእለን',
        unbanSuccess: 'ተጠቃሚ ካብ ምኽልካል ብዓወት ተኣልዩ',
        unbanFailed: 'ተጠቃሚ ካብ ምኽልካል ምእላይ ኣይተኻእለን',
        enrollSuccess: 'ተጠቃሚ ብኢድ ተመዝጊቡ',
        enrollFailed: 'ተጠቃሚ ምምዝጋብ ኣይተኻእለን',
        loadError: 'ዝርዝር ተጠቃሚ ምጽዓን ኣይተኻእለን',
      },
    },
  },
};