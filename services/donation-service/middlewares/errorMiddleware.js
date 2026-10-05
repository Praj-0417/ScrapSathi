'use strict';

const { ApiError } = require('../utils/ApiError');
const { ERROR_CODES, HTTP_STATUS } = require('../constants');
const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  if (res.headersSent) {
    return;
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
      meta: {},
      errors: err.errors || [],
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    });
  }

  // JSON Syntax Error (malformed body)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Malformed JSON payload in request body.',
      data: null,
      meta: {},
      errors: [],
    });
  }

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: `Invalid format for field "${err.path}": "${err.value}".`,
      data: null,
      meta: {},
      errors: [{ path: err.path, message: `Invalid ${err.kind || 'ObjectId'}` }],
    });
  }

  // Mongoose Schema Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors || {}).map((e) => ({
      path: e.path,
      message: e.message,
    }));
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed.',
      data: null,
      meta: {},
      errors,
    });
  }

  // MongoDB Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const duplicateFields = Object.keys(err.keyValue || {}).join(', ');
    return res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      message: `Duplicate value entered for field: ${duplicateFields}.`,
      data: null,
      meta: {},
      errors: [],
    });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid or malformed authentication token.',
      data: null,
      meta: {},
      errors: [],
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Authentication token has expired. Please log in again.',
      data: null,
      meta: {},
      errors: [],
    });
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'File too large. Maximum allowed size is 5MB.',
      data: null,
      meta: {},
      errors: [],
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: `Unexpected file field: "${err.field}".`,
      data: null,
      meta: {},
      errors: [],
    });
  }

  logger.error('Unhandled request error', {
    error: err,
    method: req.method,
    path: req.originalUrl,
    requestId: req.context?.requestId,
  });

  return res.status(ERROR_CODES.INTERNAL_SERVER_ERROR.statusCode).json({
    success: false,
    message: ERROR_CODES.INTERNAL_SERVER_ERROR.message,
    data: null,
    meta: {},
    errors: [],
  });
};

module.exports = errorHandler;
