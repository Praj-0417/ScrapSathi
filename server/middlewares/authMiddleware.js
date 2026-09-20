'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/user/userModel');
const { env } = require('../config/env');
const { ApiError } = require('../utils/ApiError');
const { ERROR_CODES } = require('../constants');

const protect = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new ApiError(ERROR_CODES.UNAUTHORIZED);
    }

    const token = authorization.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (!decoded.userId) {
      throw new ApiError(ERROR_CODES.UNAUTHORIZED);
    }

    const user = await User.findById(decoded.userId)
      .select('name email phone userType role otpVerified profile profileModel')
      .lean();

    if (!user) {
      throw new ApiError(ERROR_CODES.UNAUTHORIZED);
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
