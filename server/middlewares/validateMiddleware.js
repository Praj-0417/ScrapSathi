'use strict';

const { ApiError } = require('../utils/ApiError');
const { ERROR_CODES } = require('../constants');

const validate = (schema) => (req, _res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    const errors = (error.errors || []).map((err) => ({
      path: err.path.join('.'),
      message: err.message,
    }));
    next(new ApiError(ERROR_CODES.VALIDATION_ERROR, errors));
  }
};

module.exports = validate;
