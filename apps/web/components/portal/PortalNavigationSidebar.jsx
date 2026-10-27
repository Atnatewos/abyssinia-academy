/**
 * @fileoverview Portal Navigation Sidebar
 * Collapsible phase accordion with week navigation and progress rings
 * Path: apps/web/components/portal/PortalNavigationSidebar.jsx
 */
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, PlayCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import ProgressRing from './ProgressRing';

/**
 * PortalNavigationSidebar - Left sidebar with phase accordion and week list
 * Features auto-calculated circular progress rings for each week
 */
const PortalNavigationSidebar = ({
  phases = [],
  selectedWeek,
  onSelectWeek,
  activeLesson,
  onSelectLesson,
  completedLessons = [],
}) => {
  const { t } = useLanguage();
  const [expandedPhases, setExpandedPhases] = useState({});

  const togglePhase = (phaseId) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId],
    }));
  };

  const getWeekProgress = (week) => {
    if (!week.lessons || week.lessons.length === 0) return 0;
    const completed = week.lessons.filter((l) => completedLessons.includes(l.id)).length;
    return Math.round((completed / week.lessons.length) * 100);
  };

  const getFirstLesson = (week) => {
    return week.lessons && week.lessons.length > 0 ? week.lessons[0] : null;
  };

  return (
    <div className="portal-navigation-sidebar">
      <h3 className="sidebar-title">
        {t.portal?.classroomCurriculum || 'Course Curriculum'}
      </h3>
      <div className="sidebar-phases">
        {phases.map((phase) => {
          const phaseId = phase.id || `phase-${phase.number}`;
          const isExpanded = expandedPhases[phaseId] !== false;
          return (
            <div key={phaseId} className="sidebar-phase">
              <button className="sidebar-phase-header" onClick={() => togglePhase(phaseId)}>
                <div className="sidebar-phase-header-left">
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span className="sidebar-phase-title">
                    Phase {phase.number}: {phase.title}
                  </span>
                </div>
                <span className="sidebar-phase-duration">{phase.duration}</span>
              </button>
              {isExpanded && (
                <div className="sidebar-phase-weeks">
                  {phase.weeks && phase.weeks.map((week) => {
                    const weekProgress = getWeekProgress(week);
                    const isSelected = selectedWeek === (week.number || week.week_number);
                    const firstLesson = getFirstLesson(week);
                    return (
                      <div key={week.number || week.id} className="sidebar-week-group">
                        <button
                          className={`sidebar-week-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            onSelectWeek(week.number || week.week_number);
                            if (firstLesson) onSelectLesson(firstLesson);
                          }}
                        >
                          <div className="sidebar-week-info">
                            <span className="sidebar-week-number">
                              Week {week.number || week.week_number}
                            </span>
                            <span className="sidebar-week-title">{week.title}</span>
                          </div>
                          <div className="sidebar-week-progress">
                            {weekProgress === 100 ? (
                              <CheckCircle size={16} className="icon-completed" />
                            ) : weekProgress > 0 ? (
                              <ProgressRing progress={weekProgress} size={20} strokeWidth={2.5} />
                            ) : (
                              <PlayCircle size={16} className="icon-play" />
                            )}
                          </div>
                        </button>
                        {(isSelected || weekProgress > 0) && week.lessons && (
                          <div className="sidebar-week-lessons">
                            {week.lessons.map((lesson) => {
                              const isActive = activeLesson && activeLesson.id === lesson.id;
                              const isDone = completedLessons.includes(lesson.id);
                              return (
                                <button
                                  key={lesson.id}
                                  className={`sidebar-lesson-item ${isActive ? 'active' : ''}`}
                                  onClick={() => onSelectLesson(lesson)}
                                >
                                  <div className="sidebar-lesson-left">
                                    {isDone ? (
                                      <CheckCircle size={12} className="icon-completed" />
                                    ) : isActive ? (
                                      <PlayCircle size={12} className="icon-active" />
                                    ) : (
                                      <PlayCircle size={12} className="icon-play" />
                                    )}
                                    <span className="sidebar-lesson-title">{lesson.title}</span>
                                  </div>
                                  <span className="sidebar-lesson-duration">{lesson.duration}</span>
                                </button>
                              );
                            })}
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
      {phases.length === 0 && (
        <p className="sidebar-empty">No curriculum data available.</p>
      )}
    </div>
  );
};

export default PortalNavigationSidebar;