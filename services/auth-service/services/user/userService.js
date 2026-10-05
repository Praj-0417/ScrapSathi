'use strict';

const userRepository = require('../../repositories/user/userRepository');
const { ApiError } = require('../../utils/ApiError');
const { ERROR_CODES } = require('../../constants');

const getMe = async (userId) => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new ApiError(ERROR_CODES.USER_NOT_FOUND);
  }
  return user;
};

const updateMe = async (userId, data) => {
  const user = await userRepository.updateUserById(userId, data);
  if (!user) {
    throw new ApiError(ERROR_CODES.USER_NOT_FOUND);
  }
  return user;
};

const updateProfile = async (userId, userType, data) => {
  const profile = await userRepository.updateProfile(userId, userType, data);
  if (!profile) {
    throw new ApiError(ERROR_CODES.PROFILE_NOT_FOUND);
  }
  return profile;
};

module.exports = {
  getMe,
  updateMe,
  updateProfile,
};
