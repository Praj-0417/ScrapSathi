const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: { type: Date,
      required: true, 
      default: () => Date.now() + 10 * 60 * 1000 }, // Expires in 10 minutes
});

otpSchema.pre("save", async function (next) {
  console.log("New document saved to the database");
  next();
});

module.exports = mongoose.model("OTP", otpSchema);