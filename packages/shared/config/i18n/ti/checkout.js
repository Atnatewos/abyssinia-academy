/**
 * @fileoverview Tigrinya — Checkout Flow Namespace
 *
 * Template variable {minutes} resolved from payments.approval.slaMinutes —
 * never hardcoded.
 *
 * Path: packages/shared/config/i18n/ti/checkout.js
 */

module.exports = {
  checkout: {
    title: 'ኣብ አቢሲኒያ ኣካዳሚ ተመዝገብ',
    subtitle: 'ኩሎም ትምህርትታትን ናይ ትምህርቲ ቁሳቁስን ንምኽፋት ብድሕንነት ክፈል',
    fullName: 'ምሉእ ስም',
    phone: 'ቑጽሪ ተሌፎን',
    transactionRef: 'ቑጽሪ ምልክት ግብይት',
    paymentMethod: 'ኣገባብ ክፍሊት',
    tuitionFee: 'ክፍሊት ትምህርቲ',
    verifying: 'ክፍሊት ይረጋገጽ ኣሎ...',
    completeEnrollment: 'ምዝገባ ኣጠናቕ እሞ ፖርታል ክፈት',
    uploadScreenshot: 'ስክሪንሾት ክፍሊት ጽዓን (ኣማራጺ)',
    pendingTitle: 'ክፍሊት ኣብ ትሕቲ ገምጋም',
    /* Template variable {minutes} injected from payments config */
    pendingMessage: 'ክፍሊትካ ይረጋገጽ ኣሎ። ድሕሪ ምርግጋጹ ውሽጢ {minutes} ደቓይቕ ኣብ ፖርታል ክትኣቱ ኢኻ።',
    approvedTitle: 'ክፍሊት ተረጋጊጹ!',
    approvedMessage: 'ክፍሊትካ ተረጋጊጹ። ኣብ አቢሲኒያ ኣካዳሚ እንቋዕ ብደሓን መጻእካ!',
    rejectedTitle: 'ክፍሊት ኣይተረጋገጸን',
    rejectedMessage: 'ክፍሊትካ ክረጋገጽ ኣይተኻእለን። በጃኻ ምስ ደገፍ ተራኸብ።',
    noPaymentTitle: 'ክፍሊት ኣይተረኸበን',
    noPaymentMessage: 'ክሳብ ሕጂ ክፍሊት ኣየቕረብካን።',
    goToPortal: 'ናብ ፖርታል ክላስሩም ኪድ',
    viewPricing: 'ዋጋ ተመልከት',
    noPaymentMethods: 'ኣገባብ ክፍሊት የለን።',
    copyToClipboard: 'ናብ ቅንጥብ ሰሌዳ ቅዳሕ',
    copied: 'ተቐዲሑ!',
    copy: 'ቅዳሕ',
    invalidFileType: 'በጃኻ ስእሊ JPEG, PNG, ወይ WebP ጽዓን።',
    fileTooLarge: 'ዓቐን ፋይል ትሕቲ {size}MB ክኸውን ኣለዎ።',
    fullNameRequired: 'ምሉእ ስም ኣስፈላጊ እዩ።',
    phoneRequired: 'ቑጽሪ ተሌፎን ኣስፈላጊ እዩ።',
    transactionRefRequired: 'ቑጽሪ ምልክት ግብይት ኣስፈላጊ እዩ።',
    paymentMethodRequired: 'በጃኻ ኣገባብ ክፍሊት ምረጽ።',
    clickToUpload: 'ስክሪንሾት ንምጽዓን ጠውቕ',
    uploadHint: 'JPEG, PNG, ወይ WebP (ብዝበዝሐ {size}MB)',
    accountLabel: 'ሕሳብ',
    bankLabel: 'ባንክ፦ {bankName}',
    accountNameLabel: 'ስም ሕሳብ፦',
    payVia: 'ብ {method} ክፈል',
    purchaseSummaryTitle: 'ግዝያ',
    purchaseFullCourse: 'ምሉእ ትምህርቲ — ኩሎም 5 ምዕራፋት',
    purchasePhasesSelected: '{count} ምዕራፍ(ታት) ተመሪጹ',
  },
};