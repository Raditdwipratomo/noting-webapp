// middleware/errors.js

/**
 * Base Application Error Class
 * Semua custom error harus extend dari class ini
 */
class AppError extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {string|null} errorCode - Custom error code untuk identifikasi
   * @param {boolean} isOperational - Apakah error ini operasional (expected) atau programming error
   */
  constructor(message, statusCode, errorCode = null, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.timestamp = new Date().toISOString();

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Bad Request Error (400)
 * Digunakan ketika request tidak valid atau parameter salah
 */
class BadRequestError extends AppError {
  constructor(message = "Bad Request", errorCode = "BAD_REQUEST") {
    super(message, 400, errorCode);
  }
}

/**
 * Unauthorized Error (401)
 * Digunakan ketika user belum login atau token tidak valid
 */
class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", errorCode = "UNAUTHORIZED") {
    super(message, 401, errorCode);
  }
}

/**
 * Forbidden Error (403)
 * Digunakan ketika user tidak memiliki akses ke resource
 */
class ForbiddenError extends AppError {
  constructor(message = "Forbidden", errorCode = "FORBIDDEN") {
    super(message, 403, errorCode);
  }
}

/**
 * Not Found Error (404)
 * Digunakan ketika resource tidak ditemukan
 */
class NotFoundError extends AppError {
  constructor(message = "Resource not found", errorCode = "NOT_FOUND") {
    super(message, 404, errorCode);
  }
}

/**
 * Conflict Error (409)
 * Digunakan ketika terjadi konflik data (misal: duplicate entry)
 */
class ConflictError extends AppError {
  constructor(message = "Conflict", errorCode = "CONFLICT") {
    super(message, 409, errorCode);
  }
}

/**
 * Validation Error (422)
 * Digunakan ketika validasi input gagal
 */
class ValidationError extends AppError {
  constructor(
    message = "Validation failed",
    errors = [],
    errorCode = "VALIDATION_ERROR"
  ) {
    super(message, 422, errorCode);
    this.errors = errors;
  }
}

/**
 * Internal Server Error (500)
 * Digunakan untuk error yang tidak diharapkan (programming errors)
 */
class InternalServerError extends AppError {
  constructor(
    message = "Internal server error",
    errorCode = "INTERNAL_SERVER_ERROR"
  ) {
    super(message, 500, errorCode, false); // Not operational
  }
}

/**
 * Database Error (500)
 * Digunakan untuk error yang terkait database
 */
class DatabaseError extends AppError {
  constructor(message = "Database error", errorCode = "DATABASE_ERROR") {
    super(message, 500, errorCode, false); // Not operational
  }
}

/**
 * Too Many Requests Error (429)
 * Digunakan untuk rate limiting
 */
class TooManyRequestsError extends AppError {
  constructor(message = "Too many requests", errorCode = "TOO_MANY_REQUESTS") {
    super(message, 429, errorCode);
  }
}

/**
 * Service Unavailable Error (503)
 * Digunakan ketika service sedang maintenance atau tidak tersedia
 */
class ServiceUnavailableError extends AppError {
  constructor(
    message = "Service unavailable",
    errorCode = "SERVICE_UNAVAILABLE"
  ) {
    super(message, 503, errorCode, false);
  }
}

/**
 * Payment Required Error (402)
 * Digunakan untuk fitur yang memerlukan pembayaran
 */
class PaymentRequiredError extends AppError {
  constructor(message = "Payment required", errorCode = "PAYMENT_REQUIRED") {
    super(message, 402, errorCode);
  }
}

/**
 * Gone Error (410)
 * Digunakan ketika resource sudah tidak tersedia lagi secara permanen
 */
class GoneError extends AppError {
  constructor(message = "Resource is gone", errorCode = "GONE") {
    super(message, 410, errorCode);
  }
}

/**
 * Unprocessable Entity Error (422)
 * Alternatif untuk ValidationError dengan semantik berbeda
 */
class UnprocessableEntityError extends AppError {
  constructor(
    message = "Unprocessable entity",
    errorCode = "UNPROCESSABLE_ENTITY"
  ) {
    super(message, 422, errorCode);
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
  ServiceUnavailableError,
  PaymentRequiredError,
  GoneError,
  UnprocessableEntityError,
};



