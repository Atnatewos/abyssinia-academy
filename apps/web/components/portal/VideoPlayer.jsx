// /**
//  * @fileoverview Video Player Component
//  * YouTube embed with access-controlled locked overlay
//  * Routes to appropriate lock state based on enrollment + phase access
//  * 
//  * Path: apps/web/components/portal/VideoPlayer.jsx
//  */

// import React from 'react';
// import { useAuth } from '../../context/AuthContext';
// import LockedOverlay from './LockedOverlay';
// import useAccessControl from '../../hooks/useAccessControl';

// /**
//  * VideoPlayer - Renders YouTube iframe with access control
//  * 
//  * Access logic priority:
//  * 1. Free preview lessons → always accessible to enrolled students
//  * 2. Full-course students → access everything
//  * 3. Individual-phase students → access only purchased phases
//  * 4. Non-enrolled users → nothing (shown general lock overlay)
//  * 
//  * @param {object} props
//  * @param {object} props.lesson - Current lesson object with id, isFreePreview, etc.
//  * @param {string} [props.activeVideoId] - Specific video ID to play (for session switching)
//  */
// const VideoPlayer = ({ lesson, activeVideoId }) => {
//   const { isEnrolled: authEnrolled } = useAuth();
//   const { checkLessonAccess, getLockedLessonPhase } = useAccessControl();

//   if (!lesson) {
//     return (
//       <div className="video-player" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//         <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>
//           Select a lesson from the curriculum to start learning.
//         </p>
//       </div>
//     );
//   }

//   /*
//    * Determine access based on the access map
//    * Free preview bypass: enrolled students can always watch free previews
//    * even if they haven't purchased that specific phase
//    */
//   const isFreePreview = lesson.isFreePreview === true;
//   const hasAccess = checkLessonAccess(lesson.id, isFreePreview);

//   const videoId = activeVideoId || lesson.mainVideo?.youtubeId || lesson.youtubeId;

//   if (!videoId) {
//     return (
//       <div className="video-player" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//         <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>
//           No video available for this lesson yet.
//         </p>
//       </div>
//     );
//   }

//   /*
//    * Show locked overlay with contextual phase information
//    * when the student doesn't have access to this content
//    */
//   if (!hasAccess) {
//     const lockedPhase = getLockedLessonPhase(lesson.id);
//     return (
//       <div className="video-player">
//         <LockedOverlay lockedPhaseNumber={lockedPhase} />
//       </div>
//     );
//   }

//   return (
//     <div className="video-player">
//       <iframe
//         src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`}
//         title={lesson.title}
//         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//         allowFullScreen
//       />
//     </div>
//   );
// };

// export default VideoPlayer;





/**
 * @fileoverview Video Player Component
 *
 * Renders a YouTube iframe with access-controlled locked overlay.
 * Handles bare IDs, watch URLs, youtu.be URLs, embed URLs, and short URLs.
 *
 * Path: apps/web/components/portal/VideoPlayer.jsx
 */

import React from 'react';
import LockedOverlay from './LockedOverlay';
import useAccessControl from '../../hooks/useAccessControl';

/**
 * Extract a bare YouTube video ID from any URL format or bare ID.
 *
 * @param {string} input
 * @returns {string|null}
 */
const extractYoutubeId = (input) => {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/,
    /shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = trimmed.match(p);
    if (m) return m[1];
  }
  return null;
};

const VideoPlayer = ({ lesson, activeVideoId }) => {
  const { checkLessonAccess, getLockedLessonPhase } = useAccessControl();

  if (!lesson) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <p className="text-text-dim text-sm text-center px-4">
          Select a lesson from the curriculum to start learning.
        </p>
      </div>
    );
  }

  const isFreePreview = lesson.isFreePreview === true;
  const hasAccess = checkLessonAccess(lesson.id, isFreePreview);
  const rawVideo = activeVideoId || lesson.mainVideo?.youtubeId || lesson.youtubeId;
  const videoId = extractYoutubeId(rawVideo);

  if (!videoId) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <p className="text-text-dim text-sm text-center px-4">
          No video available for this lesson yet.
        </p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black relative">
        <LockedOverlay lockedPhaseNumber={getLockedLessonPhase(lesson.id)} />
      </div>
    );
  }

  return (
    <iframe
      src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`}
      title={lesson.title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="w-full h-full border-0"
    />
  );
};

export default VideoPlayer;