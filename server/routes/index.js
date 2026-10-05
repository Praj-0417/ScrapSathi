'use strict';

const express = require('express');
const { success } = require('../utils/apiResponse');

// ─── Modular Route Imports ───────────────────────────────────────────────────
const authRoutes       = require('./auth/authRoutes');
const usersRoutes      = require('./user/userRoutes');
const pickupsRoutes    = require('./pickup/pickupRoutes');
const collectorsRoutes = require('./collector/collectorRoutes');
const adminRoutes      = require('./admin/adminRoutes');
const donationsRoutes  = require('./donation/donationRoutes');
const rateRoutes       = require('./rates/rateRoutes');
const geocodeRoutes    = require('./geocode/geocodeRoutes');
const contactRoutes    = require('./contact/contactRoutes');

const router = express.Router();

// ─── Health ───────────────────────────────────────────────────────────────────
router.get('/health', (_req, res) =>
  success(res, {
    message: 'ScrapSaathi API v1 is healthy',
    data: { service: 'scrapsaathi-api', version: 'v1' },
  }),
);

// ─── API Routes ──────────────────────────────────────────────────────────────
router.use('/auth',       authRoutes);
router.use('/otp',        authRoutes);
router.use('/users',      usersRoutes);
router.use('/pickups',    pickupsRoutes);
router.use('/collector',  collectorsRoutes);
router.use('/admin',      adminRoutes);
router.use('/donations',  donationsRoutes);
router.use('/rates',      rateRoutes);
router.use('/geocode',    geocodeRoutes);
router.use('/contact',    contactRoutes);

module.exports = router;
