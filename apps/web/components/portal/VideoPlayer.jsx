/**
 * @fileoverview Video Player Component
 * YouTube embed with locked overlay for non-enrolled users
 * Path: apps/web/components/portal/VideoPlayer.jsx
 */

import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import LockedOverlay from './LockedOverlay';

const VideoPlayer = ({ lesson, isEnrolled }) => {
  const { language } = useLanguage();
  const { isEnrolled: authEnrolled } = useAuth();
  const hasAccess = isEnrolled || authEnrolled || lesson?.is_free_preview;

  if (!lesson) {
    return (
      <div className="video-player" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>No lesson selected.</p>
      </div>
    );
  }

  return (
    <div className="video-player">
      {!hasAccess ? (
        <LockedOverlay />
      ) : (
        <iframe
          src={`https://www.youtube.com/embed/${lesson.youtube_id || lesson.youtubeId}?autoplay=0&rel=0&modestbranding=1`}
          title={language === 'am' && lesson.title_am ? lesson.title_am : lesson.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
};

export default VideoPlayer;