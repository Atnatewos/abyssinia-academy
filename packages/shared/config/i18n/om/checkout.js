/**
 * @fileoverview Oromo — Checkout Flow Namespace
 *
 * Template variable {minutes} resolved from payments.approval.slaMinutes —
 * never hardcoded.
 *
 * Path: packages/shared/config/i18n/om/checkout.js
 */

module.exports = {
  checkout: {
    title: 'Akademii Abisiiniyaa Keessatti Galmaa\'i',
    subtitle: 'Koorsiiwwan hunda fi maddoota koorsii banuuf nageenyaan kaffali',
    fullName: 'Maqaa Guutuu',
    phone: 'Lakkoofsa Bilbilaa',
    transactionRef: 'Lakkoofsa Mallattoo Gurgurtaa',
    paymentMethod: 'Mala Kaffaltii',
    tuitionFee: 'Kaffaltii Barnootaa',
    verifying: 'Kaffaltii Mirkaneessaa Jira...',
    completeEnrollment: 'Galmee Xumuri & Portaalii Bani',
    uploadScreenshot: 'Suuraa Kaffaltii Olkaa\'i (Filannoo)',
    pendingTitle: 'Kaffaltiin Gamaaggamuu Jala Jira',
    /* Template variable {minutes} injected from payments config */
    pendingMessage: 'Kaffaltiin kee mirkanaa\'aa jira. Mirkaneessaa booda daqiiqaa {minutes} keessatti portaalii argatta.',
    approvedTitle: 'Kaffaltiin Mirkanaa\'e!',
    approvedMessage: 'Kaffaltiin kee mirkanaa\'e. Baga gara Akademii Abisiiniyaa dhuftu!',
    rejectedTitle: 'Kaffaltiin Hin Mirkanaane',
    rejectedMessage: 'Kaffaltiin kee mirkanaa\'uu hin dandeenye. Maaloo deeggarsa qunnami.',
    noPaymentTitle: 'Kaffaltiin Hin Argamne',
    noPaymentMessage: 'Hanga ammaatti kaffaltii hin dhiyeessine.',
    goToPortal: 'Gara Portaalii Kutaa Barnootaatti Deebi\'i',
    viewPricing: 'Gatii Ilaali',
    noPaymentMethods: 'Malli kaffaltii hin jiru.',
    copyToClipboard: 'Gara kilaayiboordiitti koppii godhi',
    copied: 'Koppii Ta\'e!',
    copy: 'Koppii Godhi',
    invalidFileType: 'Maaloo suuraa JPEG, PNG, yookaan WebP olkaa\'i.',
    fileTooLarge: 'Guddinni faayilii {size}MB gadi ta\'uu qaba.',
    fullNameRequired: 'Maqaan guutuun barbaachisa.',
    phoneRequired: 'Lakkoofsi bilbilaa barbaachisa.',
    transactionRefRequired: 'Mallattoon gurgurtaa barbaachisa.',
    paymentMethodRequired: 'Maaloo mala kaffaltii filadhu.',
    clickToUpload: 'Suuraa olkaa\'uuf cuqaasi',
    uploadHint: 'JPEG, PNG, yookaan WebP (hanga {size}MB)',
    accountLabel: 'Herrega',
    bankLabel: 'Baankii: {bankName}',
    accountNameLabel: 'Maqaa Herregaa:',
    payVia: '{method} kaffali',
    purchaseSummaryTitle: 'Bittaa',
    purchaseFullCourse: 'Koorsii Guutuu — Kutaa Barnootaa 5 Hunda',
    purchasePhasesSelected: 'Kutaa barnootaa {count} filatame',
  },
};