/**
 * @fileoverview Tigrinya — Agent System Namespace
 *
 * Contains all UI copy for the agent commission system:
 *   - Agent dashboard labels
 *   - Agent share section
 *   - Agent commission table
 *   - Agent stats cards
 *   - Agent code input (checkout)
 *   - Admin agent management
 *
 * All copy is config-driven — no hardcoded strings in JSX components.
 *
 * Path: packages/shared/config/i18n/ti/agents.js
 */
module.exports = {
  agents: {
    /* Dashboard */
    dashboardTitle: 'ዳሽቦርድ ወኪል',
    dashboardSubtitle: 'ኣብ ነፍሲ ወከፍ ዘቕርቦ ሽያጭ ፈጣን ኮሚሽን ርኸብ።',
    yourAgentCode: 'ኮድ ወኪልካ',
    yourAgentLink: 'ሊንክ ወኪልካ',
    instantPayout: 'ፈጣን ክፍሊት',
    instantPayoutDesc: 'ናይ ምጽባይ ግዜ የለን — ኮሚሽናት ብቕጽበት ይርከቡ።',

    /* Stats */
    totalAgentSales: 'ጠቕላላ ሽያጭ ወኪል',
    totalAgentEarned: 'ጠቕላላ ኣታዊ ወኪል',
    agentCommissionRate: 'መጠን ኮሚሽን',
    pendingAgentCommissions: 'ኣብ ምጽባይ ዘለዉ ኮሚሽናት',

    /* Share section */
    shareTitle: 'ሊንክ ወኪልካ ኣካፍል',
    shareSubtitle: 'ዓርኪታትካ ብሊንክካ ምስ ገደሱ ፈጣን ኮሚሽን ርኸብ።',
    copyCode: 'ኮድ ቅዳሕ',
    copyLink: 'ሊንክ ቅዳሕ',
    copied: 'ናብ ቅንጥብ ሰሌዳ ተቐዲሑ',
    copyFailed: 'ምቕዳሕ ኣይተኻእለን',

    /* Commission table */
    commissionHistory: 'ታሪኽ ኮሚሽን ወኪል',
    allCommissions: 'ኩሉ',
    date: 'መዓልቲ',
    source: 'ካብ',
    type: 'ዓይነት',
    amount: 'መጠን',
    status: 'ኩነታት',
    paid: 'ተኸፊሉ',
    reversed: 'ተመሊሱ',
    empty: 'ክሳብ ሕጂ ኮሚሽን ወኪል የለን። ኣታዊ ንምጅማር ሊንክካ ኣካፍል!',
    page: 'ገጽ',

    /* Commission types */
    fixedCommission: '{amount} ብር ኣብ ነፍሲ ወከፍ ሽያጭ',
    percentageCommission: '{percent}% ኣብ ነፍሲ ወከፍ ሽያጭ',

    /* Agent code input (checkout) */
    haveAgentCode: 'ኮድ ወኪል ኣለካ?',
    enterAgentCode: 'ኮድ ወኪል ኣእቱ',
    agentCodeApplied: 'ኮድ ወኪል ተተግቢሩ፦ {code}',
    agentDiscount: 'ቅናሽ ወኪል',
    invalidAgentCode: 'ዘይግቡእ ኮድ ወኪል።',
    selfAgentCode: 'ናይ ገዛእ ርእስኻ ኮድ ወኪል ክትጥቀም ኣይትኽእልን።',
    agentCodeAlreadyUsed: 'እዚ ኮድ ወኪል ኣብ ሕሳብካ ተጠቒሙ እዩ።',
    agentOverridesMLM: 'ኮድ ወኪል ነቲ ቅናሽ ሪፈራል ይሽር።',
    agentOverridesDiscount: 'ኮድ ወኪል ነቲ ቅናሽ ዘተባብዕ ይሽር።',

    /* Admin */
    adminTitle: 'ምሕደራ ወኪል',
    adminSubtitle: 'መጠን ኮሚሽን ወኪል ኣዋቅር እሞ ኣፈጻጽማ ተመልከት።',
    adminCommissionType: 'ዓይነት ኮሚሽን',
    adminCommissionValue: 'ዋጋ ኮሚሽን',
    adminFixed: 'ቀዋሚ (ብር)',
    adminPercentage: 'መቶኛ (%)',
    adminSave: 'ቅንብራት ወኪል ኣቐምጥ',
    adminSaved: 'ቅንብራት ወኪል ብዓወት ተቐሚጡ።',
    adminSaveFailed: 'ቅንብራት ወኪል ምቕማጥ ኣይተኻእለን።',
    adminActiveAgents: 'ንጡፋት ወኪላት',
    adminTotalAgentCommissions: 'ጠቕላላ ኮሚሽን ወኪል ዝተኸፈለ',
    adminAgentPerformance: 'ኣፈጻጽማ ወኪል',

    /* How it works */
    howItWorks: 'ኮሚሽን ወኪል ከመይ ይሰርሕ',
    step1Title: 'ሊንክ ወኪልካ ኣካፍል',
    step1Desc: 'ብልዩ ዝኾነ ሊንክ ወኪልካ ቅዲሕካ ምስ ዓርኪታትካ ኣካፍል።',
    step2Title: 'ንሳቶም ይገድሱ',
    step2Desc: 'ሓደ ሰብ ብሊንክካ ምስ ገደሰ እቲ ሽያጭ ንዓኻ ይመደብ።',
    step3Title: 'ፈጣን ኮሚሽን',
    step3Desc: 'ኣማሓዳሪ ነቲ ክፍሊት ምስ ኣረጋገጸ ኮሚሽንካ ብቕጽበት ይርከብ።',
    step4Title: 'ብንኸፍኣ ግዜ ኣውጽእ',
    step4Desc: 'ናይ ምዕጻው ግዜ የለን — ኣታዊኻ ብዝደለኻዮ ግዜ ኣውጽእ።',

    /* Errors */
    loadError: 'ዳሽቦርድ ወኪል ምጽዓን ኣይተኻእለን።',
    loadCommissionsError: 'ኮሚሽናት ወኪል ምጽዓን ኣይተኻእለን።',
    validateError: 'ኮድ ወኪል ምርግጋጽ ኣይተኻእለን።',
  },
};