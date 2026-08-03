/**
 * @fileoverview Course Detail Page Component
 * Shows course info with PhaseCard components for each phase.
 * "Open Classroom" on a PhaseCard navigates to /portal?phase=X
 * Path: apps/web/pages/courses/[slug].jsx
 */

import { useRouter } from 'next/router';
import Link from 'next/link';
import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import PhaseCard from '../../components/courses/PhaseCard';
import { useLanguage } from '../../context/LanguageContext';
import { useCourseBySlug } from '../../hooks/useCourses';

const CourseDetailPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const { language, t } = useLanguage();
  const { course, loading, error } = useCourseBySlug(slug);

  if (!router.isReady || loading) {
    return (
      <PageLayout>
        <div className="courses-page">
          <div className="spinner" style={{ marginTop: '3rem' }}><div className="spinner-circle" /></div>
        </div>
      </PageLayout>
    );
  }

  if (error || !course) {
    return (
      <PageLayout>
        <div className="courses-page">
          <div className="empty-state" style={{ marginTop: '3rem' }}>
            <p className="empty-state-desc">{error || 'Course not found.'}</p>
            <Link href="/courses" className="pricing-btn" style={{ display: 'inline-flex', marginTop: '1rem' }}>Back to Courses</Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  const title = language === 'am' && course.title_am ? course.title_am : course.title;

  return (
    <>
      <SEOHead title={title} description={course.description || ''} />
      <PageLayout>
        <div className="courses-page">
          <div className="course-detail-header">
            <Link href="/courses" className="back-btn">
              {t.courses?.backToCourses || '← Back to All Courses'}
            </Link>
            <span className="course-detail-selected">
              Selected Program: <strong>{title}</strong>
            </span>
          </div>

          <div className="section-header" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
            <div className="section-tag">{t.courses?.phasesInCourse || 'Course Roadmap & Phases'}</div>
            <h1 className="section-title">{t.courses?.phasesHeading || '5 Structured Phases to Mastery'}</h1>
            <p className="section-subtitle">{t.courses?.phasesSubheading || 'Comprehensive phase breakdown.'}</p>
          </div>

          {course.phases && course.phases.length > 0 ? (
            <div className="phases-grid">
              {course.phases.map((phase, index) => (
                <PhaseCard key={phase.id} phase={phase} index={index} />
              ))}
            </div>
          ) : (
            <div className="empty-state"><p className="empty-state-desc">No phases available for this course yet.</p></div>
          )}
        </div>
      </PageLayout>
    </>
  );
};

export default CourseDetailPage;