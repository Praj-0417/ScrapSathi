const OtpService = require('../../services/otp.service');

const userOTP = async (req, res) => {
    try {
        const { email } = req.body;
        await OtpService.sendRegistrationOtp(email);
        res.status(200).json({
            success: true,
            message: "OTP sent successfully"
        });
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        await OtpService.sendPasswordResetOtp(email);
        res.status(200).json({
            success: true,
            message: 'OTP sent successfully'
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const isValid = await OtpService.verifyOtp(email, otp);
        if (isValid) {
            res.status(200).json({ success: true, message: 'OTP verified successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify OTP. Please try again later.',
        });
    }
};

module.exports = { userOTP, sendOTP, verifyOTP };