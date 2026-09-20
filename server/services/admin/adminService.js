'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminRepository = require('../../repositories/admin/adminRepository');
const { ApiError } = require('../../utils/ApiError');
const { ERROR_CODES, APP_CONSTANTS } = require('../../constants');
const { env } = require('../../config/env');

class AdminService {
  async login(email, password) {
    const admin = await adminRepository.findAdminByEmail(email);
    if (!admin) throw new ApiError(ERROR_CODES.INVALID_CREDENTIALS);

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new ApiError(ERROR_CODES.INVALID_CREDENTIALS);

    const token = jwt.sign(
      { userId: admin._id.toString(), email: admin.email, role: admin.role, name: admin.name },
      env.JWT_SECRET,
      { expiresIn: APP_CONSTANTS.AUTH.ADMIN_JWT_EXPIRES_IN },
    );

    return {
      token,
      user: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    };
  }

  async listUsers(options) {
    return adminRepository.listUsers(options);
  }

  async listPickups(options) {
    return adminRepository.listPickups(options);
  }

  async listDonations(options) {
    return adminRepository.listDonations(options);
  }
}

module.exports = new AdminService();
