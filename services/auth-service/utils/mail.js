'use strict';

/**
 * mail.js — clean mail utility
 * All email sending goes through the email adapter.
 * This file re-exports the adapter functions for backward compatibility
 * with existing code that imports from `utils/mail`.
 */
const {
  sendOtpEmail,
  sendWelcomeEmail,
  sendPickupAcceptedEmail,
  sendPickupRequestNotification,
} = require('../infrastructure/email/emailAdapter');

module.exports = {
  mailOtp: sendOtpEmail,
  sendWelcomeEmail,
  sendConfirmationEmail: sendPickupAcceptedEmail,
  notifyWasteCollectors: sendPickupRequestNotification,
};
