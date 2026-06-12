const mongoose = require('mongoose');

const WasteCollectorProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    address: { type: String },
    profilePhoto: { type: String },
    companyName: { type: String },
    businessLicenseNo: { type: String },
});

const WasteCollectorProfile = mongoose.model('WasteCollectorProfile', WasteCollectorProfileSchema);
module.exports = WasteCollectorProfile;
