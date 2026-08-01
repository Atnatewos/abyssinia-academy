/**
 * @fileoverview Session Chapters Component
 * YouTube-style clickable timestamp list for lesson sessions
 * Path: apps/web/components/portal/SessionChapters.jsx
 */
import React from 'react';
import { PlayCircle } from 'lucide-react';

/**
 * SessionChapters - Renders session videos as clickable chapter markers
 * @param {object} props
 * @param {Array} props.sessions - Array of session objects { title, youtubeId, time }
 * @param {string} [props.activeSessionId] - ID of the currently playing session
 * @param {Function} [props.onSelectSession] - Callback when a chapter is clicked
 */
const SessionChapters = ({ sessions = [], activeSessionId, onSelectSession }) => {
  if (!sessions || sessions.length === 0) {
    return (
      <p className="chapters-empty">
        No session breakdown available for this lesson.
      </p>
    );
  }

  return (
    <div className="session-chapters">
      {sessions.map((session, index) => {
        const isActive = activeSessionId === session.youtubeId;
        return (
          <button
            key={index}
            className={`chapter-item ${isActive ? 'active' : ''}`}
            onClick={() => onSelectSession && onSelectSession(session.youtubeId)}
            type="button"
          >
            <div className="chapter-icon">
              <PlayCircle size={14} />
            </div>
            <div className="chapter-info">
              <span className="chapter-title">{session.title}</span>
            </div>
            <span className="chapter-time">{session.time}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SessionChapters;