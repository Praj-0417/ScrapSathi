'use strict';

const mongoose = require('mongoose');
const { DONATION_CAUSES } = require('../enums');

const DonationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [10, 'Donation amount must be at least ₹10'],
    },
    cause: {
      type: String,
      enum: Object.values(DONATION_CAUSES),
      default: DONATION_CAUSES.GENERAL,
    },
    donorName: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 10,
    },
    transactionId: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    paymentMethod: {
      type: String,
      enum: ['upi_qr', 'card', 'netbanking', 'wallet'],
      default: 'upi_qr',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
    },
    certificateId: {
      type: String,
      unique: true,
      sparse: true,
    },
    message: {
      type: String,
      maxlength: 500,
      trim: true,
    },
  },
  { timestamps: true },
);

DonationSchema.index({ userId: 1, createdAt: -1 });
DonationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Donation', DonationSchema);
