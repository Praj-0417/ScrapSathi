'use strict';

const User = require('../../models/user/userModel');
const PickupRequest = require('../../models/pickupRequestModel');
const Donation = require('../../models/donationModel');
const { ROLES } = require('../../enums');
const { APP_CONSTANTS } = require('../../constants');

class AdminRepository {
  async findAdminByEmail(email) {
    return User.findOne({ email: email.toLowerCase(), role: ROLES.ADMIN });
  }

  async listUsers({ page = APP_CONSTANTS.PAGINATION.DEFAULT_PAGE, limit = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT, search } = {}) {
    const filter = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {};
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);
    return { docs, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async listPickups({ page = APP_CONSTANTS.PAGINATION.DEFAULT_PAGE, limit = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT, status } = {}) {
    const filter = status ? { status } : {};
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      PickupRequest.find(filter)
        .populate('userId', 'name email phone')
        .populate('wasteCollector', 'name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PickupRequest.countDocuments(filter),
    ]);
    return { docs, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async listDonations({ page = APP_CONSTANTS.PAGINATION.DEFAULT_PAGE, limit = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT } = {}) {
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      Donation.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Donation.countDocuments(),
    ]);
    return { docs, total, page, limit, pages: Math.ceil(total / limit) };
  }
}

module.exports = new AdminRepository();
