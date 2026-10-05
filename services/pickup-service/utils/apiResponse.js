'use strict';

const HTTP_STATUS = require('../constants/httpStatus');

const success = (res, {
  statusCode = HTTP_STATUS.OK,
  message = 'OK',
  data = null,
  meta = {},
} = {}) => res.status(statusCode).json({
  success: true,
  message,
  data,
  meta,
  errors: [],
});

const failure = (res, {
  statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  message = 'Internal Server Error',
  errors = [],
  meta = {},
} = {}) => res.status(statusCode).json({
  success: false,
  message,
  data: null,
  meta,
  errors,
});

module.exports = {
  success,
  failure,
};
