const OTPRepository = require('../repositories/otp.repository');
const mailer = require('../utils/mail');
const otpGenerator = require('otp-generator');
const UserRepository = require('../repositories/user.repository');

class OtpService {
    async sendRegistrationOtp(email) {
        const user = await UserRepository.findUserByEmail(email);
        if (user) {
            throw new Error('User already exists, please login');
        }
        return this.generateAndSendOtp(email);
    }

    async sendPasswordResetOtp(email) {
        const user = await UserRepository.findUserByEmail(email);
        if (!user) {
            throw new Error('User not found');
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
        await mailer.mailOtp(otp, email);
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
