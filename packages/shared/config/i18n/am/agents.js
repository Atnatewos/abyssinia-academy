/**
 * @fileoverview Amharic — Agent System Namespace
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
 * Path: packages/shared/config/i18n/am/agents.js
 */
module.exports = {
  agents: {
    /* Dashboard */
    dashboardTitle: 'የወኪል ዳሽቦርድ',
    dashboardSubtitle: 'በሚያመጡት እያንዳንዱ ሽያጭ ላይ ፈጣን ኮሚሽን ያግኙ።',
    yourAgentCode: 'የእርስዎ የወኪል ኮድ',
    yourAgentLink: 'የእርስዎ የወኪል ሊንክ',
    instantPayout: 'ፈጣን ክፍያ',
    instantPayoutDesc: 'የጥበቃ ጊዜ የለም - ኮሚሽኖች ወዲያውኑ ይገኛሉ።',

    /* Stats */
    totalAgentSales: 'ጠቅላላ የወኪል ሽያጮች',
    totalAgentEarned: 'ጠቅላላ የወኪል ገቢ',
    agentCommissionRate: 'የኮሚሽን መጠን',
    pendingAgentCommissions: 'በመጠባበቅ ላይ ያሉ ኮሚሽኖች',

    /* Share section */
    shareTitle: 'የወኪል ሊንክዎን ያጋሩ',
    shareSubtitle: 'ጓደኞችዎ በሊንክዎ ሲገዙ ፈጣን ኮሚሽን ያግኙ።',
    copyCode: 'ኮድ ቅዳ',
    copyLink: 'ሊንክ ቅዳ',
    copied: 'ወደ ቅንጥብ ሰሌዳ ተቀድቷል',
    copyFailed: 'መቅዳት አልተቻለም',

    /* Commission table */
    commissionHistory: 'የወኪል ኮሚሽን ታሪክ',
    allCommissions: 'ሁሉም',
    date: 'ቀን',
    source: 'ከ',
    type: 'ዓይነት',
    amount: 'መጠን',
    status: 'ሁኔታ',
    paid: 'ተከፍሏል',
    reversed: 'ተመላሽ ሆኗል',
    empty: 'እስካሁን የወኪል ኮሚሽን የለም። ገቢ ለመጀመር ሊንክዎን ያጋሩ!',
    page: 'ገጽ',

    /* Commission types */
    fixedCommission: 'በእያንዳንዱ ሽያጭ {amount} ብር',
    percentageCommission: 'በእያንዳንዱ ሽያጭ {percent}%',

    /* Agent code input (checkout) */
    haveAgentCode: 'የወኪል ኮድ አለዎት?',
    enterAgentCode: 'የወኪል ኮድ ያስገቡ',
    agentCodeApplied: 'የወኪል ኮድ ተተግብሯል፦ {code}',
    agentDiscount: 'የወኪል ቅናሽ',
    invalidAgentCode: 'ልክ ያልሆነ የወኪል ኮድ።',
    selfAgentCode: 'የራስዎን የወኪል ኮድ መጠቀም አይችሉም።',
    agentCodeAlreadyUsed: 'ይህ የወኪል ኮድ ለእርስዎ መለያ አስቀድሞ ጥቅም ላይ ውሏል።',
    agentOverridesMLM: 'የወኪል ኮድ የሪፈራል ቅናሹን ይሽራል።',
    agentOverridesDiscount: 'የወኪል ኮድ የማስተዋወቂያ ቅናሹን ይሽራል።',

    /* Admin */
    adminTitle: 'የወኪል አስተዳደር',
    adminSubtitle: 'የወኪል ኮሚሽን መጠኖችን ያዋቅሩ እና አፈጻጸምን ይመልከቱ።',
    adminCommissionType: 'የኮሚሽን ዓይነት',
    adminCommissionValue: 'የኮሚሽን ዋጋ',
    adminFixed: 'ቋሚ (ብር)',
    adminPercentage: 'መቶኛ (%)',
    adminSave: 'የወኪል ቅንብሮችን አስቀምጥ',
    adminSaved: 'የወኪል ቅንብሮች በተሳካ ሁኔታ ተቀምጠዋል።',
    adminSaveFailed: 'የወኪል ቅንብሮችን ማስቀመጥ አልተቻለም።',
    adminActiveAgents: 'ንቁ ወኪሎች',
    adminTotalAgentCommissions: 'የተከፈለ ጠቅላላ የወኪል ኮሚሽን',
    adminAgentPerformance: 'የወኪል አፈጻጸም',

    /* How it works */
    howItWorks: 'የወኪል ኮሚሽን እንዴት ይሰራል',
    step1Title: 'የወኪል ሊንክዎን ያጋሩ',
    step1Desc: 'ልዩ የወኪል ሊንክዎን ቅደው ከጓደኞችዎ ጋር ያጋሩ።',
    step2Title: 'እነሱ ይገዛሉ',
    step2Desc: 'አንድ ሰው በሊንክዎ ሲገዛ ሽያጩ ለእርስዎ ይመደባል።',
    step3Title: 'ፈጣን ኮሚሽን',
    step3Desc: 'አስተዳዳሪው ክፍያውን ካጸደቀ በኋላ ኮሚሽንዎ ወዲያውኑ ይገኛል።',
    step4Title: 'በማንኛውም ጊዜ ያውጡ',
    step4Desc: 'የመቆለፊያ ጊዜ የለም — ገቢዎን በፈለጉት ጊዜ ያውጡ።',

    /* Errors */
    loadError: 'የወኪል ዳሽቦርድን መጫን አልተቻለም።',
    loadCommissionsError: 'የወኪል ኮሚሽኖችን መጫን አልተቻለም።',
    validateError: 'የወኪል ኮድን ማረጋገጥ አልተቻለም።',

    /* Registration attribution */
    validatingAgent: 'የወኪል ኮድ በማረጋገጥ ላይ...',
    invitedByAgent: 'በ{name} ተጋብዘዋል።',
    invitedByAgentDesc: 'ግዢዎ በወኪል ፕሮግራም በኩል {name}ን ይደግፋል።',
    removeAgentCode: 'የወኪል ኮድ አስወግድ',
        /* Funnel Stats */
    totalReferrals: 'በአጠቃላይ የተመላለሱ ተጠቃሚዎች',
    pendingReferrals: 'በመጠባበቅ ላይ ያሉ',
    convertedReferrals: 'ወደ ግዢ የተቀየሩ',
  },
};