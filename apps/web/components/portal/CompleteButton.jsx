/**
 * @fileoverview Complete Button Component
 * Toggle button for marking lessons as complete/incomplete
 * Path: apps/web/components/portal/CompleteButton.jsx
 */

import { CheckCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const CompleteButton = ({ isCompleted = false, onToggle, loading = false }) => {
  const { t } = useLanguage();

  return (
    <button onClick={onToggle} disabled={loading} className={`complete-btn ${isCompleted ? 'completed' : 'incomplete'}`}>
      <CheckCircle />
      <span>
        {loading ? 'Updating...' : isCompleted ? (t.portal?.completed || 'Completed') : (t.portal?.markComplete || 'Mark as Complete')}
      </span>
    </button>
  );
};

export default CompleteButton;