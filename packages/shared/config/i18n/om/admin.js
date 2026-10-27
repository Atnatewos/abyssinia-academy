/**
 * @fileoverview Oromo — Admin Namespace
 *
 * All copy is config-driven — no hardcoded strings in JSX components.
 *
 * Path: packages/shared/config/i18n/om/admin.js
 */

module.exports = {
  admin: {
    comingSoon: {
      eyebrow: 'Hojii Irra Jira',
      heading: 'Amalli kun ijaaramaa jira',
      description:
        'Gareen keenya fuula kanaaf muuxannoo qulqullina qabu qopheessaa jira. Dhiyootti banamuu fi uumuu, gulaaluu fi haquu guutuu qabaata.',
      subtitle: 'Amalli kun dhiyootti dhufa',
      contactSupport: 'Amma barbaadduu? Deeggarsa qunnami',
      supportEmail: process.env.SUPPORT_EMAIL || 'support@abyssinia-academy.com',
      footerNote: 'Gareen injinariingii irratti hojjechaa jira — fuulli kun haaromsa gara fuulduraatti ni banama.',
      defaultTitle: 'Amalli Dhiyootti Dhufa',
      defaultBack: 'Deebi\'i',

      /* Per-route titles */
      editCourse: 'Koorsii Gulaali',
      addVideo: 'Viidiyoo Dabali',
      editVideo: 'Viidiyoo Gulaali',
      addDiscussion: 'Marii Dabali',
      editDiscussion: 'Marii Gulaali',
      addDiscount: 'Koodii Hir\'isaa Haaraa',
      viewDiscount: 'Ibsa Hir\'isaa',
      editDiscount: 'Koodii Hir\'isaa Gulaali',
      viewAdmin: 'Ibsa Bulchaa',

      /* Per-route back button labels */
      backToCourses: 'Gara Koorsiiwwanitti Deebi\'i',
      backToVideos: 'Gara Viidiyoowwanitti Deebi\'i',
      backToDiscussions: 'Gara Mariitti Deebi\'i',
      backToDiscounts: 'Gara Hir\'isaawwanitti Deebi\'i',
      backToAdmins: 'Gara Bulchootaatti Deebi\'i',
    },

    announcements: {
      /* Nav + page chrome */
      navLabel: 'Beeksisawwan',
      pageTitle: 'Beeksisawwan',
      pageSubtitle: 'Fayyadamtoota hunda, kan galmaa\'an qofa, yookaan fayyadamtoota addaatti ergaa tamsaasi',
      backToDashboard: 'Gara Daashboordiitti Deebi\'i',

      /* Tabs */
      tabCompose: 'Qopheessi',
      tabHistory: 'Seenaa',

      /* Composer labels */
      audienceLabel: 'Ergi',
      audienceAll: 'Fayyadamtoota hunda',
      audienceEnrolled: 'Kan galmaa\'an qofa',
      audienceTargeted: 'Fayyadamtoota adda',
      audienceSingle: 'Fayyadamaa tokko',

      /* Targeted user picker */
      targetedLabel: 'Fayyadamtoota filadhu',
      targetedCountSuffix: 'filatame',
      targetedPlaceholder: 'Maqaa, bilbila, yookaan imeeliidhaan barbaadi…',
      targetedHint: 'Qubeen 2 ol galchi. Bu\'aa kamiyyuu cuqaasiitii dabaladhu. Fayyadamtoota barbaachisu filachuu dandeessa.',
      removeUser: 'Fayyadamaa haqi',
      noResults: 'Barbaacha keetiif fayyadamaan mijatu hin jiru',
      noEmail: 'Imeeliin hin jiru',

      singlePlaceholder: 'Bilbila yookaan imeelii galchi',
      singleHint: 'Lakkoofsa bilbilaa yookaan teessoo imeelii waliin walsimu',

      titleLabel: 'Mata-duree',
      titlePlaceholder: 'fkn, beeksisa eegala koorsii haaraa',
      bodyLabel: 'Ergaa',
      bodyPlaceholder: 'Ergaa beeksisaa kee barreessi…',

      severityLabel: 'Cimina',
      severityInfo: 'Odeeffannoo',
      severitySuccess: 'Milkaa\'ina',
      severityWarning: 'Akeekkachiisa',
      severityCritical: 'Baay\'ee Cimaa',

      /* Actions */
      sendBtn: 'Beeksisa Ergi',
      sending: 'Ergaa jira…',
      cancel: 'Haqi',

      /* Preview panel */
      previewLabel: 'Ilaalcha kallattii',
      previewTitlePlaceholder: 'Mata-dureen kee asitti mul\'ata',
      previewBodyPlaceholder: 'Ergaan kee asitti mul\'ata',
      previewTimeJustNow: 'Amma',
      previewAudienceLabel: 'Dhaggeeffattoota',
      previewSeverityLabel: 'Cimina',
      previewWarning: 'Fudhattoonni hundi beeksisa kana akka beeksisaatti saanduqa isaanii keessatti fudhatu.',

      /* Confirm modal */
      confirmTitle: 'Tamsaasa mirkaneessi',
      confirmBody:
        'Beeksisa kana erguuf jirta. Gochi kun hin deebi\'u, erga ergamees hin haqamu.',
      confirmInputLabel: 'Mirkaneessuuf SEND barreessi',
      confirmBtn: 'Tamsaasa ergi',

      /* History tab */
      historyTitle: 'Seenaa tamsaasaa',
      refreshHistory: 'Haaromsi',
      historyEmpty: 'Hanga ammaatti beeksisni hin ergamne.',
      historyLoadFailed: 'Seenaa tamsaasaa fe\'uu hin dandeenye.',
      historyColWhen: 'Yoom',
      historyColTitle: 'Mata-duree',
      historyColAudience: 'Dhaggeeffattoota',
      historyColRecipients: 'Fudhattoota',
      historyColSentBy: 'Kan erge',

      /* Relative time formatting for history */
      timeJustNow: 'Amma',
      timeMinutesAgo: 'daqiiqaa {count} dura',
      timeHoursAgo: 'sa\'aatii {count} dura',
      timeDaysAgo: 'guyyaa {count} dura',

      /* Toasts + errors */
      successToast: 'Beeksisni fudhattoota {count}tti ergame',
      validationFailed: 'Maaloo dirreewwan barbaachisan hunda guuti',
      sendFailed: 'Beeksisa erguu hin dandeenye. Maaloo irra deebi\'ii yaali.',
    },
  },
};