const mongoose = require('mongoose');

const RecycleCompanyProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    address: { type: String },
    profilePhoto: { type: String },
    companyName: { type: String },
    businessLicenseNo: { type: String },
    recyclingCapabilities: { type: String },
});

const RecycleCompanyProfile = mongoose.model('RecycleCompanyProfile', RecycleCompanyProfileSchema);
module.exports = RecycleCompanyProfile;
