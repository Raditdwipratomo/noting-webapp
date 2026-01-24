class AppError extends Error {
  constructor(message, statusCode, errorCode = null, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Bad Request Error (400)
 */
class BadRequestError extends AppError {
  constructor(message = "Bad Request", errorCode = "BAD_REQUEST") {
    super(message, 400, errorCode);
  }
}

/**
 * Unauthorized Error (401)
 */
class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", errorCode = "UNAUTHORIZED") {
    super(message, 401, errorCode);
  }
}

/**
 * Forbidden Error (403)
 */
class ForbiddenError extends AppError {
  constructor(message = "Forbidden", errorCode = "FORBIDDEN") {
    super(message, 403, errorCode);
  }
}

/**
 * Not Found Error (404)
 */
class NotFoundError extends AppError {
  constructor(message = "Resource not found", errorCode = "NOT_FOUND") {
    super(message, 404, errorCode);
  }
}

/**
 * Conflict Error (409)
 */
class ConflictError extends AppError {
  constructor(message = "Conflict", errorCode = "CONFLICT") {
    super(message, 409, errorCode);
  }
}

/**
 * Validation Error (422)
 */
class ValidationError extends AppError {
  constructor(
    message = "Validation failed",
    errors = [],
    errorCode = "VALIDATION_ERROR",
  ) {
    super(message, 422, errorCode);
    this.errors = errors;
  }
}

/**
 * Internal Server Error (500)
 */
class InternalServerError extends AppError {
  constructor(
    message = "Internal server error",
    errorCode = "INTERNAL_SERVER_ERROR",
  ) {
    super(message, 500, errorCode, false); // Not operational
  }
}

/**
 * Database Error (500)
 */
class DatabaseError extends AppError {
  constructor(message = "Database error", errorCode = "DATABASE_ERROR") {
    super(message, 500, errorCode, false);
  }
}

/**
 * Too Many Requests Error (429)
 */
class TooManyRequestsError extends AppError {
  constructor(message = "Too many requests", errorCode = "TOO_MANY_REQUESTS") {
    super(message, 429, errorCode);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,
  DatabaseError,
  TooManyRequestsError,
};
