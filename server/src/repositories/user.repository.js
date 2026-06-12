const User = require('../models/user/user-model');
const IndividualProfile = require('../models/user/individualProfile-model');
const WasteCollectorProfile = require('../models/user/wasteCollectorProfile-model');
const BigOrganizationProfile = require('../models/user/bigOrganizationProfile-model');
const RecycleCompanyProfile = require('../models/user/recycleCompanyProfile-model');
const { USER_TYPES } = require('../constants/enums');

const profileModelMap = {
    [USER_TYPES.INDIVIDUAL]: IndividualProfile,
    [USER_TYPES.WASTE_COLLECTOR]: WasteCollectorProfile,
    [USER_TYPES.BIG_ORGANIZATION]: BigOrganizationProfile,
    [USER_TYPES.RECYCLE_COMPANY]: RecycleCompanyProfile,
};

class UserRepository {
    async findUserByEmail(email) {
        return await User.findOne({ email: email.toLowerCase() }).populate('profile');
    }

    async findUserById(id) {
        return await User.findById(id).populate('profile');
    }

    async createUser(userData, profileData) {
        const ProfileModel = profileModelMap[userData.userType];
        if (!ProfileModel) {
            throw new Error('Invalid user type');
        }

        const profile = new ProfileModel(profileData);
        await profile.save();

        const newUser = new User({
            ...userData,
            profile: profile._id,
            profileModel: ProfileModel.modelName,
        });
        await newUser.save();
        
        profile.user = newUser._id;
        await profile.save();


        return newUser;
    }

    async updateUser(id, userData) {
        return await User.findByIdAndUpdate(id, userData, { new: true });
    }

    async updateProfile(userId, userType, profileData) {
        const ProfileModel = profileModelMap[userType];
        if (!ProfileModel) {
            throw new Error('Invalid user type');
        }
        const user = await this.findUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return await ProfileModel.findByIdAndUpdate(user.profile, profileData, { new: true });
    }
}

module.exports = new UserRepository();
