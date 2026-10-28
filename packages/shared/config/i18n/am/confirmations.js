/**
 * @fileoverview አማርኛ — Confirmations Namespace
 *
 * Every confirmation dialog string used by the platform. Consumed by:
 *   - apps/web/lib/api.js (interceptor default messages)
 *   - apps/web/components/shared/ConfirmDialog.jsx (button labels)
 *   - apps/web/pages/admin/users/[id]/index.jsx (God Mode actions)
 *
 * Adding a new confirmation pattern means adding an entry here and
 * referencing it by key from api.js or a page's `useConfirm()` call.
 *
 * Path: packages/shared/config/i18n/am/confirmations.js
 */

module.exports = {
  confirmations: {
    /* ── Default button labels + fallbacks ── */
    defaults: {
      confirmText: 'አረጋግጥ',
      cancelText: 'ሰርዝ',
      processingText: 'በሂደት ላይ...',
      requireInputPrefix: 'ያስገቡ',
      requireInputSuffix: 'ለማረጋገጥ:',
      fallbackTitle: 'አረጋግጥ',
      cancelledMessage: 'ተግባሩ በተጠቃሚው ተሰርዟል።',
    },

    /* ── Interceptor-driven actions (matched by URL pattern) ── */
    actions: {
      /* Deletes */
      deleteCourse: {
        title: 'ይህን ኮርስ በቋሚነት ይሰርዙ?',
        message: 'ሁሉም ትምህርቶች፣ ምዝገባዎች እና የክፍያ ታሪክ ለዚህ ኮርስ በቋሚነት ይወገዳሉ። ይህ ሊቀለበስ አይችልም።',
        confirmText: 'ኮርሱን ሰርዝ',
        variant: 'danger',
      },
      deleteVideo: {
        title: 'ይህን ቪዲዮ ይሰርዙ?',
        message: 'ቪዲዮው ከስርዓተ ትምህርቱ ይወገዳል።',
        confirmText: 'ቪዲዮውን ሰርዝ',
        variant: 'danger',
      },
      deleteDiscussion: {
        title: 'ይህን ውይይት ይሰርዙ?',
        message: 'የውይይት ቪዲዮው ይወገዳል።',
        confirmText: 'ሰርዝ',
        variant: 'danger',
      },
      deleteDiscount: {
        title: 'ይህን የቅናሽ ኮድ ይሰርዙ?',
        message: 'ይህን ኮድ ያስቀመጡ ተማሪዎች ከእንዲህ ወዲያ ሊጠቀሙበት አይችሉም።',
        confirmText: 'ኮዱን ሰርዝ',
        variant: 'danger',
      },
      deleteLesson: {
        title: 'ይህን ትምህርት ይሰርዙ?',
        message: 'የትምህርቱ ይዘት ይወገዳል።',
        confirmText: 'ሰርዝ',
        variant: 'danger',
      },
      deletePhase: {
        title: 'ይህን ደረጃ ይሰርዙ?',
        message: 'በዚህ ደረጃ ውስጥ ያሉ ሁሉም ሳምንታት እና ትምህርቶች ይወገዳሉ።',
        confirmText: 'ደረጃውን ሰርዝ',
        variant: 'danger',
      },
      deleteWeek: {
        title: 'ይህን ሳምንት ይሰርዙ?',
        message: 'በዚህ ሳምንት ውስጥ ያሉ ሁሉም ትምህርቶች ይወገዳሉ።',
        confirmText: 'ሰርዝ',
        variant: 'danger',
      },
      deleteAdmin: {
        title: 'ይህን የአስተዳዳሪ መለያ ይሰርዙ?',
        message: 'ወዲያውኑ የአስተዳዳሪ ፓነል መዳረሻቸውን ያጣሉ።',
        confirmText: 'አስተዳዳሪውን ሰርዝ',
        variant: 'danger',
      },
      deleteGeneric: {
        title: 'ይህን ንጥል ይሰርዙ?',
        message: 'ይህ ተግባር ሊቀለበስ አይችልም።',
        confirmText: 'ሰርዝ',
        variant: 'danger',
      },

      /* Payments */
      approvePayment: {
        title: 'ይህን ክፍያ ያጽድቁ?',
        message: 'ተማሪው ወዲያውኑ ይመዘገባል እና የወኪል/MLM ኮሚሽኖች ይከፈላሉ።',
        confirmText: 'አጽድቅ',
        variant: 'warning',
      },
      rejectPayment: {
        title: 'ይህን ክፍያ ይገቱ?',
        message: 'ተማሪው ማሳወቂያ ይደርሰዋል እና መዳረሻ አያገኝም።',
        confirmText: 'ግቓ',
        variant: 'danger',
      },
      bulkApprovePayments: {
        title: 'ክፍያዎችን በጅምላ ያጽድቁ?',
        message: 'የተመረጠው እያንዳንዱ ክፍያ ይጸድቃል እና ሁሉም ኮሚሽኖች ይከፈላሉ።',
        confirmText: 'በጅምላ አጽድቅ',
        variant: 'warning',
      },

      /* Withdrawals */
      processWithdrawal: {
        title: 'ይህን ወጪ ያስኬዱ?',
        message: 'ማጽደቅ እንደተከፈለ ያመላክታል። መግባት ገንዘቡን ወደ ዋሌቱ ይመልሳል።',
        confirmText: 'አስካሂድ',
        variant: 'warning',
      },
      requestWithdrawal: {
        title: 'ወጪ ይጠይቁ?',
        message: 'አስተዳዳሪ ያስኬደዋል። መጠኑ ከዋሌትዎ ተይዟል።',
        confirmText: 'ጥያቄ አስገባ',
        variant: 'warning',
      },

      /* Bulk user actions */
      bulkUserAction: {
        title: 'በተጠቃሚዎች ላይ የጅምላ ተግባር ይተግብሩ?',
        message: 'ይህ በአንድ ጊዜ በተለያዩ መለያዎች ላይ ተጽዕኖ ያሳድራል።',
        confirmText: 'በሁሉም ላይ ተግብር',
        variant: 'warning',
      },

      /* Settings */
      saveSettings: {
        title: 'ቅንብሮችን ያስቀምጡ?',
        message: 'የዋጋ ለውጦች ወዲያውኑ በይፋዊው ጣቢያ ላይ ይታያሉ።',
        confirmText: 'ለውጦችን አስቀምጥ',
        variant: 'warning',
      },
      resetSettings: {
        title: 'ቅንብሮችን ወደ ነባሪ ይመልሱ?',
        message: 'ይህ ክፍል ወደ ነባሪ እሴቶች ይመለሳል።',
        confirmText: 'እንደነበር መልስ',
        variant: 'danger',
      },

      /* Announcements */
      broadcastAnnouncement: {
        title: 'ይህን ማስታወቂያ ያስተላልፉ?',
        message: 'እያንዳንዱ ተቀባይ ይህን ማሳወቂያ ይደርሰዋል። አንድ ጊዜ ከተላከ ሊመለስ አይችልም።',
        confirmText: 'ማስታወቂያ ላክ',
        variant: 'warning',
      },

      /* Student-facing */
      submitPayment: {
        title: 'የክፍያ ማረጋገጫ ያስገቡ?',
        message: 'አስተዳዳሪ ክፍያዎን ይገመግማል እና መዳረሻ ያጸድቃል።',
        confirmText: 'ክፍያ አስገባ',
        variant: 'warning',
      },
      changePassword: {
        title: 'የይለፍ ቃልዎን ይቀይሩ?',
        message: 'ለሚቀጥለው መግቢያዎ አዲሱን የይለፍ ቃል መጠቀም ይኖርብዎታል።',
        confirmText: 'የይለፍ ቃል ቀይር',
        variant: 'warning',
      },
      saveProfile: {
        title: 'የመገለጫ ለውጦችን ያስቀምጡ?',
        message: 'የመገለጫ መረጃዎ ይዘምናል።',
        confirmText: 'አስቀምጥ',
        variant: 'default',
      },

      /* ── God Mode — admin user detail page (imperative useConfirm) ── */
      godmodeEnroll: {
        title: 'ተጠቃሚውን እንደተመዘገበ ምልክት ያድርጉ?',
        message: 'ተጠቃሚው ወዲያውኑ ሙሉ የኮርስ መዳረሻ ያገኛል።',
        confirmText: 'እንደተመዘገበ ምልክት አድርግ',
        variant: 'warning',
      },
      godmodeUnenroll: {
        title: 'ይህን ተጠቃሚ ከምዝገባ ያስወግዱ?',
        message: 'ተጠቃሚው የኮርስ መዳረሻውን ያጣል። የሪፈራል ገቢ እንዳለ ይቆያል።',
        confirmText: 'ከምዝገባ አስወግድ',
        variant: 'danger',
      },
      godmodeImpersonate: {
        title: 'የማስመሰል አገናኝ ይፍጠሩ?',
        message: 'የ5 ደቂቃ አስማት አገናኝ ይፈጠራል። በአዲስ ትር ውስጥ ይከፍቱታል — የአስተዳዳሪ ክፍለ ጊዜዎ እንዳለ ይቆያል።',
        confirmText: 'አገናኝ ፍጠር',
        variant: 'warning',
      },
      godmodePasswordReset: {
        title: 'የይለፍ ቃል መቀየሪያ አገናኝ ይፍጠሩ?',
        message: 'ለዚህ ተጠቃሚ የአንድ ጊዜ አገናኝ ይፈጠራል። አዲስ የይለፍ ቃል ለማዘጋጀት ሊጠቀሙበት ይችላሉ።',
        confirmText: 'መቀየሪያ አገናኝ ፍጠር',
        variant: 'warning',
      },
      godmodeWalletAdjust: {
        title: 'የዋሌት ማስተካከያ ያረጋግጡ',
        messageTemplate: 'እርስዎ {direction} {amount} ብር ሊያደርጉ ነው። ምክንያት: "{reason}"። ይህ በኦዲት መዝገብ ውስጥ ይመዘገባል።',
        confirmText: 'ማስተካከያ ተግብር',
        variant: 'warning',
      },
      godmodeWalletAdjustLarge: {
        title: 'ትልቅ የዋሌት ማስተካከያ — መጠኑን ያረጋግጡ',
        messageTemplate: 'እርስዎ {direction} {amount} ብር ሊያደርጉ ነው። ምክንያት: "{reason}"። ይህ በኦዲት መዝገብ ውስጥ ይመዘገባል።',
        confirmText: 'ማስተካከያ ተግብር',
        variant: 'danger',
        requireInput: 'ADJUST',
      },
      godmodeAgentOverride: {
        title: 'የወኪል ኮሚሽን መጠን ይቀይሩ?',
        messageTemplate: 'አዲሱ መጠን በእያንዳንዱ ሽያጭ {value} {unit} ይሆናል። ይህ ለዚህ ወኪል ሁሉንም የወደፊት ኮሚሽኖች ይነካል።',
        confirmText: 'መጠን ቀይር',
        variant: 'warning',
      },
      godmodeOrphan: {
        title: 'ይህን ተጠቃሚ ከMLM ዛፍ ያጠሩ?',
        message: 'ሁሉም የቅድመ አያት አገናኞች ይወገዳሉ። ተጠቃሚው የራሱን የታችኛውን መስመር ይይዛል። ይህ ተግባር ይመዘገባል እና ሊቀለበስ አይችልም።',
        confirmText: 'ተጠቃሚውን አጥራ',
        variant: 'danger',
        requireInput: 'ORPHAN',
      },
      godmodeBan: {
        title: 'ይህን ተጠቃሚ ያግዱ?',
        message: 'ወዲያውኑ መዳረሻቸውን ያጣሉ። የወኪል እና የሪፈራል ኮዶቻቸው ይሰረዛሉ። ይህ ይመዘገባል ነገር ግን ከእርዳታ ማንሳት ተግባር ሊቀለበስ ይችላል።',
        confirmText: 'ተጠቃሚውን አግድ',
        variant: 'danger',
        requireInput: 'BAN',
      },
      godmodeUnban: {
        title: 'ይህን ተጠቃሚ ከእገዳ ያንሱ?',
        message: 'ወደ መድረኩ መዳረሻቸውን ይመለሳሉ። የወኪል እና የሪፈራል ኮዶቻቸው እንደገና ይነቃቃሉ ስለዚህ እንደገና ማግኘት ይችላሉ።',
        confirmText: 'ከእገዳ አንሳ',
        variant: 'warning',
        requireInput: 'UNBAN',
      },
      godmodeManualEnroll: {
        title: 'ያለክፍያ ሙሉ የኮርስ መዳረሻ ይስጡ?',
        messageTemplate: 'ተጠቃሚው ያለ ክፍያ መዝገብ በሙሉ ኮርስ ውስጥ ይመዘገባል። ምክንያት: "{reason}"። ይህ በኦዲት መዝገብ ውስጥ ይመዘገባል።',
        confirmText: 'መዳረሻ ስጥ',
        variant: 'warning',
      },
    },
  },
};