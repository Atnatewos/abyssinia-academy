/**
 * @fileoverview English — Learning Portal Namespace
 * Path: packages/shared/config/i18n/en/portal.js
 */

module.exports = {
  portal: {
    /* ── Top level ───────────────────────────────────────────────── */
    title: 'Abyssinia Student Classroom',
    subtitle: 'Pre-recorded Live Sessions & Timestamped Video Player',
    progressLabel: 'Your Learning Progress',

    /* ── Breadcrumbs ────────────────────────────────────────────── */
    home: 'Home',
    allPhases: 'All Phases',
    phaseLabel: 'Phase {number}',
    phaseWithDuration: 'Phase {number} · {duration}',

    /* ── Video player ───────────────────────────────────────────── */
    currentlyPlaying: 'Currently Playing',
    nowPlaying: 'Now Playing',
    markComplete: 'Mark as Complete',
    completed: 'Completed',
    selectClassPrompt: 'Select a class from the left to start watching.',
    closeVideo: 'Close video',

    /* ── Lesson accordion ──────────────────────────────────────── */
    liveSession: 'Live Session',
    sessionBySession: 'Session by Session',
    classNotes: 'Class Notes',
    resources: 'Resources',
    resourcesCount: 'Resources ({count})',
    freePreviewBadge: 'Free Preview',
    lockedBadge: 'Locked',
    completedBadge: 'Completed',
    noClassesInWeek: 'No classes in this week yet.',
    classesCount: '{count} classes',
    classCountSingular: '{count} class',
    durationLabel: '{duration}',

    /* ── Session breakdown ──────────────────────────────────────── */
    sessionBreakdown: 'Session Breakdown',
    codeResources: 'Code & Assets',
    instructorNotes: 'Instructor Notes',
    download: 'Download Asset',

    /* ── Week header ────────────────────────────────────────────── */
    weekLabel: 'Week {number}',

    /* ── Phase info card ────────────────────────────────────────── */
    phaseOutcomes: 'Key Learning Focus',
    phaseDuration: '{duration}',

    /* ── Dashboard (no phase selected) ──────────────────────────── */
    welcomeBack: 'Welcome back',
    welcomeGreeting: 'Hi {name}, ready to continue?',
    welcomeSubtitle:
      "You're enrolled in the {course}. Pick up where you left off, or explore all phases below.",
    resumeLearning: 'Resume Learning',
    viewInCatalog: 'View in course catalog',

    /* ── Stat cards ─────────────────────────────────────────────── */
    lessonsDone: 'Lessons Done',
    overallProgress: 'Overall Progress',
    enrollment: 'Enrollment',
    enrollmentFullCourse: 'Full Course',
    enrollmentIndividual: 'Individual Phases',
    enrollmentFullSubtext: 'All 5 phases unlocked',
    enrollmentIndividualSubtext: 'Selected phases only',

    /* ── Phase grid ─────────────────────────────────────────────── */
    allPhasesTitle: 'All Phases',
    yourPhasesTitle: 'Your Phases',
    startButton: 'Start',
    continueButton: 'Continue',
    lockedButton: 'Locked',
    lessonsCount: '{count} lessons',

    /* ── Empty / loading states ────────────────────────────────── */
    noPhasesAvailable: 'No phases available yet. Please check back soon.',
    classroomCurriculum: 'Classroom Curriculum',

    /* ── Locked overlay ─────────────────────────────────────────── */
    lockedTitle: 'This Class is Locked',
    lockedDescription:
      'Complete your enrollment to unlock all courses, class recordings, source code repositories, and weekly project feedback.',
    lockedPhaseTitle: 'Phase {phase} is Locked',
    lockedPhaseDescription:
      'Purchase Phase {phase}{title} to unlock this content and continue your learning journey.',
    unlockPhase: 'Unlock Phase {phase}',
  },
};