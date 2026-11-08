/**
 * @fileoverview Reseller Error Classes
 *
 * Domain-specific error types for the reseller module. These extend the
 * base Error class and add a `statusCode` property so consumers (Express,
 * Next.js) can translate them into HTTP responses consistently.
 *
 * Design principle: the shared module should be able to throw these without
 * depending on any framework-specific error implementation.
 *
 * Path: packages/shared/reseller/errors.js
 */

/**
 * Base error for all reseller operations.
 * All reseller errors extend this so callers can catch by base class.
 */
class ResellerError extends Error {
  constructor(message, statusCode = 500, code = 'RESELLER_ERROR') {
    super(message);
    this.name = 'ResellerError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    /* Preserve stack trace in V8 */
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/** 400 — Bad input, invalid state */
class ResellerValidationError extends ResellerError {
  constructor(message, code = 'RESELLER_VALIDATION_ERROR') {
    super(message, 400, code);
    this.name = 'ResellerValidationError';
  }
}

/** 403 — Action not permitted for this user */
class ResellerForbiddenError extends ResellerError {
  constructor(message, code = 'RESELLER_FORBIDDEN') {
    super(message, 403, code);
    this.name = 'ResellerForbiddenError';
  }
}

/** 404 — Reseller or related resource not found */
class ResellerNotFoundError extends ResellerError {
  constructor(message, code = 'RESELLER_NOT_FOUND') {
    super(message, 404, code);
    this.name = 'ResellerNotFoundError';
  }
}

/** 409 — Conflict: duplicate code, already exists, concurrent modification */
class ResellerConflictError extends ResellerError {
  constructor(message, code = 'RESELLER_CONFLICT') {
    super(message, 409, code);
    this.name = 'ResellerConflictError';
  }
}

/** 429 — Rate limit exceeded or cap reached */
class ResellerLimitError extends ResellerError {
  constructor(message, code = 'RESELLER_LIMIT_EXCEEDED') {
    super(message, 429, code);
    this.name = 'ResellerLimitError';
  }
}

module.exports = {
  ResellerError,
  ResellerValidationError,
  ResellerForbiddenError,
  ResellerNotFoundError,
  ResellerConflictError,
  ResellerLimitError,
};