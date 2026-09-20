'use strict';

const { z } = require('zod');
const { USER_TYPES } = require('../../enums');
const { APP_CONSTANTS } = require('../../constants');

const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(APP_CONSTANTS.VALIDATION.NAME_MIN_LENGTH, `Name must be at least ${APP_CONSTANTS.VALIDATION.NAME_MIN_LENGTH} characters`)
      .max(APP_CONSTANTS.VALIDATION.NAME_MAX_LENGTH),
    email: z.string().email('Invalid email address'),
    phone: z
      .string()
      .min(APP_CONSTANTS.VALIDATION.PHONE_MIN_LENGTH, `Phone number must be at least ${APP_CONSTANTS.VALIDATION.PHONE_MIN_LENGTH} digits`)
      .max(APP_CONSTANTS.VALIDATION.PHONE_MAX_LENGTH)
      .regex(/^\+?[0-9]+$/, 'Phone number must contain only digits'),
    password: z
      .string()
      .min(APP_CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${APP_CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH} characters`)
      .max(APP_CONSTANTS.VALIDATION.PASSWORD_MAX_LENGTH),
    termsAccepted: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the Terms and Conditions' }),
    }),
    userType: z.nativeEnum(USER_TYPES, {
      errorMap: () => ({ message: 'Invalid user type' }),
    }),
    // Optional profile fields
    address: z.string().max(APP_CONSTANTS.VALIDATION.ADDRESS_MAX_LENGTH).optional(),
    companyName: z.string().max(200).optional(),
    businessLicenseNo: z.string().max(100).optional(),
    wasteType: z.string().max(200).optional(),
    recyclingCapabilities: z.string().max(500).optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(APP_CONSTANTS.AUTH.OTP_LENGTH, `OTP must be exactly ${APP_CONSTANTS.AUTH.OTP_LENGTH} digits`),
    password: z
      .string()
      .min(APP_CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${APP_CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH} characters`)
      .max(APP_CONSTANTS.VALIDATION.PASSWORD_MAX_LENGTH),
  }),
});

const sendOtpSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(APP_CONSTANTS.AUTH.OTP_LENGTH, `OTP must be exactly ${APP_CONSTANTS.AUTH.OTP_LENGTH} digits`),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  sendOtpSchema,
  verifyOtpSchema,
};
