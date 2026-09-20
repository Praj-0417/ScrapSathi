'use strict';

const userService = require('../../services/user/userService');
const { success } = require('../../utils/apiResponse');
const { MESSAGES } = require('../../constants');

const getMe = async (req, res, next) => {
  try {
    const user = await userService.getMe(req.user.userId);
    return success(res, { message: MESSAGES.USER_FETCHED, data: { user } });
  } catch (error) {
    return next(error);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const user = await userService.updateMe(req.user.userId, req.body);
    return success(res, { message: MESSAGES.PROFILE_UPDATED, data: { user } });
  } catch (error) {
    return next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const profile = await userService.updateProfile(
      req.user.userId,
      req.user.userType,
      req.body,
    );
    return success(res, { message: MESSAGES.PROFILE_UPDATED, data: { profile } });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getMe, updateMe, updateProfile };
