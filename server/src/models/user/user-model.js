const mongoose = require('mongoose');
const { USER_TYPES } = require('../../constants/enums');

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String, required: true },
        password: { type: String, required: true },
        otpVerified: { type: Boolean, default: false },
        termsAccepted: { type: Boolean, required: true },
        userType: {
            type: String,
            enum: Object.values(USER_TYPES),
            required: true,
        },
        profile: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'profileModel',
        },
        profileModel: {
            type: String,
            required: true,
            enum: ['IndividualProfile', 'WasteCollectorProfile', 'BigOrganizationProfile', 'RecycleCompanyProfile'],
        },
    },
    { timestamps: true }
);

const User = mongoose.model('User', UserSchema);
module.exports = User;



