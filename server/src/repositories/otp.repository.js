const OTP = require('../models/user/otp-model');

class OtpRepository {
    async createOtp(email, otp) {
        return await OTP.create({ email: email.toLowerCase(), otp });
    }

    async findLatestOtp(email) {
        return await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    }
}

module.exports = new OtpRepository();
