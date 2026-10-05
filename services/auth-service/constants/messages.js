'use strict';

const MESSAGES = Object.freeze({
  // Health
  HEALTH_OK: 'ScrapSaathi backend is healthy',

  // Auth & User
  USER_REGISTERED: 'User registered successfully',
  LOGIN_SUCCESS: 'Logged in successfully',
  OTP_SENT: 'OTP sent successfully',
  OTP_VERIFIED: 'OTP verified successfully',
  PASSWORD_RESET_SUCCESS: 'Password has been reset successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  USER_FETCHED: 'User profile fetched successfully',

  // Pickup
  PICKUP_CREATED: 'Pickup request created successfully',
  PICKUP_ACCEPTED: 'Pickup request accepted successfully',
  PICKUP_CANCELLED: 'Pickup request cancelled successfully',
  PICKUP_COMPLETED: 'Pickup request completed successfully',
  PICKUPS_FETCHED: 'Pickup requests retrieved successfully',

  // Donation
  DONATION_CREATED: 'Donation recorded successfully',
  DONATIONS_FETCHED: 'Donations retrieved successfully',

  // Admin
  ADMIN_LOGIN_SUCCESS: 'Admin logged in successfully',
  USERS_FETCHED: 'Users retrieved successfully',
});

module.exports = MESSAGES;
