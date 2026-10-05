'use strict';

const otpRepository = require('../../repositories/user/otpRepository');
const userRepository = require('../../repositories/user/userRepository');
const emailAdapter = require('../../infrastructure/email/emailAdapter');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const { ApiError } = require('../../utils/ApiError');
const { ERROR_CODES, APP_CONSTANTS } = require('../../constants');

class OtpService {
  async sendRegistrationOtp(email) {
    const user = await userRepository.findUserByEmail(email);
    if (user) {
      throw new ApiError(ERROR_CODES.USER_ALREADY_EXISTS);
    }
    return this.generateAndSendOtp(email);
  }

  async sendPasswordResetOtp(email) {
    const user = await userRepository.findUserByEmail(email);
    if (!user) {
      throw new ApiError(ERROR_CODES.USER_NOT_FOUND);
    }
    return this.generateAndSendOtp(email);
  }

  async generateAndSendOtp(email) {
    const otp = otpGenerator.generate(APP_CONSTANTS.AUTH.OTP_LENGTH, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const hashedOtp = await bcrypt.hash(otp, APP_CONSTANTS.AUTH.OTP_BCRYPT_ROUNDS);
    await otpRepository.createOtp(email, hashedOtp);
    try {
      await emailAdapter.sendOtpEmail(email, otp);
    } catch (error) {
      throw new ApiError(ERROR_CODES.OTP_SEND_FAILED);
    }
  }

  async verifyOtp(email, otp) {
    const response = await otpRepository.findLatestOtp(email);
    if (!response || response.length === 0) {
      return false;
    }

    const latestOtp = response[0];
    if (latestOtp.expiresAt < new Date()) {
      await otpRepository.markOtpUsed(latestOtp._id);
      return false;
    }

    const isMatch = await bcrypt.compare(otp, latestOtp.otp);
    if (!isMatch) {
      return false;
    }

    await otpRepository.markOtpUsed(latestOtp._id);
    return true;
  }
}

module.exports = new OtpService();
