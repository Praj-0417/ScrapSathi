'use strict';

const pickupRepository = require('../../repositories/pickup/pickupRepository');
const cloudinaryAdapter = require('../../infrastructure/storage/cloudinaryAdapter');
const emailAdapter = require('../../infrastructure/email/emailAdapter');
const { ApiError } = require('../../utils/ApiError');
const { ERROR_CODES, APP_CONSTANTS } = require('../../constants');
const { PICKUP_REQUEST_STATUS, WASTE_UNITS, LOCATION_TYPES } = require('../../enums');
const { checkServiceability } = require('../../utils/serviceability');
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
      customerNotes,
      city = 'delhi-ncr',
    } = data;

    // ── Serviceability Enforcement ──────────────────────────────────────────
    let resolvedCity = city;
    if (latitude !== undefined && longitude !== undefined) {
      const lat = Number(latitude);
      const lon = Number(longitude);
      if (!isNaN(lat) && !isNaN(lon)) {
        const check = checkServiceability(lat, lon);
        if (!check.serviceable) {
          throw new ApiError(
            ERROR_CODES.LOCATION_NOT_SERVICEABLE,
            `We currently do not service this location (${address || 'selected area'}). Active service hubs: Delhi NCR, Mumbai, Bengaluru, Pune, Hyderabad, Jaipur, Lucknow, Kolkata, and Chennai.`,
          );
        }
        if (check.hubId) {
          resolvedCity = check.hubId;
        }
      }
    }

    // Normalize wasteDetails — support both array and flat fields
    let normalizedWasteDetails = wasteDetails;
    if (typeof normalizedWasteDetails === 'string') {
      try {
        normalizedWasteDetails = JSON.parse(normalizedWasteDetails);
      } catch (err) {
        normalizedWasteDetails = null;
      }
    }
    if (!normalizedWasteDetails || normalizedWasteDetails.length === 0) {
      normalizedWasteDetails = [{ wasteType, subcategory, quantity: Number(quantity), unit }];
    }

    if (!normalizedWasteDetails[0]?.wasteType || !normalizedWasteDetails[0]?.quantity) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST);
    }

    // ── Server-side quote calculation (Caveat #6) ──────────────────────────
    // Load all rate categories once and build a flat map: wasteType.toLowerCase() → unitRate
    const ScrapRateCategory = require('../../models/scrapRateModel');
    const rateCategories = await ScrapRateCategory.find({ active: true }).lean().catch(() => []);
    const rateMap = {};
    for (const cat of rateCategories) {
      for (const item of cat.items || []) {
        if (item.active !== false) {
          const key = (item.name || item.itemId || '').toLowerCase();
          rateMap[key] = item.prices instanceof Map
            ? (item.prices.get(resolvedCity) ?? item.prices.get('delhi-ncr') ?? 0)
            : (item.prices?.[resolvedCity] ?? item.prices?.['delhi-ncr'] ?? 0);
        }
      }
    }

    const rateSnapshotDate = new Date();
    const quoteItems = normalizedWasteDetails.map((detail) => {
      const key = (detail.wasteType || '').toLowerCase();
      const unitRate = rateMap[key] ?? 0;
      const qty = Number(detail.quantity) || 0;
      return {
        wasteType:   detail.wasteType,
        subcategory: detail.subcategory,
        quantity:    qty,
        unit:        detail.unit || unit,
        unitRate,
        lineTotal:   parseFloat((unitRate * qty).toFixed(2)),
      };
    });
    const totalEstimate = parseFloat(
      quoteItems.reduce((s, l) => s + l.lineTotal, 0).toFixed(2),
    );

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
      quote: { items: quoteItems, city: resolvedCity, currency: 'INR', totalEstimate, rateSnapshotDate },
      address,
      preferredTimeSlot,
      ...(customerNotes ? { customerNotes } : {}),
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

  /**
   * Get authenticated live tracking telemetry for customer or assigned collector (Caveat #10)
   */
  async getPickupTracking(pickupId, userId) {
    const pickup = await pickupRepository.getLiveTracking(pickupId);
    if (!pickup) throw new ApiError(ERROR_CODES.NOT_FOUND);

    const isOwner = (pickup.userId?._id || pickup.userId)?.toString() === userId;
    const isCollector = (pickup.wasteCollector?._id || pickup.wasteCollector)?.toString() === userId;
    if (!isOwner && !isCollector) {
      throw new ApiError(ERROR_CODES.TRACKING_NOT_ALLOWED);
    }

    const live = pickup.liveTracking || null;
    let isStale = false;
    if (live?.updatedAt) {
      isStale = Date.now() - new Date(live.updatedAt).getTime() > 5 * 60 * 1000;
    }

    return {
      pickupId: pickup._id,
      status: pickup.status,
      collector: pickup.wasteCollector || null,
      destination: pickup.location || null,
      address: pickup.address,
      liveTracking: live,
      isStale,
    };
  }
}

module.exports = new PickupService();
