/**
 * @fileoverview Learning Portal Page - Phase 1 Redesign
 * Features sticky video player, Up Next queue, and session chapter switching
 * Path: apps/web/pages/portal/index.jsx
 */
import React, { useState, useMemo } from 'react';
import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import VideoPlayer from '../../components/portal/VideoPlayer';
import CompleteButton from '../../components/portal/CompleteButton';
import PortalNavigationSidebar from '../../components/portal/PortalNavigationSidebar';
import WeekAccordion from '../../components/portal/WeekAccordion';
import UpNextCard from '../../components/portal/UpNextCard';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import useProgress from '../../hooks/useProgress';
import usePortalCourse from '../../hooks/usePortalCourse';
import { Video, X } from 'lucide-react';

const PortalPage = () => {
  const { t, language } = useLanguage();
  const { isEnrolled } = useAuth();
  const { phases, loading: courseLoading } = usePortalCourse('fullstack-web-engineering-masterclass');
  const { completedLessons, toggleLesson, calculateProgress, loading: progressLoading } = useProgress();

  const [activeLesson, setActiveLesson] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [expandedClassSections, setExpandedClassSections] = useState({});
  const [checklistItems, setChecklistItems] = useState({});

  // Flatten all lessons for sequential navigation
  const allLessons = useMemo(() => {
    const lessons = [];
    phases.forEach((phase) => {
      phase.weeks?.forEach((week) => {
        week.lessons?.forEach((lesson) => {
          lessons.push(lesson);
        });
      });
    });
    return lessons;
  }, [phases]);

  const allLessonIds = useMemo(() => allLessons.map((l) => l.id), [allLessons]);
  const progressPercentage = calculateProgress(allLessonIds);

  // Find the next lesson in the sequence
  const nextLesson = useMemo(() => {
    if (!activeLesson) return null;
    const currentIndex = allLessons.findIndex((l) => l.id === activeLesson.id);
    if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
      return allLessons[currentIndex + 1];
    }
    return null;
  }, [activeLesson, allLessons]);

  const handleSelectLesson = (lesson) => {
    setActiveLesson(lesson);
    setActiveVideoId(lesson.mainVideo?.youtubeId);
    setShowVideo(true);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectSession = (youtubeId) => {
    setActiveVideoId(youtubeId);
  };

  const handleCloseVideo = () => {
    setShowVideo(false);
    setActiveLesson(null);
    setActiveVideoId(null);
  };

  const handleToggleComplete = async (lessonId) => {
    await toggleLesson(lessonId);
  };

  const toggleWeek = (weekId) => {
    setExpandedWeeks((prev) => ({ ...prev, [weekId]: !prev[weekId] }));
  };

  const toggleClassSection = (sectionKey) => {
    setExpandedClassSections((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  const toggleChecklist = (itemKey) => {
    setChecklistItems((prev) => ({ ...prev, [itemKey]: !prev[itemKey] }));
  };

  if (courseLoading) {
    return (
      <PageLayout>
        <div className="portal-page-redesigned">
          <div className="spinner" style={{ marginTop: '3rem' }}>
            <div className="spinner-circle" />
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <>
      <SEOHead title={t.portal?.title || 'Classroom Portal'} />
      <PageLayout>
        <div className="portal-page-redesigned">
          {/* Portal Header */}
          <header className="portal-header-redesigned">
            <div className="portal-header-info">
              <div className="portal-header-icon"><Video /></div>
              <div>
                <h1 className="portal-header-title">{t.portal?.title || 'Abyssinia Student Classroom'}</h1>
                <p className="portal-header-subtitle">{t.portal?.subtitle || 'Select a class to start learning'}</p>
              </div>
            </div>
            <div className="progress-bar-wrapper">
              <div className="progress-bar-text">
                <p className="progress-bar-label">{t.portal?.progressLabel || 'Your Progress'}</p>
                <p className="progress-bar-percent">{progressPercentage}% Complete</p>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }} />
              </div>
            </div>
          </header>

          <div className="portal-grid-redesigned">
            {/* Left Sidebar */}
            <aside className="portal-navigation-sidebar">
              <PortalNavigationSidebar
                phases={phases}
                selectedWeek={selectedWeek}
                onSelectWeek={setSelectedWeek}
                activeLesson={activeLesson}
                onSelectLesson={handleSelectLesson}
                completedLessons={completedLessons}
              />
            </aside>

            {/* Main Content Area */}
            <main className="portal-main-content">
              {/* Sticky Video Player Section */}
              {showVideo && activeLesson && (
                <div className="sticky-video-wrapper">
                  <div className="video-player-container">
                    <div className="video-player-topbar">
                      <div className="video-player-lesson-info">
                        <span className="video-player-lesson-label">{t.portal?.currentlyPlaying || 'Now Playing'}</span>
                        <h2 className="video-player-lesson-title">
                          {language === 'am' && activeLesson.title_am ? activeLesson.title_am : activeLesson.title}
                        </h2>
                      </div>
                      <div className="video-player-actions">
                        <CompleteButton
                          isCompleted={completedLessons.includes(activeLesson.id)}
                          onToggle={() => handleToggleComplete(activeLesson.id)}
                          loading={progressLoading}
                        />
                        <button className="video-player-close-btn" onClick={handleCloseVideo} aria-label="Close video">
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                    <VideoPlayer lesson={activeLesson} activeVideoId={activeVideoId} isEnrolled={isEnrolled} />
                  </div>
                  {/* Up Next Smart Queue */}
                  <UpNextCard nextLesson={nextLesson} onSelectLesson={handleSelectLesson} />
                </div>
              )}

              {/* Week Accordions */}
              <div className="weeks-accordion-container">
                {phases.map((phase) => (
                  <div key={phase.id || `phase-${phase.number}`} className="phase-section">
                    <h3 className="phase-title">Phase {phase.number}: {phase.title}</h3>
                    {phase.weeks && phase.weeks.map((week) => (
                      <WeekAccordion
                        key={week.id || `week-${week.number}`}
                        week={week}
                        isExpanded={expandedWeeks[week.id || `week-${week.number}`]}
                        onToggle={() => toggleWeek(week.id || `week-${week.number}`)}
                        activeLesson={activeLesson}
                        onSelectLesson={handleSelectLesson}
                        completedLessons={completedLessons}
                        isEnrolled={isEnrolled}
                        expandedClassSections={expandedClassSections}
                        onToggleClassSection={toggleClassSection}
                        checklistItems={checklistItems}
                        onToggleChecklist={toggleChecklist}
                        activeVideoId={activeVideoId}
                        onSelectSession={handleSelectSession}
                      />
                    ))}
                  </div>
                ))}
                {phases.length === 0 && (
                  <div className="empty-state">
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>No curriculum data available.</p>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </PageLayout>
    </>
  );
};

export default PortalPage;