const express = require('express');
const otpController = require('../../controllers/user/otp-controller');
const router = express.Router();

router.post('/user-otp', otpController.userOTP);
router.post('/verify-otp', otpController.verifyOTP);
router.post('/send-otp', otpController.sendOTP);

module.exports = router;
