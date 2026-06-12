const express = require('express');
const otpController = require('../../controllers/user/otp-controller');
const validate = require('../../middlewares/validate.middleware');
const { otpSchema } = require('../../validators/auth.validator');
const router = express.Router();

router.post('/user-otp', validate(otpSchema), otpController.userOTP);
router.post('/verify-otp', validate(otpSchema), otpController.verifyOTP);
router.post('/send-otp', validate(otpSchema), otpController.sendOTP);

module.exports = router;
