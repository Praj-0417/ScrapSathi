'use strict';

const APP_CONSTANTS = Object.freeze({
  AUTH: Object.freeze({
    BCRYPT_ROUNDS: 12,
    OTP_BCRYPT_ROUNDS: 10,
    OTP_LENGTH: 6,
    OTP_EXPIRATION_MS: 10 * 60 * 1000, // 10 minutes
    OTP_EXPIRATION_MINUTES: 10,
    ADMIN_JWT_EXPIRES_IN: '8h',
  }),

  PAGINATION: Object.freeze({
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    PICKUP_DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  }),

  RATE_LIMIT: Object.freeze({
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
  }),

  STORAGE: Object.freeze({
    CLOUDINARY_PICKUP_FOLDER: 'scrapsaathi/pickups',
    CLOUDINARY_PROFILE_FOLDER: 'scrapsaathi/profiles',
    MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5 MB
    ALLOWED_IMAGE_TYPES: Object.freeze(['image/jpeg', 'image/png', 'image/webp', 'image/jpg']),
  }),

  VALIDATION: Object.freeze({
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 80,
    PHONE_MIN_LENGTH: 10,
    PHONE_MAX_LENGTH: 15,
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128,
    ADDRESS_MAX_LENGTH: 500,
    MESSAGE_MAX_LENGTH: 500,
    MAX_WASTE_DETAILS: 10,
  }),
});

module.exports = APP_CONSTANTS;
