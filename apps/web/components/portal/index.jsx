/**
 * @fileoverview Learning Portal Page
 * Main student classroom with video player and curriculum sidebar
 * Path: apps/web/pages/portal/index.jsx
 */

import { useState, useMemo, useCallback } from 'react';
import SEOHead from '../../components/shared/SEOHead';
import FloatingGlow from '../../components/shared/FloatingGlow';
import Navigation from '../../components/shared/Navigation';
import Footer from '../../components/shared/Footer';
import PortalHeader from '../../components/portal/PortalHeader';
import VideoPlayer from '../../components/portal/VideoPlayer';
import SessionList from '../../components/portal/SessionList';
import ResourceDownload from '../../components/portal/ResourceDownload';
import LessonNotes from '../../components/portal/LessonNotes';
import CurriculumSidebar from '../../components/portal/CurriculumSidebar';
import CompleteButton from '../../components/portal/CompleteButton';
import Tabs from '../../components/shared/Tabs';
import Spinner from '../../components/shared/Spinner';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useCourseBySlug } from '../../hooks/useCourses';
import useProgress from '../../hooks/useProgress';

/**
 * PortalPage - Main student learning portal
 * Displays video player, curriculum, and lesson details
 */
const PortalPage = () => {
  const { t } = useLanguage();
  const { isEnrolled } = useAuth();
  const { completedLessons, toggleLesson, isLessonCompleted, calculateProgress, loading: progressLoading } = useProgress();

  const [activeTab, setActiveTab] = useState('sessions');
  const [activeLesson, setActiveLesson] = useState(null);
  const [toggleLoading, setToggleLoading] = useState(false);

  const { course, loading: courseLoading } = useCourseBySlug('fullstack-web-engineering-masterclass');

  const phases = course?.phases || [];

  /**
   * Collect all lesson IDs for progress calculation
   */
  const allLessonIds = useMemo(() => {
    const ids = [];
    phases.forEach((phase) => {
      phase.weeks?.forEach((week) => {
        week.lessons?.forEach((lesson) => {
          ids.push(lesson.id);
        });
      });
    });
    return ids;
  }, [phases]);

  const progressPercentage = useMemo(() => {
    return calculateProgress(allLessonIds);
  }, [calculateProgress, allLessonIds]);

  /**
   * Set initial lesson when curriculum loads
   */
  useMemo(() => {
    if (!activeLesson && phases.length > 0) {
      const firstPhase = phases[0];
      const firstWeek = firstPhase.weeks?.[0];
      const firstLesson = firstWeek?.lessons?.[0];
      if (firstLesson) {
        setActiveLesson(firstLesson);
      }
    }
  }, [phases, activeLesson]);

  /**
   * Handle lesson selection from sidebar
   * @param {object} lesson - Selected lesson object
   */
  const handleSelectLesson = useCallback((lesson) => {
    setActiveLesson(lesson);
    setActiveTab('sessions');
  }, []);

  /**
   * Handle lesson completion toggle
   */
  const handleToggleComplete = useCallback(async () => {
    if (!activeLesson) return;
    setToggleLoading(true);
    await toggleLesson(activeLesson.id);
    setToggleLoading(false);
  }, [activeLesson, toggleLesson]);

  const isCompleted = activeLesson ? isLessonCompleted(activeLesson.id) : false;

  const tabs = [
    { id: 'sessions', label: t.portal?.sessionBreakdown || 'Session Breakdown' },
    {
      id: 'resources',
      label: `${t.portal?.codeResources || 'Code & Assets'} (${activeLesson?.resources?.length || 0})`,
      count: activeLesson?.resources?.length || 0,
    },
    { id: 'notes', label: t.portal?.instructorNotes || 'Instructor Notes' },
  ];

  return (
    <>
      <SEOHead title={t.portal?.title || 'Classroom Portal'} />

      <div className="min-h-screen font-sans transition-colors duration-300 flex flex-col relative overflow-x-hidden bg-[#070b14] text-slate-100">
        <FloatingGlow />
        <Navigation />

        <main className="flex-1 relative z-10 py-6 px-4">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Portal Header with Progress */}
            <PortalHeader progressPercentage={progressPercentage} />

            {/* Loading State */}
            {courseLoading && (
              <div className="flex justify-center py-20">
                <Spinner size="lg" />
              </div>
            )}

            {/* Main Portal Grid */}
            {!courseLoading && (
              <div className="grid lg:grid-cols-12 gap-6">
                {/* Left Column: Video Player + Lesson Details */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Video Player */}
                  <VideoPlayer lesson={activeLesson} isEnrolled={isEnrolled} />

                  {/* Lesson Details */}
                  {activeLesson && (
                    <div className="glass-card p-6 rounded-2xl space-y-4 border-amber-500/20">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
                            {t.portal?.currentlyPlaying || 'Currently Playing'}
                          </span>
                          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                            {activeLesson.title}
                          </h2>
                        </div>

                        <CompleteButton
                          isCompleted={isCompleted}
                          onToggle={handleToggleComplete}
                          loading={toggleLoading}
                        />
                      </div>

                      {/* Tabs */}
                      <div className="border-t border-slate-700/30 pt-4">
                        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

                        <div className="mt-4">
                          {activeTab === 'sessions' && (
                            <SessionList sessions={activeLesson.sessions || []} />
                          )}
                          {activeTab === 'resources' && (
                            <ResourceDownload resources={activeLesson.resources || []} />
                          )}
                          {activeTab === 'notes' && (
                            <LessonNotes notes={activeLesson.notes || ''} />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Curriculum Sidebar */}
                <div className="lg:col-span-4">
                  <CurriculumSidebar
                    phases={phases}
                    activeLesson={activeLesson}
                    onSelectLesson={handleSelectLesson}
                    completedLessons={completedLessons}
                    isEnrolled={isEnrolled}
                  />
                </div>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PortalPage;