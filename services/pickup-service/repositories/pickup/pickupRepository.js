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

  async findPending({ page = APP_CONSTANTS.PAGINATION.DEFAULT_PAGE, limit = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT, longitude, latitude, maxDistanceKm = 25 } = {}) {
    const skip = (page - 1) * limit;
    const filter = { status: PICKUP_REQUEST_STATUS.PENDING };

    // Geographic dispatch (Caveat #9): Filter pickups within radius of collector coordinates
    if (longitude !== undefined && latitude !== undefined && !isNaN(Number(longitude)) && !isNaN(Number(latitude))) {
      filter.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)],
          },
          $maxDistance: Number(maxDistanceKm) * 1000,
        },
      };
    }

    const query = PickupRequest.find(filter).populate('userId', 'name phone address');
    if (!filter.location) {
      query.sort({ createdAt: -1 });
    }

    const [rawDocs, total] = await Promise.all([
      query.skip(skip).limit(limit).lean(),
      PickupRequest.countDocuments(filter),
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

  /**
   * Generic (non-conditional) status update — admin use only.
   * For lifecycle transitions use the atomic variants below.
   */
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

  /**
   * Atomically release an accepted pickup back to pending.
   * Condition: _id matches, status is ACCEPTED, wasteCollector is the releasing collector.
   * Clears the wasteCollector assignment in the same operation.
   */
  async atomicRelease(pickupId, collectorId) {
    return PickupRequest.findOneAndUpdate(
      {
        _id: pickupId,
        status: PICKUP_REQUEST_STATUS.ACCEPTED,
        wasteCollector: collectorId,
      },
      {
        status: PICKUP_REQUEST_STATUS.PENDING,
        $unset: { wasteCollector: 1 },
        $push: {
          statusHistory: {
            status: PICKUP_REQUEST_STATUS.PENDING,
            actorId: collectorId,
            note: 'Released by collector',
            timestamp: new Date(),
          },
        },
      },
      { new: true },
    );
  }

  /**
   * Atomically complete an accepted pickup.
   * Condition: _id matches, status is ACCEPTED, wasteCollector is the completing collector.
   */
  async atomicComplete(pickupId, collectorId, extraFields = {}) {
    return PickupRequest.findOneAndUpdate(
      {
        _id: pickupId,
        status: PICKUP_REQUEST_STATUS.ACCEPTED,
        wasteCollector: collectorId,
      },
      {
        status: PICKUP_REQUEST_STATUS.COMPLETED,
        ...extraFields,
        $push: {
          statusHistory: {
            status: PICKUP_REQUEST_STATUS.COMPLETED,
            actorId: collectorId,
            note: extraFields.collectorNotes || 'Completed by collector',
            timestamp: new Date(),
          },
        },
      },
      { new: true },
    ).populate('userId', 'name email phone');
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

  /**
   * Push authenticated GPS location update for active accepted pickup (Caveat #10)
   */
  async updateLiveLocation(pickupId, collectorId, { longitude, latitude, heading, speed }) {
    return PickupRequest.findOneAndUpdate(
      {
        _id: pickupId,
        status: PICKUP_REQUEST_STATUS.ACCEPTED,
        wasteCollector: collectorId,
      },
      {
        $set: {
          liveTracking: {
            coordinates: [Number(longitude), Number(latitude)],
            heading: heading ? Number(heading) : 0,
            speed: speed ? Number(speed) : 0,
            updatedAt: new Date(),
          },
        },
      },
      { new: true },
    ).select('liveTracking status wasteCollector');
  }

  /**
   * Retrieve live tracking telemetry for a pickup
   */
  async getLiveTracking(pickupId) {
    return PickupRequest.findById(pickupId)
      .select('liveTracking status address location wasteCollector userId')
      .populate('wasteCollector', 'name phone')
      .lean();
  }
}

module.exports = new PickupRepository();
