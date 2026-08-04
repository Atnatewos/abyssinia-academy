/**
 * @fileoverview Access Control Library
 * Centralized access validation for phase/week/lesson locking
 * Determines what content a student can access based on their enrollment
 * 
 * Architecture:
 * - Full-course students → access everything
 * - Individual-phase students → only access purchased phases
 * - Free preview lessons → accessible to ANY authenticated user (even if not enrolled)
 * - Non-enrolled users → only free previews, everything else locked
 * - Non-authenticated users → nothing
 * 
 * Path: apps/web/lib/accessControl.js
 */

import apiClient from './api';

/**
 * Cache for the access map to avoid redundant API calls
 * Cleared on login/logout via the AuthContext
 */
let cachedAccessMap = null;
let cachedAccessPromise = null;

/**
 * Clear the cached access map (call on login/logout/enrollment change)
 */
export const clearAccessCache = () => {
  cachedAccessMap = null;
  cachedAccessPromise = null;
};

/**
 * Fetch the user's access map from the server
 * Returns a structured object indicating which phases/weeks/lessons are accessible
 * 
 * @returns {Promise<object>} Access map with accessiblePhases, accessibleWeeks, accessibleLessons
 * 
 * @example
 * {
 *   purchaseMode: 'individual-phases',
 *   accessiblePhases: ['phase-1', 'phase-3'],
 *   accessibleWeeks: [1, 2, 3, 4, 15, 16, 17, 18, 19, 20],
 *   accessibleLessons: ['p1-w1-l1', 'p1-w1-l2', ...],
 *   isFullCourse: false,
 *   isEnrolled: true
 * }
 */
export const fetchAccessMap = async () => {
  if (cachedAccessMap) return cachedAccessMap;

  if (cachedAccessPromise) return cachedAccessPromise;

  cachedAccessPromise = (async () => {
    try {
      const response = await apiClient.get('/access/check');

      if (response && response.success) {
        cachedAccessMap = response.data;
        return cachedAccessMap;
      }

      cachedAccessMap = getDefaultAccessMap();
      return cachedAccessMap;
    } catch (error) {
      console.error('Access check failed, denying all access:', error.message);
      cachedAccessMap = getDefaultAccessMap();
      return cachedAccessMap;
    } finally {
      cachedAccessPromise = null;
    }
  })();

  return cachedAccessPromise;
};

/**
 * Get a restrictive default access map when not authenticated or on error
 * Allows nothing — zero trust by default
 * 
 * @returns {object} Default restrictive access map
 */
const getDefaultAccessMap = () => ({
  purchaseMode: 'none',
  accessiblePhases: [],
  accessibleWeeks: [],
  accessibleLessons: [],
  isFullCourse: false,
  isEnrolled: false,
});

/**
 * Check if a specific phase is accessible to the student
 * 
 * @param {object} accessMap - The fetched access map
 * @param {string} phaseId - Phase ID (e.g., 'phase-1')
 * @returns {boolean} Whether the phase is accessible
 */
export const canAccessPhase = (accessMap, phaseId) => {
  if (!accessMap || !phaseId) return false;
  if (accessMap.isFullCourse) return true;
  return accessMap.accessiblePhases?.includes(phaseId) || false;
};

/**
 * Check if a specific week is accessible to the student
 * 
 * @param {object} accessMap - The fetched access map
 * @param {number} weekNumber - Week number
 * @returns {boolean} Whether the week is accessible
 */
export const canAccessWeek = (accessMap, weekNumber) => {
  if (!accessMap || !weekNumber) return false;
  if (accessMap.isFullCourse) return true;
  return accessMap.accessibleWeeks?.includes(weekNumber) || false;
};

/**
 * Check if a specific lesson is accessible to the student
 * 
 * Access priority (first match wins):
 * 1. Full-course purchase → always accessible
 * 2. Free preview lesson + user is authenticated → accessible (teaser content)
 * 3. Lesson ID is in the accessible set → purchased phase
 * 4. Everything else → locked
 * 
 * @param {object} accessMap - The fetched access map
 * @param {string} lessonId - Lesson ID (e.g., 'p1-w1-l1')
 * @param {boolean} [isFreePreview=false] - Whether the lesson is a free preview
 * @returns {boolean} Whether the lesson is accessible
 */
export const canAccessLesson = (accessMap, lessonId, isFreePreview = false) => {
  if (!accessMap || !lessonId) return false;

  /*
   * Full-course students get everything — no further checks needed
   */
  if (accessMap.isFullCourse) return true;

  /*
   * Free preview lessons are accessible to ANY authenticated user.
   * This is the teaser strategy — show free content to drive purchases.
   * The access map exists (user is authenticated) so free previews unlock.
   */
  if (isFreePreview) return true;

  /*
   * For individual-phase students, check if this lesson belongs to a purchased phase
   */
  return accessMap.accessibleLessons?.includes(lessonId) || false;
};

/**
 * Get the list of locked phase IDs that the student hasn't purchased
 * Useful for showing "Buy Phase X" CTAs on locked overlays
 * 
 * @param {object} accessMap - The fetched access map
 * @param {Array} allPhaseIds - All available phase IDs in the course
 * @returns {Array} Array of locked phase IDs
 */
export const getLockedPhases = (accessMap, allPhaseIds = []) => {
  if (!accessMap) return allPhaseIds;
  if (accessMap.isFullCourse) return [];
  return allPhaseIds.filter((id) => !accessMap.accessiblePhases?.includes(id));
};

/**
 * Determine which phase a lesson belongs to by parsing the lesson ID
 * Lesson ID format: p{phaseNumber}-w{weekNumber}-l{lessonNumber}
 * Example: 'p3-w15-l2' → phase 3
 * 
 * @param {string} lessonId - Lesson ID string
 * @returns {number|null} Phase number or null if unparseable
 */
export const getPhaseNumberFromLessonId = (lessonId) => {
  if (!lessonId) return null;
  const match = lessonId.match(/^p(\d+)-/);
  return match ? parseInt(match[1], 10) : null;
};