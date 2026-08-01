/**
 * @fileoverview Lesson Factory Helpers
 * Central place for creating lessons, videos, and resources
 * Every course file uses these helpers for consistency
 * Path: packages/shared/courses/fullstack-web-development/shared/helpers.js
 */

/**
 * Extract YouTube video ID from a full URL or plain ID
 * Works with all YouTube URL formats:
 *   - https://www.youtube.com/watch?v=VIDEO_ID
 *   - https://youtu.be/VIDEO_ID
 *   - https://www.youtube.com/embed/VIDEO_ID
 *   - VIDEO_ID (plain)
 * @param {string} url - Full YouTube URL or plain video ID
 * @returns {string} YouTube video ID
 */
function extractYouTubeId(url) {
  if (!url) return '';

  // If it's already a plain video ID (11 characters, no special chars except - and _)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return url;
}

/**
 * Format duration from seconds to human-readable string
 * @param {number} totalSeconds - Duration in seconds
 * @returns {string} Formatted duration (e.g., "1h 15m" or "45m" or "5m 30s")
 */
function formatDuration(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return '';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 && hours === 0) parts.push(`${seconds}s`);

  return parts.join(' ') || '<1m';
}

/**
 * Create a complete lesson object
 * Duration is optional - if not provided, the frontend will display the config value.
 * For auto-detection of YouTube duration, we'd need the YouTube Data API,
 * which requires an API key. The duration field is kept as a manual fallback.
 *
 * @param {object} config - Lesson configuration
 * @param {string} config.id - Unique lesson ID (e.g., 'p1-w1-l1')
 * @param {string} config.title - Lesson title displayed to students
 * @param {string} [config.duration] - Fallback duration string (e.g., "45 mins")
 * @param {boolean} [config.isFreePreview] - Whether this is a free preview lesson
 * @param {string} [config.notes] - Instructor notes shown to students
 * @param {object} [config.mainVideo] - Main lecture video { title, youtubeUrl }
 * @param {Array} [config.sessionVideos] - Session breakdown videos [{ title, youtubeUrl, time }]
 * @param {Array} [config.resources] - Downloadable resources [{ name, type }]
 * @returns {object} Complete lesson object with extracted YouTube IDs
 */
function createLesson(config) {
  const mainVideo = config.mainVideo
    ? {
        title: config.mainVideo.title,
        youtubeId: extractYouTubeId(config.mainVideo.youtubeUrl),
      }
    : null;

  const sessionVideos = (config.sessionVideos || []).map((v) => ({
    title: v.title,
    youtubeId: extractYouTubeId(v.youtubeUrl),
    time: v.time || '00:00',
  }));

  return {
    id: config.id,
    title: config.title,
    duration: config.duration || '',
    isFreePreview: config.isFreePreview || false,
    notes: config.notes || '',
    mainVideo,
    sessionVideos,
    resources: config.resources || [],
  };
}

/**
 * Create a main video object
 * @param {string} title - Video name shown to students (e.g., "Full Lecture: Web Architecture")
 * @param {string} youtubeUrl - Full YouTube URL or video ID
 * @returns {object} { title, youtubeUrl }
 */
function mainVideo(title, youtubeUrl) {
  return { title, youtubeUrl };
}

/**
 * Create a session-by-session video object
 * @param {string} title - Video name shown to students (e.g., "01. Client-Server Architecture")
 * @param {string} youtubeUrl - Full YouTube URL or video ID
 * @param {string} time - Timestamp in MM:SS format
 * @returns {object} { title, youtubeUrl, time }
 */
function sessionVideo(title, youtubeUrl, time) {
  return { title, youtubeUrl, time };
}

/**
 * Create a downloadable resource object
 * @param {string} name - Resource filename (e.g., "HTML5_CheatSheet.pdf")
 * @param {string} [type] - Resource type: 'pdf', 'zip', 'link', 'file' (default: 'pdf')
 * @returns {object} { name, type }
 */
function resource(name, type = 'pdf') {
  return { name, type };
}

module.exports = {
  createLesson,
  mainVideo,
  sessionVideo,
  resource,
  extractYouTubeId,
  formatDuration,
};