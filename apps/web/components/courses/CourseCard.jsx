/**
 * @fileoverview Course Card Component
 * Individual course card with icon, badge, description, and action
 * Path: apps/web/components/courses/CourseCard.jsx
 */

import Link from 'next/link';
import { ChevronRight, Code2, Server, Cpu, Database, Terminal } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const iconMap = { Code2, Server, Cpu, Database, Terminal };

const CourseCard = ({ course, index = 0 }) => {
  const { language, t } = useLanguage();
  const IconComponent = iconMap[course.icon] || Code2;
  const title = language === 'am' && course.title_am ? course.title_am : course.title;
  const description = language === 'am' && course.description_am ? course.description_am : course.description;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="course-card"
      style={{ animationDelay: `${index * 150}ms`, textDecoration: 'none', color: 'inherit' }}
    >
      <div className="course-card-top">
        <div className="course-card-meta">
          {course.badge && <span className="course-card-badge">{course.badge}</span>}
          <span className="course-card-duration">⏱ {course.duration}</span>
        </div>
        <div className="course-card-icon"><IconComponent /></div>
        <div>
          <h3 className="course-card-title">{title}</h3>
          <p className="course-card-desc">{description}</p>
        </div>
      </div>
      <div className="course-card-bottom">
        <span className="course-card-level">{course.level}</span>
        <span className="course-card-btn">
          <span>{t.courses?.viewPhases || 'View Course Phases'}</span>
          <ChevronRight size={16} />
        </span>
      </div>
    </Link>
  );
};

export default CourseCard;