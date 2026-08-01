/**
 * @fileoverview Week Accordion - Professional LMS Style
 * Numbered sections with durations, todo lists, expandable class cards
 * Path: apps/web/components/portal/WeekAccordion.jsx
 */

import React, { useState } from 'react';
import {
  ChevronDown, ChevronRight, CheckCircle, Lock, PlayCircle,
  Video, FileText, Download, HelpCircle, CheckSquare, Clock,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import SessionChapters from './SessionChapters';

const WeekAccordion = ({
  week,
  isExpanded = false,
  onToggle,
  activeLesson,
  onSelectLesson,
  completedLessons = [],
  isEnrolled = false,
  expandedClassSections = {},
  onToggleClassSection,
  checklistItems = {},
  onToggleChecklist,
  activeVideoId,
  onSelectSession,
  getWeekProgress,
}) => {
  const { t } = useLanguage();
  const [showTodo, setShowTodo] = useState(true);

  const weekProgress = getWeekProgress ? getWeekProgress(week) : 0;
  const completedCount = week.lessons?.filter((l) => completedLessons.includes(l.id)).length || 0;
  const totalCount = week.lessons?.length || 0;

  return (
    <div className="week-accordion-v2">
      {/* Week Header */}
      <button className="week-accordion-header" onClick={onToggle}>
        <div className="week-header-left">
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          <span className="week-number-badge">Week {week.number || week.week_number}</span>
          <span className="week-title-text">{week.title}</span>
        </div>
        <div className="week-header-right">
          <Clock size={14} style={{ color: 'var(--text-dim)' }} />
          <span className="week-duration-text">{week.lessons?.reduce((acc, l) => acc + parseInt(l.duration) || 0, 0) || 0}m</span>
          <span className="week-progress-text">{completedCount}/{totalCount} Done</span>
          {weekProgress === 100 ? (
            <CheckCircle size={18} style={{ color: '#10b981' }} />
          ) : weekProgress > 0 ? (
            <span className="week-progress-badge">{weekProgress}%</span>
          ) : null}
        </div>
      </button>

      {isExpanded && (
        <div className="week-accordion-body">
          {/* Todo List */}
          <div className="week-todo-section">
            <button className="todo-toggle" onClick={() => setShowTodo(!showTodo)}>
              <CheckSquare size={14} />
              <span>Week Todo List</span>
              {showTodo ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {showTodo && (
              <ul className="todo-items">
                <li className="todo-item">
                  <input type="checkbox" checked={weekProgress === 100} readOnly />
                  <label>Watch all session videos</label>
                </li>
                <li className="todo-item">
                  <input type="checkbox" checked={checklistItems[`w${week.number}-exercise`] || false} onChange={() => onToggleChecklist(`w${week.number}-exercise`)} />
                  <label>Complete coding exercise</label>
                </li>
                <li className="todo-item">
                  <input type="checkbox" checked={checklistItems[`w${week.number}-submit`] || false} onChange={() => onToggleChecklist(`w${week.number}-submit`)} />
                  <label>Submit assignment</label>
                </li>
                <li className="todo-item">
                  <input type="checkbox" checked={checklistItems[`w${week.number}-quiz`] || false} onChange={() => onToggleChecklist(`w${week.number}-quiz`)} />
                  <label>Take quiz</label>
                </li>
              </ul>
            )}
          </div>

          {/* Class Cards */}
          {week.lessons?.map((lesson, idx) => {
            const isActive = activeLesson?.id === lesson.id;
            const isDone = completedLessons.includes(lesson.id);
            const isLocked = !isEnrolled && !lesson.isFreePreview;
            const sectionKey = `${lesson.id}-videos`;

            return (
              <div key={lesson.id} className={`class-card-v2 ${isActive ? 'active' : ''}`}>
                <button className="class-card-header" onClick={() => onSelectLesson(lesson)}>
                  <div className="class-header-left">
                    {isDone ? (
                      <CheckCircle size={20} style={{ color: '#10b981' }} />
                    ) : isLocked ? (
                      <Lock size={20} style={{ color: 'var(--text-dim)' }} />
                    ) : (
                      <PlayCircle size={20} style={{ color: 'var(--accent-gold)' }} />
                    )}
                    <span className="class-number">Class {idx + 1}</span>
                    <span className="class-title-text">{lesson.title}</span>
                  </div>
                  <span className="class-duration-text">{lesson.duration}</span>
                </button>

                <div className="class-card-body">
                  {/* Class Videos */}
                  <div className="class-section-v2">
                    <button className="class-section-toggle" onClick={() => onToggleClassSection(`${lesson.id}-videos`)}>
                      <Video size={14} />
                      <span>Class Videos</span>
                      {expandedClassSections[`${lesson.id}-videos`] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    {expandedClassSections[`${lesson.id}-videos`] && (
                      <div className="class-section-body">
                        {lesson.mainVideo && (
                          <div className="main-video-card" onClick={() => onSelectLesson(lesson)} style={{ cursor: 'pointer' }}>
                            <div className="main-video-thumb">
                              <PlayCircle size={24} style={{ color: '#fff' }} />
                            </div>
                            <div className="main-video-info">
                              <span className="video-card-label">Live Session Recording</span>
                              <span className="video-card-title">{lesson.mainVideo.title}</span>
                              <span className="video-card-duration">{lesson.duration}</span>
                            </div>
                          </div>
                        )}
                        {lesson.sessionVideos?.length > 0 && (
                          <div className="session-chapters-wrapper">
                            <span className="section-sub-label">Section By Section</span>
                            <SessionChapters
                              sessions={lesson.sessionVideos}
                              activeSessionId={activeVideoId}
                              onSelectSession={onSelectSession}
                              startNumber={1}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Class Notes */}
                  <div className="class-section-v2">
                    <button className="class-section-toggle" onClick={() => onToggleClassSection(`${lesson.id}-notes`)}>
                      <FileText size={14} />
                      <span>Class Notes</span>
                      {expandedClassSections[`${lesson.id}-notes`] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    {expandedClassSections[`${lesson.id}-notes`] && (
                      <div className="class-section-body">
                        {lesson.notes ? <p className="notes-content">{lesson.notes}</p> : <p className="notes-empty">No notes available for this class.</p>}
                      </div>
                    )}
                  </div>

                  {/* Resources */}
                  <div className="class-section-v2">
                    <button className="class-section-toggle" onClick={() => onToggleClassSection(`${lesson.id}-resources`)}>
                      <Download size={14} />
                      <span>Reference Materials ({lesson.resources?.length || 0})</span>
                      {expandedClassSections[`${lesson.id}-resources`] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    {expandedClassSections[`${lesson.id}-resources`] && (
                      <div className="class-section-body">
                        {lesson.resources?.length > 0 ? (
                          lesson.resources.map((r, i) => (
                            <div key={i} className="resource-row">
                              <span>{r.name}</span>
                              <span className="resource-type">{r.type}</span>
                            </div>
                          ))
                        ) : <p className="notes-empty">No resources available.</p>}
                      </div>
                    )}
                  </div>

                  {/* Q&A */}
                  <div className="class-section-v2">
                    <button className="class-section-toggle" onClick={() => onToggleClassSection(`${lesson.id}-questions`)}>
                      <HelpCircle size={14} />
                      <span>Questions Asked in Class</span>
                      {expandedClassSections[`${lesson.id}-questions`] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    {expandedClassSections[`${lesson.id}-questions`] && (
                      <div className="class-section-body">
                        <p className="notes-empty">Questions from this class will appear here.</p>
                      </div>
                    )}
                  </div>

                  {/* Checklist */}
                  <div className="class-section-v2">
                    <button className="class-section-toggle" onClick={() => onToggleClassSection(`${lesson.id}-checklist`)}>
                      <CheckSquare size={14} />
                      <span>Class Checklist</span>
                      {expandedClassSections[`${lesson.id}-checklist`] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    {expandedClassSections[`${lesson.id}-checklist`] && (
                      <div className="class-section-body">
                        <ul className="checklist-v2">
                          <li><input type="checkbox" checked={checklistItems[`${lesson.id}-watch`] || false} onChange={() => onToggleChecklist(`${lesson.id}-watch`)} /> <label>Watch main lecture</label></li>
                          <li><input type="checkbox" checked={checklistItems[`${lesson.id}-sessions`] || false} onChange={() => onToggleChecklist(`${lesson.id}-sessions`)} /> <label>Review session videos</label></li>
                          <li><input type="checkbox" checked={checklistItems[`${lesson.id}-notes`] || false} onChange={() => onToggleChecklist(`${lesson.id}-notes`)} /> <label>Read class notes</label></li>
                          <li><input type="checkbox" checked={isDone} readOnly /> <label>Mark as complete</label></li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {!week.lessons?.length && <p className="notes-empty">No classes available for this week yet.</p>}
        </div>
      )}
    </div>
  );
};

export default WeekAccordion;