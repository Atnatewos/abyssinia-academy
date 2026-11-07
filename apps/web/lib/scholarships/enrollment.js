/**
 * @fileoverview Scholarship Enrollment Creation
 *
 * Creates the `enrollments` row for an approved scholarship. Must run
 * inside a transaction (the caller in service.js opens one). This module
 * does NOT open its own transaction — it uses the provided client.
 *
 * Design mirrors `pages/api/admin/payments/[id]/approve.js` but with
 * three critical differences:
 *
 *   1. NO commission distribution (no sale happened)
 *   2. MERGES with existing enrollments (preserves paid progress)
 *   3. Sets `purchase_source = 'scholarship'` so reconciliation queries
 *      can separate scholarship grants from paid enrollments
 *
 * Enrollment shape must match payment-approved enrollments exactly, so
 * the portal and access-control middleware work identically.
 *
 * Path: apps/web/lib/scholarships/enrollment.js
 */

import { getScholarshipRules } from '../config';

/* ============================================================================
 * COURSE LOOKUP
 * ========================================================================== */

/**
 * Resolve the course ID for the platform's flagship course.
 * Every scholarship grants access to this course (there is only one).
 *
 * @param {import('pg').PoolClient} client - Transaction client
 * @returns {Promise<string>} Course UUID
 * @throws {Error} If the course is not found (indicates a seed issue)
 */
const resolveCourseId = async (client) => {
  const result = await client.query(
    `SELECT id FROM courses
     WHERE slug = 'fullstack-web-engineering-masterclass'
     LIMIT 1`
  );
  if (result.rows.length === 0) {
    throw new Error(
      'Flagship course not found. Ensure the courses seed has run.'
    );
  }
  return result.rows[0].id;
};

/* ============================================================================
 * EXISTING ENROLLMENT MERGE
 * ========================================================================== */

/**
 * Merge the new scholarship grant with any existing enrollment.
 *
 * Cases:
 *   - No existing enrollment → use the new grant as-is
 *   - Existing full-course → keep it (already grants everything)
 *   - Existing phases + new full-course → upgrade to full-course
 *   - Existing phases + new phases → union of both phase sets
 *
 * @param {object|null} existing - Existing enrollment row or null
 * @param {object} grant - { purchaseMode: 'full-course'|'individual-phases',
 *                           selectedPhases: string[]|null }
 * @param {boolean} mergeEnabled - From getScholarshipRules().mergeWithExistingEnrollments
 * @returns {{ purchaseMode: string, selectedPhases: string[]|null }}
 */
const mergeEnrollmentGrants = (existing, grant, mergeEnabled) => {
  if (!existing || !mergeEnabled) {
    return {
      purchaseMode: grant.purchaseMode,
      selectedPhases: grant.selectedPhases,
    };
  }

  /* If either side is full-course, the result is full-course. */
  if (existing.purchase_mode === 'full-course' || grant.purchaseMode === 'full-course') {
    return { purchaseMode: 'full-course', selectedPhases: null };
  }

  /* Both sides are individual-phases: union of the phase sets. */
  const existingPhases = Array.isArray(existing.selected_phases)
    ? existing.selected_phases
    : [];
  const grantPhases = Array.isArray(grant.selectedPhases)
    ? grant.selectedPhases
    : [];
  const unioned = Array.from(new Set([...existingPhases, ...grantPhases]));

  return {
    purchaseMode: 'individual-phases',
    selectedPhases: unioned,
  };
};

/* ============================================================================
 * ENROLLMENT CREATION
 * ========================================================================== */

/**
 * Create or update the enrollment row for an approved scholarship.
 *
 * MUST be called inside a transaction. The caller (service.js) is
 * responsible for BEGIN/COMMIT/ROLLBACK.
 *
 * @param {import('pg').PoolClient} client - Transaction client
 * @param {object} params
 * @param {string} params.userId - Applicant UUID
 * @param {string} params.applicationId - Scholarship application UUID
 * @param {object} params.campaign - Loaded campaign row (grants source of truth)
 * @param {number} params.registrationFeePaid - Amount actually paid (0 if free)
 * @returns {Promise<{ enrollmentId: string, merged: boolean, purchaseMode: string, selectedPhases: string[]|null }>}
 */
