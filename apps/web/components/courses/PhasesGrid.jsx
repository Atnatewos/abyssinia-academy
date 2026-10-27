/**
 * @fileoverview Phases Grid Component
 * Responsive grid layout for phase cards
 * Path: apps/web/components/courses/PhasesGrid.jsx
 */

import PhaseCard from './PhaseCard';

/**
 * PhasesGrid - Renders a grid of PhaseCard components
 * @param {object} props
 * @param {Array} props.phases - Array of phase objects
 * @param {string} props.courseSlug - Parent course slug for navigation
 */
const PhasesGrid = ({ phases, courseSlug = '' }) => {
  if (!phases || phases.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          No phases available for this course yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {phases.map((phase, index) => (
        <PhaseCard key={phase.id} phase={phase} index={index} courseSlug={courseSlug} />
      ))}
    </div>
  );
};

export default PhasesGrid;