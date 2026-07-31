/**
 * @fileoverview Progress Bar Component
 * Animated progress bar showing course completion percentage
 * Path: apps/web/components/portal/ProgressBar.jsx
 */

import { useLanguage } from '../../context/LanguageContext';

const ProgressBar = ({ percentage = 0 }) => {
  const { t } = useLanguage();
  const displayPercentage = Math.min(100, Math.max(0, Math.round(percentage)));

  return (
    <div className="progress-bar-wrapper">
      <div className="progress-bar-text">
        <p className="progress-bar-label">{t.portal?.progressLabel || 'Your Learning Progress'}</p>
        <p className="progress-bar-percent">{displayPercentage}% Complete</p>
      </div>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${displayPercentage}%` }} />
      </div>
    </div>
  );
};

export default ProgressBar;