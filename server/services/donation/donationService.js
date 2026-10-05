'use strict';

const donationRepository = require('../../repositories/donation/donationRepository');

class DonationService {
  async donate(userId, data) {
    // Generate a provisional acknowledgement reference (Caveats #11 + #12)
    const provisionalAckId =
      data.certificateId ||
      `ACK-ECO-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return donationRepository.create({
      userId,
      ...data,
      certificateId: provisionalAckId,
      receiptType: 'provisional_acknowledgement',
      paymentStatus: data.transactionId ? 'completed' : 'pending',
      verificationStatus: 'unverified',
    });
  }

  /**
   * Reconcile payment with provider callback or admin audit (Caveats #11 + #12)
   */
  async reconcilePayment(donationId, { providerRef, panNumber, verifiedAmount }) {
    const verifiedCertId = `80G-VERIFIED-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const updated = await donationRepository.update(donationId, {
      paymentStatus: 'verified',
      verificationStatus: 'reconciled',
      receiptType: 'tax_receipt_80g',
      certificateId: verifiedCertId,
      reconciledAt: new Date(),
      transactionId: providerRef,
      ...(panNumber ? { panNumber } : {}),
      ...(verifiedAmount ? { amount: verifiedAmount } : {}),
    });
    return updated;
  }

  async getMyDonations(userId, options) {
    return donationRepository.findByUserId(userId, options);
  }
}

module.exports = new DonationService();
