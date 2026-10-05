'use strict';

const mongoose = require('mongoose');
const { PICKUP_REQUEST_STATUS, WASTE_UNITS, LOCATION_TYPES } = require('../enums');

const wasteDetailSchema = new mongoose.Schema(
  {
    wasteType: { type: String, required: true, trim: true },
    subcategory: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 0.1 },
    unit: {
      type: String,
      default: WASTE_UNITS.KG,
      enum: Object.values(WASTE_UNITS),
    },
  },
  { _id: false },
);

const statusEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: Object.values(PICKUP_REQUEST_STATUS),
      required: true,
    },
    note: { type: String },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false },
);

const quoteLineSchema = new mongoose.Schema(
  {
    wasteType:  { type: String, required: true },
    subcategory: { type: String },
    quantity:   { type: Number, required: true },
    unit:       { type: String, default: 'kg' },
    unitRate:   { type: Number, required: true }, // ₹ per unit at time of booking
    lineTotal:  { type: Number, required: true },
  },
  { _id: false },
);

const settlementSchema = new mongoose.Schema(
  {
    finalWeight:     { type: Number },               // kg as measured on site
    evidenceUrls:    [{ type: String }],             // Cloudinary URLs for evidence photos
    adjustmentReason:{ type: String, maxlength: 500 },
    settledAmount:   { type: Number },
    settledAt:       { type: Date },
    settledBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false },
);

const pickupRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    wasteCollector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    wasteDetails: {
      type: [wasteDetailSchema],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'At least one waste detail is required',
      },
    },
    // Server-calculated quote snapshot — immutable after creation
    quote: {
      items:            [quoteLineSchema],
      city:             { type: String },
      currency:         { type: String, default: 'INR' },
      totalEstimate:    { type: Number },      // Sum of all line totals
      rateSnapshotDate: { type: Date },        // When rates were captured
    },
    imageUrl:        { type: String },
    imagePublicId:   { type: String },
    address:         { type: String, required: true, trim: true },
    scheduledDate:   { type: Date },
    preferredTimeSlot: { type: String, required: true, trim: true },
    customerNotes:   { type: String, maxlength: 1000, trim: true },
    collectorNotes:  { type: String, maxlength: 1000, trim: true },
    settlement:      settlementSchema,
    status: {
      type: String,
      enum: Object.values(PICKUP_REQUEST_STATUS),
      default: PICKUP_REQUEST_STATUS.PENDING,
      index: true,
    },
    statusHistory: [statusEventSchema],
    location: {
      type: {
        type: String,
        enum: Object.values(LOCATION_TYPES),
      },
      coordinates: [Number], // [longitude, latitude]
    },
    // Authenticated live tracking telemetry from assigned collector (Caveat #10)
    liveTracking: {
      coordinates: [Number], // [longitude, latitude]
      heading:     { type: Number },
      speed:       { type: Number },
      updatedAt:   { type: Date },
    },
  },
  { timestamps: true },
);

// Compound indexes for common query patterns
pickupRequestSchema.index({ userId: 1, status: 1 });
pickupRequestSchema.index({ wasteCollector: 1, status: 1 });
pickupRequestSchema.index({ status: 1, createdAt: -1 });
pickupRequestSchema.index({ location: '2dsphere' }, { sparse: true });

module.exports = mongoose.model('PickupRequest', pickupRequestSchema);
