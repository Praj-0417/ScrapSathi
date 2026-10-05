'use strict';

const authService = require('../../services/auth/authService');
const { success } = require('../../utils/apiResponse');
const { ApiError } = require('../../utils/ApiError');
const { HTTP_STATUS, ERROR_CODES, MESSAGES } = require('../../constants');

// ── Cookie helper ─────────────────────────────────────────────────────────────
const setAuthCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 24 * 60 * 60 * 1000,
  });
};

const register = async (req, res, next) => {
  try {
    // register() now returns { user, token } after verifying the OTP challenge
    const { user, token } = await authService.register(req.body);
    setAuthCookie(res, token);
    return success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: MESSAGES.USER_REGISTERED,
      data: { token, user },
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);
    setAuthCookie(res, token);
    return success(res, {
      message: MESSAGES.LOGIN_SUCCESS,
      data: { token, user },
    });
  } catch (error) {
    return next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // Increment tokenVersion → all tokens for this user are revoked
    if (req.user?.userId) {
      await authService.logout(req.user.userId);
    }
    res.clearCookie('token');
    return success(res, { message: 'Logged out successfully' });
  } catch (error) {
    return next(error);
  }
};

const sendRegistrationOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.sendRegistrationOtp(email);
    return success(res, { message: MESSAGES.OTP_SENT });
  } catch (error) {
    return next(error);
  }
};

const sendPasswordResetOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.sendPasswordResetOtp(email);
    return success(res, { message: MESSAGES.OTP_SENT });
  } catch (error) {
    return next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    // purpose=registration returns a verificationToken the client must include in register body
    const purpose = req.query.purpose || null;
    const result = await authService.verifyOtp(email, otp, purpose);
    if (result.isValid) {
      return success(res, {
        message: MESSAGES.OTP_VERIFIED,
        data: result.verificationToken ? { verificationToken: result.verificationToken } : {},
      });
    }
    return next(new ApiError(ERROR_CODES.INVALID_OTP));
  } catch (error) {
    return next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;
    await authService.resetPassword(email, otp, password);
    return success(res, { message: MESSAGES.PASSWORD_RESET_SUCCESS });
  } catch (error) {
    return next(error);
  }
};

const googleLogin = async (req, res, next) => {
  try {
    const { user, token } = await authService.googleLogin(req.body);
    setAuthCookie(res, token);
    return success(res, {
      message: 'Google login successful',
      data: { token, user },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  logout,
  sendRegistrationOtp,
  sendPasswordResetOtp,
  verifyOtp,
  resetPassword,
};


