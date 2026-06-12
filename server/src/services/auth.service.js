const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/user.repository');
const { USER_TYPES } = require('../constants/enums');
const OtpService = require('./otp.service');

class AuthService {
    async registerUser(userData) {
        const { name, email, phone, password, termsAccepted, userType, ...profileData } = userData;

        if (!termsAccepted) {
            throw new Error('You must accept the Terms and Conditions to register.');
        }

        const existingUser = await UserRepository.findUserByEmail(email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await UserRepository.createUser(
            {
                name,
                email,
                phone,
                password: hashedPassword,
                userType,
                termsAccepted,
            },
            profileData
        );

        return newUser;
    }

    async loginUser(email, password) {
        const user = await UserRepository.findUserByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            throw new Error('Invalid email or password');
        }

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                userType: user.userType,
                name: user.name,
                phone: user.phone,
            },
            process.env.JWT_SECRET || 'achhaLol',
            {
                expiresIn: '24h',
            }
        );

        return { user, token };
    }

    async updatePassword(email, otp, newPassword) {
        const isValidOtp = await OtpService.verifyOtp(email, otp);
        if (!isValidOtp) {
            throw new Error('Invalid OTP');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const user = await UserRepository.findUserByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }

        await UserRepository.updateUser(user._id, { password: hashedPassword });
    }
}

module.exports = new AuthService();
