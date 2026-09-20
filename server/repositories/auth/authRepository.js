'use strict';

const User = require('../../models/user/userModel');
const OTP = require('../../models/user/otpModel');
const IndividualProfile = require('../../models/user/individualProfileModel');
const WasteCollectorProfile = require('../../models/user/wasteCollectorProfileModel');
const BigOrganizationProfile = require('../../models/user/bigOrganizationProfileModel');
const RecycleCompanyProfile = require('../../models/user/recycleCompanyProfileModel');
const { USER_TYPES } = require('../../enums');
const { ApiError } = require('../../utils/ApiError');
const { ERROR_CODES } = require('../../constants');

const PROFILE_MODEL_MAP = Object.freeze({
  [USER_TYPES.INDIVIDUAL]: IndividualProfile,
  [USER_TYPES.WASTE_COLLECTOR]: WasteCollectorProfile,
  [USER_TYPES.BIG_ORGANIZATION]: BigOrganizationProfile,
  [USER_TYPES.RECYCLE_COMPANY]: RecycleCompanyProfile,
});

class AuthRepository {
  // ─── User ─────────────────────────────────────────────────────────────────

  async findUserByEmail(email) {
    return User.findOne({ email: email.toLowerCase().trim() }).populate('profile');
  }

  async findUserById(id) {
    return User.findById(id).populate('profile');
  }

  async updateUser(id, data) {
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  /**
   * Create a user + their profile atomically (rollback on failure).
   */
  async createUserWithProfile(userData, profileData) {
    const ProfileModel = PROFILE_MODEL_MAP[userData.userType];
    if (!ProfileModel) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST);
    }

    let newUser = null;
    let profile = null;

    try {
      newUser = await User.create({
        ...userData,
        email: userData.email.toLowerCase().trim(),
        profileModel: ProfileModel.modelName,
      });

      profile = await ProfileModel.create({
        ...profileData,
        user: newUser._id,
      });

      newUser.profile = profile._id;
      await newUser.save();

      return this.findUserById(newUser._id);
    } catch (error) {
      // Rollback
      if (profile?._id) {
        await ProfileModel.findByIdAndDelete(profile._id).catch(() => {});
      }
      if (newUser?._id) {
        await User.findByIdAndDelete(newUser._id).catch(() => {});
      }
      throw error;
    }
  }

  async updateProfile(userId, userType, profileData) {
    const ProfileModel = PROFILE_MODEL_MAP[userType];
    if (!ProfileModel) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST);
    }
    const user = await this.findUserById(userId);
    if (!user) throw new ApiError(ERROR_CODES.USER_NOT_FOUND);
    return ProfileModel.findByIdAndUpdate(user.profile, profileData, {
      new: true,
      runValidators: true,
    });
  }

  // ─── OTP ──────────────────────────────────────────────────────────────────

  async createOtp(email, hashedOtp) {
    return OTP.create({ email: email.toLowerCase().trim(), otp: hashedOtp });
  }

  async findLatestUnusedOtp(email) {
    const results = await OTP.find({
      email: email.toLowerCase().trim(),
      usedAt: { $exists: false },
    })
      .sort({ createdAt: -1 })
      .limit(1);
    return results[0] || null;
  }

  async markOtpUsed(id) {
    return OTP.findByIdAndUpdate(id, { usedAt: new Date() });
  }

  async invalidateAllOtpsForEmail(email) {
    return OTP.updateMany(
      { email: email.toLowerCase().trim(), usedAt: { $exists: false } },
      { usedAt: new Date() },
    );
  }
}

module.exports = new AuthRepository();
