/**
 * @fileoverview Course Management Service
 * Business logic for course CRUD operations (admin)
 * Path: apps/api/src/services/course.service.js
 */

const coursesDb = require('../database/queries/courses');
const { NotFoundError, BadRequestError } = require('../utils/errors');

/**
 * Get all courses for public view
 * @returns {Array} Published courses
 */
const getPublishedCourses = async () => {
  const courses = await coursesDb.getAllCourses();
  return courses;
};

/**
 * Get course details with full curriculum
 * @param {string} slug - Course slug
 * @returns {object} Course with phases, weeks, lessons
 */
const getCourseWithCurriculum = async (slug) => {
  const course = await coursesDb.getCourseBySlug(slug);
  
  if (!course) {
    throw new NotFoundError('Course not found.');
  }

  const curriculum = await coursesDb.getFullCurriculum(course.id);
  course.phases = curriculum;

  return course;
};

/**
 * Get course by ID (admin)
 * @param {string} id - Course UUID
 * @returns {object} Course object
 */
const getCourseById = async (id) => {
  const course = await coursesDb.getCourseById(id);
  
  if (!course) {
    throw new NotFoundError('Course not found.');
  }

  return course;
};

/**
 * Get lesson by ID
 * @param {string} lessonId - Lesson UUID
 * @returns {object} Lesson with sessions and resources
 */
const getLessonById = async (lessonId) => {
  const lesson = await coursesDb.getLessonById(lessonId);
  
  if (!lesson) {
    throw new NotFoundError('Lesson not found.');
  }

  return lesson;
};

/**
 * Create a new course (admin)
 * @param {object} courseData - Course creation data
 * @returns {object} Created course
 */
const createCourse = async (courseData) => {
  const { title, slug } = courseData;

  // Check if slug already exists
  const existing = await coursesDb.getCourseBySlug(slug);
  if (existing) {
    throw new BadRequestError('A course with this slug already exists.');
  }

  const course = await coursesDb.createCourse({
    slug,
    title: title,
    titleAm: courseData.titleAm || null,
    description: courseData.description,
    descriptionAm: courseData.descriptionAm || null,
    level: courseData.level || 'All Levels',
    duration: courseData.duration || '20+ Weeks',
    badge: courseData.badge || null,
    icon: courseData.icon || 'Code2',
    thumbnailUrl: courseData.thumbnailUrl || null,
  });

  return course;
};

/**
 * Update a course (admin)
 * @param {string} id - Course UUID
 * @param {object} courseData - Updated course data
 * @returns {object} Updated course
 */
const updateCourse = async (id, courseData) => {
  const course = await coursesDb.getCourseById(id);
  
  if (!course) {
    throw new NotFoundError('Course not found.');
  }

  const updatedCourse = await coursesDb.updateCourse(id, courseData);
  return updatedCourse;
};

module.exports = {
  getPublishedCourses,
  getCourseWithCurriculum,
  getCourseById,
  getLessonById,
  createCourse,
  updateCourse,
};