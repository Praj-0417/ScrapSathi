const AuthService = require('../../services/auth.service');
const UserRepository = require('../../repositories/user.repository');

const home = async (req, res) => {
    try {
        res.status(200).send("Welcome to ScrapSathi platform ");
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const register = async (req, res) => {
    try {
        const newUser = await AuthService.registerUser(req.body);
        res.status(201).json({ message: "Registration successful", userId: newUser._id });
    } catch (error) {
        console.error(error.message);
        res.status(400).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await AuthService.loginUser(email, password);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 24 * 60 * 60 * 1000,
        });

        res.status(200).json({ token, user });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(401).json({ message: error.message });
    }
};

const updatePassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;
        await AuthService.updatePassword(email, otp, password);
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(400).json({ message: error.message });
    }
};

const user = async (req, res) => {
    try {
        const userData = req.user;
        return res.status(200).json({ userData });
    } catch (error) {
        console.log(`Error from the user route: ${error}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await UserRepository.findUserById(req.user.userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        console.error("Error in getProfile:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const updatedProfile = await UserRepository.updateProfile(req.user.userId, req.user.userType, req.body);
        if (!updatedProfile) {
            return res.status(404).json({ message: "Profile not found" });
        }
        res.status(200).json(updatedProfile);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { home, register, login, user, updatePassword, getProfile, updateUserProfile };