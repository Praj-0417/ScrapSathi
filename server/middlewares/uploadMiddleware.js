'use strict';

const multer = require('multer');
const { ApiError } = require('../utils/ApiError');
const { APP_CONSTANTS, HTTP_STATUS } = require('../constants');

const storage = multer.memoryStorage();

/**
 * Verify genuine file signatures (magic bytes) to prevent executable payload injection (Caveat #17).
 */
const isValidImageSignature = (buffer) => {
  if (!buffer || buffer.length < 8) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return true;
  }
  // WebP: RIFF .... WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return true;
  }

  return false;
};

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

const multerInstance = multer({
  storage,
  limits: { fileSize: APP_CONSTANTS.STORAGE.MAX_FILE_SIZE_BYTES },
  fileFilter,
});

/**
 * Middleware wrapper that enforces both MIME filtering and binary magic-byte validation
 */
const upload = {
  single: (fieldName) => (req, res, next) => {
    multerInstance.single(fieldName)(req, res, (err) => {
      if (err) return next(err);
      if (req.file?.buffer && !isValidImageSignature(req.file.buffer)) {
        return next(
          new ApiError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: 'Corrupted or spoofed image detected. File magic bytes do not match a valid image signature.',
          }),
        );
      }
      next();
    });
  },
  isValidImageSignature,
};

module.exports = upload;
