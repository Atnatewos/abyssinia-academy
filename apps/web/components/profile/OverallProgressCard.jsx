/**
 * @fileoverview Overall Progress Card Component
 * Circular progress ring with lesson/phase completion stats.
 * ALL display text from i18n → t.profile.*
 * Path: apps/web/components/profile/OverallProgressCard.jsx
 */

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import ProgressRing from '../portal/ProgressRing';

/**
 * OverallProgressCard — Shows the student's total progress across all phases.
 *
 * @param {object} props
 * @param {object} props.progress - Progress data { overall: number }
 * @param {number} props.completedLessons - Number of completed lessons
 * @param {number} props.totalLessons - Total lessons in the course (default: 76)
 * @param {number} props.totalWeeks - Total weeks in the course (default: 24)
 */
const OverallProgressCard = ({
  progress = {},
  completedLessons = 0,
  totalLessons = 76,
  totalWeeks = 24,
}) => {
  const { t } = useLanguage();
  const pct = progress?.overall || 0;

  /*
   * Calculate estimated weeks completed based on lesson progress
   */
  const estimatedWeeksCompleted = totalWeeks > 0
    ? Math.round((completedLessons / totalLessons) * totalWeeks)
    : 0;

  /*
   * Build the display strings with replaced placeholders
   */
  const lessonsLabel = (t.profile?.lessonsCompleted || '{completed} of {total} lessons done')
    .replace('{completed}', String(completedLessons))
    .replace('{total}', String(totalLessons));

  const weeksLabel = (t.profile?.weeksCompleted || '{completed} of {total} weeks completed')
    .replace('{completed}', String(estimatedWeeksCompleted))
    .replace('{total}', String(totalWeeks));

  return (
    <div className="profile-card">
      <h3 className="profile-card-title">
        <TrendingUp size={18} />
        {t.profile?.overallProgress || 'Overall Progress'}
      </h3>

      {/* Circular Progress Ring */}
      <div className="profile-progress-visual">
        <ProgressRing progress={Math.round(pct)} size={100} strokeWidth={6} />
        <div className="profile-progress-percent">{Math.round(pct)}%</div>
      </div>

      {/* Progress Stats */}
      <div className="profile-progress-stats">
        <div className="profile-progress-stat">
          <span className="profile-progress-stat-value">{completedLessons}</span>
          <span className="profile-progress-stat-label">{lessonsLabel}</span>
        </div>
        <div className="profile-progress-stat">
          <span className="profile-progress-stat-value">{estimatedWeeksCompleted}</span>
          <span className="profile-progress-stat-label">{weeksLabel}</span>
        </div>
      </div>
    </div>
  );
};

export default OverallProgressCard;