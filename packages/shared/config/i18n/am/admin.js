/**
 * @fileoverview Amharic — Admin Namespace
 *
 * Full AM parity with the English admin namespace. Coming Soon stub
 * labels + shared copy for unfinished CRUD routes + announcements
 * composer labels + user picker + history tab for bilingual admin users.
 *
 * Path: packages/shared/config/i18n/am/admin.js
 */

module.exports = {
  admin: {
    comingSoon: {
      eyebrow: 'በሥራ ላይ',
      heading: 'ይህ ባህሪ በቅርቡ ይመጣል',
      description:
        'ቡድናችን ለዚህ ገጽ የተሟላ ተሞክሮ እየሠራ ነው። ሙሉ የመፍጠር፣ የማረም እና የመሰረዝ ችሎታዎች ያሉት ሙሉ ገጽ በቅርቡ ይገኛል።',
      subtitle: 'ይህ ባህሪ በቅርቡ ይመጣል',
      contactSupport: 'አሁን ያስፈልግዎታል? ድጋፍ ያግኙ',
      supportEmail: 'support@abyssinia-academy.com',
      footerNote: 'የኢንጂነሪንግ ቡድን እየሠራበት ነው — ይህ ገጽ በቀጣዩ ዝማኔ ይኖራል።',
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
      pageSubtitle: 'ለሁሉም ተጠቃሚዎች፣ ለተመዘገቡ ብቻ፣ ወይም ለተወሰኑ ተጠቃሚዎች መልዕክት ይላኩ',
      backToDashboard: 'ወደ ዳሽቦርድ ተመለስ',

      tabCompose: 'አዘጋጅ',
      tabHistory: 'ታሪክ',

      audienceLabel: 'ለማን ይላክ',
      audienceAll: 'ሁሉም ተጠቃሚዎች',
      audienceEnrolled: 'የተመዘገቡ ብቻ',
      audienceTargeted: 'የተወሰኑ ተጠቃሚዎች',
      audienceSingle: 'አንድ ተጠቃሚ',

      targetedLabel: 'ተጠቃሚዎችን ምረጥ',
      targetedCountSuffix: 'ተመርጠዋል',
      targetedPlaceholder: 'በስም፣ ስልክ ወይም ኢሜይል ይፈልጉ…',
      targetedHint: 'ቢያንስ 2 ቁምፊዎችን ይጻፉ። ለመጨመር ማንኛውንም ውጤት ጠቅ ያድርጉ። እንደፍላጎትዎ ብዙ ተጠቃሚዎችን መምረጥ ይችላሉ።',
      removeUser: 'ተጠቃሚ አስወግድ',
      noResults: 'ከፍለጋዎ ጋር የሚዛመድ ተጠቃሚ የለም',
      noEmail: 'ኢሜይል የለም',

      singlePlaceholder: 'ስልክ ወይም ኢሜይል ያስገቡ',
      singleHint: 'ከስልክ ቁጥር ወይም ከኢሜይል አድራሻ ጋር ይዛመዳል',

      titleLabel: 'ርዕስ',
      titlePlaceholder: 'ለምሳሌ፣ አዲስ ኮርስ ማስጀመሪያ ማስታወቂያ',
      bodyLabel: 'መልዕክት',
      bodyPlaceholder: 'የማስታወቂያ መልዕክትዎን ይጻፉ…',

      severityLabel: 'ክብደት',
      severityInfo: 'መረጃ',
      severitySuccess: 'ስኬት',
      severityWarning: 'ማስጠንቀቂያ',
      severityCritical: 'አስቸኳይ',

      sendBtn: 'ማስታወቂያ ላክ',
      sending: 'በመላክ ላይ…',
      cancel: 'ሰርዝ',

      previewLabel: 'ቀጥታ ቅድመ-እይታ',
      previewTitlePlaceholder: 'ርዕስዎ እዚህ ይታያል',
      previewBodyPlaceholder: 'መልዕክትዎ እዚህ ይታያል',
      previewTimeJustNow: 'አሁን',
      previewAudienceLabel: 'ተቀባይ',
      previewSeverityLabel: 'ክብደት',
      previewWarning: 'ሁሉም ተቀባዮች ይህን ማስታወቂያ በማሳወቂያ ሳጥናቸው ውስጥ ያገኙታል።',

      confirmTitle: 'ስርጭትን ያረጋግጡ',
      confirmBody:
        'ይህን ማስታወቂያ ሊልኩ ነው። ይህ እርምጃ ከተወሰደ በኋላ ሊቀለበስ አይችልም እና ከደረሰ በኋላ ሊሰረዝ አይችልም።',
      confirmInputLabel: 'SEND ብለው ይጻፉ ለማረጋገጥ',
      confirmBtn: 'ስርጭት ላክ',

      historyTitle: 'የስርጭት ታሪክ',
      refreshHistory: 'አድስ',
      historyEmpty: 'እስካሁን ምንም ማስታወቂያ አልተላከም።',
      historyLoadFailed: 'የስርጭት ታሪክን መጫን አልተሳካም።',
      historyColWhen: 'መቼ',
      historyColTitle: 'ርዕስ',
      historyColAudience: 'ተቀባይ',
      historyColRecipients: 'ተቀባዮች',
      historyColSentBy: 'የላከው',

      timeJustNow: 'አሁን',
      timeMinutesAgo: 'ከ{count} ደቂቃ በፊት',
      timeHoursAgo: 'ከ{count} ሰዓት በፊት',
      timeDaysAgo: 'ከ{count} ቀን በፊት',

      successToast: 'ማስታወቂያ ለ{count} ተቀባዮች ተልኳል',
      validationFailed: 'እባክዎ ሁሉንም አስፈላጊ መስኮች ይሙሉ',
      sendFailed: 'ማስታወቂያ መላክ አልተሳካም። እባክዎ እንደገና ይሞክሩ።',
    },
  },
};