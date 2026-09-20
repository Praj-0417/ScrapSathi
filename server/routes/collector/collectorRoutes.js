'use strict';

const express = require('express');
const router = express.Router();

const collectorController = require('../../controllers/collector/collectorController');
const { protect } = require('../../middlewares/authMiddleware');
const { requireRole } = require('../../middlewares/requireRoleMiddleware');
const { USER_TYPES } = require('../../enums');

const guardCollector = [protect, requireRole(USER_TYPES.WASTE_COLLECTOR)];

router.get('/pickups/available', ...guardCollector, collectorController.listAvailable);
router.get('/pickups',           ...guardCollector, collectorController.myPickups);
router.post('/pickups/:id/accept',   ...guardCollector, collectorController.accept);
router.post('/pickups/:id/cancel',   ...guardCollector, collectorController.cancel);
router.post('/pickups/:id/complete', ...guardCollector, collectorController.complete);

module.exports = router;
