'use strict';

const HTTP_STATUS = require('./httpStatus');

const ERROR_CODES = Object.freeze({
  // General Errors
  INTERNAL_SERVER_ERROR: Object.freeze({ statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR, message: 'Internal Server Error' }),
  NOT_FOUND: Object.freeze({ statusCode: HTTP_STATUS.NOT_FOUND, message: 'Not Found' }),
  BAD_REQUEST: Object.freeze({ statusCode: HTTP_STATUS.BAD_REQUEST, message: 'Bad Request' }),
  UNAUTHORIZED: Object.freeze({ statusCode: HTTP_STATUS.UNAUTHORIZED, message: 'Unauthorized' }),
  FORBIDDEN: Object.freeze({ statusCode: HTTP_STATUS.FORBIDDEN, message: 'Forbidden' }),
  CONFLICT: Object.freeze({ statusCode: HTTP_STATUS.CONFLICT, message: 'Conflict' }),
  TOO_MANY_REQUESTS: Object.freeze({ statusCode: HTTP_STATUS.TOO_MANY_REQUESTS, message: 'Too many requests, please try again later' }),

  // Auth & User Errors
  USER_ALREADY_EXISTS: Object.freeze({ statusCode: HTTP_STATUS.BAD_REQUEST, message: 'User with this email already exists' }),
  INVALID_CREDENTIALS: Object.freeze({ statusCode: HTTP_STATUS.UNAUTHORIZED, message: 'Invalid email or password' }),
  TERMS_NOT_ACCEPTED: Object.freeze({ statusCode: HTTP_STATUS.BAD_REQUEST, message: 'You must accept the Terms and Conditions to register' }),
  USER_NOT_FOUND: Object.freeze({ statusCode: HTTP_STATUS.NOT_FOUND, message: 'User not found' }),
  PROFILE_NOT_FOUND: Object.freeze({ statusCode: HTTP_STATUS.NOT_FOUND, message: 'Profile not found' }),

  // OTP Errors
  INVALID_OTP: Object.freeze({ statusCode: HTTP_STATUS.BAD_REQUEST, message: 'Invalid OTP' }),
  OTP_SEND_FAILED: Object.freeze({ statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR, message: 'Failed to send OTP' }),
  OTP_EXPIRED: Object.freeze({ statusCode: HTTP_STATUS.BAD_REQUEST, message: 'OTP has expired' }),

  // Validation Errors
  VALIDATION_ERROR: Object.freeze({ statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY, message: 'Validation Error' }),

  // Pickup Errors
  PICKUP_NOT_FOUND: Object.freeze({ statusCode: HTTP_STATUS.NOT_FOUND, message: 'Pickup request not found' }),
  PICKUP_ALREADY_ACCEPTED: Object.freeze({ statusCode: HTTP_STATUS.CONFLICT, message: 'This pickup request has already been accepted or does not exist.' }),
  PICKUP_INVALID_CANCEL: Object.freeze({ statusCode: HTTP_STATUS.BAD_REQUEST, message: 'Cannot cancel this pickup. It may not exist, not belong to you, or already be completed.' }),
  PICKUP_CANCEL_NOT_ACCEPTED: Object.freeze({ statusCode: HTTP_STATUS.BAD_REQUEST, message: 'You can only cancel pickups that are in accepted state.' }),
  PICKUP_COMPLETE_NOT_ACCEPTED: Object.freeze({ statusCode: HTTP_STATUS.BAD_REQUEST, message: 'Pickup must be in accepted state before marking as completed.' }),
  IMAGE_UPLOAD_FAILED: Object.freeze({ statusCode: HTTP_STATUS.BAD_REQUEST, message: 'Image upload failed' }),
});

module.exports = ERROR_CODES;
