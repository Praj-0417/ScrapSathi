'use strict';

const multer = require('multer');
const { ApiError } = require('../utils/ApiError');
const { APP_CONSTANTS, HTTP_STATUS } = require('../constants');

const storage = multer.memoryStorage();

const fileFilter = (_req, file, callback) => {
  if (!APP_CONSTANTS.STORAGE.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return callback(
      new ApiError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: `Invalid file type "${file.mimetype}". Allowed: JPEG, PNG, WebP.`,
      }),
      false,
    );
  }
  callback(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: APP_CONSTANTS.STORAGE.MAX_FILE_SIZE_BYTES },
  fileFilter,
});

module.exports = upload;
