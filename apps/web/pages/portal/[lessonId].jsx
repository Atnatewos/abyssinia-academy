import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import VideoPlayer from '../../components/portal/VideoPlayer';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import useProgress from '../../hooks/useProgress';
import { Video } from 'lucide-react';

/**
 * Portal Lesson Page
 * Direct link to a specific lesson in the learning portal
 */
export default function PortalLessonPage() {
  const router = useRouter();
  const { lessonId } = router.query;
  const { t } = useLanguage();
  const { isEnrolled } = useAuth();
  const { completedLessons, toggleLesson } = useProgress();

  const [activeLesson, setActiveLesson] = useState(null);

  useEffect(() => {
    if (lessonId) {
      // TODO: Fetch lesson data from API using lessonId
      // For now, providing a valid structure to satisfy Next.js build requirements
      setActiveLesson({
        id: lessonId,
        title: 'Loading Lesson...',
        sessions: [],
        resources: [],
        notes: ''
      });
    }
  }, [lessonId]);

  const handleToggleComplete = async (id) => {
    await toggleLesson(id);
  };

  return (
    <>
      <SEOHead title={t.portal?.title || 'Classroom Portal'} />
      <PageLayout>
        <div className="portal-page">
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
          </div>

          <div className="portal-grid" style={{ marginTop: '1.5rem' }}>
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
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  );
}