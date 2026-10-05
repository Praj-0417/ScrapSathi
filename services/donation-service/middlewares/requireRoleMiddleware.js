'use strict';

const { ApiError } = require('../utils/ApiError');
const { ERROR_CODES } = require('../constants');

/**
 * RBAC middleware factory.
 * Usage: router.use(requireRole('admin'))
 *        router.use(requireRole('waste-collector'))
 *
 * Must be used AFTER `protect` middleware so req.user is available.
 */
const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user) {
    return next(new ApiError(ERROR_CODES.UNAUTHORIZED));
  }

  const userRole = req.user.role;
  const userType = req.user.userType;

  // Check against role (admin) OR userType (waste-collector)
  const hasRole = roles.some(
    (r) => userRole === r || userType === r,
  );

  if (!hasRole) {
    return next(new ApiError(ERROR_CODES.FORBIDDEN));
  }

  return next();
};

module.exports = { requireRole };
