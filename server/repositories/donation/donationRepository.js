'use strict';

const Donation = require('../../models/donationModel');
const { APP_CONSTANTS } = require('../../constants');

class DonationRepository {
  async create(data) {
    return Donation.create(data);
  }

  async findByUserId(userId, { page = APP_CONSTANTS.PAGINATION.DEFAULT_PAGE, limit = APP_CONSTANTS.PAGINATION.PICKUP_DEFAULT_LIMIT } = {}) {
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      Donation.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Donation.countDocuments({ userId }),
    ]);
    return { docs, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findAll({ page = APP_CONSTANTS.PAGINATION.DEFAULT_PAGE, limit = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT } = {}) {
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

module.exports = new DonationRepository();
