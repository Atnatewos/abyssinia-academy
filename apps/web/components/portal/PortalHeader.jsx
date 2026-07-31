/**
 * @fileoverview Portal Header Component
 * Top bar of the learning portal with title and progress
 * Path: apps/web/components/portal/PortalHeader.jsx
 */

import { Video } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import ProgressBar from './ProgressBar';

const PortalHeader = ({ progressPercentage = 0 }) => {
  const { t } = useLanguage();

  return (
    <div className="portal-header">
      <div className="portal-header-info">
        <div className="portal-header-icon"><Video /></div>
        <div>
          <h1 className="portal-header-title">{t.portal?.title || 'Abyssinia Student Classroom'}</h1>
          <p className="portal-header-subtitle">{t.portal?.subtitle || 'Pre-recorded Live Sessions & Timestamped Video Player'}</p>
        </div>
      </div>
      <ProgressBar percentage={progressPercentage} />
    </div>
  );
};

export default PortalHeader;