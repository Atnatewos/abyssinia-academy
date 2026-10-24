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
        'ቡድናችን ለዚህ ጽ የተሟላ ተሞክሮ እየሠራ ነው። ሉ የመፍር፣ የማም እና የመሰረዝ ችሎታች ያሉት ሙሉ ገጽ በቅርቡ ይገኛል።',
      subtitle: 'ይህ ባህሪ በቅርቡ ይመጣል',
      contactSupport: 'አሁን ያስፈልዎታል? ድጋፍ ያኙ',
      supportEmail: process.env.SUPPORT_EMAIL || 'support@abyssinia-academy.com',
      footerNote: 'የንጂነሪንግ ቡድን እየሠራበት ነው — ህ ገጽ በቀጣዩ ዝማኔ ይኖራል',
      defaultTitle: 'ባሪ በቅርቡ መጣል',
      defaultBack: 'ተመለስ',

      editCourse: 'ኮርስ አርትዕ',
      addVideo: 'ቪዮ ጨምር',
      editVideo: 'ቪዲዮ አርትዕ',
      addDiscussion: 'ውይይት ጨምር',
      editDiscussion: 'ውይይት አርትዕ',
      addDiscount: 'አዲስ የቅናሽ ኮድ',
      viewDiscount: 'የቅናሽ ዝርዝሮች',
      editDiscount: 'የቅናሽ ኮድ አርትዕ',
      viewAdmin: 'የአስተዳዳሪ ዝርዝሮች',

      backToCourses: 'ደ ኮርሶች ተመለስ',
      backToVideos: 'ደ ቪዲዮዎች ተመለስ',
      backToDiscussions: 'ወደ ውይይቶች ተመለስ',
      backToDiscounts: 'ወደ ቅናሾች ተመለስ',
      backToAdmins: 'ደ አስተዳዳዎች ተመለስ',
    },

    announcements: {
      navLabel: 'ማስታወቂያዎች',
      pageTitle: 'ማስታወቂያዎች',
      pageSubtitle: 'ለሁሉም ተጠሚዎች፣ ለተመዘገቡ ብቻ፣ ወይም ለተወሰ ተጠቃሚች መልዕክት ይኩ',
      backToDashboard: 'ወደ ዳሽቦርድ ተመለስ',

      tabCompose: 'አዘጋጅ',
      tabHistory: 'ታሪክ',

      audienceLabel: 'ለማን ይክ',
      audienceAll: 'ሁሉም ተጠቃሚዎች',
      audienceEnrolled: 'የተመዘገቡ ብቻ',
      audienceTargeted: 'የተወሰኑ ተጠቃዎች',
      audienceSingle: 'አንድ ተጠቃሚ',

      targetedLabel: 'ተጠቃሚዎችን ምረጥ',
      targetedCountSuffix: 'ተመርጠዋል',
      targetedPlaceholder: 'በስም፣ ስልክ ወይም ኢሜይል ይፈልጉ…',
      targetedHint: 'ቢያንስ 2 ቁምዎችን ይፉ። ለመጨመር ማንውንም ውጤት ጠቅ ያድር። እንደላጎትዎ ዙ ተጠሚዎችን መምረ ይችላሉ',
      removeUser: 'ተጠቃሚ አስወግድ',
      noResults: 'ከፍለጋዎ ጋር የሚዛመድ ተጠቃሚ የለም',
      noEmail: 'ኢይል የለም',

      singlePlaceholder: 'ስልክ ወይም ኢይል ያስገቡ',
      singleHint: 'ከስልክ ቁጥር ይም ከኢሜይል አድራሻ ር ይዛመዳል',

      titleLabel: 'ርዕስ',
      titlePlaceholder: 'ለምሌ፣ አዲስ ኮርስ ማስጀመሪያ ማስታቂያ',
      bodyLabel: 'መልዕክት',
      bodyPlaceholder: 'የማስታወቂያ መልዕክትን ይጻ…',

      severityLabel: 'ክብደት',
      severityInfo: 'መረጃ',
      severitySuccess: 'ስኬት',
      severityWarning: 'ማስጠንቀቂያ',
      severityCritical: 'አስቸኳይ',

      sendBtn: 'ማስታወቂያ ላክ',
      sending: 'በመላክ ይ…',
      cancel: 'ርዝ',

      previewLabel: 'ቀጥታ ቅድመ-እይታ',
      previewTitlePlaceholder: 'ርዕስዎ እዚህ ይታያል',
      previewBodyPlaceholder: 'መልዕክትዎ እዚህ ይታያል',
      previewTimeJustNow: 'አን',
      previewAudienceLabel: 'ተቀባይ',
      previewSeverityLabel: 'ክብት',
      previewWarning: 'ሉም ተቀዮች ይህን ስታወቂያ በማሳወቂያ ጥናቸው ውስጥ ያገኙታል።',

      confirmTitle: 'ስርጭትን ያረጋግጡ',
      confirmBody:
        'ይህን ማስታወቂያ ልኩ ነው። ይህ እርምጃ ከተወሰደ በኋላ ሊቀለበስ አይችልም እና ከደረሰ በኋ ሊሰረዝ አይችልም።',
      confirmInputLabel: 'SEND ብለው ይፉ ለማረገጥ',
      confirmBtn: 'ስርጭት ክ',

      historyTitle: 'የስርጭት ታክ',
      refreshHistory: 'አድስ',
      historyEmpty: 'እስካሁን ንም ማስታወያ አልተላከም።',
      historyLoadFailed: 'የስርጭት ሪክን መጫን አልተሳካም',
      historyColWhen: 'መቼ',
      historyColTitle: 'ርዕስ',
      historyColAudience: 'ተቀባይ',
      historyColRecipients: 'ተቀባዮች',
      historyColSentBy: 'የላከው',

      timeJustNow: 'አሁን',
      timeMinutesAgo: 'ከ{count} ደቂቃ በፊት',
      timeHoursAgo: 'ከ{count} ዓት በፊት',
      timeDaysAgo: 'ከ{count} ቀን በፊት',

      successToast: 'ማስወቂያ ለ{count} ተቀባዮች ተልኳል',
      validationFailed: 'እባክ ሁሉንም አስላጊ መስች ይሙሉ',
      sendFailed: 'ማስታወቂያ መላክ አልተሳካም። እባዎ እንደገና ይሞክሩ',
    },
  },
};