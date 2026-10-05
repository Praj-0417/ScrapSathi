'use strict';

const express = require('express');
const router = express.Router();

const donationController = require('../../controllers/donation/donationController');
const { protect } = require('../../middlewares/authMiddleware');
const validate = require('../../middlewares/validateMiddleware');
const { createDonationSchema } = require('../../validators/donation/donationValidators');

router.post('/',   protect, validate(createDonationSchema), donationController.create);
router.get('/me',  protect, donationController.listMine);

module.exports = router;
