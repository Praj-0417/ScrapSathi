'use strict';

const express = require('express');
const router = express.Router();

const userController = require('../../controllers/user/userController');
const { protect } = require('../../middlewares/authMiddleware');

router.get('/me',           protect, userController.getMe);
router.patch('/me',         protect, userController.updateMe);
router.patch('/me/profile', protect, userController.updateProfile);

module.exports = router;
