'use strict';

const express = require('express');
const router = express.Router();

const adminController = require('../../controllers/admin/adminController');
const { protect } = require('../../middlewares/authMiddleware');
const { requireRole } = require('../../middlewares/requireRoleMiddleware');
const validate = require('../../middlewares/validateMiddleware');
const { authRateLimit } = require('../../middlewares/rateLimitMiddleware');
const { adminLoginSchema } = require('../../validators/admin/adminValidators');
const { ROLES } = require('../../enums');

const guardAdmin = [protect, requireRole(ROLES.ADMIN)];

// Admin login — no JWT required, just rate-limited
router.post('/auth/login', authRateLimit, validate(adminLoginSchema), adminController.login);

// Protected admin data endpoints
router.get('/users',     ...guardAdmin, adminController.listUsers);
router.get('/pickups',   ...guardAdmin, adminController.listPickups);
router.get('/donations', ...guardAdmin, adminController.listDonations);

module.exports = router;
