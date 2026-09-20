'use strict';

const PickupRequest = require('../../models/pickupRequestModel');
const User = require('../../models/user/userModel');
const { PICKUP_REQUEST_STATUS, USER_TYPES } = require('../../enums');
const { APP_CONSTANTS } = require('../../constants');

const formatPickup = (doc) => {
  if (!doc) return doc;
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  if (Array.isArray(obj.wasteDetails) && obj.wasteDetails.length > 0) {
    if (!obj.wasteType) {
      obj.wasteType = obj.wasteDetails.map((w) => w.wasteType).join(', ');
    }
    if (!obj.quantity) {
      obj.quantity = obj.wasteDetails.reduce((sum, w) => sum + (Number(w.quantity) || 0), 0);
    }
    if (!obj.unit) {
      obj.unit = obj.wasteDetails[0]?.unit || 'kg';
    }
    if (!obj.subcategory) {
      obj.subcategory = obj.wasteDetails
        .map((w) => `${w.subcategory || w.wasteType} (${w.quantity} ${w.unit || 'kg'})`)
        .join(', ');
    }
  }
  return obj;
};

class PickupRepository {
  async create(data) {
    const created = await PickupRequest.create(data);
    return formatPickup(created);
  }

  async findById(id) {
    const doc = await PickupRequest.findById(id)
      .populate('userId', 'name email phone')
      .populate('wasteCollector', 'name email phone');
    return formatPickup(doc);
  }

  async findByUserId(userId, { page = APP_CONSTANTS.PAGINATION.DEFAULT_PAGE, limit = APP_CONSTANTS.PAGINATION.PICKUP_DEFAULT_LIMIT } = {}) {
    const skip = (page - 1) * limit;
    const [rawDocs, total] = await Promise.all([
      PickupRequest.find({ userId })
        .populate('wasteCollector', 'name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PickupRequest.countDocuments({ userId }),
    ]);
    const docs = rawDocs.map(formatPickup);
    return { docs, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findPending({ page = APP_CONSTANTS.PAGINATION.DEFAULT_PAGE, limit = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT } = {}) {
    const skip = (page - 1) * limit;
    const [rawDocs, total] = await Promise.all([
      PickupRequest.find({ status: PICKUP_REQUEST_STATUS.PENDING })
        .populate('userId', 'name phone address')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PickupRequest.countDocuments({ status: PICKUP_REQUEST_STATUS.PENDING }),
    ]);
    const docs = rawDocs.map(formatPickup);
    return { docs, total, page, limit, pages: Math.ceil(total / limit) };
  }

  /**
   * Atomically accept a pending pickup — prevents race conditions.
   * Returns null if already accepted by another collector.
   */
  async atomicAccept(pickupId, collectorId) {
    return PickupRequest.findOneAndUpdate(
      { _id: pickupId, status: PICKUP_REQUEST_STATUS.PENDING },
      {
        status: PICKUP_REQUEST_STATUS.ACCEPTED,
        wasteCollector: collectorId,
        $push: {
          statusHistory: {
            status: PICKUP_REQUEST_STATUS.ACCEPTED,
            actorId: collectorId,
            timestamp: new Date(),
          },
        },
      },
      { new: true },
    ).populate('userId', 'name email phone');
  }

  async updateStatus(pickupId, status, actorId, note = '') {
    return PickupRequest.findByIdAndUpdate(
      pickupId,
      {
        status,
        $push: { statusHistory: { status, actorId, note, timestamp: new Date() } },
      },
      { new: true },
    );
  }

  async cancelByUser(pickupId, userId) {
    return PickupRequest.findOneAndUpdate(
      { _id: pickupId, userId, status: { $in: [PICKUP_REQUEST_STATUS.PENDING, PICKUP_REQUEST_STATUS.ACCEPTED] } },
      {
        status: PICKUP_REQUEST_STATUS.CANCELLED,
        $push: { statusHistory: { status: PICKUP_REQUEST_STATUS.CANCELLED, actorId: userId, timestamp: new Date() } },
      },
      { new: true },
    );
  }

  async findByCollector(collectorId, { page = APP_CONSTANTS.PAGINATION.DEFAULT_PAGE, limit = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT } = {}) {
    const skip = (page - 1) * limit;
    const [rawDocs, total] = await Promise.all([
      PickupRequest.find({ wasteCollector: collectorId })
        .populate('userId', 'name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PickupRequest.countDocuments({ wasteCollector: collectorId }),
    ]);
    const docs = rawDocs.map(formatPickup);
    return { docs, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getAllCollectorEmails() {
    return User.find({ userType: USER_TYPES.WASTE_COLLECTOR }, 'email').lean();
  }

  async findAll({ page = APP_CONSTANTS.PAGINATION.DEFAULT_PAGE, limit = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT, status } = {}) {
    const filter = status ? { status } : {};
    const skip = (page - 1) * limit;
    const [rawDocs, total] = await Promise.all([
      PickupRequest.find(filter)
        .populate('userId', 'name email phone')
        .populate('wasteCollector', 'name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PickupRequest.countDocuments(filter),
    ]);
    const docs = rawDocs.map(formatPickup);
    return { docs, total, page, limit, pages: Math.ceil(total / limit) };
  }
}

module.exports = new PickupRepository();
