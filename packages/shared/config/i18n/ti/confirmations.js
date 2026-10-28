/**
 * @fileoverview ትግርኛ — Confirmations Namespace
 *
 * Every confirmation dialog string used by the platform. Consumed by:
 *   - apps/web/lib/api.js (interceptor default messages)
 *   - apps/web/components/shared/ConfirmDialog.jsx (button labels)
 *   - apps/web/pages/admin/users/[id]/index.jsx (God Mode actions)
 *
 * Adding a new confirmation pattern means adding an entry here and
 * referencing it by key from api.js or a page's `useConfirm()` call.
 *
 * Path: packages/shared/config/i18n/ti/confirmations.js
 */

module.exports = {
  confirmations: {
    /* ── Default button labels + fallbacks ── */
    defaults: {
      confirmText: 'ኣረጋግጽ',
      cancelText: 'ሰርዝ',
      processingText: 'ኣብ መስርሕ...',
      requireInputPrefix: 'ኣእቱ',
      requireInputSuffix: 'ንምርግጋጽ:',
      fallbackTitle: 'ኣረጋግጽ',
      cancelledMessage: 'ተግባሩ ብተጠቃሚ ተሰሪዙ።',
    },

    /* ── Interceptor-driven actions (matched by URL pattern) ── */
    actions: {
      /* Deletes */
      deleteCourse: {
        title: 'ነዚ ኮርስ ብቐዋሚ ክትስርዞ?',
        message: 'ኩሎም ትምህርትታት፣ ምዝገባታትን ታሪኽ ክፍሊትን ንዚ ኮርስ ብቐዋሚ ክወገዱ እዮም። እዚ ክምለስ ኣይኽእልን።',
        confirmText: 'ኮርስ ስርዝ',
        variant: 'danger',
      },
      deleteVideo: {
        title: 'ነዚ ቪድዮ ክትስርዞ?',
        message: 'ቪድዮ ካብ ስርዓተ ትምህርቲ ክወገድ እዩ።',
        confirmText: 'ቪድዮ ስርዝ',
        variant: 'danger',
      },
      deleteDiscussion: {
        title: 'ነዚ ምይይጥ ክትስርዞ?',
        message: 'ቪድዮ ምይይጥ ክወገድ እዩ።',
        confirmText: 'ስርዝ',
        variant: 'danger',
      },
      deleteDiscount: {
        title: 'ነዚ ኮድ ቅናሽ ክትስርዞ?',
        message: 'ነዚ ኮድ ዝሓዙ ተምሃሮ ካብ ሕጂ ንደሓር ክጥቀሙሉ ኣይኽእሉን።',
        confirmText: 'ኮድ ስርዝ',
        variant: 'danger',
      },
      deleteLesson: {
        title: 'ነዚ ትምህርቲ ክትስርዞ?',
        message: 'ትሕዝቶ ትምህርቲ ክወገድ እዩ።',
        confirmText: 'ስርዝ',
        variant: 'danger',
      },
      deletePhase: {
        title: 'ነዚ ደረጃ ክትስርዞ?',
        message: 'ኩሎም ሰሙናትን ትምህርትታትን ኣብዚ ደረጃ ክወገዱ እዮም።',
        confirmText: 'ደረጃ ስርዝ',
        variant: 'danger',
      },
      deleteWeek: {
        title: 'ነዚ ሰሙን ክትስርዞ?',
        message: 'ኩሎም ትምህርትታት ኣብዚ ሰሙን ክወገዱ እዮም።',
        confirmText: 'ስርዝ',
        variant: 'danger',
      },
      deleteAdmin: {
        title: 'ነዚ ኣካውንት ኣማሓዳሪ ክትስርዞ?',
        message: 'ብኡንብኡ ናብ ፓነል ኣማሓዳሪ ዘለዎ መእተዊ ክጠፍኦ እዩ።',
        confirmText: 'ኣማሓዳሪ ስርዝ',
        variant: 'danger',
      },
      deleteGeneric: {
        title: 'ነዚ ንጥረ ነገር ክትስርዞ?',
        message: 'እዚ ተግባር ክምለስ ኣይኽእልን።',
        confirmText: 'ስርዝ',
        variant: 'danger',
      },

      /* Payments */
      approvePayment: {
        title: 'ነዚ ክፍሊት ክትፈቅዶ?',
        message: 'ተምሃራይ ብኡንብኡ ክምዝገብ እዩ እሞ ኮሚሽናት ወኪል/MLM ክኽፈሉ እዮም።',
        confirmText: 'ፍቐድ',
        variant: 'warning',
      },
      rejectPayment: {
        title: 'ነዚ ክፍሊት ክትነጽጎ?',
        message: 'ተምሃራይ ምልክት ክበጽሖ እዩ እሞ መእተዊ ኣይክረክብን።',
        confirmText: 'ንጸግ',
        variant: 'danger',
      },
      bulkApprovePayments: {
        title: 'ክፍሊታት ብጅምላ ክትፈቅዶ?',
        message: 'ኩሎም ዝተመርጹ ክፍሊታት ክፍቀዱ እዮም እሞ ኩሎም ኮሚሽናት ክኽፈሉ እዮም።',
        confirmText: 'ብጅምላ ፍቐድ',
        variant: 'warning',
      },

      /* Withdrawals */
      processWithdrawal: {
        title: 'ነዚ ወጻኢ ክትሰርሖ?',
        message: 'ምፍቃድ ከም ዝተኸፈለ ይሕብር። ምንጻግ ገንዘብ ናብ ዋሌት ይመልስ።',
        confirmText: 'ስራሕ',
        variant: 'warning',
      },
      requestWithdrawal: {
        title: 'ወጻኢ ክትሓትት?',
        message: 'ኣማሓዳሪ ክሰርሖ እዩ። መጠኑ ካብ ዋሌትካ ተተሓዚሉ ኣሎ።',
        confirmText: 'ሕቶ ኣእቱ',
        variant: 'warning',
      },

      /* Bulk user actions */
      bulkUserAction: {
        title: 'ኣብ ተጠቀምቲ ብጅምላ ተግባር ክትትግብር?',
        message: 'እዚ ብሓደ ግዜ ኣብ ብዙሓት ኣካውንታት ጽልዋ ይገብር።',
        confirmText: 'ኣብ ኩሎም ተግብር',
        variant: 'warning',
      },

      /* Settings */
      saveSettings: {
        title: 'ቅጥዕታት ክትዕቅብ?',
        message: 'ለውጥታት ዋጋ ብኡንብኡ ኣብ ወግዓዊ መርበብ ይረአ።',
        confirmText: 'ለውጥታት ዓቅብ',
        variant: 'warning',
      },
      resetSettings: {
        title: 'ቅጥዕታት ናብ ነባሪ ክትመልስ?',
        message: 'እዚ ክፍሊ ናብ ነባሪ ዋጋታት ክምለስ እዩ።',
        confirmText: 'ከም ነበሮ መልስ',
        variant: 'danger',
      },

      /* Announcements */
      broadcastAnnouncement: {
        title: 'ነዚ ምልክት ክትመሓላልፍ?',
        message: 'ኩሎም ተቐበልቲ ነዚ ምልክት ክበጽሖም እዩ። ሓንሳብ ምስ ተላእከ ክምለስ ኣይኽእልን።',
        confirmText: 'ምልክት ላእኽ',
        variant: 'warning',
      },

      /* Student-facing */
      submitPayment: {
        title: 'መረጋገጺ ክፍሊት ክትኣእቱ?',
        message: 'ኣማሓዳሪ ክፍሊትካ ክግምግም እዩ እሞ መእተዊ ክፈቅድ እዩ።',
        confirmText: 'ክፍሊት ኣእቱ',
        variant: 'warning',
      },
      changePassword: {
        title: 'መሕለፊ ቃልካ ክትቅይር?',
        message: 'ንዝቕጽል እቶትካ ሓድሽ መሕለፊ ቃል ክትጥቀም ክትግደድ ኢኻ።',
        confirmText: 'መሕለፊ ቃል ቅይር',
        variant: 'warning',
      },
      saveProfile: {
        title: 'ለውጥታት መግለጺ ክትዕቅብ?',
        message: 'ሓበሬታ መግለጺኻ ክሕደስ እዩ።',
        confirmText: 'ዓቅብ',
        variant: 'default',
      },

      /* ── God Mode — admin user detail page (imperative useConfirm) ── */
      godmodeEnroll: {
        title: 'ተጠቃሚ ከም ዝተመዝገበ ምልክት ክትገብር?',
        message: 'ተጠቃሚ ብኡንብኡ ምሉእ መእተዊ ኮርስ ክረክብ እዩ።',
        confirmText: 'ከም ዝተመዝገበ ምልክት ግበር',
        variant: 'warning',
      },
      godmodeUnenroll: {
        title: 'ነዚ ተጠቃሚ ካብ ምዝገባ ክትኣውጽ?',
        message: 'ተጠቃሚ መእተዊ ኮርስ ክጠፍኦ እዩ። ኣታዊ ሪፈራል ከም ዘሎ ክጸንሕ እዩ።',
        confirmText: 'ካብ ምዝገባ ኣውጽ',
        variant: 'danger',
      },
      godmodeImpersonate: {
        title: 'ሊንክ ምስላ ክትፈጥር?',
        message: 'ናይ 5 ደቓይቕ ሊንክ ስሒር ክፍጠር እዩ። ኣብ ሓድሽ ታብ ክትከፍቶ ኢኻ — ክፍለ ግዜ ኣማሓዳሪኻ ከም ዘሎ ክጸንሕ እዩ።',
        confirmText: 'ሊንክ ፍጠር',
        variant: 'warning',
      },
      godmodePasswordReset: {
        title: 'ሊንክ ምቅይራ መሕለፊ ቃል ክትፈጥር?',
        message: 'ንዚ ተጠቃሚ ናይ ሓደ ግዜ ሊንክ ክፍጠር እዩ። ሓድሽ መሕለፊ ቃል ንምድራድ ክጥቀሙሉ ይኽእሉ።',
        confirmText: 'ሊንክ ምቅይራ ፍጠር',
        variant: 'warning',
      },
      godmodeWalletAdjust: {
        title: 'ምትዕርራይ ዋሌት ኣረጋግጽ',
        messageTemplate: 'ት{ direction} {amount} ብር ክትገብር ኢኻ። ምኽንያት: "{reason}"። እዚ ኣብ መዝገብ ኦዲት ክመዝገብ እዩ።',
        confirmText: 'ምትዕርራይ ተግብር',
        variant: 'warning',
      },
      godmodeWalletAdjustLarge: {
        title: 'ዓቢ ምትዕርራይ ዋሌት — መጠን ኣረጋግጽ',
        messageTemplate: 'ት{ direction} {amount} ብር ክትገብር ኢኻ። ምኽንያት: "{reason}"። እዚ ኣብ መዝገብ ኦዲት ክመዝገብ እዩ።',
        confirmText: 'ምትዕርራይ ተግብር',
        variant: 'danger',
        requireInput: 'ADJUST',
      },
      godmodeAgentOverride: {
        title: 'መጠን ኮሚሽን ወኪል ክትቅይር?',
        messageTemplate: 'ሓድሽ መጠን ኣብ ነፍሲ ወከፍ ሽያጭ {value} {unit} ክኸውን እዩ። እዚ ኩሎም ናይ መጻኢ ኮሚሽናት ንዚ ወኪል ክጸልው እዩ።',
        confirmText: 'መጠን ቅይር',
        variant: 'warning',
      },
      godmodeOrphan: {
        title: 'ነዚ ተጠቃሚ ካብ ዛፍ MLM ክትጥርዮ?',
        message: 'ኩሎም ሊንክታት ቅድመ ኣቦታት ክወገዱ እዮም። ተጠቃሚ ናይ ገዛእ ርእሱ ትሕተኛ መስመር ክሕዝ እዩ። እዚ ተግባር ክመዝገብ እዩ እሞ ክምለስ ኣይኽእልን።',
        confirmText: 'ተጠቃሚ ጥር',
        variant: 'danger',
        requireInput: 'ORPHAN',
      },
      godmodeBan: {
        title: 'ነዚ ተጠቃሚ ክትኽልክል?',
        message: 'ብኡንብኡ መእተዊኦም ክጠፍኦም እዩ። ኮድታት ወኪልን ሪፈራልን ክስረዙ እዮም። እዚ ክመዝገብ እዩ ግን ካብ ተግባር ምእላይ ክምለስ ይኽእል።',
        confirmText: 'ተጠቃሚ ኣኽልክል',
        variant: 'danger',
        requireInput: 'BAN',
      },
      godmodeUnban: {
        title: 'ነዚ ተጠቃሚ ካብ ምኽልካል ክትኣልይ?',
        message: 'ናብ መድረኽ መእተዊኦም ክምለስ እዩ። ኮድታት ወኪልን ሪፈራልን እንደገና ክንቀሳቐሱ እዮም ስለዚ እንደገና ክረኽቡ ይኽእሉ።',
        confirmText: 'ካብ ምኽልካል ኣልይ',
        variant: 'warning',
        requireInput: 'UNBAN',
      },
      godmodeManualEnroll: {
        title: 'ብዘይ ክፍሊት ምሉእ መእተዊ ኮርስ ክትህብ?',
        messageTemplate: 'ተጠቃሚ ብዘይ መዝገብ ክፍሊት ኣብ ምሉእ ኮርስ ክምዝገብ እዩ። ምኽንያት: "{reason}"። እዚ ኣብ መዝገብ ኦዲት ክመዝገብ እዩ።',
        confirmText: 'መእተዊ ሃብ',
        variant: 'warning',
      },
    },
  },
};