/**
 * @fileoverview Learning Portal Page
 * Student classroom with video player and curriculum sidebar
 * Path: apps/web/pages/portal/index.jsx
 */
import { useState } from 'react';
import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import VideoPlayer from '../../components/portal/VideoPlayer';
import SessionList from '../../components/portal/SessionList';
import ResourceDownload from '../../components/portal/ResourceDownload';
import LessonNotes from '../../components/portal/LessonNotes';
import CurriculumSidebar from '../../components/portal/CurriculumSidebar';
import CompleteButton from '../../components/portal/CompleteButton';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import useProgress from '../../hooks/useProgress';
import { Video } from 'lucide-react';

/**
 * PortalPage - Student learning portal matching Gemini foundation
 * Now uses useProgress hook for real database-persisted progress
 */
const PortalPage = () => {
  const { t } = useLanguage();
  const { isEnrolled } = useAuth();
  
  // 🚀 REAL PROGRESS HOOK - Replaces local useState
  const { completedLessons, toggleLesson, calculateProgress, loading: progressLoading } = useProgress();

  const [activeLesson, setActiveLesson] = useState(null);
  const [activeTab, setActiveTab] = useState('sessions');

  /**
   * Handle lesson completion toggle via API
   */
  const handleToggleComplete = async (lessonId) => {
    await toggleLesson(lessonId);
  };

  // Note: To calculate real progress, we need all lesson IDs for the current course.
  // For now, we'll show 0% or calculate based on a known total if available.
  // In a full implementation, you'd fetch the course curriculum and pass all IDs to calculateProgress().
  const progressPercentage = 0; // Placeholder until course data is fully wired

  return (
    <>
      <SEOHead title={t.portal?.title || 'Classroom Portal'} />
      <PageLayout>
        <div className="portal-page">
          {/* Portal Header */}
          <div className="portal-header">
            <div className="portal-header-info">
              <div className="portal-header-icon">
                <Video />
              </div>
              <div>
                <h1 className="portal-header-title">
                  {t.portal?.title || 'Abyssinia Student Classroom'}
                </h1>
                <p className="portal-header-subtitle">
                  {t.portal?.subtitle || 'Pre-recorded Live Sessions & Timestamped Video Player'}
                </p>
              </div>
            </div>
            <div className="progress-bar-wrapper">
              <div className="progress-bar-text">
                <p className="progress-bar-label">{t.portal?.progressLabel || 'Your Learning Progress'}</p>
                <p className="progress-bar-percent">{progressPercentage}% Complete</p>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }} />
              </div>
            </div>
          </div>

          {/* Portal Grid */}
          <div className="portal-grid" style={{ marginTop: '1.5rem' }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <VideoPlayer lesson={activeLesson} isEnrolled={isEnrolled} />
              {activeLesson && (
                <div className="lesson-details">
                  <div className="lesson-details-header">
                    <div>
                      <span className="lesson-details-label">
                        {t.portal?.currentlyPlaying || 'Currently Playing'}
                      </span>
                      <h2 className="lesson-details-title">{activeLesson.title}</h2>
                    </div>
                    <CompleteButton
                      isCompleted={completedLessons.includes(activeLesson.id)}
                      onToggle={() => handleToggleComplete(activeLesson.id)}
                      loading={progressLoading}
                    />
                  </div>
                  <div className="lesson-tabs">
                    <div className="lesson-tabs-nav">
                      <button
                        className={`lesson-tab ${activeTab === 'sessions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('sessions')}
                      >
                        {t.portal?.sessionBreakdown || 'Session Breakdown'}
                      </button>
                      <button
                        className={`lesson-tab ${activeTab === 'resources' ? 'active' : ''}`}
                        onClick={() => setActiveTab('resources')}
                      >
                        {t.portal?.codeResources || 'Code & Assets'} ({(activeLesson.resources || []).length})
                      </button>
                      <button
                        className={`lesson-tab ${activeTab === 'notes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('notes')}
                      >
                        {t.portal?.instructorNotes || 'Instructor Notes'}
                      </button>
                    </div>
                    {activeTab === 'sessions' && <SessionList sessions={activeLesson.sessions || []} />}
                    {activeTab === 'resources' && <ResourceDownload resources={activeLesson.resources || []} />}
                    {activeTab === 'notes' && <LessonNotes notes={activeLesson.notes || ''} />}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <CurriculumSidebar
              phases={[]}
              activeLesson={activeLesson}
              onSelectLesson={setActiveLesson}
              completedLessons={completedLessons}
              isEnrolled={isEnrolled}
            />
          </div>
        </div>
      </PageLayout>
    </>
  );
};

export default PortalPage;