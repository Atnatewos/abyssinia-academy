/**
 * @fileoverview Session List Component
 * Displays clickable session-by-session videos from lesson config
 * Path: apps/web/components/portal/SessionList.jsx
 */

const SessionList = ({ sessions = [] }) => {
  if (!sessions || sessions.length === 0) {
    return (
      <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', padding: '1rem 0' }}>
        No session breakdown available for this lesson.
      </p>
    );
  }

  return (
    <div className="session-list">
      {sessions.map((video, index) => (
        <div key={index} className="session-item">
          <span className="session-name">{video.title}</span>
          <span className="session-time">{video.time}</span>
        </div>
      ))}
    </div>
  );
};

export default SessionList;