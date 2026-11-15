/**
 * @fileoverview Learning Portal — Clean, Reference-Matched Design
 *
 * Responsive behavior:
 *   - DESKTOP (lg+): two-column grid. Video player sticky on the RIGHT,
 *     always rendered. Accordion scrolls independently on the LEFT.
 *   - MOBILE (<lg): single column. Video player is HIDDEN until a lesson
 *     is opened. Once opened, it becomes a STICKY bar at the top of the
 *     viewport (below the navbar) that stays visible while scrolling.
 *
 * Every surface is fully opaque (bg-bg-card-solid). Depth comes from
 * thin borders. Every string resolves from `t.portal.*`.
 *
 * Path: apps/web/pages/portal/index.jsx
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import VideoPlayer from '../../components/portal/VideoPlayer';
import CompleteButton from '../../components/portal/CompleteButton';
import ProgressRing from '../../components/portal/ProgressRing';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import useProgress from '../../hooks/useProgress';
import usePortalCourse from '../../hooks/usePortalCourse';
import ScholarshipBanner from '../../components/scholarships/ScholarshipBanner';
import useAccessControl from '../../hooks/useAccessControl';
import GlassCard from '../../components/shared/GlassCard';
import StatCard from '../../components/shared/StatCard';
import AnimatedProgress from '../../components/shared/AnimatedProgress';
import { SkeletonStatsGrid, SkeletonCard } from '../../components/shared/Skeleton';
import {
  Video, X, ChevronRight, CheckCircle, Lock, PlayCircle,
  Home, Clock, ChevronDown, Radio, ListVideo, BookOpen,
  GraduationCap, Trophy, Target, ArrowRight, Sparkles,
  FileText, Download,
} from 'lucide-react';

const STORAGE_KEY_WEEKS = 'abyssinia_collapsed_weeks';
const STORAGE_KEY_CLASSES = 'abyssinia_expanded_classes';

const PHASE_ICON_MAP = {
  Code2: BookOpen,
  BookOpen: BookOpen,
  GraduationCap: GraduationCap,
  Sparkles: Sparkles,
};

const interpolate = (template, tokens = {}) => {
  if (!template || typeof template !== 'string') return '';
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    tokens[key] !== undefined ? String(tokens[key]) : `{${key}}`
  );
};

/**
 * Style tokens for the LIVE SESSION card and active session row.
 * Matches the reference design: subtle red tint, soft border, no glow.
 */
const STYLE = {
  liveInactive: {
    backgroundColor: 'rgba(239, 68, 68, 0.045)',
    borderColor: 'rgba(239, 68, 68, 0.16)',
  },
  liveActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.09)',
    borderColor: 'rgba(239, 68, 68, 0.28)',
  },
  sessionInactive: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  sessionActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.18)',
  },
};

const PortalPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const { isEnrolled, user } = useAuth();
  const { course, phases, loading: courseLoading } = usePortalCourse('fullstack-web-engineering-masterclass');
  const { completedLessons, toggleLesson, calculateProgress, loading: progressLoading } = useProgress();
  const { checkPhaseAccess, checkWeekAccess, checkLessonAccess, isFullCourse } = useAccessControl();

  const p = t.portal || {};

  const [activePhase, setActivePhase] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeVideoId, setActiveVideoId] = useState(null);

  useEffect(() => {
    if (phases.length > 0 && router.query.phase && !activePhase) {
      const targetPhase = phases.find(
        (ph) => String(ph.number ?? ph.phase_number) === String(router.query.phase)
      );
      if (targetPhase) setActivePhase(targetPhase);
    }
  }, [phases, router.query.phase, activePhase]);

  const [collapsedWeeks, setCollapsedWeeks] = useState(() => {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY_WEEKS)) || {}; } catch { return {}; }
  });

  const [expandedSections, setExpandedSections] = useState(() => {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY_CLASSES)) || {}; } catch { return {}; }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY_WEEKS, JSON.stringify(collapsedWeeks));
  }, [collapsedWeeks]);

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(expandedSections));
  }, [expandedSections]);

  const allLessonIds = useMemo(() => {
    const ids = [];
    phases.forEach((phase) => {
      const phaseAccessible = isFullCourse || checkPhaseAccess(phase.id);
      if (phaseAccessible || isEnrolled) {
        phase.weeks?.forEach((w) => w.lessons?.forEach((l) => ids.push(l.id)));
      }
    });
    return ids;
  }, [phases, isFullCourse, checkPhaseAccess, isEnrolled]);

  const progressPercentage = calculateProgress(allLessonIds);
  const completedCount = allLessonIds.filter((id) => completedLessons.includes(id)).length;

  const getPhaseProgress = useCallback((phase) => {
    let total = 0, done = 0;
    phase.weeks?.forEach((w) => w.lessons?.forEach((l) => {
      total++;
      if (completedLessons.includes(l.id)) done++;
    }));
    return total ? Math.round((done / total) * 100) : 0;
  }, [completedLessons]);

  const getWeekProgress = useCallback((week) => {
    if (!week.lessons?.length) return 0;
    return Math.round((week.lessons.filter((l) => completedLessons.includes(l.id)).length / week.lessons.length) * 100);
  }, [completedLessons]);

  const handleBackToPhases = () => {
    const slug = course?.slug || 'fullstack-web-engineering-masterclass';
    router.push(`/courses/${slug}`);
  };

  const handleSelectLesson = useCallback((lesson) => {
    setActiveLesson(lesson);
    setActiveVideoId(lesson.mainVideo?.youtubeId || lesson.sessionVideos?.[0]?.youtubeId || null);
  }, []);

  const handleSelectSession = useCallback((youtubeId) => setActiveVideoId(youtubeId), []);

  const handleCloseVideo = useCallback(() => {
    setActiveLesson(null);
    setActiveVideoId(null);
  }, []);

  const toggleWeek = useCallback((weekId) => {
    setCollapsedWeeks((prev) => ({ ...prev, [weekId]: !prev[weekId] }));
  }, []);

  const toggleSection = useCallback((lessonId, section) => {
    const key = `${lessonId}:${section}`;
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const lessonHasContent = useCallback((lesson) => {
    return Boolean(
      lesson.mainVideo ||
      lesson.sessionVideos?.length ||
      lesson.notes ||
      lesson.resources?.length
    );
  }, []);

  const handleToggleComplete = useCallback(async (lessonId) => {
    await toggleLesson(lessonId);
  }, [toggleLesson]);

  if (courseLoading) {
    return (
      <>
        <SEOHead title={p.title || 'Classroom Portal'} />
        <PageLayout>
          <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col gap-6">
            <SkeletonStatsGrid count={3} showTrend />
            <SkeletonCard showIcon bodyLines={4} />
          </div>
        </PageLayout>
      </>
    );
  }

  /* ── Welcome dashboard (no phase) ── */
  if (!activePhase) {
    const firstName = (user?.full_name || user?.fullName || '').split(' ')[0] || 'Learner';

    return (
      <>
        <SEOHead title={p.title || 'Classroom Portal'} />
        <PageLayout>
          <div className="max-w-5xl mx-auto px-4 py-12 flex flex-col gap-8">
            <GlassCard noPadding className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-2xs font-bold uppercase tracking-wider">
                      <Sparkles size={11} />
                      {p.welcomeBack || 'Welcome back'}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-text-main leading-tight">
                      {interpolate(p.welcomeGreeting || 'Hi {name}, ready to continue?', { name: firstName })}
                    </h1>
                    <p className="text-sm text-text-muted max-w-xl">
                      {interpolate(
                        p.welcomeSubtitle ||
                          "You're enrolled in the {course}. Pick up where you left off, or explore all phases below.",
                        { course: course?.title || 'Fullstack Web Engineering Masterclass' }
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const firstPhase = phases[0];
                      if (firstPhase) setActivePhase(firstPhase);
                    }}
                    disabled={phases.length === 0}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-accent text-text-inverse text-sm font-bold hover:bg-accent-light transition-all duration-300 shadow-glow-gold hover:shadow-glow-gold-lg hover:-translate-y-0.5 disabled:opacity-50 shrink-0"
                  >
                    <PlayCircle size={16} />
                    {p.resumeLearning || 'Resume Learning'}
                    <ArrowRight size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <StatCard
                    icon={Target}
                    label={p.lessonsDone || 'Lessons Done'}
                    value={`${completedCount} / ${allLessonIds.length}`}
                    tone="accent"
                  />
                  <StatCard
                    icon={Trophy}
                    label={p.overallProgress || 'Overall Progress'}
                    value={`${progressPercentage}%`}
                    tone={progressPercentage === 100 ? 'success' : 'default'}
                  />
                  <StatCard
                    icon={GraduationCap}
                    label={p.enrollment || 'Enrollment'}
                    value={isFullCourse ? (p.enrollmentFullCourse || 'Full Course') : (p.enrollmentIndividual || 'Individual Phases')}
                    subtext={isFullCourse ? (p.enrollmentFullSubtext || 'All 5 phases unlocked') : (p.enrollmentIndividualSubtext || 'Selected phases only')}
                    tone="default"
                  />
                </div>

                <AnimatedProgress percent={progressPercentage} showLabel size="md" />
              </div>
            </GlassCard>

            <ScholarshipBanner />

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-text-main flex items-center gap-2">
                  <BookOpen size={18} className="text-accent" />
                  {isFullCourse ? (p.allPhasesTitle || 'All Phases') : (p.yourPhasesTitle || 'Your Phases')}
                </h2>
                <button
                  type="button"
                  onClick={handleBackToPhases}
                  className="text-xs font-semibold text-text-muted hover:text-accent transition-colors inline-flex items-center gap-1"
                >
                  {p.viewInCatalog || 'View in course catalog'}
                  <ChevronRight size={12} />
                </button>
              </div>

              {phases.length === 0 ? (
                <div className="p-8 rounded-2xl bg-bg-card-solid border border-border-light text-center text-sm text-text-muted">
                  {p.noPhasesAvailable || 'No phases available yet. Please check back soon.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {phases.map((phase) => {
                    const phaseNumber = phase.number ?? phase.phase_number;
                    const phaseAccessible = isFullCourse || checkPhaseAccess(phase.id);
                    const phaseProgress = getPhaseProgress(phase);
                    const totalLessons = phase.weeks?.reduce((acc, w) => acc + (w.lessons?.length || 0), 0) || 0;
                    const PhaseIcon = PHASE_ICON_MAP[phase.icon] || GraduationCap;

                    return (
                      <button
                        key={phase.id || `phase-${phaseNumber}`}
                        type="button"
                        onClick={() => phaseAccessible && setActivePhase(phase)}
                        disabled={!phaseAccessible}
                        className={`text-left p-5 rounded-2xl border transition-all duration-300 group ${
                          phaseAccessible
                            ? 'bg-bg-card-solid border-border-light hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-glow-gold cursor-pointer'
                            : 'bg-bg-card-solid border-border-light/60 opacity-70 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                              phaseAccessible
                                ? 'bg-accent/10 border border-accent/30 text-accent'
                                : 'bg-bg-pill border border-border-light text-text-dim'
                            }`}>
                              {phaseAccessible ? <PhaseIcon size={18} /> : <Lock size={18} />}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-2xs font-bold uppercase tracking-wider text-text-dim">
                                {interpolate(p.phaseLabel || 'Phase {number}', { number: phaseNumber })}
                                {phase.duration && ` · ${phase.duration}`}
                              </span>
                              <span className="text-sm font-extrabold text-text-main leading-tight line-clamp-1">
                                {phase.title}
                              </span>
                            </div>
                          </div>
                          <ProgressRing progress={phaseProgress} size={36} strokeWidth={2.5} />
                        </div>

                        <div className="flex items-center gap-3 text-2xs text-text-muted mb-3">
                          <span className="inline-flex items-center gap-1">
                            <BookOpen size={10} />
                            {interpolate(p.lessonsCount || '{count} lessons', { count: totalLessons })}
                          </span>
                        </div>

                        <div className={`inline-flex items-center gap-1 text-xs font-bold transition-colors ${
                          phaseAccessible ? 'text-accent group-hover:text-accent-light' : 'text-text-dim'
                        }`}>
                          {phaseAccessible ? (
                            <>
                              {phaseProgress > 0
                                ? (p.continueButton || 'Continue')
                                : (p.startButton || 'Start')}
                              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                            </>
                          ) : (
                            <>
                              <Lock size={11} />
                              {p.lockedButton || 'Locked'}
                            </>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </PageLayout>
      </>
    );
  }

  /*
   * ACTIVE PHASE
   *
   * Responsive layout:
   *   - Desktop (lg+): grid with video RIGHT, accordion LEFT.
   *     Video is sticky at top-[88px].
   *   - Mobile (<lg): video column is `hidden` when no lesson.
   *     Once a lesson is opened, it becomes `sticky top-[72px]` (below nav)
   *     so users can watch while scrolling through the accordion.
   */
  return (
    <>
      <SEOHead title={p.title || 'Classroom Portal'} />
      <PageLayout>
        <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-6 py-6">

          {/* Top bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-3 rounded-xl bg-bg-card-solid border border-border-light">
            <nav className="flex items-center gap-1.5 text-xs">
              <a href="/" className="flex items-center gap-1 text-text-muted hover:text-accent transition-colors">
                <Home size={14} /> {p.home || 'Home'}
              </a>
              <ChevronRight size={14} className="text-text-dim" />
              <span className="text-text-main font-semibold">
                {course?.title || 'Fullstack Masterclass'}
              </span>
              <ChevronRight size={14} className="text-text-dim" />
              <span className="text-text-main font-semibold">
                {interpolate(p.phaseLabel || 'Phase {number}', {
                  number: activePhase.number ?? activePhase.phase_number,
                })}
              </span>
            </nav>
            <div className="flex items-center gap-3">
              <span className="text-2xs text-text-dim whitespace-nowrap">
                {completedCount}/{allLessonIds.length} · {progressPercentage}%
              </span>
              <div className="w-32 h-2 rounded-full bg-bg-pill border border-border-light overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent to-accent-light transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActivePhase(null)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-accent/30 bg-bg-pill text-accent text-xs font-semibold hover:bg-accent/10 transition-colors mb-4"
          >
            <ChevronRight size={14} className="rotate-180" />
            {p.allPhases || 'All Phases'}
          </button>

          {/* Two-column grid (desktop) / single column (mobile) */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-5 items-start">

              {/* ─── VIDEO COLUMN ───
                  Desktop: always rendered, sticky on the RIGHT (order-2).
                  Mobile: hidden unless a lesson is open. Once open, becomes
                          a FIXED panel pinned below the navbar so it stays
                          visible while the accordion scrolls underneath.
              */}
                <div
                  className={`
                    lg:order-2 lg:sticky lg:top-[88px] lg:self-start
                    order-1
                    ${
                      activeLesson
                        ? 'fixed left-0 right-0 z-40 lg:static lg:left-auto lg:right-auto'
                        : 'hidden lg:block'
                    }
                  `}
                  style={
                    activeLesson
                      ? {
                          top: 'var(--portal-video-top, 140px)',
                        }
                      : undefined
                  }
                >
              {activeLesson ? (
                <div className="rounded-xl overflow-hidden border border-accent/30 bg-bg-card-solid shadow-lg">
                  <div className="flex items-start justify-between gap-3 px-3 lg:px-4 py-2 lg:py-3 border-b border-border-medium">
                    <div className="min-w-0 flex-1">
                      <span className="text-2xs font-bold uppercase tracking-wider text-accent inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        {p.nowPlaying || 'Now Playing'}
                      </span>
                      <h2 className="text-xs lg:text-sm font-bold text-text-main truncate mt-0.5">
                        {activeLesson.title}
                      </h2>
                    </div>
                    <div className="flex items-center gap-1.5 lg:gap-2 shrink-0">
                      <div className="hidden lg:block">
                        <CompleteButton
                          isCompleted={completedLessons.includes(activeLesson.id)}
                          onToggle={() => handleToggleComplete(activeLesson.id)}
                          loading={progressLoading}
                        />
                      </div>
                      <button
                        type="button"
                        className="flex items-center justify-center w-7 h-7 lg:w-8 lg:h-8 rounded-md bg-error/10 border border-error/20 text-error hover:bg-error/20 transition-colors"
                        onClick={handleCloseVideo}
                        aria-label={p.closeVideo || 'Close video'}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="aspect-video bg-black">
                    <VideoPlayer lesson={activeLesson} activeVideoId={activeVideoId} />
                  </div>
                </div>
              ) : (
                <div className="hidden lg:flex flex-col items-center justify-center p-6 rounded-xl border border-border-medium bg-bg-card-solid min-h-[300px]">
                  <Video size={48} className="text-text-dim mb-4" />
                  <p className="text-sm text-text-dim text-center">
                    {p.selectClassPrompt || 'Select a class from the left to start watching.'}
                  </p>
                </div>
              )}
            </div>

            {/* ─── ACCORDION COLUMN ───
                Desktop: LEFT side (order-1)
                Mobile: below the sticky video (order-2)
            */}
            <div className="order-2 lg:order-1 flex flex-col gap-3 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto lg:pr-2 lg:custom-scrollbar">

              {/* Phase info card */}
              <div className="p-4 rounded-xl border border-accent/20 bg-bg-card-solid">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="inline-block px-2 py-0.5 mb-1 rounded bg-accent/10 text-accent text-2xs font-bold uppercase tracking-wider border border-accent/20">
                      {interpolate(p.phaseWithDuration || 'Phase {number} · {duration}', {
                        number: activePhase.number ?? activePhase.phase_number,
                        duration: activePhase.duration || '',
                      }).replace(/ · $/, '')}
                    </span>
                    <h2 className="text-base font-bold text-text-main">{activePhase.title}</h2>
                    {activePhase.subtitle && (
                      <p className="text-xs text-text-muted italic mt-1">{activePhase.subtitle}</p>
                    )}
                  </div>
                  <ProgressRing progress={getPhaseProgress(activePhase)} size={44} strokeWidth={3} />
                </div>
                {activePhase.description && (
                  <p className="text-xs text-text-muted leading-relaxed mb-2">
                    {activePhase.description}
                  </p>
                )}
                {activePhase.outcomes?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {activePhase.outcomes.map((o, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-success/10 border border-success/20 text-success text-2xs"
                      >
                        <CheckCircle size={10} /> {o}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Weeks */}
              <div className="flex flex-col gap-3">
                {activePhase.weeks?.map((week) => {
                  const weekId = week.id || `w-${week.number}`;
                  const wp = getWeekProgress(week);
                  const isCollapsed = collapsedWeeks[weekId] === true;
                  const weekAccessible = isFullCourse || checkWeekAccess(week.number);
                  const totalLessons = week.lessons?.length || 0;

                  return (
                    <div
                      key={weekId}
                      className="rounded-xl border border-border-medium bg-bg-card-solid overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => toggleWeek(weekId)}
                        className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-bg-card-hover transition-all duration-200 text-left border-b border-border-medium group"
                        aria-expanded={!isCollapsed}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="text-accent shrink-0 transition-transform duration-200 group-hover:scale-110">
                            {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                          </span>
                          <span className="text-sm font-bold text-accent whitespace-nowrap">
                            {interpolate(p.weekLabel || 'Week {number}', {
                              number: week.number || week.week_number,
                            })}
                          </span>
                          <span className="text-sm font-bold text-text-main truncate">
                            {week.title}
                          </span>
                          {!weekAccessible && (
                            <Lock size={14} className="text-text-dim shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0 text-2xs text-text-dim">
                          <Clock size={12} />
                          <span>
                            {totalLessons === 1
                              ? interpolate(p.classCountSingular || '{count} class', { count: totalLessons })
                              : interpolate(p.classesCount || '{count} classes', { count: totalLessons })}
                          </span>
                          {wp === 100 && <CheckCircle size={16} className="text-success" />}
                          {wp > 0 && wp < 100 && (
                            <span className="text-accent font-bold">{wp}%</span>
                          )}
                        </div>
                      </button>

                      {!isCollapsed && (
                        <div className="p-3 flex flex-col gap-2">
                          {totalLessons === 0 ? (
                            <p className="px-2 py-3 text-xs text-text-dim italic text-center">
                              {p.noClassesInWeek || 'No classes in this week yet.'}
                            </p>
                          ) : (
                            week.lessons.map((lesson) => {
                              const isActive = activeLesson?.id === lesson.id;
                              const isDone = completedLessons.includes(lesson.id);
                              const isFreePreview = lesson.isFreePreview === true;
                              const lessonAccessible = checkLessonAccess(lesson.id, isFreePreview);
                              const hasContent = lessonHasContent(lesson);
                              const videosKey = `${lesson.id}:videos`;
                              const notesKey = `${lesson.id}:notes`;
                              const resourcesKey = `${lesson.id}:resources`;
                              const videosExpanded = expandedSections[videosKey] !== false;
                              const notesExpanded = expandedSections[notesKey] === true;
                              const resourcesExpanded = expandedSections[resourcesKey] === true;

                              return (
                                <div
                                  key={lesson.id}
                                  className={`rounded-lg border bg-bg-card-solid overflow-hidden ${
                                    isActive ? 'border-accent/30' : 'border-border-light'
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleSelectLesson(lesson);
                                      if (hasContent) toggleSection(lesson.id, 'videos');
                                    }}
                                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-bg-card-hover transition-colors text-left ${
                                      !lessonAccessible ? 'opacity-70' : ''
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                      {isDone ? (
                                        <CheckCircle size={16} className="text-success shrink-0" />
                                      ) : !lessonAccessible ? (
                                        <Lock size={16} className="text-text-dim shrink-0" />
                                      ) : (
                                        <BookOpen
                                          size={16}
                                          className={`shrink-0 ${isActive ? 'text-accent' : 'text-text-muted'}`}
                                        />
                                      )}
                                      <span className={`text-sm font-semibold truncate ${
                                        isActive ? 'text-accent' : 'text-text-main'
                                      }`}>
                                        {lesson.title}
                                      </span>
                                      {isFreePreview && (
                                        <span className="text-2xs px-2 py-0.5 rounded-md bg-success/10 text-success border border-success/20 font-bold shrink-0">
                                          {p.freePreviewBadge || 'Free Preview'}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 text-2xs text-text-dim">
                                      {lesson.duration && (
                                        <span className="font-mono">{lesson.duration}</span>
                                      )}
                                      {hasContent && (
                                        <span className={videosExpanded ? 'text-accent' : ''}>
                                          {videosExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                        </span>
                                      )}
                                    </div>
                                  </button>

                                  {videosExpanded && (lesson.mainVideo || lesson.sessionVideos?.length > 0) && (
                                    <div className="px-3 pb-3 pt-1 flex flex-col gap-2">
                                      {lesson.mainVideo?.youtubeId && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleSelectLesson(lesson);
                                            handleSelectSession(lesson.mainVideo.youtubeId);
                                          }}
                                          className="relative flex items-center gap-3 w-full px-3 py-2.5 rounded-lg border transition-colors duration-150 text-left hover:border-error/30"
                                          style={
                                            isActive && activeVideoId === lesson.mainVideo.youtubeId
                                              ? STYLE.liveActive
                                              : STYLE.liveInactive
                                          }
                                        >
                                          <Radio size={16} className="text-error shrink-0" />
                                          <div className="flex flex-col min-w-0 flex-1">
                                            <span className="text-2xs font-bold uppercase tracking-wider text-error">
                                              {p.liveSession || 'Live Session'}
                                            </span>
                                            <span className="text-sm font-semibold text-text-main truncate">
                                              {lesson.mainVideo.title}
                                            </span>
                                          </div>
                                          <span className="text-2xs px-2 py-0.5 rounded bg-error text-white font-bold uppercase tracking-wider shrink-0">
                                            Live
                                          </span>
                                        </button>
                                      )}

                                      {lesson.sessionVideos?.length > 0 && (
                                        <div className="flex flex-col">
                                          <div className="flex items-center gap-2 px-1 py-1.5 text-2xs font-bold uppercase tracking-wider text-text-dim">
                                            <ListVideo size={12} />
                                            {p.sessionBySession || 'Session by Session'}
                                          </div>
                                          <div className="flex flex-col gap-0.5">
                                            {lesson.sessionVideos.map((sv, i) => {
                                              const isSessionActive = isActive && activeVideoId === sv.youtubeId;
                                              return (
                                                <button
                                                  key={`${lesson.id}-s-${i}`}
                                                  type="button"
                                                  onClick={() => {
                                                    handleSelectLesson(lesson);
                                                    handleSelectSession(sv.youtubeId);
                                                  }}
                                                  className={`flex items-center gap-3 w-full px-2 py-2 rounded-md border transition-colors duration-150 text-left ${
                                                    isSessionActive
                                                      ? 'text-text-main'
                                                      : 'text-text-muted hover:text-text-main'
                                                  }`}
                                                  style={
                                                    isSessionActive
                                                      ? STYLE.sessionActive
                                                      : STYLE.sessionInactive
                                                  }
                                                >
                                                  <span className={`w-5 text-center font-bold text-xs shrink-0 ${
                                                    isSessionActive ? 'text-accent' : 'text-accent/80'
                                                  }`}>
                                                    {i + 1}
                                                  </span>
                                                  <span className="flex-1 text-xs truncate">
                                                    {sv.title}
                                                  </span>
                                                  <span className="text-2xs text-text-dim font-mono shrink-0">
                                                    {sv.time}
                                                  </span>
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {lesson.notes && (
                                    <div className="border-t border-border-light">
                                      <button
                                        type="button"
                                        onClick={() => toggleSection(lesson.id, 'notes')}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-2xs font-bold uppercase tracking-wider text-text-dim hover:text-accent transition-colors text-left"
                                      >
                                        <FileText size={12} />
                                        <span>{p.classNotes || 'Class Notes'}</span>
                                        {notesExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                      </button>
                                      {notesExpanded && (
                                        <div className="px-3 pb-3">
                                          <div className="px-3 py-2 rounded-md bg-bg-pill border border-border-light text-xs text-text-muted leading-relaxed">
                                            {lesson.notes}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {lesson.resources?.length > 0 && (
                                    <div className="border-t border-border-light">
                                      <button
                                        type="button"
                                        onClick={() => toggleSection(lesson.id, 'resources')}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-2xs font-bold uppercase tracking-wider text-text-dim hover:text-accent transition-colors text-left"
                                      >
                                        <Download size={12} />
                                        <span>
                                          {interpolate(p.resourcesCount || 'Resources ({count})', {
                                            count: lesson.resources.length,
                                          })}
                                        </span>
                                        {resourcesExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                      </button>
                                      {resourcesExpanded && (
                                        <div className="px-3 pb-3 flex flex-col gap-1.5">
                                          {lesson.resources.map((r, i) => (
                                            <div
                                              key={`${lesson.id}-res-${i}`}
                                              className="flex items-center gap-2 px-3 py-2 rounded-md bg-bg-pill border border-border-light text-xs"
                                            >
                                              <FileText size={12} className="text-text-dim shrink-0" />
                                              <span className="flex-1 text-text-main truncate">{r.name}</span>
                                              <span className="text-2xs px-1.5 py-0.5 rounded bg-accent/10 text-accent font-bold uppercase tracking-wider shrink-0">
                                                {r.type}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  );
};

export default PortalPage;