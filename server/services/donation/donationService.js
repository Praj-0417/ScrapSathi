'use strict';

const donationRepository = require('../../repositories/donation/donationRepository');

class DonationService {
  async donate(userId, data) {
    const certificateId =
      data.certificateId ||
      `80G-ECO-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return donationRepository.create({
      userId,
      ...data,
      certificateId,
      paymentStatus: 'completed',
    });
  }

  async getMyDonations(userId, options) {
    return donationRepository.findByUserId(userId, options);
  }
}

module.exports = new DonationService();
