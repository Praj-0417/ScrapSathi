'use strict';

class ApiError extends Error {
  constructor(errorCodeOrStatusCode, messageOrErrors = [], stack = '') {
    if (typeof errorCodeOrStatusCode === 'object' && errorCodeOrStatusCode !== null) {
      super(errorCodeOrStatusCode.message || 'An error occurred');
      this.statusCode = errorCodeOrStatusCode.statusCode || 500;
      this.message = errorCodeOrStatusCode.message || 'An error occurred';
      this.errors = Array.isArray(messageOrErrors) ? messageOrErrors : [];
    } else {
      super(typeof messageOrErrors === 'string' ? messageOrErrors : 'An error occurred');
      this.statusCode = Number(errorCodeOrStatusCode) || 500;
      this.message = typeof messageOrErrors === 'string' ? messageOrErrors : 'An error occurred';
      this.errors = [];
    }

    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = { ApiError };
