/**
 * @fileoverview Phase Progress List Component
 * Displays each phase with a progress bar and status indicator
 * Path: apps/web/components/profile/PhaseProgressList.jsx
 */

import React, { useMemo } from 'react';
import { Layers, CheckCircle, Clock, Lock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import usePortalCourse from '../../hooks/usePortalCourse';
import useProgress from '../../hooks/useProgress';

const PhaseProgressList = () => {
  const { t, language } = useLanguage();
  const { phases: coursePhases, loading } = usePortalCourse('fullstack-web-engineering-masterclass');
  const { completedLessons, calculateProgress } = useProgress();

  const phasesWithProgress = useMemo(() => {
    if (!coursePhases || coursePhases.length === 0) return [];
    return coursePhases.map((phase) => {
      const lessonIds = [];
      phase.weeks?.forEach((week) => {
        week.lessons?.forEach((lesson) => lessonIds.push(lesson.id));
      });
      const progress = calculateProgress(lessonIds);
      return {
        ...phase,
        lessonIds,
        progress,
        totalLessons: lessonIds.length,
        completedCount: lessonIds.filter((id) => completedLessons.includes(id)).length,
        status: progress >= 100 ? 'completed' : progress > 0 ? 'in-progress' : 'locked',
      };
    });
  }, [coursePhases, completedLessons, calculateProgress]);

  if (loading) return <div className="profile-card"><div className="spinner-sm"><div className="spinner-circle" /></div></div>;
  if (!phasesWithProgress.length) return null;

  return (
    <div className="profile-card">
      <h3 className="profile-card-title">
        <Layers size={18} />
        {t.profile?.phaseProgress || 'Phase Progress'}
      </h3>

      <div className="profile-phase-list">
        {phasesWithProgress.map((phase) => {
          const phaseTitle = language === 'am' ? (phase.title_am || phase.title) : phase.title;

          return (
            <div key={phase.id || phase.number} className={`profile-phase-item status-${phase.status}`}>
              <div className="profile-phase-item-header">
                <div className="profile-phase-item-info">
                  <span className="profile-phase-item-number">Phase {phase.number}</span>
                  <span className="profile-phase-item-title">{phaseTitle}</span>
                </div>
                <div className="profile-phase-item-status-icon">
                  {phase.status === 'completed' && <CheckCircle size={18} color="#10b981" />}
                  {phase.status === 'in-progress' && <Clock size={18} color="#f59e0b" />}
                  {phase.status === 'locked' && <Lock size={18} color="#6b7280" />}
                </div>
              </div>

              <div className="profile-phase-item-bar">
                <div
                  className="profile-phase-item-bar-fill"
                  style={{ width: `${phase.progress}%` }}
                />
              </div>

              <div className="profile-phase-item-meta">
                <span>{phase.completedCount}/{phase.totalLessons} lessons</span>
                <span className={`profile-phase-item-status status-${phase.status}`}>
                  {phase.status === 'completed' && (t.profile?.completed || 'Completed')}
                  {phase.status === 'in-progress' && (t.profile?.inProgress || 'In Progress')}
                  {phase.status === 'locked' && (t.profile?.locked || 'Locked')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PhaseProgressList;