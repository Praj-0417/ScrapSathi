'use strict';

const rateLimit = require('express-rate-limit');
const { env } = require('../config/env');
const { HTTP_STATUS, APP_CONSTANTS } = require('../constants');

const rateLimitResponse = (message) => (_req, res) => {
  res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
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
  windowMs: env.RATE_LIMIT_WINDOW_MS || APP_CONSTANTS.RATE_LIMIT.WINDOW_MS,
  max: env.RATE_LIMIT_MAX || APP_CONSTANTS.RATE_LIMIT.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse('Too many requests. Please slow down.'),
  skip: (req) => req.method === 'OPTIONS' || process.env.NODE_ENV === 'test',
});

/**
 * Auth rate limiter — 10 req per 15 min per IP (for login + register)
 */
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.AUTH_RATE_LIMIT_MAX || 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse('Too many authentication attempts. Please wait 15 minutes.'),
  skip: (req) => req.method === 'OPTIONS' || process.env.NODE_ENV === 'test',
});

/**
 * OTP rate limiter — 5 sends per 15 min per IP
 */
const otpRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.OTP_RATE_LIMIT_MAX || 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse('Too many OTP requests. Please wait 15 minutes.'),
  skip: (req) => req.method === 'OPTIONS' || process.env.NODE_ENV === 'test',
});

module.exports = {
  apiRateLimit,
  authRateLimit,
  otpRateLimit,
};
