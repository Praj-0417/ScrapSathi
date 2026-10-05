const jwt = require('jsonwebtoken');

class ApiError extends Error {
  constructor(statusCode, message = 'Something went wrong', errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

const httpStatus = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

const errorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  CONFLICT_STATE: 'CONFLICT_STATE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
};

const logger = {
  info: (msg, meta) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, meta ? JSON.stringify(meta) : ''),
  warn: (msg, meta) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, meta ? JSON.stringify(meta) : ''),
  error: (msg, meta) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, meta ? JSON.stringify(meta) : ''),
  debug: (msg, meta) => console.debug(`[DEBUG] ${new Date().toISOString()} - ${msg}`, meta ? JSON.stringify(meta) : ''),
};

/**
 * Standardized JWT verification middleware across microservices
 */
const verifyToken = (secret) => {
  return (req, res, next) => {
    try {
      let token = req.cookies?.token;
      if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
      }

      // Also support headers passed from API Gateway
      if (!token && req.headers['x-user-id']) {
        req.user = {
          _id: req.headers['x-user-id'],
          id: req.headers['x-user-id'],
          email: req.headers['x-user-email'],
          role: req.headers['x-user-role'],
          userType: req.headers['x-user-role'],
        };
        return next();
      }

      if (!token) {
        return next(new ApiError(httpStatus.UNAUTHORIZED, 'Authentication token missing'));
      }

      const decoded = jwt.verify(token, secret || process.env.JWT_SECRET || 'scrapsathi-jwt-secret-key-32chars');
      req.user = decoded;
      next();
    } catch (err) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired authentication token'));
    }
  };
};

/**
 * Role-based access control guard
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    const role = req.user?.role || req.user?.userType;
    if (!role || !roles.includes(role)) {
      return next(new ApiError(httpStatus.FORBIDDEN, `Access denied for role: ${role || 'unknown'}`));
    }
    next();
  };
};

/**
 * Standard centralized error middleware for microservice express apps
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal Server Error';

  logger.error(`Error processing ${req.method} ${req.originalUrl}: ${message}`, {
    statusCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || [],
    errorCode: err.errorCode || errorCodes.INTERNAL_ERROR,
    data: null,
  });
};

module.exports = {
  ApiError,
  ApiResponse,
  asyncHandler,
  httpStatus,
  errorCodes,
  logger,
  verifyToken,
  requireRole,
  errorHandler,
};
