'use strict';

const pickupRepository = require('../../repositories/pickup/pickupRepository');
const emailAdapter = require('../../infrastructure/email/emailAdapter');
const { ApiError } = require('../../utils/ApiError');
const { ERROR_CODES, APP_CONSTANTS } = require('../../constants');
const logger = require('../../utils/logger');

class CollectorService {
  /**
   * List pending pickups available for a collector, optionally filtered by proximity (Caveat #9).
   */
  async listAvailablePickups({ page = APP_CONSTANTS.PAGINATION.DEFAULT_PAGE, limit = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT, longitude, latitude, radius } = {}) {
    return pickupRepository.findPending({ page, limit, longitude, latitude, maxDistanceKm: radius });
  }

  /**
   * Update live GPS telemetry for an active assigned pickup (Caveat #10).
   */
  async updateLocation(collectorId, pickupId, locationData) {
    const updated = await pickupRepository.updateLiveLocation(pickupId, collectorId, locationData);
    if (!updated) {
      throw new ApiError(ERROR_CODES.TRACKING_NOT_ALLOWED);
    }
    return updated;
  }

  /**
   * Atomically accept a pending pickup.
   */
  async acceptPickup(collectorId, pickupId) {
    const updated = await pickupRepository.atomicAccept(pickupId, collectorId);

    if (!updated) {
      throw new ApiError(ERROR_CODES.PICKUP_ALREADY_ACCEPTED);
    }

    // Send confirmation email to the user (non-blocking)
    const user = updated.userId;
    if (user?.email) {
      emailAdapter
        .sendPickupAcceptedEmail(user.email, {
          collectorName: updated.wasteCollector?.name || 'A collector',
          collectorPhone: updated.wasteCollector?.phone || 'N/A',
          collectorEmail: updated.wasteCollector?.email || 'N/A',
        })
        .catch((err) => {
          logger.warn('Pickup acceptance email failed', {
            userId: user._id?.toString(),
            error: err.message,
          });
        });
    }

    return updated;
  }

  /**
   * Collector releases an accepted pickup — resets it to pending.
   * Uses atomicRelease: conditional on {_id, status=ACCEPTED, wasteCollector=collectorId}.
   * The wasteCollector field is cleared atomically in the same operation.
   */
  async cancelPickup(collectorId, pickupId) {
    const updated = await pickupRepository.atomicRelease(pickupId, collectorId);

    if (!updated) {
      // Either not found, not owned by this collector, or not in ACCEPTED state
      throw new ApiError(ERROR_CODES.PICKUP_INVALID_TRANSITION);
    }

    return updated;
  }

  /**
   * Mark a pickup as completed. Only the assigned collector may do this.
   * Uses atomicComplete: conditional on {_id, status=ACCEPTED, wasteCollector=collectorId}.
   */
  async completePickup(collectorId, pickupId, extraData = {}) {
    const updated = await pickupRepository.atomicComplete(pickupId, collectorId, extraData);

    if (!updated) {
      // Either not found, not owned by this collector, or not in ACCEPTED state
      throw new ApiError(ERROR_CODES.PICKUP_INVALID_TRANSITION);
    }

    return updated;
  }

  /**
   * Get all pickups assigned to or completed by this collector.
   */
  async getMyPickups(collectorId, { page = APP_CONSTANTS.PAGINATION.DEFAULT_PAGE, limit = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT } = {}) {
    return pickupRepository.findByCollector(collectorId, { page, limit });
  }
}

module.exports = new CollectorService();
