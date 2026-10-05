'use strict';

const express = require('express');
const router = express.Router();

const authController = require('../../controllers/auth/authController');
const { protect } = require('../../middlewares/authMiddleware');
const validate = require('../../middlewares/validateMiddleware');
const { authRateLimit, otpRateLimit } = require('../../middlewares/rateLimitMiddleware');
const {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  sendOtpSchema,
  verifyOtpSchema,
} = require('../../validators/auth/authValidators');

// ─── Auth ──────────────────────────────────────────────────────────────────
router.post('/register',     authRateLimit, validate(registerSchema), authController.register);
router.post('/login',        authRateLimit, validate(loginSchema),    authController.login);
router.post('/google',       authRateLimit,                           authController.googleLogin);
router.post('/google/token', authRateLimit,                           authController.googleLogin);
router.post('/logout',       protect,                                 authController.logout);

// ─── OTP ───────────────────────────────────────────────────────────────────
router.post('/otp/send-registration', otpRateLimit, validate(sendOtpSchema),   authController.sendRegistrationOtp);
router.post('/otp/send-reset',        otpRateLimit, validate(sendOtpSchema),   authController.sendPasswordResetOtp);
router.post('/otp/send-otp',          otpRateLimit, validate(sendOtpSchema),   authController.sendPasswordResetOtp);
router.post('/otp/verify',            otpRateLimit, validate(verifyOtpSchema), authController.verifyOtp);

// ─── Password ──────────────────────────────────────────────────────────────
router.post('/password/reset', authRateLimit, validate(resetPasswordSchema), authController.resetPassword);
router.post('/update',         authRateLimit, validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;
