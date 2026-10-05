'use strict';

const rateLimit = require('express-rate-limit');
const { env } = require('../config/env');
const ERROR_CODES = require('../constants/error-codes');

const rateLimitResponse = (message) => (_req, res) => {
  res.status(429).json({
    success: false,
    message,
    data: null,
    meta: {},
    errors: [],
  });
};

/**
 * General API rate limiter — 100 req/min per IP (configurable via env)
 */
const apiRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse('Too many requests. Please slow down.'),
  skip: (req) => req.method === 'OPTIONS',
});

/**
 * Auth rate limiter — 10 req per 15 min per IP (for login + register)
 */
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse('Too many authentication attempts. Please wait 15 minutes.'),
  skip: (req) => req.method === 'OPTIONS',
});

// do DSA motherfucker
// this project is worst

/**
 * OTP rate limiter — 5 sends per 15 min per IP
 */
const otpRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.OTP_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse('Too many OTP requests. Please wait 15 minutes.'),
  skip: (req) => req.method === 'OPTIONS',
});

module.exports = {
  apiRateLimit,
  authRateLimit,
  otpRateLimit,
};
