/**
 * @fileoverview Session List Component
 * Displays timestamped session breakdown for a lesson
 * Path: apps/web/components/portal/SessionList.jsx
 */

const SessionList = ({ sessions = [] }) => {
  if (!sessions || sessions.length === 0) {
    return <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', padding: '1rem 0' }}>No session breakdown available.</p>;
  }

  return (
    <div className="session-list">
      {sessions.map((session, index) => (
        <div key={index} className="session-item">
          <span className="session-name">{session.name}</span>
          <span className="session-time">{session.time}</span>
        </div>
      ))}
    </div>
  );
};

export default SessionList;