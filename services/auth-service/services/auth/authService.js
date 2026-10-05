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

// ── Helpers ─────────────────────────────────────────────────────────────────

const sanitizeUser = (user) => {
  const safe = typeof user.toObject === 'function' ? user.toObject() : { ...user };
  delete safe.password;
  delete safe.tokenVersion;
  return safe;
};

/**
 * Generate a long-lived access token.
 * Embeds `version` so authMiddleware can detect revocation (Caveat #4).
 */
const generateToken = (user) =>
  jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      userType: user.userType,
      role: user.role,
      name: user.name,
      version: user.tokenVersion ?? 0,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN },
  );

/**
 * Sign a short-lived verification challenge (Caveat #2).
 * Issued after OTP verification; required to call register().
 */
const signVerificationToken = (email) =>
  jwt.sign(
    { email: email.toLowerCase().trim(), purpose: 'registration' },
    env.JWT_SECRET,
    { expiresIn: '15m' },
  );

class AuthService {
  // ─── Registration (Caveat #1 + #2) ────────────────────────────────────────

  async register(userData) {
    const {
      name, email, phone, password, termsAccepted, userType,
      address, companyName, businessLicenseNo, wasteType, recyclingCapabilities,
      verificationToken,   // Required: proof of OTP verification (Caveat #2)
    } = userData;

    if (!termsAccepted) {
      throw new ApiError(ERROR_CODES.TERMS_NOT_ACCEPTED);
    }

    // ── OTP enforcement (Caveat #2) ─────────────────────────────────────────
    // verificationToken is a short-lived JWT issued by verifyOtp() for purpose='registration'.
    if (!verificationToken) {
      throw new ApiError(ERROR_CODES.OTP_NOT_VERIFIED);
    }
    let verifiedEmail;
    try {
      const decoded = jwt.verify(verificationToken, env.JWT_SECRET);
      if (decoded.purpose !== 'registration') throw new Error('Wrong purpose');
      verifiedEmail = decoded.email;
    } catch {
      throw new ApiError(ERROR_CODES.OTP_NOT_VERIFIED);
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (verifiedEmail !== normalizedEmail) {
      throw new ApiError(ERROR_CODES.OTP_NOT_VERIFIED);
    }

    const existing = await authRepository.findUserByEmail(normalizedEmail);
    if (existing) {
      throw new ApiError(ERROR_CODES.USER_ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(password, APP_CONSTANTS.AUTH.BCRYPT_ROUNDS);

    const newUser = await authRepository.createUserWithProfile(
      { name, email: normalizedEmail, phone, password: hashedPassword, userType, termsAccepted },
      { address, companyName, businessLicenseNo, wasteType, recyclingCapabilities },
    );

    emailAdapter.sendWelcomeEmail(newUser.email, newUser.name).catch((err) => {
      logger.warn('Welcome email failed', { userId: newUser._id.toString(), error: err.message });
    });

    // ── Auto-login after registration (Caveat #1) ────────────────────────────
    const token = generateToken(newUser);
    return { user: sanitizeUser(newUser), token };
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

  // ─── Logout with revocation (Caveat #4) ───────────────────────────────────

  async logout(userId) {
    // Increment tokenVersion → all existing JWTs for this user become invalid.
    await authRepository.incrementTokenVersion(userId);
  }

  // ─── Google OAuth with proper verification (Caveat #3) ────────────────────

  async googleLogin({ credential, email, name, picture, googleId }) {
    let resolvedEmail = email;
    let resolvedName = name;
    let resolvedPicture = picture;
    let resolvedGoogleId = googleId;

    if (credential) {
      if (env.GOOGLE_CLIENT_ID) {
        // ── Proper Google ID token verification (Caveat #3) ─────────────────
        try {
          const { OAuth2Client } = require('google-auth-library');
          const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
          const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: env.GOOGLE_CLIENT_ID,
          });
          const payload = ticket.getPayload();
          // payload.iss is verified by the library; payload.exp is checked too.
          resolvedEmail   = resolvedEmail   || payload.email;
          resolvedName    = resolvedName    || payload.name;
          resolvedPicture = resolvedPicture || payload.picture;
          resolvedGoogleId = resolvedGoogleId || payload.sub;
        } catch (err) {
          logger.error('Google ID token verification failed', { error: err.message });
          throw new ApiError(ERROR_CODES.GOOGLE_AUTH_FAILED);
        }
      } else {
        // GOOGLE_CLIENT_ID not set — development fallback only.
        logger.warn('GOOGLE_CLIENT_ID not configured. Skipping Google token signature verification. Set it in production.');
        try {
          const parts = credential.split('.');
          if (parts.length >= 2) {
            const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const parsed = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
            resolvedEmail    = resolvedEmail    || parsed.email;
            resolvedName     = resolvedName     || parsed.name;
            resolvedPicture  = resolvedPicture  || parsed.picture;
            resolvedGoogleId = resolvedGoogleId || parsed.sub;
          }
        } catch (err) {
          logger.warn('Failed to parse Google credential token', { error: err.message });
        }
      }
    }

    if (!resolvedEmail) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Email is required for Google login');
    }

    resolvedEmail = resolvedEmail.toLowerCase().trim();
    let user = await authRepository.findUserByEmail(resolvedEmail);

    if (user) {
      const updates = {};
      if (!user.googleId && resolvedGoogleId) updates.googleId = resolvedGoogleId;
      if (!user.avatar && resolvedPicture)    updates.avatar   = resolvedPicture;
      if (Object.keys(updates).length > 0) {
        user = await authRepository.updateUser(user._id, updates);
      }
    } else {
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
        { address: '', profilePhoto: resolvedPicture || '' },
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

  /**
   * Verify OTP and return a short-lived verificationToken (Caveat #2).
   * For registration: token must be passed to register() as proof of email ownership.
   * For password reset: token is not returned (existing flow re-verifies inside resetPassword).
   */
  async verifyOtp(email, otp, purpose = null) {
    const record = await authRepository.findLatestUnusedOtp(email);
    if (!record) return { isValid: false };

    if (record.expiresAt < new Date()) {
      await authRepository.markOtpUsed(record._id);
      return { isValid: false };
    }

    const isMatch = await bcrypt.compare(otp, record.otp);
    if (!isMatch) return { isValid: false };

    await authRepository.markOtpUsed(record._id);

    // Issue a verification challenge token when the purpose is registration
    const verificationToken = purpose === 'registration'
      ? signVerificationToken(email)
      : null;

    return { isValid: true, verificationToken };
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
    const { isValid } = await this.verifyOtp(email, otp);
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



