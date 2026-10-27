/**
 * @fileoverview MLM Error Classes
 *
 * Minimal, self-contained error types so the shared MLM module does not
 * depend on any workspace-specific error implementation. Both Express
 * and Next.js consumers can catch these and translate to HTTP responses.
 *
 * Path: packages/shared/mlm/errors.js
 */

class MlmError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'MlmError';
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

class BadRequestError extends MlmError {
  constructor(message = 'Bad request.') {
    super(message, 400);
  }
}

class NotFoundError extends MlmError {
  constructor(message = 'Resource not found.') {
    super(message, 404);
  }
}

class ConflictError extends MlmError {
  constructor(message = 'Resource already exists.') {
    super(message, 409);
  }
}

class ForbiddenError extends MlmError {
  constructor(message = 'Access denied.') {
    super(message, 403);
  }
}

module.exports = {
  MlmError,
  BadRequestError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
};