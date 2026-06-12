const { z } = require('zod');
const { USER_TYPES } = require('../constants/enums');

const registerSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email address'),
        phone: z.string().min(10, 'Phone number must be at least 10 digits'),
        password: z.string().min(6, 'Password must be at least 6 characters long'),
        termsAccepted: z.boolean().refine(val => val === true, {
            message: 'You must accept the Terms and Conditions',
        }),
        userType: z.nativeEnum(USER_TYPES),
        address: z.string().optional(),
        profilePhoto: z.string().optional(),
        companyName: z.string().optional(),
        businessLicenseNo: z.string().optional(),
        wasteType: z.string().optional(),
        recyclingCapabilities: z.string().optional(),
    }),
});

const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
    }),
});

const updatePasswordSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        otp: z.string().length(6, 'OTP must be 6 characters long'),
        password: z.string().min(6, 'Password must be at least 6 characters long'),
    }),
});

const otpSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
    }),
});

module.exports = {
    registerSchema,
    loginSchema,
    updatePasswordSchema,
    otpSchema,
};
