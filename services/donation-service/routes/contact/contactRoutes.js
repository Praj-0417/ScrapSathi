'use strict';

const express = require('express');
const router = express.Router();

const contactController = require('../../controllers/contact/contactController');
const validate = require('../../middlewares/validateMiddleware');
const { contactInquirySchema } = require('../../validators/contact/contactValidators');
const { contactRateLimit } = require('../../middlewares/rateLimitMiddleware');

router.post('/', contactRateLimit, validate(contactInquirySchema), contactController.submitContact);

module.exports = router;
