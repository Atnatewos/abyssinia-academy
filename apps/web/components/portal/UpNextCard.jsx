/**
 * @fileoverview Up Next Card Component
 * Smart queue showing the next lesson in the curriculum sequence
 * Path: apps/web/components/portal/UpNextCard.jsx
 */
import React from 'react';
import { ChevronRight, PlayCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * UpNextCard - Encourages continuous learning by showing the next lesson
 * @param {object} props
 * @param {object} props.nextLesson - The next lesson object in the sequence
 * @param {Function} props.onSelectLesson - Callback to navigate to the next lesson
 */
const UpNextCard = ({ nextLesson, onSelectLesson }) => {
  const { language } = useLanguage();

  if (!nextLesson) {
    return (
      <div className="up-next-card completed-course">
        <div className="up-next-icon">🎉</div>
        <div className="up-next-info">
          <h4 className="up-next-title">Course Completed!</h4>
          <p className="up-next-subtitle">You have finished all available lessons.</p>
        </div>
      </div>
    );
  }

  const title = language === 'am' && nextLesson.title_am ? nextLesson.title_am : nextLesson.title;

  return (
    <button className="up-next-card" onClick={() => onSelectLesson(nextLesson)} type="button">
      <div className="up-next-icon">
        <PlayCircle size={20} />
      </div>
      <div className="up-next-info">
        <span className="up-next-label">Up Next</span>
        <h4 className="up-next-title">{title}</h4>
        <span className="up-next-duration">{nextLesson.duration}</span>
      </div>
      <div className="up-next-action">
        <ChevronRight size={16} />
      </div>
    </button>
  );
};

export default UpNextCard;