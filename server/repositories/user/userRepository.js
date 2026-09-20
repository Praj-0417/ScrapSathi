'use strict';

const User = require('../../models/user/userModel');
const IndividualProfile = require('../../models/user/individualProfileModel');
const BigOrganizationProfile = require('../../models/user/bigOrganizationProfileModel');
const RecycleCompanyProfile = require('../../models/user/recycleCompanyProfileModel');
const WasteCollectorProfile = require('../../models/user/wasteCollectorProfileModel');
const { USER_TYPES } = require('../../enums');

const findUserById = async (userId) => {
  return User.findById(userId).select('-password').populate('profile').exec();
};

const findUserByEmail = async (email) => {
  return User.findOne({ email: email.toLowerCase().trim() }).select('-password').populate('profile').exec();
};

const updateUserById = async (userId, data) => {
  return User.findByIdAndUpdate(userId, data, { new: true, runValidators: true }).select('-password').exec();
};

const getProfileModel = (userType) => {
  switch (userType) {
    case USER_TYPES.INDIVIDUAL:
    case 'Individual':
      return IndividualProfile;
    case USER_TYPES.BIG_ORGANIZATION:
    case 'Big Organization':
      return BigOrganizationProfile;
    case USER_TYPES.RECYCLE_COMPANY:
    case 'Recycle Company':
      return RecycleCompanyProfile;
    case USER_TYPES.WASTE_COLLECTOR:
    case 'Waste Collector':
      return WasteCollectorProfile;
    default:
      return null;
  }
};

const updateProfile = async (userId, userType, profileData) => {
  const user = await User.findById(userId);
  if (!user) return null;

  const ProfileModel = getProfileModel(userType);
  if (!ProfileModel) return null;

  if (user.profile) {
    return ProfileModel.findByIdAndUpdate(user.profile, profileData, { new: true, runValidators: true });
  } else {
    const newProfile = new ProfileModel({ ...profileData, user: userId });
    await newProfile.save();
    user.profile = newProfile._id;
    await user.save();
    return newProfile;
  }
};

module.exports = {
  findUserById,
  findUserByEmail,
  updateUserById,
  updateProfile,
};
