/**
 * @fileoverview Language Context
 * Bilingual EN/AM support with translations loaded from shared config
 * Path: apps/web/context/LanguageContext.js
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getItem, setItem } from '../lib/storage';

/**
 * Static translations embedded directly in the context
 * This avoids cross-package import issues with Next.js webpack
 * Translations are sourced from packages/shared/config/i18n/
 */
const TRANSLATIONS = {
  en: {
    nav: {
      overview: 'Overview',
      courses: 'Courses',
      portal: 'Classroom Portal',
      tuition: 'Tuition',
      enrollNow: 'Enroll Now',
      claimDiscount: 'Claim Discount →',
    },
    banner: {
      text: '🚀 Next Cohort Enrolling! Master Full-Stack Engineering with Unlisted Masterclasses.',
    },
    hero: {
      badge: '#1 Unlisted YouTube Masterclass Learning System',
      title: 'Master Professional Software Engineering at',
      subtitle: 'A step-by-step 5-phase engineering curriculum. Access high-definition pre-recorded live masterclasses, session breakdowns, raw coding exercises, and production project repositories.',
      exploreCourses: 'Explore Courses',
      unlockAccess: 'Unlock Full Pass',
    },
    stats: {
      phases: '5 Phases',
      phasesSub: 'Structured System',
      weeks: '20+ Weeks',
      weeksSub: 'Live Video Sessions',
      access: '100%',
      accessSub: 'Lifetime YouTube Access',
    },
    courses: {
      sectionTitle: 'Academy Catalog',
      heading: 'Industry-Ready Engineering Programs',
      subheading: 'Select a course program to explore its 5 structured learning phases.',
      backToCourses: '← Back to All Courses',
      phasesInCourse: 'Course Roadmap & Phases',
      phasesHeading: '5 Structured Phases to Mastery',
      phasesSubheading: 'Comprehensive phase breakdown designed to take you from core basics to cloud deployment.',
      watchClass: 'Open Classroom',
      unlockVideo: 'Unlock Access',
      freePreview: 'FREE PREVIEW',
      unlistedClass: 'UNLISTED CLASS',
      viewPhases: 'View Course Phases',
      phaseOutcomes: 'Key Learning Focus',
    },
    portal: {
      title: 'Abyssinia Student Classroom',
      subtitle: 'Pre-recorded Live Sessions & Timestamped Video Player',
      progressLabel: 'Your Learning Progress',
      currentlyPlaying: 'Currently Playing',
      markComplete: 'Mark as Complete',
      completed: 'Completed',
      sessionBreakdown: 'Session Breakdown',
      codeResources: 'Code & Assets',
      instructorNotes: 'Instructor Notes',
      download: 'Download Asset',
      classroomCurriculum: 'Classroom Curriculum',
      lockedTitle: 'This Unlisted Class is Locked',
      lockedDescription: 'Complete your enrollment to unlock all courses, unlisted YouTube class recordings, source code repositories, and weekly project feedback.',
    },
    pricing: {
      heading: 'Simple & Transparent Tuition',
      subheading: 'One single payment unlocks all courses, 5 phases, code repositories, and unlisted YouTube playlists.',
      fullPass: 'Full Academy Access Pass',
      masterclass: 'Full-Stack Software Masterclass',
      instantAccess: 'Instant access to all 5 phases & course modules',
      hdPlaylists: 'Unlisted HD YouTube pre-recorded video masterclasses',
      timestampsNotes: 'Timestamped session breakdowns & lecture notes',
      githubAssets: 'GitHub source code repositories & starter kits',
      telegramCommunity: 'Private Telegram developer mentorship community',
      enrollToday: 'Enroll Today & Start Learning',
    },
    checkout: {
      title: 'Enroll in Abyssinia Academy',
      subtitle: 'Pay securely to unlock all courses & unlisted masterclass video archives.',
      fullName: 'Full Name',
      phone: 'Phone Number',
      transactionRef: 'Transaction Reference Number',
      paymentMethod: 'Payment Method',
      tuitionFee: 'Tuition Fee',
      verifying: 'Verifying Payment...',
      completeEnrollment: 'Complete Enrollment & Unlock Portal',
      uploadScreenshot: 'Upload Payment Screenshot (Optional)',
      pendingTitle: 'Payment Under Review',
      pendingMessage: 'Your payment is being verified. You will get access within 24 hours after confirmation.',
    },
    auth: {
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      email: 'Email Address',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password?',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
    },
    theme: {
      light: 'Light Mode',
      dark: 'Dark Mode',
      languageName: 'English',
    },
    footer: {
      rights: 'All rights reserved.',
    },
  },
  am: {
    nav: {
      overview: 'ዋና ገፅ',
      courses: 'ኮርሶች',
      portal: 'የተማሪዎች መማሪያ',
      tuition: 'የትምህርት ክፍያ',
      enrollNow: 'አሁኑኑ ይመዝገቡ',
      claimDiscount: 'ቅናሽ ያግኙ →',
    },
    banner: {
      text: '🚀 ለአዲሱ ምዕራፍ ምዝገባ ተጀምሯል! በዩቲዩብ ቪዲዮዎች የሶፍትዌር ኢንጂነሪንግ ይማሩ።',
    },
    hero: {
      badge: '#1 የተቀረፁ የዩቲዩብ ማስተርክላስ ትምህርቶች',
      title: 'በሙያዊ የሶፍትዌር ልማት ባለሙያ ይሁኑ በ',
      subtitle: 'በ5 የተቀናጁ ደረጃዎች የተከፈለ የሶፍትዌር ልማት ትምህርት።',
      exploreCourses: 'ኮርሶችን ይመልከቱ',
      unlockAccess: 'ሙሉ መዳረሻ ይክፈቱ',
    },
    stats: {
      phases: '5 ደረጃዎች',
      phasesSub: 'የተዋቀረ የትምህርት መስመር',
      weeks: '20+ ሳምንታት',
      weeksSub: 'የተቀረፁ የቀጥታ ክፍሎች',
      access: '100%',
      accessSub: 'የቪዲዮ መዳረሻ',
    },
    courses: {
      sectionTitle: 'የኮርሶች ዝርዝር',
      heading: 'ለስራ የሚያበቁ የትምህርት ፕሮግራሞች',
      subheading: 'የሚፈልጉትን ኮርስ በመምረጥ የ5ቱን ደረጃዎች ዝርዝር ያግኙ።',
      backToCourses: '← ወደ ኮርሶች ዝርዝር ተመለስ',
      phasesInCourse: 'የኮርሱ ደረጃዎች',
      phasesHeading: '5 የተዋቀሩ የዕድገት ደረጃዎች',
      phasesSubheading: 'ከመሰረታዊ የዌብ እውቀት እስከ ደመና ሰርቨሮች መጫን የሚያስችል የተቀናጀ ትምህርት።',
      watchClass: 'መማሪያውን ክፈት',
      unlockVideo: 'ቪዲዮውን ይክፈቱ',
      freePreview: 'ነፃ ቅምሻ',
      unlistedClass: 'የተቆለፈ ክፍል',
      viewPhases: 'የኮርሱን 5 ደረጃዎች ይመልከቱ',
      phaseOutcomes: 'ዋና የትምህርት ትኩረቶች',
    },
    portal: {
      title: 'የአቢሲኒያ ተማሪዎች መማሪያ',
      subtitle: 'የተቀረፁ የቪዲዮ ክፍሎች ማጫወቻ',
      progressLabel: 'የእርስዎ የትምህርት ዕድገት',
      currentlyPlaying: 'አሁን በመጫወት ላይ',
      markComplete: 'ጨርሻለሁ በል',
      completed: 'ተጠናቋል',
      sessionBreakdown: 'የክፍሉ ክፍሎች',
      codeResources: 'የኮድ ፋይሎች',
      instructorNotes: 'የአስተማሪው ማስታወሻ',
      download: 'አውርድ',
      classroomCurriculum: 'የትምህርት ዝርዝር',
      lockedTitle: 'ይህ ክፍል ተቆልፏል',
      lockedDescription: 'ሁሉንም ኮርሶች፣ የዩቲዩብ ቪዲዮዎችን እና የኮድ ፋይሎችን ለማግኘት ምዝገባዎን ያጠናቅቁ።',
    },
    pricing: {
      heading: 'ግልጽ እና ተመጣጣኝ የትምህርት ክፍያ',
      subheading: 'አንድ ጊዜ በመክፈል የ5ቱንም ደረጃዎች ቪዲዮዎች፣ የኮድ ፋይሎች እና የዩቲዩብ ፕሌይሊስቶች ያግኙ።',
      fullPass: 'ሙሉ የአካዳሚ መዳረሻ',
      masterclass: 'የፉል-ስታክ ሶፍትዌር ማስተርክላስ',
      instantAccess: 'የ5ቱም ደረጃዎች እና ሳምንታዊ ክፍሎች ፈጣን መዳረሻ',
      hdPlaylists: 'የተቀረፁ HD ቪዲዮዎች ፕሌይሊስት',
      timestampsNotes: 'የሰዓት ማብራሪያዎች እና ማስታወሻዎች',
      githubAssets: 'የጊትሃብ ኮድ ፋይሎች እና መልመጃዎች',
      telegramCommunity: 'የቴሌግራም የተማሪዎች ማህበረሰብ ደጋፊ ግሩፕ',
      enrollToday: 'ዛሬውኑ ይመዝገቡ',
    },
    checkout: {
      title: 'በአቢሲኒያ አካዳሚ ይመዝገቡ',
      subtitle: 'በአስተማማኝ ሁኔታ ክፍያ ፈጽመው የቪዲዮ ትምህርቶችን ይክፈቱ።',
      fullName: 'ሙሉ ስም',
      phone: 'ስልክ ቁጥር',
      transactionRef: 'የተላከለት ቁጥር',
      paymentMethod: 'የክፍያ ዘዴ',
      tuitionFee: 'የትምህርት ክፍያ',
      verifying: 'ክፍያው በመረጋገጥ ላይ...',
      completeEnrollment: 'ምዝገባውን ጨርስ እና ፖርታሉን ክፈት',
      uploadScreenshot: 'የክፍያ ማረጋገጫ ፎቶ ያስገቡ',
      pendingTitle: 'ክፍያዎ እየተረጋገጠ ነው',
      pendingMessage: 'ክፍያዎ እየተረጋገጠ ነው። ከተረጋገጠ በ24 ሰዓት ውስጥ መዳረሻ ያገኛሉ።',
    },
    auth: {
      login: 'ግባ',
      register: 'ይመዝገቡ',
      logout: 'ውጣ',
      email: 'ኢሜል አድራሻ',
      password: 'የይለፍ ቃል',
      confirmPassword: 'የይለፍ ቃል ያረጋግጡ',
      forgotPassword: 'የይለፍ ቃል ረሱ?',
      noAccount: 'መለያ የሎትም?',
      hasAccount: 'ቀድሞውኑ መለያ አለዎት?',
    },
    theme: {
      light: 'ብርሃናማ ሞድ',
      dark: 'ጨለማማ ሞድ',
      languageName: 'አማርኛ',
    },
    footer: {
      rights: 'መብቱ በህግ የተጠበቀ ነው።',
    },
  },
};

