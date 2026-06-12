const OtpService = require('../../services/otp.service');

const userOTP = async (req, res, next) => {
    try {
        const { email } = req.body;
        await OtpService.sendRegistrationOtp(email);
        res.status(200).json({
            success: true,
            message: "OTP sent successfully"
        });
    } catch (error) {
        next(error);
    }
};

const sendOTP = async (req, res, next) => {
    try {
        const { email } = req.body;
        await OtpService.sendPasswordResetOtp(email);
        res.status(200).json({
            success: true,
            message: 'OTP sent successfully'
        });
    } catch (error) {
        next(error);
    }
};

const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const isValid = await OtpService.verifyOtp(email, otp);
        if (isValid) {
            res.status(200).json({ success: true, message: 'OTP verified successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { userOTP, sendOTP, verifyOTP };