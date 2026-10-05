'use strict';

const ScrapRateCategory = require('../../models/scrapRateModel');
const logger = require('../../utils/logger');

// Initial seed data if database collection is empty
const DEFAULT_SEED_DATA = [
  {
    categoryId: 'normal',
    name: 'Paper & Cardboard',
    icon: '📰',
    description: 'Newspaper, books, corrugated boxes & packaging',
    order: 1,
    items: [
      { itemId: 'newspaper', name: 'Newspaper (Raddi)', unit: 'kg', prices: { 'delhi-ncr': 15, 'bengaluru': 14, 'mumbai': 15 }, popular: true, description: 'Old newspapers, raddi', icon: '🗞️' },
      { itemId: 'office-paper', name: 'Office Paper (A3/A4)', unit: 'kg', prices: { 'delhi-ncr': 14, 'bengaluru': 14, 'mumbai': 13 }, popular: false, description: 'White papers, documents, printouts', icon: '📄' },
      { itemId: 'books', name: 'Books & Magazines', unit: 'kg', prices: { 'delhi-ncr': 12, 'bengaluru': 12, 'mumbai': 12 }, popular: true, description: 'School books, notebooks, novels, magazines', icon: '📚' },
      { itemId: 'cardboard', name: 'Cardboard / Carton', unit: 'kg', prices: { 'delhi-ncr': 8, 'bengaluru': 6, 'mumbai': 8 }, popular: true, description: 'Corrugated shipping boxes, carton packaging', icon: '📦' },
    ],
  },
  {
    categoryId: 'metals',
    name: 'Metals & Utensils',
    icon: '🔩',
    description: 'Iron, Steel, Aluminium, Brass & Copper scrap',
    order: 2,
    items: [
      { itemId: 'iron', name: 'Iron (Loha)', unit: 'kg', prices: { 'delhi-ncr': 25, 'bengaluru': 23, 'mumbai': 26 }, popular: true, description: 'Iron rods, grills, metal scraps, bed frames', icon: '🔩' },
      { itemId: 'steel', name: 'Steel (Stainless)', unit: 'kg', prices: { 'delhi-ncr': 42, 'bengaluru': 35, 'mumbai': 40 }, popular: true, description: 'Steel utensils, sink parts, stainless steel scrap', icon: '🥄' },
      { itemId: 'aluminium', name: 'Aluminium Scrap', unit: 'kg', prices: { 'delhi-ncr': 112, 'bengaluru': 105, 'mumbai': 110 }, popular: true, description: 'Aluminium utensils, door frames, sections', icon: '🥫' },
      { itemId: 'brass', name: 'Brass (Peetal)', unit: 'kg', prices: { 'delhi-ncr': 325, 'bengaluru': 325, 'mumbai': 330 }, popular: true, description: 'Brass pooja items, taps, decorative items', icon: '🪔' },
      { itemId: 'copper', name: 'Copper (Taamba)', unit: 'kg', prices: { 'delhi-ncr': 505, 'bengaluru': 505, 'mumbai': 510 }, popular: true, description: 'Copper wires, utensils, motor winding copper', icon: '🥉' },
    ],
  },
  {
    categoryId: 'appliances',
    name: 'Large Appliances',
    icon: '❄️',
    description: 'Air Conditioners, Refrigerators, Washing Machines',
    order: 3,
    items: [
      { itemId: 'ac-15ton', name: 'Split / Window AC (1.5 Ton)', unit: 'unit', prices: { 'delhi-ncr': 5150, 'bengaluru': 4150, 'mumbai': 5000 }, popular: true, description: 'Indoor + Outdoor unit / Window AC with compressor', icon: '❄️' },
      { itemId: 'fridge-double-door', name: 'Double Door Refrigerator', unit: 'unit', prices: { 'delhi-ncr': 1350, 'bengaluru': 1200, 'mumbai': 1300 }, popular: true, description: 'Frost-free double door fridge', icon: '🧊' },
      { itemId: 'fridge-single-door', name: 'Single Door Refrigerator', unit: 'unit', prices: { 'delhi-ncr': 1100, 'bengaluru': 1000, 'mumbai': 1050 }, popular: true, description: 'Direct cool single door fridge', icon: '🧊' },
      { itemId: 'wm-front-load', name: 'Automatic Washing Machine', unit: 'unit', prices: { 'delhi-ncr': 1350, 'bengaluru': 1200, 'mumbai': 1300 }, popular: true, description: 'Front / Top load automatic washing machine', icon: '🧺' },
      { itemId: 'microwave', name: 'Microwave Oven', unit: 'unit', prices: { 'delhi-ncr': 350, 'bengaluru': 250, 'mumbai': 300 }, popular: false, description: 'Solo, grill or convection microwave', icon: '🍲' },
    ],
  },
  {
    categoryId: 'electronics',
    name: 'Small Appliances & E-Waste',
    icon: '🔌',
    description: 'Batteries, Inverters, Laptops, CPUs & Electronics',
    order: 4,
    items: [
      { itemId: 'inverter-battery', name: 'Lead Acid Inverter Battery', unit: 'kg', prices: { 'delhi-ncr': 81, 'bengaluru': 72, 'mumbai': 80 }, popular: true, description: '100Ah - 220Ah tubular inverter battery', icon: '🔋' },
      { itemId: 'laptops-cpus', name: 'Laptops & Desktop CPUs', unit: 'unit', prices: { 'delhi-ncr': 350, 'bengaluru': 300, 'mumbai': 350 }, popular: true, description: 'Old working or dead laptops, motherboards & CPUs', icon: '💻' },
      { itemId: 'ceiling-fan', name: 'Ceiling Fan', unit: 'unit', prices: { 'delhi-ncr': 200, 'bengaluru': 180, 'mumbai': 200 }, popular: false, description: 'Copper winding ceiling fan with blades', icon: '🌀' },
    ],
  },
  {
    categoryId: 'plastics',
    name: 'Plastics & Bottles',
    icon: '🧴',
    description: 'PET bottles, HDPE containers, hard plastics & glass',
    order: 5,
    items: [
      { itemId: 'plastic', name: 'Soft & Hard Plastic', unit: 'kg', prices: { 'delhi-ncr': 12, 'bengaluru': 10, 'mumbai': 11 }, popular: true, description: 'Plastic bottles, containers, jars, buckets', icon: '🧴' },
      { itemId: 'glass', name: 'Glass Bottles', unit: 'kg', prices: { 'delhi-ncr': 2, 'bengaluru': 2, 'mumbai': 2 }, popular: false, description: 'Beer bottles, glass containers (unbroken)', icon: '🍾' },
    ],
  },
];

class RateRepository {
  async getAllCategories() {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return DEFAULT_SEED_DATA;
    }
    let categories = await ScrapRateCategory.find().sort({ order: 1 });
    if (!categories || categories.length === 0) {
      try {
        await ScrapRateCategory.insertMany(DEFAULT_SEED_DATA);
        categories = await ScrapRateCategory.find().sort({ order: 1 });
      } catch (err) {
        logger.warn('Could not seed scrap rates, returning memory fallback', { error: err.message });
        return DEFAULT_SEED_DATA;
      }
    }
    return categories;
  }

  async findCategoryById(categoryId) {
    return ScrapRateCategory.findOne({ categoryId });
  }

  async findCategoryByItemId(itemId) {
    return ScrapRateCategory.findOne({ 'items.itemId': itemId });
  }

  async saveCategory(category) {
    return category.save();
  }
}

module.exports = new RateRepository();
