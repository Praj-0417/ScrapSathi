'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const authRepository = require('../../repositories/auth/authRepository');
const emailAdapter = require('../../infrastructure/email/emailAdapter');
const { ApiError } = require('../../utils/ApiError');
const { ERROR_CODES, APP_CONSTANTS } = require('../../constants');
const { env } = require('../../config/env');
const logger = require('../../utils/logger');
const { USER_TYPES, ROLES } = require('../../enums');

const sanitizeUser = (user) => {
  const safe = typeof user.toObject === 'function' ? user.toObject() : { ...user };
  delete safe.password;
  return safe;
};

const generateToken = (user) =>
  jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      userType: user.userType,
      role: user.role,
      name: user.name,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN },
  );

class AuthService {
  // ─── Registration ──────────────────────────────────────────────────────────

  async register(userData) {
    const {
      name, email, phone, password, termsAccepted, userType,
      address, companyName, businessLicenseNo, wasteType, recyclingCapabilities,
    } = userData;

    if (!termsAccepted) {
      throw new ApiError(ERROR_CODES.TERMS_NOT_ACCEPTED);
    }

    const existing = await authRepository.findUserByEmail(email);
    if (existing) {
      throw new ApiError(ERROR_CODES.USER_ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(password, APP_CONSTANTS.AUTH.BCRYPT_ROUNDS);

    const newUser = await authRepository.createUserWithProfile(
      { name, email, phone, password: hashedPassword, userType, termsAccepted },
      { address, companyName, businessLicenseNo, wasteType, recyclingCapabilities },
    );

    // Send welcome email (non-blocking — failure should not break registration)
    emailAdapter.sendWelcomeEmail(newUser.email, newUser.name).catch((err) => {
      logger.warn('Welcome email failed', { userId: newUser._id.toString(), error: err.message });
    });

    return sanitizeUser(newUser);
  }

  // ─── Login ─────────────────────────────────────────────────────────────────

  async login(email, password) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      throw new ApiError(ERROR_CODES.INVALID_CREDENTIALS);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new ApiError(ERROR_CODES.INVALID_CREDENTIALS);
    }

    const token = generateToken(user);
    return { user: sanitizeUser(user), token };
  }

  // ─── Google OAuth ──────────────────────────────────────────────────────────

  async googleLogin({ credential, email, name, picture, googleId }) {
    let resolvedEmail = email;
    let resolvedName = name;
    let resolvedPicture = picture;
    let resolvedGoogleId = googleId;

    // Decode Google JWT credential token if provided
    if (credential) {
      try {
        const parts = credential.split('.');
        if (parts.length >= 2) {
          const base64Url = parts[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
          const parsed = JSON.parse(jsonPayload);
          resolvedEmail = resolvedEmail || parsed.email;
          resolvedName = resolvedName || parsed.name;
          resolvedPicture = resolvedPicture || parsed.picture;
          resolvedGoogleId = resolvedGoogleId || parsed.sub;
        }
      } catch (err) {
        logger.warn('Failed to parse Google credential token, falling back to body fields', {
          error: err.message,
        });
      }
    }

    if (!resolvedEmail) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Email is required for Google login');
    }

    resolvedEmail = resolvedEmail.toLowerCase().trim();
    let user = await authRepository.findUserByEmail(resolvedEmail);

    if (user) {
      // User exists. Link googleId and avatar if not present
      const updates = {};
      if (!user.googleId && resolvedGoogleId) updates.googleId = resolvedGoogleId;
      if (!user.avatar && resolvedPicture) updates.avatar = resolvedPicture;
      if (Object.keys(updates).length > 0) {
        user = await authRepository.updateUser(user._id, updates);
      }
    } else {
      // Auto-provision new user with Individual profile
      user = await authRepository.createUserWithProfile(
        {
          name: resolvedName || resolvedEmail.split('@')[0],
          email: resolvedEmail,
          phone: '',
          googleId: resolvedGoogleId || `google_${Date.now()}`,
          authProvider: 'google',
          avatar: resolvedPicture || '',
          userType: USER_TYPES.INDIVIDUAL,
          role: ROLES.USER,
          termsAccepted: true,
          otpVerified: true,
        },
        {
          address: '',
          profilePhoto: resolvedPicture || '',
        }
      );
    }

    const token = generateToken(user);
    return { user: sanitizeUser(user), token };
  }

  // ─── OTP ───────────────────────────────────────────────────────────────────

  async sendRegistrationOtp(email) {
    const existing = await authRepository.findUserByEmail(email);
    if (existing) {
      throw new ApiError(ERROR_CODES.USER_ALREADY_EXISTS);
    }
    return this._generateAndSendOtp(email);
  }

  async sendPasswordResetOtp(email) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      throw new ApiError(ERROR_CODES.USER_NOT_FOUND);
    }
    return this._generateAndSendOtp(email);
  }

  async verifyOtp(email, otp) {
    const record = await authRepository.findLatestUnusedOtp(email);
    if (!record) return false;

    if (record.expiresAt < new Date()) {
      await authRepository.markOtpUsed(record._id);
      return false;
    }

    const isMatch = await bcrypt.compare(otp, record.otp);
    if (!isMatch) return false;

    await authRepository.markOtpUsed(record._id);
    return true;
  }

  async _generateAndSendOtp(email) {
    const otp = otpGenerator.generate(APP_CONSTANTS.AUTH.OTP_LENGTH, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const hashedOtp = await bcrypt.hash(otp, APP_CONSTANTS.AUTH.OTP_BCRYPT_ROUNDS);
    await authRepository.createOtp(email, hashedOtp);

    try {
      await emailAdapter.sendOtpEmail(email, otp);
    } catch (error) {
      logger.error('OTP email send failed', { email, error: error.message });
      throw new ApiError(ERROR_CODES.OTP_SEND_FAILED);
    }
  }

  // ─── Password Reset ────────────────────────────────────────────────────────

  async resetPassword(email, otp, newPassword) {
    const isValid = await this.verifyOtp(email, otp);
    if (!isValid) {
      throw new ApiError(ERROR_CODES.INVALID_OTP);
    }

    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      throw new ApiError(ERROR_CODES.USER_NOT_FOUND);
    }

    const hashedPassword = await bcrypt.hash(newPassword, APP_CONSTANTS.AUTH.BCRYPT_ROUNDS);
    await authRepository.updateUser(user._id, { password: hashedPassword });
  }
}

module.exports = new AuthService();
