/**
 * @fileoverview Video Player Component
 * YouTube embed with access-controlled locked overlay
 * Routes to appropriate lock state based on enrollment + phase access
 * 
 * Path: apps/web/components/portal/VideoPlayer.jsx
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import LockedOverlay from './LockedOverlay';
import useAccessControl from '../../hooks/useAccessControl';

/**
 * VideoPlayer - Renders YouTube iframe with access control
 * 
 * Access logic priority:
 * 1. Free preview lessons → always accessible to enrolled students
 * 2. Full-course students → access everything
 * 3. Individual-phase students → access only purchased phases
 * 4. Non-enrolled users → nothing (shown general lock overlay)
 * 
 * @param {object} props
 * @param {object} props.lesson - Current lesson object with id, isFreePreview, etc.
 * @param {string} [props.activeVideoId] - Specific video ID to play (for session switching)
 */
const VideoPlayer = ({ lesson, activeVideoId }) => {
  const { isEnrolled: authEnrolled } = useAuth();
  const { checkLessonAccess, getLockedLessonPhase } = useAccessControl();

  if (!lesson) {
    return (
      <div className="video-player" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>
          Select a lesson from the curriculum to start learning.
        </p>
      </div>
    );
  }

  /*
   * Determine access based on the access map
   * Free preview bypass: enrolled students can always watch free previews
   * even if they haven't purchased that specific phase
   */
  const isFreePreview = lesson.isFreePreview === true;
  const hasAccess = checkLessonAccess(lesson.id, isFreePreview);

  const videoId = activeVideoId || lesson.mainVideo?.youtubeId || lesson.youtubeId;

  if (!videoId) {
    return (
      <div className="video-player" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>
          No video available for this lesson yet.
        </p>
      </div>
    );
  }

  /*
   * Show locked overlay with contextual phase information
   * when the student doesn't have access to this content
   */
  if (!hasAccess) {
    const lockedPhase = getLockedLessonPhase(lesson.id);
    return (
      <div className="video-player">
        <LockedOverlay lockedPhaseNumber={lockedPhase} />
      </div>
    );
  }

  return (
    <div className="video-player">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`}
        title={lesson.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

export default VideoPlayer;