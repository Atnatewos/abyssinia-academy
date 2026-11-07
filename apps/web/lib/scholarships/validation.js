/**
 * @fileoverview Scholarship Validation Helpers
 *
 * Pure validation functions — no database access, no side effects.
 * Every function returns { valid: boolean, errors: string[] } so callers
 * can aggregate errors before deciding what to do.
 *
 * Document types are validated against the platform registry defined in
 * packages/shared/config/scholarships.config.js → documentTypes. Adding
 * or removing a type there is a config edit; no code changes needed.
 *
 * Path: apps/web/lib/scholarships/validation.js
 */

import {
  getScholarshipDefaults,
  getScholarshipAllowedPhaseIds,
  getScholarshipDocumentTypes,
} from '../config';

/* ============================================================================
 * MOTIVATION
 * ========================================================================== */

export const validateMotivation = (motivation) => {
  const errors = [];
  const defaults = getScholarshipDefaults();

  if (typeof motivation !== 'string' || !motivation.trim()) {
    errors.push('Motivation statement is required.');
    return { valid: false, errors };
  }

  const trimmed = motivation.trim();
  const length = trimmed.length;

  if (length < defaults.motivationMinChars) {
    errors.push(
      `Motivation must be at least ${defaults.motivationMinChars} characters (you entered ${length}).`
    );
  }
  if (length > defaults.motivationMaxChars) {
    errors.push(
      `Motivation cannot exceed ${defaults.motivationMaxChars} characters (you entered ${length}).`
    );
  }

  return { valid: errors.length === 0, errors };
};

/* ============================================================================
 * CAMPAIGN GRANT CONFIG
 * ========================================================================== */

export const validateGrantConfig = (grant) => {
  const errors = [];
  const { grantsFullCourse, grantsPhases } = grant || {};

  const hasFullCourse = grantsFullCourse === true;
  const hasPhases = Array.isArray(grantsPhases) && grantsPhases.length > 0;

  if (!hasFullCourse && !hasPhases) {
    errors.push(
      'Campaign must grant either full course access or at least one specific phase.'
    );
    return { valid: false, errors };
  }

  if (hasPhases) {
    const allowed = new Set(getScholarshipAllowedPhaseIds());
    const invalid = grantsPhases.filter((p) => !allowed.has(p));
    if (invalid.length > 0) {
      errors.push(
        `Invalid phase IDs: ${invalid.join(', ')}. Allowed: ${[...allowed].join(', ')}.`
      );
    }

    const deduped = new Set(grantsPhases);
    if (deduped.size !== grantsPhases.length) {
      errors.push('Duplicate phase IDs in grantsPhases.');
    }
  }

  return { valid: errors.length === 0, errors };
};

/* ============================================================================
 * REQUIRED DOCUMENTS
 * ==========================================================================
 * The campaign's required_documents array is the source of truth for what
 * an applicant must submit. Every entry must reference a document type
 * that exists in the platform registry (scholarshipsConfig.documentTypes).
 * Adding a new type to the registry immediately makes it available here.
 * ========================================================================== */

/**
 * Validate the `requiredDocuments` array from a campaign payload.
 *
 * @param {Array<{type: string, required?: boolean}>|undefined|null} docs
 * @returns {{ valid: boolean, errors: string[] }}
 */
export const validateRequiredDocuments = (docs) => {
  const errors = [];
  if (docs === undefined || docs === null) {
    return { valid: true, errors: [] };
  }
  if (!Array.isArray(docs)) {
    errors.push('requiredDocuments must be an array.');
    return { valid: false, errors };
  }

  const registry = getScholarshipDocumentTypes();
  const registered = new Set(Object.keys(registry));
  const seen = new Set();

  for (const doc of docs) {
    if (!doc || typeof doc !== 'object') {
      errors.push('Each document requirement must be an object.');
      continue;
    }
    if (!doc.type || typeof doc.type !== 'string') {
      errors.push('Each document requirement must have a string `type`.');
      continue;
    }
    if (!registered.has(doc.type)) {
      errors.push(
        `Unknown document type: "${doc.type}". Available types: ${[...registered].join(', ')}.`
      );
    }
    if (seen.has(doc.type)) {
      errors.push(`Duplicate document type: "${doc.type}".`);
    }
    seen.add(doc.type);

    if (doc.required !== undefined && typeof doc.required !== 'boolean') {
      errors.push(`Document "${doc.type}" must have a boolean \`required\` flag.`);
    }
  }

  return { valid: errors.length === 0, errors };
};

/* ============================================================================
 * CAMPAIGN PAYLOAD
 * ========================================================================== */

