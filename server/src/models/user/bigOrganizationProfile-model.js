const mongoose = require('mongoose');

const BigOrganizationProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    address: { type: String },
    profilePhoto: { type: String },
    companyName: { type: String },
    businessLicenseNo: { type: String },
    wasteType: { type: String },
});

const BigOrganizationProfile = mongoose.model('BigOrganizationProfile', BigOrganizationProfileSchema);
module.exports = BigOrganizationProfile;
