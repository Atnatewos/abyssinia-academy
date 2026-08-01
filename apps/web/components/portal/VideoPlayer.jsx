/**
 * @fileoverview Video Player Component
 * YouTube embed with locked overlay and session video switching support
 * Path: apps/web/components/portal/VideoPlayer.jsx
 */
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import LockedOverlay from './LockedOverlay';

/**
 * VideoPlayer - Renders YouTube iframe with access control
 * @param {object} props
 * @param {object} props.lesson - Current lesson object
 * @param {string} [props.activeVideoId] - Specific video ID to play (for session switching)
 * @param {boolean} props.isEnrolled - User enrollment status
 */
const VideoPlayer = ({ lesson, activeVideoId, isEnrolled }) => {
  const { isEnrolled: authEnrolled } = useAuth();
  const hasAccess = isEnrolled || authEnrolled || lesson?.isFreePreview;

  if (!lesson) {
    return (
      <div className="video-player" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Select a lesson from the curriculum to start learning.</p>
      </div>
    );
  }

  // Use activeVideoId if provided (session switch), otherwise fallback to main video
  const videoId = activeVideoId || lesson.mainVideo?.youtubeId || lesson.youtubeId;

  if (!videoId) {
    return (
      <div className="video-player" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>No video available for this lesson yet.</p>
      </div>
    );
  }

  return (
    <div className="video-player">
      {!hasAccess ? (
        <LockedOverlay />
      ) : (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`}
          title={lesson.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
};

export default VideoPlayer;