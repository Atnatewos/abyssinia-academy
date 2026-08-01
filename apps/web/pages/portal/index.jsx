/**
 * @fileoverview Learning Portal - Senior LMS Architecture
 * 
 * FEATURES:
 * - Auto-detect weeks per phase (just create week-XX.js with phaseNumber)
 * - Sticky video player (doesn't scroll with content)
 * - Accordion state persisted in localStorage (remembers open/closed)
 * - Session highlighting scoped to active lesson only
 *
 * Path: apps/web/pages/portal/index.jsx
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import VideoPlayer from '../../components/portal/VideoPlayer';
import CompleteButton from '../../components/portal/CompleteButton';
import ProgressRing from '../../components/portal/ProgressRing';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import useProgress from '../../hooks/useProgress';
import usePortalCourse from '../../hooks/usePortalCourse';
import {
  Video, X, ChevronRight, CheckCircle, Lock, PlayCircle,
  Home, Clock, ChevronDown, Radio, ListVideo, BookOpen,
} from 'lucide-react';

const STORAGE_KEY_WEEKS = 'abyssinia_collapsed_weeks';
const STORAGE_KEY_CLASSES = 'abyssinia_expanded_classes';

const PortalPage = () => {
  const { t } = useLanguage();
  const { isEnrolled } = useAuth();
  const { phases, loading: courseLoading } = usePortalCourse('fullstack-web-engineering-masterclass');
  const { completedLessons, toggleLesson, calculateProgress, loading: progressLoading } = useProgress();

  const [activePhase, setActivePhase] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeVideoId, setActiveVideoId] = useState(null);

  /**
   * Accordion state - persisted to localStorage.
   * On first visit, all weeks and classes start open.
   * User's preferences are remembered across sessions.
   */
  const [collapsedWeeks, setCollapsedWeeks] = useState(() => {
    if (typeof window !== 'undefined') {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY_WEEKS)) || {}; } catch { return {}; }
    }
    return {};
  });

  const [expandedClasses, setExpandedClasses] = useState(() => {
    if (typeof window !== 'undefined') {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY_CLASSES)) || {}; } catch { return {}; }
    }
    return {};
  });

  /** Persist week accordion state to localStorage */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_WEEKS, JSON.stringify(collapsedWeeks));
    }
  }, [collapsedWeeks]);

  /** Persist class accordion state to localStorage */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(expandedClasses));
    }
  }, [expandedClasses]);

  const allLessonIds = useMemo(() => {
    const ids = [];
    phases.forEach((p) => p.weeks?.forEach((w) => w.lessons?.forEach((l) => ids.push(l.id))));
    return ids;
  }, [phases]);

  const progressPercentage = calculateProgress(allLessonIds);
  const completedCount = allLessonIds.filter((id) => completedLessons.includes(id)).length;

  const getPhaseProgress = useCallback((phase) => {
    let total = 0, done = 0;
    phase.weeks?.forEach((w) => w.lessons?.forEach((l) => { total++; if (completedLessons.includes(l.id)) done++; }));
    return total ? Math.round((done / total) * 100) : 0;
  }, [completedLessons]);

  const getWeekProgress = useCallback((week) => {
    if (!week.lessons?.length) return 0;
    return Math.round((week.lessons.filter((l) => completedLessons.includes(l.id)).length / week.lessons.length) * 100);
  }, [completedLessons]);

  const handleSelectPhase = (phase) => {
    if (activePhase?.id === phase.id) { setActivePhase(null); }
    else { setActivePhase(phase); }
    setActiveLesson(null);
    setActiveVideoId(null);
  };

  const handleSelectLesson = useCallback((lesson) => {
    setActiveLesson(lesson);
    setActiveVideoId(lesson.mainVideo?.youtubeId || null);
  }, []);

  const handleSelectSession = useCallback((youtubeId) => setActiveVideoId(youtubeId), []);

  const handleCloseVideo = useCallback(() => { setActiveLesson(null); setActiveVideoId(null); }, []);

  const toggleWeek = useCallback((weekId) => {
    setCollapsedWeeks((prev) => ({ ...prev, [weekId]: !prev[weekId] }));
  }, []);

  const toggleClassVideos = useCallback((lessonId) => {
    setExpandedClasses((prev) => ({ ...prev, [lessonId]: !prev[lessonId] }));
  }, []);

  const handleToggleComplete = useCallback(async (lessonId) => { await toggleLesson(lessonId); }, [toggleLesson]);

  if (courseLoading) {
    return (
      <>
        <SEOHead title="Classroom Portal" />
        <PageLayout>
          <div className="portal-senior"><div className="spinner" style={{ marginTop: '4rem' }}><div className="spinner-circle" /></div></div>
        </PageLayout>
      </>
    );
  }

  return (
    <>
      <SEOHead title={t.portal?.title || 'Classroom Portal'} />
      <PageLayout>
        <div className="portal-senior">

          <header className="senior-topbar">
            <nav className="senior-breadcrumb">
              <a href="/" className="senior-breadcrumb-link"><Home size={14} /> Home</a>
              <ChevronRight size={14} className="senior-breadcrumb-sep" />
              <span className="senior-breadcrumb-current">Fullstack Masterclass</span>
              {activePhase && (<><ChevronRight size={14} className="senior-breadcrumb-sep" /><span className="senior-breadcrumb-current">Phase {activePhase.number}</span></>)}
            </nav>
            <div className="senior-progress">
              <span className="senior-progress-text">{completedCount}/{allLessonIds.length} lessons · {progressPercentage}%</span>
              <div className="senior-progress-track"><div className="senior-progress-fill" style={{ width: `${progressPercentage}%` }} /></div>
            </div>
          </header>

          {!activePhase && (
            <div className="senior-phase-grid">
              <h2 className="senior-section-title">Select a Phase to Begin</h2>
              <div className="senior-phase-cards">
                {phases.map((phase) => {
                  const pp = getPhaseProgress(phase);
                  return (
                    <button key={phase.id || phase.number} className="senior-phase-select-card" onClick={() => handleSelectPhase(phase)}>
                      <div className="senior-phase-select-top"><span className="senior-phase-select-number">Phase {phase.number}</span><ProgressRing progress={pp} size={40} strokeWidth={3} /></div>
                      <h3 className="senior-phase-select-title">{phase.title}</h3>
                      <p className="senior-phase-select-subtitle">{phase.subtitle}</p>
                      <div className="senior-phase-select-footer"><span className="senior-phase-select-duration">{phase.duration}</span><ChevronRight size={16} /></div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activePhase && (
            <div className="senior-phase-view">
              <button className="senior-back-btn" onClick={() => { setActivePhase(null); setActiveLesson(null); }}>← All Phases</button>
              <div className="senior-phase-layout">

                {/* LEFT: Accordion column - scrollable independently */}
                <div className="senior-accordion-column">
                  <div className="senior-phase-info-card">
                    <div className="senior-phase-info-top">
                      <div><span className="senior-phase-badge">Phase {activePhase.number}</span><h2 className="senior-phase-title">{activePhase.title}</h2></div>
                      <ProgressRing progress={getPhaseProgress(activePhase)} size={44} strokeWidth={3} />
                    </div>
                    <p className="senior-phase-desc">{activePhase.description}</p>
                    <div className="senior-phase-outcomes">{activePhase.outcomes?.map((o, i) => (<span key={i} className="senior-outcome-tag"><CheckCircle size={12} /> {o}</span>))}</div>
                  </div>

                  <div className="senior-weeks-list">
                    {activePhase.weeks?.map((week) => {
                      const weekId = week.id || `w-${week.number}`;
                      const wp = getWeekProgress(week);
                      const isCollapsed = collapsedWeeks[weekId] === true;
                      return (
                        <div key={weekId} className="senior-week-card">
                          <button className="senior-week-header" onClick={() => toggleWeek(weekId)}>
                            <div className="senior-week-header-left">
                              {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                              <span className="senior-week-number">Week {week.number || week.week_number}</span>
                              <span className="senior-week-title-text">{week.title}</span>
                            </div>
                            <div className="senior-week-header-right"><Clock size={12} /><span>{week.lessons?.length || 0} classes</span>{wp === 100 ? <CheckCircle size={16} style={{ color: '#10b981' }} /> : wp > 0 ? <span style={{ color: 'var(--accent-gold)', fontWeight: 700, fontSize: '0.75rem' }}>{wp}%</span> : null}</div>
                          </button>
                          {!isCollapsed && (
                            <div className="senior-week-lessons">
                              {week.lessons?.map((lesson) => {
                                const isActive = activeLesson?.id === lesson.id;
                                const isDone = completedLessons.includes(lesson.id);
                                const isLocked = !isEnrolled && !lesson.isFreePreview;
                                const isVideosExpanded = expandedClasses[lesson.id] !== false;
                                return (
                                  <div key={lesson.id} className={`senior-class-group ${isActive ? 'active' : ''}`}>
                                    <button className={`senior-class-title-bar ${isDone ? 'done' : ''}`} onClick={() => { toggleClassVideos(lesson.id); if (!isVideosExpanded) handleSelectLesson(lesson); }}>
                                      <div className="senior-class-title-left">
                                        {isDone ? <CheckCircle size={16} style={{ color: '#10b981' }} /> : isLocked ? <Lock size={16} style={{ color: 'var(--text-dim)' }} /> : <BookOpen size={16} style={{ color: isActive ? 'var(--accent-gold)' : 'var(--text-muted)' }} />}
                                        <span className="senior-lesson-title">{lesson.title}</span>
                                      </div>
                                      <div className="senior-class-title-right"><span className="senior-lesson-duration">{lesson.duration}</span><span className={`senior-class-accordion-arrow ${isVideosExpanded ? 'open' : ''}`}>{isVideosExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span></div>
                                    </button>
                                    {isVideosExpanded && (
                                      <div className="senior-class-videos">
                                        {lesson.mainVideo && (
                                          <button className={`senior-video-link live-session ${isActive && activeVideoId === lesson.mainVideo.youtubeId ? 'active' : ''}`} onClick={() => { handleSelectLesson(lesson); handleSelectSession(lesson.mainVideo.youtubeId); }}>
                                            <Radio size={14} className="senior-video-link-icon" />
                                            <div className="senior-video-link-info"><span className="senior-video-link-label">LIVE SESSION</span><span className="senior-video-link-title">{lesson.mainVideo.title}</span></div>
                                            <span className="senior-video-link-badge">Live</span>
                                          </button>
                                        )}
                                        {lesson.sessionVideos?.length > 0 && (
                                          <div className="senior-session-by-session">
                                            <span className="senior-sessions-section-label"><ListVideo size={12} /> SESSION BY SESSION</span>
                                            {lesson.sessionVideos.map((sv, i) => {
                                              const isSessionActive = isActive && activeVideoId === sv.youtubeId;
                                              return (
                                                <button key={i} className={`senior-session-link ${isSessionActive ? 'active' : ''}`} onClick={() => { handleSelectLesson(lesson); handleSelectSession(sv.youtubeId); }}>
                                                  <span className="senior-session-link-num">{i + 1}</span><span className="senior-session-link-title">{sv.title}</span><span className="senior-session-link-time">{sv.time}</span>
                                                </button>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* RIGHT: Sticky video player - doesn't scroll */}
                <div className="senior-video-column">
                  {activeLesson ? (
                    <div className="senior-video-card">
                      <div className="senior-video-topbar">
                        <div><span className="senior-video-label">NOW PLAYING</span><h2 className="senior-video-title">{activeLesson.title}</h2></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <CompleteButton isCompleted={completedLessons.includes(activeLesson.id)} onToggle={() => handleToggleComplete(activeLesson.id)} loading={progressLoading} />
                          <button className="senior-video-close" onClick={handleCloseVideo}><X size={16} /></button>
                        </div>
                      </div>
                      <VideoPlayer lesson={activeLesson} isEnrolled={isEnrolled} activeVideoId={activeVideoId} />
                    </div>
                  ) : (
                    <div className="senior-video-empty">
                      <Video size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
                      <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Select a class from the left to start watching.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </PageLayout>
    </>
  );
};

export default PortalPage;