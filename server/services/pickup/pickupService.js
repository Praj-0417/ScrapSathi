'use strict';

const pickupRepository = require('../../repositories/pickup/pickupRepository');
const cloudinaryAdapter = require('../../infrastructure/storage/cloudinaryAdapter');
const emailAdapter = require('../../infrastructure/email/emailAdapter');
const { ApiError } = require('../../utils/ApiError');
const { ERROR_CODES, APP_CONSTANTS } = require('../../constants');
const { PICKUP_REQUEST_STATUS, WASTE_UNITS, LOCATION_TYPES } = require('../../enums');
const logger = require('../../utils/logger');

class PickupService {
  /**
   * Schedule a new pickup.
   * userId is ALWAYS taken from the JWT (req.user), never from body.
   */
  async schedulePickup(userId, data, fileBuffer = null) {
    const {
      wasteDetails,
      wasteType,
      subcategory,
      quantity,
      unit = WASTE_UNITS.KG,
      address,
      preferredTimeSlot,
      scheduledDate,
      longitude,
      latitude,
    } = data;

    // Normalize wasteDetails — support both array and flat fields
    const normalizedWasteDetails = wasteDetails && wasteDetails.length > 0
      ? wasteDetails
      : [{ wasteType, subcategory, quantity: Number(quantity), unit }];

    if (!normalizedWasteDetails[0]?.wasteType || !normalizedWasteDetails[0]?.quantity) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST);
    }

    // Upload image to Cloudinary if provided
    let imageUrl = null;
    let imagePublicId = null;
    if (fileBuffer && cloudinaryAdapter.isConfigured()) {
      try {
        const uploaded = await cloudinaryAdapter.uploadBuffer(fileBuffer, APP_CONSTANTS.STORAGE.CLOUDINARY_PICKUP_FOLDER);
        imageUrl = uploaded.url;
        imagePublicId = uploaded.publicId;
      } catch (err) {
        logger.warn('Image upload failed — proceeding without image', { error: err.message });
      }
    }

    const pickupPayload = {
      userId,
      wasteDetails: normalizedWasteDetails,
      address,
      preferredTimeSlot,
      ...(scheduledDate ? { scheduledDate } : {}),
      ...(imageUrl ? { imageUrl, imagePublicId } : {}),
      statusHistory: [{ status: PICKUP_REQUEST_STATUS.PENDING, actorId: userId }],
    };

    if (longitude !== undefined && latitude !== undefined) {
      pickupPayload.location = {
        type: LOCATION_TYPES.POINT,
        coordinates: [Number(longitude), Number(latitude)],
      };
    }

    const pickup = await pickupRepository.create(pickupPayload);

    // Notify all waste collectors (non-blocking)
    pickupRepository.getAllCollectorEmails()
      .then((collectors) => {
        const emails = collectors.map((c) => c.email).filter(Boolean);
        if (emails.length > 0) {
          return emailAdapter.sendPickupRequestNotification(emails, {
            address,
            wasteType: normalizedWasteDetails[0]?.wasteType,
            quantity: normalizedWasteDetails[0]?.quantity,
            preferredTimeSlot,
          });
        }
      })
      .catch((err) => {
        logger.warn('Collector notification email failed', { error: err.message });
      });

    return pickup;
  }

  async getUserPickups(userId, { page = APP_CONSTANTS.PAGINATION.DEFAULT_PAGE, limit = APP_CONSTANTS.PAGINATION.PICKUP_DEFAULT_LIMIT } = {}) {
    return pickupRepository.findByUserId(userId, { page, limit });
  }

  async getPickupById(pickupId, userId) {
    const pickup = await pickupRepository.findById(pickupId);
    if (!pickup) throw new ApiError(ERROR_CODES.NOT_FOUND);

    // Only the owner or the assigned collector may view details
    const isOwner = (pickup.userId?._id || pickup.userId)?.toString() === userId;
    const isCollector = (pickup.wasteCollector?._id || pickup.wasteCollector)?.toString() === userId;
    if (!isOwner && !isCollector) throw new ApiError(ERROR_CODES.FORBIDDEN);

    return pickup;
  }

  async cancelPickup(userId, pickupId) {
    const cancelled = await pickupRepository.cancelByUser(pickupId, userId);
    if (!cancelled) {
      throw new ApiError(ERROR_CODES.PICKUP_INVALID_CANCEL);
    }
    return cancelled;
  }
}

module.exports = new PickupService();
