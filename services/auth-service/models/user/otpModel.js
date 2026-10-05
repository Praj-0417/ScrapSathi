'use strict';

const mongoose = require('mongoose');
const { APP_CONSTANTS } = require('../../constants');

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => Date.now() + APP_CONSTANTS.AUTH.OTP_EXPIRATION_MS,
      expires: 0,
    },
    usedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('OTP', otpSchema);
