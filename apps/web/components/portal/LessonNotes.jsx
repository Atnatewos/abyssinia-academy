/**
 * @fileoverview Lesson Notes Component
 * Displays instructor notes for the current lesson
 * Path: apps/web/components/portal/LessonNotes.jsx
 */

const LessonNotes = ({ notes }) => {
  if (!notes) {
    return <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', padding: '1rem 0' }}>No notes available.</p>;
  }
  return <div className="lesson-notes">{notes}</div>;
};

export default LessonNotes;