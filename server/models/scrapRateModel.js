'use strict';

const mongoose = require('mongoose');

const ScrapItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  unit: { type: String, default: 'kg', trim: true },
  prices: {
    type: Map,
    of: Number,
    default: { 'delhi-ncr': 15, 'bengaluru': 14 },
  },
  popular: { type: Boolean, default: false },
  description: { type: String, default: '' },
  icon: { type: String, default: '📦' },
  active: { type: Boolean, default: true },
});

const ScrapRateCategorySchema = new mongoose.Schema(
  {
    categoryId: { type: String, required: true, unique: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: '📦' },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
    items: [ScrapItemSchema],
  },
  { timestamps: true }
);

const ScrapRateCategory = mongoose.model('ScrapRateCategory', ScrapRateCategorySchema);
module.exports = ScrapRateCategory;
