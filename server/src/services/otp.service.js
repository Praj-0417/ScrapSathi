const OTPRepository = require('../repositories/otp.repository');
const mailer = require('../utils/mail');
const otpGenerator = require('otp-generator');
const UserRepository = require('../repositories/user.repository');
const { ApiError } = require('../utils/ApiError');
const ERROR_CODES = require('../constants/error-codes');

class OtpService {
    async sendRegistrationOtp(email) {
        const user = await UserRepository.findUserByEmail(email);
        if (user) {
            throw new ApiError(ERROR_CODES.USER_ALREADY_EXISTS);
        }
        return this.generateAndSendOtp(email);
    }

    async sendPasswordResetOtp(email) {
        const user = await UserRepository.findUserByEmail(email);
        if (!user) {
            throw new ApiError(ERROR_CODES.USER_NOT_FOUND);
        }
        return this.generateAndSendOtp(email);
    }

    async generateAndSendOtp(email) {
        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        await OTPRepository.createOtp(email, otp);
        try {
            await mailer.mailOtp(otp, email);
        } catch (error) {
            throw new ApiError(ERROR_CODES.OTP_SEND_FAILED);
        }
    }

    async verifyOtp(email, otp) {
        const response = await OTPRepository.findLatestOtp(email);
        if (response.length === 0 || otp !== response[0].otp) {
            return false;
        }
        // Optionally, you can add logic here to mark the OTP as used.
        return true;
    }
}

module.exports = new OtpService();
