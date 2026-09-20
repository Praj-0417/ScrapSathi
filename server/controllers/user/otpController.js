'use strict';

const otpService = require('../../services/user/otpService');
const { success, failure } = require('../../utils/apiResponse');
const { HTTP_STATUS, MESSAGES, ERROR_CODES } = require('../../constants');

const userOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    await otpService.sendRegistrationOtp(email);
    return success(res, { message: MESSAGES.OTP_SENT });
  } catch (error) {
    return next(error);
  }
};

const sendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    await otpService.sendPasswordResetOtp(email);
    return success(res, { message: MESSAGES.OTP_SENT });
  } catch (error) {
    return next(error);
  }
};

const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const isValid = await otpService.verifyOtp(email, otp);
    if (isValid) {
      return success(res, { message: MESSAGES.OTP_VERIFIED });
    }
    return failure(res, { statusCode: HTTP_STATUS.BAD_REQUEST, message: ERROR_CODES.INVALID_OTP.message });
  } catch (error) {
    return next(error);
  }
};

module.exports = { userOTP, sendOTP, verifyOTP };