export const validateCampaignPayload = (payload) => {
  const errors = [];
  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['Campaign payload is required.'] };
  }

  if (!payload.slug || typeof payload.slug !== 'string') {
    errors.push('Slug is required.');
  } else if (!/^[a-z0-9][a-z0-9-]{1,78}[a-z0-9]$/.test(payload.slug)) {
    errors.push(
      'Slug must be 3-80 chars, lowercase letters/digits/hyphens, and start+end with a letter or digit.'
    );
  }

  if (!payload.name || typeof payload.name !== 'string') {
    errors.push('Name is required.');
  } else if (payload.name.trim().length < 3) {
    errors.push('Name must be at least 3 characters.');
  } else if (payload.name.length > 200) {
    errors.push('Name cannot exceed 200 characters.');
  }

  if (payload.nameAm !== undefined && payload.nameAm !== null) {
    if (typeof payload.nameAm !== 'string') {
      errors.push('Amharic name must be a string.');
    } else if (payload.nameAm.length > 200) {
      errors.push('Amharic name cannot exceed 200 characters.');
    }
  }

  const grantResult = validateGrantConfig({
    grantsFullCourse: payload.grantsFullCourse === true,
    grantsPhases: payload.grantsPhases || null,
  });
  if (!grantResult.valid) errors.push(...grantResult.errors);

  const fee = Number(payload.registrationFeeETB);
  if (!Number.isFinite(fee) || fee < 0) {
    errors.push('Registration fee must be a non-negative number.');
  }

  const quota = Number(payload.quota);
  if (!Number.isInteger(quota) || quota < 1) {
    errors.push('Quota must be a positive integer.');
  }

  if (payload.applicationsCloseAt) {
    const openAt = payload.applicationsOpenAt
      ? new Date(payload.applicationsOpenAt)
      : new Date();
    const closeAt = new Date(payload.applicationsCloseAt);
    if (Number.isNaN(closeAt.getTime())) {
      errors.push('Application close date is invalid.');
    } else if (closeAt <= openAt) {
      errors.push('Application close date must be after the open date.');
    }
  }

  const docsResult = validateRequiredDocuments(payload.requiredDocuments);
  if (!docsResult.valid) errors.push(...docsResult.errors);

  return { valid: errors.length === 0, errors };
};

/* ============================================================================
 * DOCUMENT UPLOADS (APPLICANT SIDE)
 * ========================================================================== */

export const validateDocumentUploads = (documents) => {
  const errors = [];
  const defaults = getScholarshipDefaults();
  const registry = getScholarshipDocumentTypes();
  const registered = new Set(Object.keys(registry));

  if (!Array.isArray(documents)) {
    errors.push('documents must be an array.');
    return { valid: false, errors };
  }

  if (documents.length > defaults.maxDocumentsPerApplication) {
    errors.push(
      `At most ${defaults.maxDocumentsPerApplication} documents allowed (you provided ${documents.length}).`
    );
  }

  const allowedMimes = new Set(defaults.allowedDocumentTypes);
  const seenTypes = new Set();

  for (const doc of documents) {
    if (!doc || typeof doc !== 'object') {
      errors.push('Each document must be an object.');
      continue;
    }
    if (!registered.has(doc.type)) {
      errors.push(`Unknown document type: ${doc.type}.`);
    }
    if (seenTypes.has(doc.type)) {
      errors.push(`Duplicate document type: ${doc.type}.`);
    }
    seenTypes.add(doc.type);

    if (!doc.url || typeof doc.url !== 'string') {
      errors.push(`Document ${doc.type || '(unknown)'} is missing its URL.`);
    }
    if (doc.mimetype && !allowedMimes.has(doc.mimetype)) {
      errors.push(
        `Document ${doc.type} has disallowed type: ${doc.mimetype}. Allowed: ${[...allowedMimes].join(', ')}.`
      );
    }
    if (doc.size && doc.size > defaults.maxDocumentSizeBytes) {
      const maxMB = Math.round(defaults.maxDocumentSizeBytes / (1024 * 1024));
      errors.push(`Document ${doc.type} exceeds ${maxMB} MB.`);
    }
  }

  return { valid: errors.length === 0, errors };
};

/* ============================================================================
 * APPLICATION PAYLOAD
 * ========================================================================== */

export const validateApplicationPayload = (payload) => {
  const errors = [];
  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['Application payload is required.'] };
  }

  const motivationResult = validateMotivation(payload.motivation);
  if (!motivationResult.valid) errors.push(...motivationResult.errors);

  if (payload.documents !== undefined) {
    const docsResult = validateDocumentUploads(payload.documents);
    if (!docsResult.valid) errors.push(...docsResult.errors);
  }

  return { valid: errors.length === 0, errors };
};

/* ============================================================================
 * QUOTA
 * ========================================================================== */

export const checkCampaignQuota = (campaign, allowOverride = false) => {
  const errors = [];
  if (!campaign) {
    return { valid: false, errors: ['Campaign not provided.'] };
  }
  if (allowOverride) return { valid: true, errors: [] };

  const quota = Number(campaign.quota);
  const approved = Number(campaign.approved_count);

  if (!Number.isFinite(quota) || !Number.isFinite(approved)) {
    errors.push('Campaign quota values are invalid.');
    return { valid: false, errors };
  }
  if (approved >= quota) {
    errors.push(
      `Campaign has reached its quota (${approved}/${quota}). Approval is not possible.`
    );
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
};