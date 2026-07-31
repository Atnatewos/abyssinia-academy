/**
 * @fileoverview Error Utility Classes
 * Custom error types for specific scenarios
 * Path: apps/api/src/utils/errors.js
 */

const { ApiError } = require('../middleware/error.middleware');

/**
 * 400 Bad Request Error
 */
class BadRequestError extends ApiError {
  constructor(message = 'Bad request.') {
    super(message, 400);
  }
}

/**
 * 401 Unauthorized Error
 */
class UnauthorizedError extends ApiError {
  constructor(message = 'Authentication required.') {
    super(message, 401);
  }
}

/**
 * 403 Forbidden Error
 */
class ForbiddenError extends ApiError {
  constructor(message = 'Access denied.') {
    super(message, 403);
  }
}

/**
 * 404 Not Found Error
 */
class NotFoundError extends ApiError {
  constructor(message = 'Resource not found.') {
    super(message, 404);
  }
}

/**
 * 409 Conflict Error
 */
class ConflictError extends ApiError {
  constructor(message = 'Resource already exists.') {
    super(message, 409);
  }
}

/**
 * 422 Unprocessable Entity Error
 */
class ValidationError extends ApiError {
  constructor(message = 'Validation failed.', errors = []) {
    super(message, 422);
    this.errors = errors;
  }
}

/**
 * 429 Too Many Requests Error
 */
class RateLimitError extends ApiError {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message, 429);
  }
}

module.exports = {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  RateLimitError,
};