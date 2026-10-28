/**
 * @fileoverview አማርኛ — Admin Namespace
 *
 * Contains admin-specific UI copy including:
 *   - Coming Soon stub labels (one per unfinished CRUD route)
 *   - Announcements composer labels
 *   - Agent management labels
 *   - God Mode UI (user detail page: wallet, agent, ban/unban, impersonation)
 *
 * All copy is config-driven — no hardcoded strings in JSX components.
 *
 * Path: packages/shared/config/i18n/am/admin.js
 */

module.exports = {
  admin: {
    comingSoon: {
      eyebrow: 'በስራ ላይ',
      heading: 'ይህ ባህሪ በመገንባት ላይ ነው',
      description:
        'ቡድናችን ለዚህ ገጽ የተጣራ ተሞክሮ በመስራት ላይ ነው። በቅርቡ ሙሉ የመፍጠር፣ የማረት እና የመሰረዝ ሂደቶች ጋር ይገኛል።',
      subtitle: 'ይህ ባህሪ በቅርቡ ይመጣል',
      contactSupport: 'አሁን ይህን ይፈልጋሉ? ድጋፍን ያግኙ',
      supportEmail: process.env.SUPPORT_EMAIL || 'support@abyssinia-academy.com',
      footerNote: 'የምህንድስና ቡድን በላዩ ላይ ነው — ይህ ገጽ በቀጣይ ዝመና ውስጥ ይነቃል።',
      defaultTitle: 'ባህሪ በቅርቡ ይመጣል',
      defaultBack: 'ተመለስ',

      editCourse: 'ኮርስ አርትዕ',
      addVideo: 'ቪዲዮ ጨምር',
      editVideo: 'ቪዲዮ አርትዕ',
      addDiscussion: 'ውይይት ጨምር',
      editDiscussion: 'ውይይት አርትዕ',
      addDiscount: 'አዲስ የቅናሽ ኮድ',
      viewDiscount: 'የቅናሽ ዝርዝሮች',
      editDiscount: 'የቅናሽ ኮድ አርትዕ',
      viewAdmin: 'የአስተዳዳሪ ዝርዝሮች',

      backToCourses: 'ወደ ኮርሶች ተመለስ',
      backToVideos: 'ወደ ቪዲዮዎች ተመለስ',
      backToDiscussions: 'ወደ ውይይቶች ተመለስ',
      backToDiscounts: 'ወደ ቅናሾች ተመለስ',
      backToAdmins: 'ወደ አስተዳዳሪዎች ተመለስ',
    },

    announcements: {
      navLabel: 'ማስታወቂያዎች',
      pageTitle: 'ማስታወቂያዎች',
      pageSubtitle: 'ለሁሉም ተጠቃሚዎች፣ ለተመዘገቡ ተጠቃሚዎች ወይም ለተወሰኑ ተጠቃሚዎች መልእክቶችን ያስተላልፉ',
      backToDashboard: 'ወደ ዳሽቦርድ ተመለስ',

      tabCompose: 'አጻጽፍ',
      tabHistory: 'ታሪክ',

      audienceLabel: 'ላክ ለ',
      audienceAll: 'ሁሉም ተጠቃሚዎች',
      audienceEnrolled: 'የተመዘገቡ ብቻ',
      audienceTargeted: 'የተወሰኑ ተጠቃሚዎች',
      audienceSingle: 'አንድ ተጠቃሚ',

      targetedLabel: 'ተጠቃሚዎችን ይምረጡ',
      targetedCountSuffix: 'ተመርጠዋል',
      targetedPlaceholder: 'በስም፣ በስልክ ወይም በኢሜይል ይፈልጉ…',
      targetedHint: 'ቢያንስ 2 ፊደሎችን ያስገቡ። ለመጨመር ማንኛውንም ውጤት ይጫኑ። የሚፈልጉትን ያህል ተጠቃሚዎች መምረጥ ይችላሉ።',
      removeUser: 'ተጠቃሚ አስወግድ',
      noResults: 'ከፍለጋዎ ጋር የሚዛመድ ተጠቃሚ የለም',
      noEmail: 'ኢሜይል የለም',

      singlePlaceholder: 'ስልክ ወይም ኢሜይል ያስገቡ',
      singleHint: 'ከስልክ ቁጥር ወይም ከኢሜይል አድራሻ ጋር ይዛመዳል',

      titleLabel: 'ርዕስ',
      titlePlaceholder: 'ለምሳሌ፣ አዲስ የኮርስ ማስጀመሪያ ማስታወቂያ',
      bodyLabel: 'መልእክት',
      bodyPlaceholder: 'የማስታወቂያ መልእክትዎን ይጻፉ…',

      severityLabel: 'አስቸኳይነት',
      severityInfo: 'መረጃ',
      severitySuccess: 'ስኬት',
      severityWarning: 'ማስጠንቀቂያ',
      severityCritical: 'አስቸኳይ',

      sendBtn: 'ማስታወቂያ ላክ',
      sending: 'በመላክ ላይ…',
      cancel: 'ሰርዝ',

      previewLabel: 'ቀጥታ ቅድመ እይታ',
      previewTitlePlaceholder: 'ርዕስዎ እዚህ ይታያል',
      previewBodyPlaceholder: 'መልእክትዎ እዚህ ይታያል',
      previewTimeJustNow: 'አሁን',
      previewAudienceLabel: 'ተመልካቾች',
      previewSeverityLabel: 'አስቸኳይነት',
      previewWarning: 'ሁሉም ተቀባዮች ይህን ማስታወቂያ በመልእክት ሳጥናቸው ውስጥ እንደ ማሳወቂያ ይቀበላሉ።',

      confirmTitle: 'ስርጭቱን ያረጋግጡ',
      confirmBody:
        'ይህን ማስታወቂያ ልትልኩ ነው። ይህ ተግባር ሊቀለበስ አይችልም እና አንድ ጊዜ ከተላከ ሊመለስ አይችልም።',
      confirmInputLabel: 'ለማረጋገጥ SEND ይተይቡ',
      confirmBtn: 'ስርጭት ላክ',

      historyTitle: 'የስርጭት ታሪክ',
      refreshHistory: 'አድስ',
      historyEmpty: 'እስካሁን ምንም ማስታወቂያ አልተላከም።',
      historyLoadFailed: 'የስርጭት ታሪክን መጫን አልተቻለም።',
      historyColWhen: 'መቼ',
      historyColTitle: 'ርዕስ',
      historyColAudience: 'ተመልካቾች',
      historyColRecipients: 'ተቀባዮች',
      historyColSentBy: 'የተላከው በ',

      timeJustNow: 'አሁን',
      timeMinutesAgo: 'ከ{count} ደቂቃ በፊት',
      timeHoursAgo: 'ከ{count} ሰዓት በፊት',
      timeDaysAgo: 'ከ{count} ቀን በፊት',

      successToast: 'ማስታወቂያ ለ{count} ተቀባይ(ዎች) ተልኳል',
      validationFailed: 'እባክዎ ሁሉንም አስፈላጊ መስኮች ይሙሉ',
      sendFailed: 'ማስታወቂያ መላክ አልተቻለም። እባክዎ እንደገና ይሞክሩ።',
    },

    /* ── Agent Management ── */
    agentsTitle: 'የወኪል አስተዳደር',
    agentsSubtitle: 'የወኪል ኮሚሽን መጠኖችን ያዋቅሩ እና አፈጻጸምን ይመልከቱ።',
    agentName: 'የወኪል ስም',
    agentCode: 'የወኪል ኮድ',
    agentSales: 'ጠቅላላ ሽያጭ',
    agentEarned: 'ጠቅላላ ገቢ',
    commissionType: 'የኮሚሽን ዓይነት',
    commissionValue: 'የኮሚሽን ዋጋ',
    agentStatus: 'ሁኔታ',

    /* ═══════════════════════════════════════════════════════════════════════
       GOD MODE — User Detail Page
       Every string rendered by apps/web/pages/admin/users/[id]/index.jsx
       ═══════════════════════════════════════════════════════════════════════ */
    godMode: {
      /* Page chrome */
      backToUsers: 'ወደ ተጠቃሚዎች ተመለስ',
      userDetailsTitle: 'የተጠቃሚ ዝርዝሮች',
      loadingUser: 'የተጠቃሚ መረጃ በመጫን ላይ...',
      userNotFoundTitle: 'ተጠቃሚ አልተገኘም',
      userNotFoundSubtitle: 'የተጠየቀው ተጠቃሚ የለም።',
      unknownUser: 'ያልታወቀ',

      /* Header meta */
      joined: 'የተቀላቀለው',
      notAvailable: 'የለም',
      emDash: '—',

      /* Status badges */
      statusBanned: 'የተከለከለ',
      statusEnrolled: 'የተመዘገበ',
      statusRegistered: 'የተመዘገበ ብቻ',

      /* Header actions */
      unenroll: 'ከምዝገባ አስወግድ',
      markEnrolled: 'እንደተመዘገበ ምልክት አድርግ',

      /* Stats row */
      stats: {
        directReferrals: 'ቀጥታ ሪፈራሎች',
        teamSize: 'የቡድን መጠን',
        payingDirect: 'የሚከፍሉ ቀጥታ',
        lifetimeEarned: 'የህይወት ጊዜ ገቢ',
      },

      /* Tabs */
      tabs: {
        overview: 'አጠቃላይ እይታ',
        walletAndAgent: 'ዋሌት እና ወኪል',
        godMode: 'God Mode',
      },

      /* Overview tab */
      overview: {
        enrollmentHistory: 'የምዝገባ ታሪክ',
        noEnrollments: 'እስካሁን ምዝገባ የለም።',
        referralHistory: 'የሪፈራል ታሪክ',
        noReferrals: 'እስካሁን ሪፈራል የለም።',
        fullCoursePass: 'ሙሉ የኮርስ ፓስ',
        phaseBundle: 'የደረጃ ጥቅል',
      },

      /* Wallet tab */
      wallet: {
        heading: 'ዋሌት',
        currentBalance: 'የአሁኑ ቀሪ ሂሳብ',
        totalEarned: 'ጠቅላላ ገቢ',
        totalWithdrawn: 'ጠቅላላ ወጪ',
        pendingWithdrawal: 'በመጠባበቅ ላይ ያለ ወጪ',
        manualAdjustment: 'በእጅ የዋሌት ማስተካከያ',
        adjustmentHint:
          'አዎንታዊ ቁጥሮች ዋሌቱን ይጨምራሉ። አሉታዊ ቁጥሮች ይመልሳሉ። ≥ 10,000 ብር ማስተካከያዎች ለማረጋገጥ ADJUST መተየብ ይፈልጋሉ።',
        amountPlaceholder: 'በብር መጠን (ለምሳሌ፣ 500 ወይም -500)',
        reasonPlaceholder: 'ምክንያት (ቢያንስ 5 ፊደሎች — በኦዲት ይመዘገባል)',
        applyAdjustment: 'ማስተካከያ ተግብር',
        applying: 'በመተግበር ላይ...',
        currency: 'ብር',
      },

      /* Agent tab */
      agent: {
        heading: 'የወኪል ሁኔታ',
        agentCode: 'የወኪል ኮድ',
        commissionType: 'የኮሚሽን ዓይነት',
        commissionValue: 'የኮሚሽን ዋጋ',
        agentActive: 'ወኪል ንቁ',
        yes: 'አዎ',
        no: 'አይ',
        fixedType: 'ቋሚ',
        percentageType: 'በመቶኛ',
        overrideHeading: 'የኮሚሽን መጠን ቀይር',
        fixedOption: 'ቋሚ (በሽያጭ ብር)',
        percentageOption: 'መቶኛ (%)',
        overridePlaceholderFixed: 'ለምሳሌ፣ 500',
        overridePlaceholderPercentage: 'ለምሳሌ፣ 15',
        overrideRate: 'መጠን ቀይር',
        applying: 'በመተግበር ላይ...',
      },

      /* God Mode tab — impersonation */
      impersonation: {
        heading: 'ማስመሰል እና መዳረሻ',
        hint:
          'የ5 ደቂቃ አስማት አገናኝ ይፈጥራል። በአዲስ ትር ውስጥ ይከፈታል — የአስተዳዳሪ ክፍለ ጊዜዎ እንዳለ ይቆያል።',
        generateLink: 'የማስመሰል አገናኝ ፍጠር',
        generateReset: 'የይለፍ ቃል መቀየሪያ አገናኝ ፍጠር',
      },

      /* God Mode tab — manual enrollment */
      manualEnroll: {
        heading: 'በእጅ ምዝገባ',
        hint:
          'ያለ ክፍያ መዝገብ ሙሉ የኮርስ መዳረሻ ይሰጣል። ለጥሬ ገንዘብ ምዝገባዎች ወይም ለነፃ ትምህርት ይጠቀሙበት።',
        reasonPlaceholder: 'ምክንያት (ቢያንስ 5 ፊደሎች — በኦዲት ይመዘገባል)',
        button: 'ሙሉ የኮርስ መዳረሻ ስጥ',
        enrolling: 'በማስመዝገብ ላይ...',
      },

      /* God Mode tab — network & account */
      network: {
        heading: 'ኔትወርክ እና መለያ',
        orphanButton: 'ከMLM ዛፍ አጥራ',
      },

      /* Danger zone — ban form */
      ban: {
        heading: 'አደገኛ ክፍል — እገዳ',
        hint:
          'ተጠቃሚውን ያግዳል እና የወኪል + የሪፈራል ኮዶቻቸውን ይሰርዛል። ይህ ተግባር ይመዘገባል እና ከታች ካለው የእገዳ ማንሳት ተግባር ሊቀለበስ ይችላል።',
        reasonPlaceholder: 'የእገዳ ምክንያት (ቢያንስ 5 ፊደሎች)',
        button: 'ተጠቃሚውን አግድ',
      },

      /* Danger zone — unban form */
      unban: {
        heading: 'ተጠቃሚው በአሁኑ ጊዜ ተከልክሏል',
        bannedOnTemplate: 'በ{date} ተከልክሏል — ምክንያት: {reason}',
        noReason: '—',
        hint:
          'ከእገዳ ማንሳት መዳረሻን ይመልሳል እና የወኪል እና የሪፈራል ኮዶቻቸውን እንደገና ያነቃቃል። ይህ በኦዲት መዝገብ ውስጥ ይመዘገባል።',
        notePlaceholder: 'ለኦዲት መዝገብ አማራጭ ማስታወሻ',
        button: 'ተጠቃሚውን ከእገዳ አንሳ',
        unbanning: 'ከእገዳ በማንሳት ላይ...',
      },

      /* Toasts */
      toasts: {
        statusUpdated: 'የተጠቃሚ ሁኔታ ተዘምኗል',
        statusFailed: 'ሁኔታን ማዘመን አልተቻለም',
        impersonationSuccess: 'አስማት አገናኝ ተፈጥሯል — በአዲስ ትር ውስጥ በመክፈት ላይ',
        impersonationFailed: 'የማስመሰል አገናኝ መፍጠር አልተቻለም',
        resetSuccess: 'መቀየሪያ አገናኝ ተፈጥሯል — በአዲስ ትር ውስጥ በመክፈት ላይ',
        resetFailed: 'መቀየሪያ አገናኝ መፍጠር አልተቻለም',
        walletSuccessTemplate: 'ዋሌት ተስተካክሏል። አዲስ ቀሪ ሂሳብ: {balance} ብር',
        walletFailed: 'ዋሌትን ማስተካከል አልተቻለም',
        agentOverrideSuccess: 'የወኪል መጠን በተሳካ ሁኔታ ተቀይሯል',
        agentOverrideFailed: 'የወኪል መጠን መቀየር አልተቻለም',
        orphanSuccess: 'ተጠቃሚው ከMLM ዛፍ ተጠርቷል',
        orphanFailed: 'ተጠቃሚውን ማጥራት አልተቻለም',
        banSuccess: 'ተጠቃሚው በተሳካ ሁኔታ ተከልክሏል',
        banFailed: 'ተጠቃሚውን ማገድ አልተቻለም',
        unbanSuccess: 'ተጠቃሚው ከእገዳ በተሳካ ሁኔታ ተነስቷል',
        unbanFailed: 'ተጠቃሚውን ከእገዳ ማንሳት አልተቻለም',
        enrollSuccess: 'ተጠቃሚው በእጅ ተመዝግቧል',
        enrollFailed: 'ተጠቃሚውን ማስመዝገብ አልተቻለም',
        loadError: 'የተጠቃሚ ዝርዝሮችን መጫን አልተቻለም',
      },
    },
  },
};