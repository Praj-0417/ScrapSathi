const mongoose = require("mongoose");

const DonationSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  message: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Donation", DonationSchema);