const DEFAULT_LANGUAGE = 'en';

const LanguageContext = createContext(null);

/**
 * Language Provider Component
 * Wraps the app to provide bilingual EN/AM support
 * Language preference persists in localStorage
 */
const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLanguage = getItem('abyssinia_language', DEFAULT_LANGUAGE);
    const isValidLanguage = TRANSLATIONS[savedLanguage] !== undefined;
    setLanguageState(isValidLanguage ? savedLanguage : DEFAULT_LANGUAGE);
    setMounted(true);
  }, []);

  /**
   * Translation object for the current language
   * Memoized to prevent unnecessary re-renders
   */
  const t = useMemo(() => {
    return TRANSLATIONS[language] || TRANSLATIONS[DEFAULT_LANGUAGE];
  }, [language]);

  /**
   * Toggle between English and Amharic
   */
  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const newLang = prev === 'en' ? 'am' : 'en';
      setItem('abyssinia_language', newLang);
      return newLang;
    });
  }, []);

  /**
   * Set a specific language by code
   * @param {string} lang - Language code ('en' or 'am')
   */
  const setLanguage = useCallback((lang) => {
    if (TRANSLATIONS[lang]) {
      setLanguageState(lang);
      setItem('abyssinia_language', lang);
    }
  }, []);

  const value = {
    language,
    t,
    toggleLanguage,
    setLanguage,
    mounted,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * Hook to consume language context
 * Returns safe defaults if used outside provider
 * @returns {object} Language context with t, language, toggleLanguage, setLanguage
 */
const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (context === null) {
    return {
      language: DEFAULT_LANGUAGE,
      t: TRANSLATIONS[DEFAULT_LANGUAGE],
      toggleLanguage: () => {},
      setLanguage: () => {},
      mounted: false,
    };
  }

  return context;
};

export { LanguageProvider, useLanguage, TRANSLATIONS };