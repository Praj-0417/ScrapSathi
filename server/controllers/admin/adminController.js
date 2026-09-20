'use strict';

const adminService = require('../../services/admin/adminService');
const { success } = require('../../utils/apiResponse');
const { MESSAGES, APP_CONSTANTS } = require('../../constants');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await adminService.login(email, password);
    return success(res, { message: MESSAGES.ADMIN_LOGIN_SUCCESS, data: result });
  } catch (error) {
    return next(error);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || APP_CONSTANTS.PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(parseInt(req.query.limit, 10) || APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT, APP_CONSTANTS.PAGINATION.MAX_LIMIT);
    const { search } = req.query;
    const result = await adminService.listUsers({ page, limit, search });
    return success(res, {
      message: MESSAGES.USERS_FETCHED,
      data: { users: result.docs },
      meta: { total: result.total, page: result.page, limit: result.limit, pages: result.pages },
    });
  } catch (error) {
    return next(error);
  }
};

const listPickups = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || APP_CONSTANTS.PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(parseInt(req.query.limit, 10) || APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT, APP_CONSTANTS.PAGINATION.MAX_LIMIT);
    const { status } = req.query;
    const result = await adminService.listPickups({ page, limit, status });
    return success(res, {
      message: MESSAGES.PICKUPS_FETCHED,
      data: { pickups: result.docs },
      meta: { total: result.total, page: result.page, limit: result.limit, pages: result.pages },
    });
  } catch (error) {
    return next(error);
  }
};

const listDonations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || APP_CONSTANTS.PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(parseInt(req.query.limit, 10) || APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT, APP_CONSTANTS.PAGINATION.MAX_LIMIT);
    const result = await adminService.listDonations({ page, limit });
    return success(res, {
      message: MESSAGES.DONATIONS_FETCHED,
      data: { donations: result.docs },
      meta: { total: result.total, page: result.page, limit: result.limit, pages: result.pages },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { login, listUsers, listPickups, listDonations };
