'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/user/userModel');
const { env } = require('../config/env');
const { ApiError } = require('../utils/ApiError');
const { ERROR_CODES } = require('../constants');

const protect = async (req, res, next) => {
  try {
    // ── Token extraction: cookie first (httpOnly, XSS-safe), then Bearer header ──
    let token = req.cookies?.token;

    if (!token) {
      const authorization = req.headers.authorization;
      if (authorization && authorization.startsWith('Bearer ')) {
        token = authorization.split(' ')[1];
      }
    }

    if (!token) {
      throw new ApiError(ERROR_CODES.UNAUTHORIZED);
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (!decoded.userId) {
      throw new ApiError(ERROR_CODES.UNAUTHORIZED);
    }

    const user = await User.findById(decoded.userId)
      .select('name email phone userType role otpVerified profile profileModel tokenVersion')
      .lean();

    if (!user) {
      throw new ApiError(ERROR_CODES.UNAUTHORIZED);
    }

    // ── Token revocation via version check (Caveat #4) ───────────────────────
    // logout() increments tokenVersion; any token issued before that is rejected.
    if (typeof decoded.version === 'number' && decoded.version !== user.tokenVersion) {
      throw new ApiError(ERROR_CODES.TOKEN_REVOKED);
    }

    req.user = {
      id: user._id.toString(),
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      role: user.role,
      otpVerified: user.otpVerified,
      profile: user.profile,
      profileModel: user.profileModel,
    };

    return next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }

    return next(new ApiError(ERROR_CODES.UNAUTHORIZED));
  }
};

module.exports = { protect };
