'use strict';

const mongoose = require('mongoose');
const { USER_TYPES, ROLES, PROFILE_MODELS } = require('../../enums');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 15,
      default: '',
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider === 'local';
      },
    },
    googleId: {
      type: String,
      sparse: true,
      index: true,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
      index: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    otpVerified: { type: Boolean, default: false },
    termsAccepted: { type: Boolean, default: true },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
      index: true,
    },
    userType: {
      type: String,
      enum: Object.values(USER_TYPES),
      default: USER_TYPES.INDIVIDUAL,
      index: true,
    },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'profileModel',
    },
    profileModel: {
      type: String,
      default: PROFILE_MODELS.INDIVIDUAL,
      enum: Object.values(PROFILE_MODELS),
    },
  },
  { timestamps: true },
);

UserSchema.index({ role: 1, userType: 1 });

const User = mongoose.model('User', UserSchema);
module.exports = User;
