'use strict';

const pickupRepository = require('../../repositories/pickup/pickupRepository');
const emailAdapter = require('../../infrastructure/email/emailAdapter');
const { ApiError } = require('../../utils/ApiError');
const { ERROR_CODES, APP_CONSTANTS } = require('../../constants');
const { PICKUP_REQUEST_STATUS } = require('../../enums');
const logger = require('../../utils/logger');

class CollectorService {
  /**
   * List all pending pickups available for a collector to accept.
   */
  async listAvailablePickups({ page = APP_CONSTANTS.PAGINATION.DEFAULT_PAGE, limit = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT } = {}) {
    return pickupRepository.findPending({ page, limit });
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
   * Collector cancels an accepted pickup — resets it to pending.
   */
  async cancelPickup(collectorId, pickupId) {
    const pickup = await pickupRepository.findById(pickupId);
    if (!pickup) throw new ApiError(ERROR_CODES.NOT_FOUND);

    if ((pickup.wasteCollector?._id || pickup.wasteCollector)?.toString() !== collectorId) {
      throw new ApiError(ERROR_CODES.FORBIDDEN);
    }

    if (pickup.status !== PICKUP_REQUEST_STATUS.ACCEPTED) {
      throw new ApiError(ERROR_CODES.PICKUP_CANCEL_NOT_ACCEPTED);
    }

    // Reset to pending so another collector can pick it up
    return pickupRepository.updateStatus(pickupId, PICKUP_REQUEST_STATUS.PENDING, collectorId, 'Cancelled by collector');
  }

  /**
   * Mark a pickup as completed. Only the assigned collector may do this.
   */
  async completePickup(collectorId, pickupId) {
    const pickup = await pickupRepository.findById(pickupId);
    if (!pickup) throw new ApiError(ERROR_CODES.NOT_FOUND);

    if ((pickup.wasteCollector?._id || pickup.wasteCollector)?.toString() !== collectorId) {
      throw new ApiError(ERROR_CODES.FORBIDDEN);
    }

    if (pickup.status !== PICKUP_REQUEST_STATUS.ACCEPTED) {
      throw new ApiError(ERROR_CODES.PICKUP_COMPLETE_NOT_ACCEPTED);
    }

    return pickupRepository.updateStatus(pickupId, PICKUP_REQUEST_STATUS.COMPLETED, collectorId, 'Completed by collector');
  }

  /**
   * Get all pickups assigned to or completed by this collector.
   */
  async getMyPickups(collectorId, { page = APP_CONSTANTS.PAGINATION.DEFAULT_PAGE, limit = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT } = {}) {
    return pickupRepository.findByCollector(collectorId, { page, limit });
  }
}

module.exports = new CollectorService();
