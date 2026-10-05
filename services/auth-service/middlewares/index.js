'use strict';

const authMiddleware = require('./authMiddleware');
const errorHandler = require('./errorMiddleware');
const notFound = require('./notFoundMiddleware');
const { apiRateLimit, authRateLimit } = require('./rateLimitMiddleware');
const requestContext = require('./requestContextMiddleware');
const requireRole = require('./requireRoleMiddleware');
const securityHeaders = require('./securityHeadersMiddleware');
const upload = require('./uploadMiddleware');
const validate = require('./validateMiddleware');

module.exports = {
  authMiddleware,
  errorHandler,
  notFound,
  apiRateLimit,
  authRateLimit,
  requestContext,
  requireRole,
  securityHeaders,
  upload,
  validate,
};
