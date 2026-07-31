/**
 * @fileoverview Courses Catalog Page
 * Displays all available courses in a grid
 * Path: apps/web/pages/courses/index.jsx
 */

import { useState } from 'react';
import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import CourseCard from '../../components/courses/CourseCard';
import PhaseCard from '../../components/courses/PhaseCard';
import { useLanguage } from '../../context/LanguageContext';
import { useCourses } from '../../hooks/useCourses';

/**
 * CoursesPage - Course catalog with phase drilldown
 * Matches the Gemini foundation courses tab exactly
 */
const CoursesPage = () => {
  const { t } = useLanguage();
  const { courses, loading, error } = useCourses();
  const [selectedCourse, setSelectedCourse] = useState(null);

  /**
   * Handle back button click
   */
  const handleBack = () => {
    setSelectedCourse(null);
  };

  return (
    <>
      <SEOHead title={t.courses?.sectionTitle || 'Academy Catalog'} />
      <PageLayout>
        <div className="courses-page">
          {/* Level 1: Course Catalog */}
          {!selectedCourse ? (
            <>
              <div className="section-header" style={{ marginBottom: '2.5rem' }}>
                <div className="section-tag">
                  {t.courses?.sectionTitle || 'Academy Catalog'}
                </div>
                <h1 className="section-title">
                  {t.courses?.heading || 'Industry-Ready Engineering Programs'}
                </h1>
                <p className="section-subtitle">
                  {t.courses?.subheading || 'Select a course program to explore its 5 structured learning phases.'}
                </p>
              </div>

              {loading ? (
                <div className="spinner">
                  <div className="spinner-circle" />
                </div>
              ) : error ? (
                <div className="empty-state">
                  <p className="empty-state-desc">{error}</p>
                </div>
              ) : (
                <div className="courses-grid">
                  {courses.map((course, index) => (
                    <div key={course.id || course.slug} onClick={() => setSelectedCourse(course)}>
                      <CourseCard course={course} index={index} />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Level 2: Phase Drilldown */
            <>
              <div className="course-detail-header">
                <button onClick={handleBack} className="back-btn">
                  {t.courses?.backToCourses || '← Back to All Courses'}
                </button>
                <span className="course-detail-selected">
                  Selected Program: <strong>{selectedCourse.title}</strong>
                </span>
              </div>

              <div className="section-header" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                <div className="section-tag">
                  {t.courses?.phasesInCourse || 'Course Roadmap & Phases'}
                </div>
                <h1 className="section-title">
                  {t.courses?.phasesHeading || '5 Structured Phases to Mastery'}
                </h1>
                <p className="section-subtitle">
                  {t.courses?.phasesSubheading || 'Comprehensive phase breakdown designed to take you from core basics to cloud deployment.'}
                </p>
              </div>

              <div className="phases-grid">
                {(selectedCourse.phases || []).map((phase, index) => (
                  <PhaseCard key={phase.id} phase={phase} index={index} />
                ))}
              </div>
            </>
          )}
        </div>
      </PageLayout>
    </>
  );
};

export default CoursesPage;