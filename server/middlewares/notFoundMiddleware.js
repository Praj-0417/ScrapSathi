'use strict';

const HTTP_STATUS = require('../constants/httpStatus');
const { failure } = require('../utils/apiResponse');

const notFound = (req, res) => failure(res, {
  statusCode: HTTP_STATUS.NOT_FOUND,
  message: `Route not found: ${req.method} ${req.originalUrl}`,
});

module.exports = notFound;
