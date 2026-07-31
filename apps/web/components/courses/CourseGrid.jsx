/**
 * @fileoverview Course Grid Component
 * Responsive grid layout for course cards
 * Path: apps/web/components/courses/CourseGrid.jsx
 */

import CourseCard from './CourseCard';

/**
 * CourseGrid - Renders a grid of CourseCard components
 * @param {object} props
 * @param {Array} props.courses - Array of course objects
 */
const CourseGrid = ({ courses }) => {
  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          No courses available at the moment. Please check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {courses.map((course, index) => (
        <CourseCard key={course.id || course.slug} course={course} index={index} />
      ))}
    </div>
  );
};

export default CourseGrid;