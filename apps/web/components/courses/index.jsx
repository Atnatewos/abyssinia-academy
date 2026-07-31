/**
 * @fileoverview Courses Catalog Page
 * Displays all available courses in a grid
 * Path: apps/web/pages/courses/index.jsx
 */

import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import CourseCard from '../../components/courses/CourseCard';
import { useLanguage } from '../../context/LanguageContext';
import { useCourses } from '../../hooks/useCourses';

const CoursesPage = () => {
  const { t } = useLanguage();
  const { courses, loading, error } = useCourses();

  return (
    <>
      <SEOHead title={t.courses?.sectionTitle || 'Academy Catalog'} />
      <PageLayout>
        <div className="courses-page">
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
                <CourseCard key={course.id || course.slug} course={course} index={index} />
              ))}
            </div>
          )}
        </div>
      </PageLayout>
    </>
  );
};

export default CoursesPage;