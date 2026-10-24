/**
 * @fileoverview Tigrinya — Admin Namespace
 *
 * Contains admin-specific UI copy including:
 *   - Coming Soon stub labels (one per unfinished CRUD route)
 *   - Announcements composer labels (audience, severity, preview, modals)
 *   - Targeted user picker labels (search, chips, empty states)
 *   - History tab labels (columns, pagination, empty state)
 *   - Shared stub copy (eyebrow, heading, description, CTAs)
 *
 * All copy is config-driven — no hardcoded strings in JSX components.
 *
 * Path: packages/shared/config/i18n/ti/admin.js
 */

module.exports = {
  admin: {
    comingSoon: {
      eyebrow: 'ስራሕ ኣብ ምስራሕ',
      heading: 'እዚ ተግባር ይስራሕ ኣሎ',
      description:
        'ጋንታና ንዚ ገጽ ዝተመርቐ ተመክሮ ይሰርሕ ኣሎ። ብዝቕረበ ግዜ ምስ ምሉእ ምፍጣር፣ ምሕዳስን ምውጋድን ይርከብ።',
      subtitle: 'እዚ ተግባር ብዝቕረበ ግዜ ይመጽእ',
      contactSupport: 'ሕጂ ትደልዮ? ምስ ደገፍ ተራኸብ',
      supportEmail: 'support@abyssinia-academy.com',
      footerNote: 'ጋንታ ስነ-መሕንዚ ኣብ ልዕሊኡ ይሰርሕ ኣሎ — እዚ ገጽ ኣብ ዝመጽእ ምሕዳስ ክኸፈት እዩ።',
      defaultTitle: 'ተግባር ብዝቕረበ ግዜ ይመጽእ',
      defaultBack: 'ተመለስ',

      /* Per-route titles */
      editCourse: 'ትምህርቲ ኣስተዳድር',
      addVideo: 'ቪድዮ ወስኽ',
      editVideo: 'ቪድዮ ኣስተዳድር',
      addDiscussion: 'ዝርርብ ወስኽ',
      editDiscussion: 'ዝርርብ ኣስተዳድር',
      addDiscount: 'ሓድሽ ኮድ ቅናሽ',
      viewDiscount: 'ዝርዝር ቅናሽ',
      editDiscount: 'ኮድ ቅናሽ ኣስተዳድር',
      viewAdmin: 'ዝርዝር ኣማሓዳሪ',

      /* Per-route back button labels */
      backToCourses: 'ናብ ትምህርትታት ተመለስ',
      backToVideos: 'ናብ ቪድዮታት ተመለስ',
      backToDiscussions: 'ናብ ዝርርብ ተመለስ',
      backToDiscounts: 'ናብ ቅናሻት ተመለስ',
      backToAdmins: 'ናብ ኣማሓደርቲ ተመለስ',
    },

    announcements: {
      /* Nav + page chrome */
      navLabel: 'ምልክታት',
      pageTitle: 'ምልክታት',
      pageSubtitle: 'ንኩሎም ተጠቀምቲ፣ ንዝተመዘገቡ ተጠቀምቲ፣ ወይ ንተመረጹ ተጠቀምቲ መልእኽቲ ኣስፋሕ',
      backToDashboard: 'ናብ ዳሽቦርድ ተመለስ',

      /* Tabs */
      tabCompose: 'ኣዘጋጅ',
      tabHistory: 'ታሪኽ',

      /* Composer labels */
      audienceLabel: 'ናብ',
      audienceAll: 'ኩሎም ተጠቀምቲ',
      audienceEnrolled: 'ዝተመዘገቡ ጥራይ',
      audienceTargeted: 'ተመረጹ ተጠቀምቲ',
      audienceSingle: 'ሓደ ተጠቃሚ',

      /* Targeted user picker */
      targetedLabel: 'ተጠቀምቲ ምረጽ',
      targetedCountSuffix: 'ተመሪጹ',
      targetedPlaceholder: 'ብስም፣ ተሌፎን፣ ወይ ኢመይል ድለ...',
      targetedHint: 'ብውሕዱ 2 ፊደላት ኣእቱ። ንምውሳኽ ዝኾነ ውጽኢት ጠውቕ። ክንደይ ተጠቀምቲ ከም እትደልዮ ክትመርጽ ትኽእል።',
      removeUser: 'ተጠቃሚ ኣውጽእ',
      noResults: 'ምስ ድሌትካ ዝሰማማዕ ተጠቃሚ የለን',
      noEmail: 'ኢመይል የለን',

      singlePlaceholder: 'ተሌፎን ወይ ኢመይል ኣእቱ',
      singleHint: 'ምስ ቑጽሪ ተሌፎን ወይ ኣድራሻ ኢመይል ይሰማማዕ',

      titleLabel: 'ኣርእስቲ',
      titlePlaceholder: 'ኣብነት፦ ምልክታ ምጅማር ሓድሽ ትምህርቲ',
      bodyLabel: 'መልእኽቲ',
      bodyPlaceholder: 'መልእኽቲ ምልክታኻ ጽሓፍ...',

      severityLabel: 'ጽንኩርነት',
      severityInfo: 'ሓበሬታ',
      severitySuccess: 'ዓወት',
      severityWarning: 'መጠንቀቕታ',
      severityCritical: 'ኣደዳዊ',

      /* Actions */
      sendBtn: 'ምልክታ ስደድ',
      sending: 'ይልእኽ ኣሎ...',
      cancel: 'ሰርዝ',

      /* Preview panel */
      previewLabel: 'ቀጥታ ቅድመ-ርእይቶ',
      previewTitlePlaceholder: 'ኣርእስትኻ ኣብዚ ይርአ',
      previewBodyPlaceholder: 'መልእኽትኻ ኣብዚ ይርአ',
      previewTimeJustNow: 'ሕጂ',
      previewAudienceLabel: 'ተዓዘብቲ',
      previewSeverityLabel: 'ጽንኩርነት',
      previewWarning: 'ኩሎም ተቐበልቲ ነዚ ምልክታ ኣብ ሳጹን መልእኽቶም ክቕበሉ እዮም።',

      /* Confirm modal */
      confirmTitle: 'ስርጭት ኣረጋግጽ',
      confirmBody:
        'እዚ ምልክታ ክትሰድድ ትኸውን። እዚ ተግባር ክመለስ ኣይኽእልን እሞ ምስ ተላእከ ክስረዝ ኣይኽእልን።',
      confirmInputLabel: 'ንምርግጋጽ SEND ጽሓፍ',
      confirmBtn: 'ስርጭት ስደድ',

      /* History tab */
      historyTitle: 'ታሪኽ ስርጭት',
      refreshHistory: 'ኣሓድስ',
      historyEmpty: 'ክሳብ ሕጂ ምልክታ ኣይተላእከን።',
      historyLoadFailed: 'ታሪኽ ስርጭት ምጽዓን ኣይተኻእለን።',
      historyColWhen: 'መዓስ',
      historyColTitle: 'ኣርእስቲ',
      historyColAudience: 'ተዓዘብቲ',
      historyColRecipients: 'ተቐበልቲ',
      historyColSentBy: 'ተላኢኹ ብ',

      /* Relative time formatting for history */
      timeJustNow: 'ሕጂ',
      timeMinutesAgo: 'ቅድሚ {count} ደቒቕ',
      timeHoursAgo: 'ቅድሚ {count} ሰዓት',
      timeDaysAgo: 'ቅድሚ {count} መዓልቲ',

      /* Toasts + errors */
      successToast: 'ምልክታ ናብ {count} ተቐባሊ(ት) ተላኢኹ',
      validationFailed: 'በጃኻ ኩሎም ኣስፈላጊ መስኮታት ምልኡ',
      sendFailed: 'ምልክታ ምስዳድ ኣይተኻእለን። በጃኻ እንደገና ፈትን።',
    },
  },
};