/**
 * @fileoverview Curriculum Sidebar Component
 * Phase/Week/Lesson tree navigation for the learning portal
 * Path: apps/web/components/portal/CurriculumSidebar.jsx
 */

import { CheckCircle, Lock, PlayCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const CurriculumSidebar = ({ phases = [], activeLesson, onSelectLesson, completedLessons = [], isEnrolled = false }) => {
  const { language, t } = useLanguage();

  return (
    <div className="curriculum-sidebar">
      <h3 className="curriculum-title">
        <span>{t.portal?.classroomCurriculum || 'Classroom Curriculum'}</span>
        <span className="curriculum-count">{phases.length} {phases.length === 1 ? 'Phase' : 'Phases'}</span>
      </h3>
      <div className="curriculum-list custom-scrollbar">
        {phases.map((phase) => (
          <div key={phase.id} style={{ marginBottom: '0.5rem' }}>
            <div className="curriculum-phase">
              Phase {phase.phase_number}: {language === 'am' && phase.title_am ? phase.title_am : phase.title}
            </div>
            {phase.weeks && phase.weeks.map((week) => (
              <div key={week.id || week.week_number}>
                <div className="curriculum-week">Week {week.week_number}</div>
                {week.lessons && week.lessons.map((lesson) => {
                  const isCurrent = activeLesson && activeLesson.id === lesson.id;
                  const isDone = completedLessons.includes(lesson.id);
                  const isLocked = !isEnrolled && !lesson.is_free_preview;
                  return (
                    <div
                      key={lesson.id}
                      onClick={() => onSelectLesson(lesson)}
                      className={`curriculum-lesson ${isCurrent ? 'active' : ''}`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter') onSelectLesson(lesson); }}
                    >
                      <div className="curriculum-lesson-left">
                        {isDone ? <CheckCircle size={16} className="icon-completed" /> :
                         isLocked ? <Lock size={16} className="icon-locked" /> :
                         <PlayCircle size={16} className="icon-play" />}
                        <span className="curriculum-lesson-name">
                          {language === 'am' && lesson.title_am ? lesson.title_am : lesson.title}
                        </span>
                      </div>
                      <span className="curriculum-lesson-duration">{lesson.duration}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
        {phases.length === 0 && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', padding: '2rem 0' }}>No curriculum data available.</p>
        )}
      </div>
    </div>
  );
};

export default CurriculumSidebar;