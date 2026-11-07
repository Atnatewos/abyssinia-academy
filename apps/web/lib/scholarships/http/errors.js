/**
 * @fileoverview Scholarship HTTP Error Translation
 *
 * Converts service-layer errors (thrown as Error objects with a `.code`
 * property) into standardized HTTP responses. Every handler uses
 * `handleError(error, res)` so status codes and error shapes are
 * consistent across all 11 scholarship endpoints.
 *
 * Error code → HTTP status mapping is centralized here. Service throws
 * domain errors like `NOT_FOUND` or `QUOTA_EXCEEDED`; this module knows
 * that NOT_FOUND becomes 404 and QUOTA_EXCEEDED becomes 409.
 *
 * Path: apps/web/lib/scholarships/http/errors.js
 */

/* ============================================================================
 * ERROR → STATUS CODE MAP
 * ==========================================================================
 * Every code thrown by `lib/scholarships/service.js` and
 * `lib/scholarships/validation.js` must appear here. Unknown codes fall
 * through to 500 with a generic message.
 * ========================================================================== */

const ERROR_STATUS_MAP = {
  /* 400 — bad request / validation */
  VALIDATION_ERROR: 400,
  INVALID_STATE: 400,
  REASON_REQUIRED: 400,
  CAMPAIGN_INACTIVE: 400,
  CAMPAIGN_CLOSED: 400,

  /* 401 — auth */
  UNAUTHENTICATED: 401,

  /* 403 — permission */
  FORBIDDEN: 403,
  USER_BANNED: 403,
  REVOKE_DISABLED: 403,

  /* 404 — not found */
  NOT_FOUND: 404,
  USER_NOT_FOUND: 404,

  /* 409 — conflict */
  ALREADY_APPLIED: 409,
  QUOTA_EXCEEDED: 409,
  
  // scholarship errors 
  CAMPAIGN_HAS_APPLICATIONS: 409,

  /* 429 — rate limited */
  RATE_LIMITED: 429,
};

/**
 * Translate a thrown error into an HTTP response.
 *
 * Behavior:
 *   - If `error.code` maps to a status, use it + the error's message.
 *   - If the error has `.errors` (validation array), include it as `details`.
 *   - Otherwise, return 500 with a generic message and log the full error.
 *
 * @param {Error & { code?: string, errors?: string[] }} error
 * @param {import('next').NextApiResponse} res
 */
export const handleError = (error, res) => {
  const code = error?.code || 'INTERNAL_ERROR';
  const status = ERROR_STATUS_MAP[code] || 500;
  const message =
    status === 500
      ? 'An unexpected error occurred. Please try again.'
      : error?.message || 'Request failed.';

  /*
   * Log unexpected 500s with the stack for debugging. Expected 4xx
   * errors are noisy in production logs so we skip them.
   */
  if (status === 500) {
    console.error('[scholarships/http] unhandled error:', {
      code,
      message: error?.message,
      stack: error?.stack,
    });
  }

  const payload = {
    success: false,
    code,
    message,
  };
  if (Array.isArray(error?.errors) && error.errors.length > 0) {
    payload.details = error.errors;
  }

  /*
   * Guard against double-send: if the handler already wrote a response
   * before throwing, `res.headersSent` will be true. Log and bail.
   */
  if (res.headersSent) {
    console.error('[scholarships/http] headers already sent — cannot send error');
    return;
  }

  return res.status(status).json(payload);
};

/**
 * Build a domain error with an explicit code. Used by handlers when they
 * need to fail before reaching the service layer (e.g. missing body).
 *
 * @param {string} code
 * @param {string} message
 * @param {string[]} [details]
 * @returns {Error & { code: string, errors?: string[] }}
 */
export const domainError = (code, message, details) => {
  const error = new Error(message);
  error.code = code;
  if (details && details.length > 0) {
    error.errors = details;
  }
  return error;
};