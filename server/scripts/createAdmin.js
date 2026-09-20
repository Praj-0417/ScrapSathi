'use strict';

const bcrypt = require('bcrypt');
const User = require('../models/user/userModel');
const IndividualProfile = require('../models/user/individualProfileModel');
const connectDatabase = require('../config/database');
const { ROLES, USER_TYPES, PROFILE_MODELS } = require('../enums');
const { APP_CONSTANTS } = require('../constants');
const { env } = require('../config/env');

const createAdmin = async () => {
  const email = env.ADMIN_EMAIL;
  const password = env.ADMIN_PASSWORD;
  const name = env.ADMIN_NAME || 'Admin';
  const phone = env.ADMIN_PHONE || '9999999999';

  if (!email || !password) {
    console.error('Error: ADMIN_EMAIL and ADMIN_PASSWORD must be configured in .env');
    process.exit(1);
  }

  try {
    await connectDatabase();

    let existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      // Update role and password if already exists
      const hashedPassword = await bcrypt.hash(password, APP_CONSTANTS.AUTH.BCRYPT_ROUNDS);
      existing.role = ROLES.ADMIN;
      existing.password = hashedPassword;
      existing.name = name;
      existing.phone = phone;
      await existing.save();
      console.log(`Admin account updated successfully for: ${email}`);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, APP_CONSTANTS.AUTH.BCRYPT_ROUNDS);

    const adminUser = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: ROLES.ADMIN,
      userType: USER_TYPES.INDIVIDUAL,
      profileModel: PROFILE_MODELS.INDIVIDUAL,
      otpVerified: true,
      termsAccepted: true,
    });

    const profile = await IndividualProfile.create({
      user: adminUser._id,
      address: 'Admin Office',
    });

    adminUser.profile = profile._id;
    await adminUser.save();

    console.log(`Admin created successfully!`);
    console.log(`Name: ${adminUser.name}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Role: ${adminUser.role}`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to create admin:', error);
    process.exit(1);
  }
};

createAdmin();
