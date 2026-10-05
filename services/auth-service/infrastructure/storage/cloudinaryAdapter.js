'use strict';

const cloudinary = require('cloudinary').v2;
const { env } = require('../../config/env');
const logger = require('../../utils/logger');

// Configure on first use (lazy singleton)
let _configured = false;

const configure = () => {
  if (_configured) return;
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  _configured = true;
};

/**
 * Upload a file buffer to Cloudinary.
 * @param {Buffer} buffer - file buffer
 * @param {string} folder - e.g. 'scrapsaathi/pickups'
 * @param {{ publicId?: string, allowedFormats?: string[] }} options
 * @returns {Promise<{ url: string, publicId: string }>}
 */
const uploadBuffer = async (buffer, folder = 'scrapsaathi', options = {}) => {
  configure();

  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: 'image',
      allowed_formats: options.allowedFormats || ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      ...(options.publicId ? { public_id: options.publicId } : {}),
    };

    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        logger.error('Cloudinary upload failed', { error });
        return reject(error);
      }
      logger.info('Cloudinary upload successful', { publicId: result.public_id, url: result.secure_url });
      resolve({ url: result.secure_url, publicId: result.public_id });
    });

    uploadStream.end(buffer);
  });
};

/**
 * Delete a file from Cloudinary by its public ID.
 * @param {string} publicId
 */
const deleteFile = async (publicId) => {
  configure();
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    logger.info('Cloudinary file deleted', { publicId, result: result.result });
    return result;
  } catch (error) {
    logger.error('Cloudinary delete failed', { publicId, error });
    throw error;
  }
};

/**
 * Returns true if Cloudinary is configured (credentials available).
 */
const isConfigured = () =>
  !!(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);

module.exports = {
  uploadBuffer,
  deleteFile,
  isConfigured,
};
