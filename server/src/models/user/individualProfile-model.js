const mongoose = require('mongoose');

const IndividualProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    address: { type: String },
    profilePhoto: { type: String },
});

const IndividualProfile = mongoose.model('IndividualProfile', IndividualProfileSchema);
module.exports = IndividualProfile;
