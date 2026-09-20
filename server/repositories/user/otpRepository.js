'use strict';

const OTP = require('../../models/user/otpModel');

class OtpRepository {
  async createOtp(email, otp) {
    return OTP.create({ email: email.toLowerCase().trim(), otp });
  }

  async findLatestOtp(email) {
    return OTP.find({
      email: email.toLowerCase().trim(),
      usedAt: { $exists: false },
    })
      .sort({ createdAt: -1 })
      .limit(1);
  }

  async markOtpUsed(id) {
    return OTP.findByIdAndUpdate(id, { usedAt: new Date() }, { new: true });
  }
}

module.exports = new OtpRepository();