export const createScholarshipEnrollment = async (client, params) => {
  const { userId, applicationId, campaign, registrationFeePaid = 0 } = params;

  if (!userId || !applicationId || !campaign) {
    throw new Error(
      'createScholarshipEnrollment requires userId, applicationId, and campaign.'
    );
  }

  const rules = getScholarshipRules();
  const courseId = await resolveCourseId(client);

  /*
   * Derive the grant from the campaign row — NEVER from any request
   * payload. This is the single source of truth.
   */
  const grantsFullCourse = campaign.grants_full_course === true;
  const grantsPhases =
    Array.isArray(campaign.grants_phases) && campaign.grants_phases.length > 0
      ? campaign.grants_phases
      : null;

  const grant = grantsFullCourse
    ? { purchaseMode: 'full-course', selectedPhases: null }
    : { purchaseMode: 'individual-phases', selectedPhases: grantsPhases };

  /* Fetch any existing enrollment for this user+course. */
  const existingResult = await client.query(
    `SELECT id, purchase_mode, selected_phases, purchase_amount, purchase_source
     FROM enrollments
     WHERE user_id = $1 AND course_id = $2
     FOR UPDATE`,
    [userId, courseId]
  );
  const existing = existingResult.rows[0] || null;

  const merged = mergeEnrollmentGrants(existing, grant, rules.mergeWithExistingEnrollments);

  /*
   * Upsert the enrollment. If a row exists, we merge and update. If not,
   * we insert a fresh scholarship row.
   *
   * Note: `purchase_source` is preserved when the existing source is
   * 'payment' or 'admin_manual' — a scholarship should never downgrade
   * an existing paid enrollment's provenance. But we still ADD the
   * scholarship linkage so the audit trail shows BOTH sources.
   */
  let enrollmentId;
  let wasMerged = false;

  if (existing) {
    /* Update the existing row with the merged grant. */
    await client.query(
      `UPDATE enrollments
       SET purchase_mode = $2,
           selected_phases = $3,
           purchase_amount = COALESCE(purchase_amount, 0) + $4,
           scholarship_application_id = $5,
           revoked_at = NULL,
           revocation_reason = NULL
       WHERE id = $1`,
      [
        existing.id,
        merged.purchaseMode,
        merged.selectedPhases,
        registrationFeePaid,
        applicationId,
      ]
    );
    enrollmentId = existing.id;
    wasMerged = true;
  } else {
    /* Insert a fresh scholarship enrollment. */
    const insertResult = await client.query(
      `INSERT INTO enrollments (
         user_id, course_id, purchase_mode, selected_phases,
         purchase_amount, purchase_source, scholarship_application_id,
         enrolled_at
       )
       VALUES ($1, $2, $3, $4, $5, 'scholarship', $6, CURRENT_TIMESTAMP)
       RETURNING id`,
      [
        userId,
        courseId,
        merged.purchaseMode,
        merged.selectedPhases,
        registrationFeePaid,
        applicationId,
      ]
    );
    enrollmentId = insertResult.rows[0].id;
  }

  /*
   * Ensure a `course_progress` row exists so the portal can render
   * progress widgets. Matches the pattern in approve.js.
   */
  await client.query(
    `INSERT INTO course_progress (user_id, course_id, progress)
     VALUES ($1, $2, 0)
     ON CONFLICT (user_id, course_id) DO NOTHING`,
    [userId, courseId]
  );

  /*
   * Flip the user's flags so admin filters work instantly. Combined with
   * the partial indexes we added in Wave 1, these queries are O(log n).
   */
  await client.query(
    `UPDATE users
     SET is_enrolled = true,
         enrolled_at = COALESCE(enrolled_at, CURRENT_TIMESTAMP),
         is_scholarship_recipient = true,
         scholarship_campaign_id = $2,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [userId, campaign.id]
  );

  return {
    enrollmentId,
    merged: wasMerged,
    purchaseMode: merged.purchaseMode,
    selectedPhases: merged.selectedPhases,
  };
};

/* ============================================================================
 * ENROLLMENT REVOCATION
 * ========================================================================== */

/**
 * Revoke a scholarship enrollment.
 *
 * Behavior depends on `getScholarshipRules().revokePreservesProgress`:
 *   - true  → set `revoked_at` and `revocation_reason`, keep all data
 *   - false → hard delete the enrollment (DESTRUCTIVE, rarely desired)
 *
 * Access control (portal, progress routes) checks for `revoked_at` on
 * the enrollment row — revoked enrollments are treated as "no enrollment".
 *
 * @param {import('pg').PoolClient} client - Transaction client
 * @param {object} params
 * @param {string} params.enrollmentId
 * @param {string} params.reason
 * @returns {Promise<void>}
 */
export const revokeScholarshipEnrollment = async (client, params) => {
  const { enrollmentId, reason } = params;
  const rules = getScholarshipRules();

  if (!enrollmentId) {
    throw new Error('revokeScholarshipEnrollment requires enrollmentId.');
  }

  if (!rules.revokePreservesProgress) {
    await client.query('DELETE FROM enrollments WHERE id = $1', [enrollmentId]);
    return;
  }

  await client.query(
    `UPDATE enrollments
     SET revoked_at = CURRENT_TIMESTAMP,
         revocation_reason = $2
     WHERE id = $1`,
    [enrollmentId, reason || 'admin_revocation']
  );
};