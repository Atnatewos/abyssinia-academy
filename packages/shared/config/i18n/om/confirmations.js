/**
 * @fileoverview Afaan Oromoo — Confirmations Namespace
 *
 * Every confirmation dialog string used by the platform. Consumed by:
 *   - apps/web/lib/api.js (interceptor default messages)
 *   - apps/web/components/shared/ConfirmDialog.jsx (button labels)
 *   - apps/web/pages/admin/users/[id]/index.jsx (God Mode actions)
 *
 * Adding a new confirmation pattern means adding an entry here and
 * referencing it by key from api.js or a page's `useConfirm()` call.
 *
 * Path: packages/shared/config/i18n/om/confirmations.js
 */

module.exports = {
  confirmations: {
    /* ── Default button labels + fallbacks ── */
    defaults: {
      confirmText: 'Mirkaneessi',
      cancelText: 'Haqi',
      processingText: 'Adeemsa irra jira...',
      requireInputPrefix: 'Barreessi',
      requireInputSuffix: 'mirkaneessuuf:',
      fallbackTitle: 'Mirkaneessi',
      cancelledMessage: 'Gochi fayyadamaadhaan haqame.',
    },

    /* ── Interceptor-driven actions (matched by URL pattern) ── */
    actions: {
      /* Deletes */
      deleteCourse: {
        title: 'Koorsii kana yeroo hundaaf haquu?',
        message: 'Barnootni, galmeen fi seenaan kaffaltii koorsii kanaa hundi yeroo hundaaf ni haqama. Kun hin deebi\'u.',
        confirmText: 'Koorsii Haqi',
        variant: 'danger',
      },
      deleteVideo: {
        title: 'Viidiyoo kana haquu?',
        message: 'Viidiyoon kun sirna barnootaa irraa ni haqama.',
        confirmText: 'Viidiyoo Haqi',
        variant: 'danger',
      },
      deleteDiscussion: {
        title: 'Marii kana haquu?',
        message: 'Viidiyoon marii ni haqama.',
        confirmText: 'Haqi',
        variant: 'danger',
      },
      deleteDiscount: {
        title: 'Koodii hir\'isaa kana haquu?',
        message: 'Barattoonni koodii kana kuufatan kana booda itti fayyadamuu hin danda\'an.',
        confirmText: 'Koodii Haqi',
        variant: 'danger',
      },
      deleteLesson: {
        title: 'Barnoota kana haquu?',
        message: 'Qabiyyeen barnootaa ni haqama.',
        confirmText: 'Haqi',
        variant: 'danger',
      },
      deletePhase: {
        title: 'Sadarkaa kana haquu?',
        message: 'Torbanootni fi barnoonni sadarkaa kana keessa jiran hundi ni haqamu.',
        confirmText: 'Sadarkaa Haqi',
        variant: 'danger',
      },
      deleteWeek: {
        title: 'Torban kana haquu?',
        message: 'Barnoonni torban kana keessa jiran hundi ni haqamu.',
        confirmText: 'Haqi',
        variant: 'danger',
      },
      deleteAdmin: {
        title: 'Herrega bulchaa kana haquu?',
        message: 'Battalumaan paanaalii bulchaa irraa argannoo ni dhabu.',
        confirmText: 'Bulchaa Haqi',
        variant: 'danger',
      },
      deleteGeneric: {
        title: 'Wanta kana haquu?',
        message: 'Gochi kun hin deebi\'u.',
        confirmText: 'Haqi',
        variant: 'danger',
      },

      /* Payments */
      approvePayment: {
        title: 'Kaffaltii kana mirkaneessuu?',
        message: 'Barataan battalumaan ni galmeeffama, komiishiniin bakka bu\'aa/MLM ni kaffalama.',
        confirmText: 'Mirkaneessi',
        variant: 'warning',
      },
      rejectPayment: {
        title: 'Kaffaltii kana diduu?',
        message: 'Barataan beeksifama, argannoo hin argatu.',
        confirmText: 'Didi',
        variant: 'danger',
      },
      bulkApprovePayments: {
        title: 'Kaffaltiiwwan baay\'ee mirkaneessuu?',
        message: 'Kaffaltiin filatame hundi ni mirkanaa\'a, komiishiniin hundi ni kaffalama.',
        confirmText: 'Baay\'ee Mirkaneessi',
        variant: 'warning',
      },

      /* Withdrawals */
      processWithdrawal: {
        title: 'Baasii kana raawwachuu?',
        message: 'Mirkaneessuun akka kaffalameetti agarsiisa. Diduun maallaqa gara waaleetii deebisa.',
        confirmText: 'Raawwadhu',
        variant: 'warning',
      },
      requestWithdrawal: {
        title: 'Baasii gaafachuu?',
        message: 'Bulchaan ni raawwata. Hammi waaleetii kee irraa qabameera.',
        confirmText: 'Gaaffii Galchi',
        variant: 'warning',
      },

      /* Bulk user actions */
      bulkUserAction: {
        title: 'Fayyadamtoota irratti gocha baay\'ee raawwachuu?',
        message: 'Kun yeroo tokko herregaawwan hedduu irratti dhiibbaa qaba.',
        confirmText: 'Hunda Irratti Raawwadhu',
        variant: 'warning',
      },

      /* Settings */
      saveSettings: {
        title: 'Qindaa\'ina olkaa\'uu?',
        message: 'Jijjiiramni gatii battalumaan marsariitii uummataa irratti mul\'ata.',
        confirmText: 'Jijjiirama Olkaa\'i',
        variant: 'warning',
      },
      resetSettings: {
        title: 'Qindaa\'ina gara durtii deebisuu?',
        message: 'Kutaan kun gara gatii durtii ni deebi\'a.',
        confirmText: 'Deebisi',
        variant: 'danger',
      },

      /* Announcements */
      broadcastAnnouncement: {
        title: 'Beeksisa kana tamsaasuu?',
        message: 'Fudhattoonni hundi beeksisa kana ni argatu. Yeroo tokko ergame hin haqamu.',
        confirmText: 'Tamsaasa Ergi',
        variant: 'warning',
      },

      /* Student-facing */
      submitPayment: {
        title: 'Ragaa kaffaltii galchuu?',
        message: 'Bulchaan kaffaltii kee gamaaggama, argannoo mirkaneessa.',
        confirmText: 'Kaffaltii Galchi',
        variant: 'warning',
      },
      changePassword: {
        title: 'Jecha darbii kee jijjiiruu?',
        message: 'Seensa itti aanuuf jecha darbii haaraa fayyadamuu qabda.',
        confirmText: 'Jecha Darbii Jijjiiri',
        variant: 'warning',
      },
      saveProfile: {
        title: 'Jijjiirama profaayilii olkaa\'uu?',
        message: 'Odeeffannoon profaayilii kee ni haaromfama.',
        confirmText: 'Olkaa\'i',
        variant: 'default',
      },

      /* ── God Mode — admin user detail page (imperative useConfirm) ── */
      godmodeEnroll: {
        title: 'Fayyadamaa akka galmaa\'eetti mallattoo godhuu?',
        message: 'Fayyadamaan battalumaan argannoo koorsii guutuu ni argata.',
        confirmText: 'Akka Galmaa\'eetti Mallattoo Godhi',
        variant: 'warning',
      },
      godmodeUnenroll: {
        title: 'Fayyadamaa kana galmee irraa baasuu?',
        message: 'Fayyadamaan argannoo koorsii ni dhaba. Galii ergamtootaa akkuma jirutti hafa.',
        confirmText: 'Galmee Irraa Baasi',
        variant: 'danger',
      },
      godmodeImpersonate: {
        title: 'Liinkii fakkeessuu uumuu?',
        message: 'Liinkiin hojii daqiiqaa 5 ni uumama. Tab haaraa keessatti bana — seesshiniin bulchaa kee akka jirutti hafa.',
        confirmText: 'Liinkii Uumi',
        variant: 'warning',
      },
      godmodePasswordReset: {
        title: 'Liinkii jijjiirraa jecha darbii uumuu?',
        message: 'Fayyadamaa kanaaf liinkiin yeroo tokkoo ni uumama. Jecha darbii haaraa qindeessuuf itti fayyadamuu danda\'u.',
        confirmText: 'Liinkii Jijjiirraa Uumi',
        variant: 'warning',
      },
      godmodeWalletAdjust: {
        title: 'Sirreeffama waaleetii mirkaneessi',
        messageTemplate: 'Wanta {direction} Birr {amount} gochuu jirta. Sababa: "{reason}". Kun galmee odiitii keessatti galmeeffama.',
        confirmText: 'Sirreeffama Raawwadhu',
        variant: 'warning',
      },
      godmodeWalletAdjustLarge: {
        title: 'Sirreeffama waaleetii guddaa — hamma mirkaneessi',
        messageTemplate: 'Wanta {direction} Birr {amount} gochuu jirta. Sababa: "{reason}". Kun galmee odiitii keessatti galmeeffama.',
        confirmText: 'Sirreeffama Raawwadhu',
        variant: 'danger',
        requireInput: 'ADJUST',
      },
      godmodeAgentOverride: {
        title: 'Hamma komiishinii bakka bu\'aa jijjiiruu?',
        messageTemplate: 'Hammi haaraan gurgurtaa tokkoof {value} {unit} ta\'a. Kun komiishiniiwwan gara fuulduraa bakka bu\'aa kanaaf ni dhiibba.',
        confirmText: 'Hamma Jijjiiri',
        variant: 'warning',
      },
      godmodeOrphan: {
        title: 'Fayyadamaa kana muka MLM irraa addan baasuu?',
        message: 'Geengoonni abbootii duraa hundi ni haqamu. Fayyadamaan gar Gar-garagalcha ofii isaa qofa qabaata. Gochi kun galmeeffama, hin deebi\'u.',
        confirmText: 'Fayyadamaa Addan Baasi',
        variant: 'danger',
        requireInput: 'ORPHAN',
      },
      godmodeBan: {
        title: 'Fayyadamaa kana dhorkuu?',
        message: 'Battalumaan argannoo ni dhabu. Koodiin bakka bu\'aa fi ergamtootaa isaa ni haqamu. Kun galmeeffama garuu gocha dhorkuu hiikuu irraa ni deebi\'a.',
        confirmText: 'Fayyadamaa Dhorki',
        variant: 'danger',
        requireInput: 'BAN',
      },
      godmodeUnban: {
        title: 'Fayyadamaa kana dhorkuu hiikuu?',
        message: 'Gara waltajjii argannoo ni argatu. Koodiin bakka bu\'aa fi ergamtootaa isaa irra deebi\'ee hojiirra oola, kanaaf irra deebi\'anii horachuu danda\'u.',
        confirmText: 'Fayyadamaa Dhorkuu Hiiki',
        variant: 'warning',
        requireInput: 'UNBAN',
      },
      godmodeManualEnroll: {
        title: 'Kaffaltii malee argannoo koorsii guutuu kennuu?',
        messageTemplate: 'Fayyadamaan galmee kaffaltii malee Koorsii Guutuu keessatti ni galmeeffama. Sababa: "{reason}". Kun galmee odiitii keessatti galmeeffama.',
        confirmText: 'Argannoo Kenni',
        variant: 'warning',
      },
    },
  },
};