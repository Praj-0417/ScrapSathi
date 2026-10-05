'use strict';

const express = require('express');
const rateController = require('../../controllers/rates/rateController');
const { protect } = require('../../middlewares/authMiddleware');
const { requireRole } = require('../../middlewares/requireRoleMiddleware');
const { ROLES } = require('../../enums');

const router = express.Router();
const guardAdmin = [protect, requireRole(ROLES.ADMIN)];

// ─── Scrap Rates Routes (Clean Layering — Caveat #15) ─────────────────────────
// Public rate board
router.get('/', rateController.getRates);

// Admin rate management
router.patch('/item', ...guardAdmin, rateController.updateItem);
router.post('/item', ...guardAdmin, rateController.addItem);
router.delete('/item/:itemId', ...guardAdmin, rateController.deleteItem);

module.exports = router;
