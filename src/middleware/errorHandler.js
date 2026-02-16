// middleware/errorHandler.js
const { AppError } = require("./errors");
// const logger = require("../config/logger"); // Optional: untuk logging

/**
 * Global Error Handler Middleware
 * Menangani semua error dan mengirim response yang sesuai
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log error untuk debugging
  if (process.env.NODE_ENV === "development") {
    console.error("Error Details:", {
      name: err.name,
      message: err.message,
      statusCode: err.statusCode,
      errorCode: err.errorCode,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userId: req.user?.user_id || "unauthenticated",
    });
  }

  // Log error ke file/service (production)
  if (process.env.NODE_ENV === "production" && !err.isOperational) {
    // Log critical errors
    console.error("CRITICAL ERROR:", {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
    });
    // You can integrate with logging services like Winston, Sentry, etc.
  }

  // Handle Sequelize/Database Errors
  if (err.name === "SequelizeValidationError") {
    error.message = "Validation Error";
    error.statusCode = 422;
    error.errorCode = "VALIDATION_ERROR";
    error.errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    error.message = "Data sudah ada";
    error.statusCode = 409;
    error.errorCode = "DUPLICATE_ENTRY";
    error.errors = err.errors.map((e) => ({
      field: e.path,
      message: `${e.path} sudah digunakan`,
    }));
  }

  if (err.name === "SequelizeForeignKeyConstraintError") {
    error.message = "Referensi data tidak valid";
    error.statusCode = 400;
    error.errorCode = "FOREIGN_KEY_CONSTRAINT";
  }

  if (err.name === "SequelizeDatabaseError") {
    error.message = "Database error";
    error.statusCode = 500;
    error.errorCode = "DATABASE_ERROR";
    error.isOperational = false;
  }

  // Handle JWT Errors
  if (err.name === "JsonWebTokenError") {
    error.message = "Token tidak valid";
    error.statusCode = 401;
    error.errorCode = "INVALID_TOKEN";
  }

  if (err.name === "TokenExpiredError") {
    error.message = "Token telah kadaluarsa";
    error.statusCode = 401;
    error.errorCode = "TOKEN_EXPIRED";
  }

  // Handle Multer Errors (file upload)
  if (err.name === "MulterError") {
    error.message = err.message;
    error.statusCode = 400;
    error.errorCode = "FILE_UPLOAD_ERROR";
  }

  // Default error values
  const statusCode = error.statusCode || 500;
  const errorCode = error.errorCode || "INTERNAL_SERVER_ERROR";
  const status = error.status || "error";
  const message = error.message || "Terjadi kesalahan pada server";

  // Build error response
  const errorResponse = {
    success: false,
    status: status,
    statusCode: statusCode,
    errorCode: errorCode,
    message: message,
    timestamp: error.timestamp || new Date().toISOString(),
  };

  // Add validation errors if present
  if (error.errors && Array.isArray(error.errors)) {
    errorResponse.errors = error.errors;
  }

  // Add stack trace in development mode
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = error.stack;
    errorResponse.requestInfo = {
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    };
  }

  // Don't leak error details in production for non-operational errors
  if (process.env.NODE_ENV === "production" && !error.isOperational) {
    errorResponse.message = "Terjadi kesalahan pada server";
    delete errorResponse.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found Handler
 * Menangani route yang tidak ditemukan
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Route ${req.originalUrl} tidak ditemukan`,
    404,
    "ROUTE_NOT_FOUND",
  );
  next(error);
};

/**
 * Async Handler Wrapper
 * Menangkap error dari async functions
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
