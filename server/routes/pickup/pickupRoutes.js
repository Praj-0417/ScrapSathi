'use strict';

const express = require('express');
const router = express.Router();

const pickupController = require('../../controllers/pickup/pickupController');
const { protect } = require('../../middlewares/authMiddleware');
const validate = require('../../middlewares/validateMiddleware');
const upload = require('../../middlewares/uploadMiddleware');
const { createPickupSchema, cancelPickupSchema } = require('../../validators/pickup/pickupValidators');

router.post(
  '/',
  protect,
  upload.single('photo'),
  validate(createPickupSchema),
  pickupController.create,
);

router.get('/',             protect, pickupController.listMyPickups);
router.get('/:id',          protect, pickupController.getOne);
router.get('/:id/tracking', protect, pickupController.getTracking);
router.patch('/:id/cancel', protect, validate(cancelPickupSchema), pickupController.cancel);

module.exports = router;
