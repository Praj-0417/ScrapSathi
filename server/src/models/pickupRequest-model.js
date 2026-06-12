const mongoose = require("mongoose");
const { PICKUP_REQUEST_STATUS } = require('../constants/enums');

const pickupRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  wasteCollector: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  wasteDetails: [{
    wasteType: { type: String, required: true },
    subcategory: { type: String },
    quantity: { type: Number, required: true },
  }],
  photo: { type: String }, // URL to the image
  address: { type: String, required: true },
  preferredTimeSlot: { type: String, required: true },
  status: { type: String, enum: Object.values(PICKUP_REQUEST_STATUS), default: PICKUP_REQUEST_STATUS.PENDING },
  statusHistory: [{
    status: { type: String, enum: Object.values(PICKUP_REQUEST_STATUS) },
    timestamp: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model("PickupRequest", pickupRequestSchema);
