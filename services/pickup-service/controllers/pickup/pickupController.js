'use strict';

const pickupService = require('../../services/pickup/pickupService');
const { success } = require('../../utils/apiResponse');
const { HTTP_STATUS, MESSAGES, APP_CONSTANTS } = require('../../constants');

const create = async (req, res, next) => {
  try {
    const fileBuffer = req.file?.buffer || null;
    const pickup = await pickupService.schedulePickup(req.user.userId, req.body, fileBuffer);
    return success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: MESSAGES.PICKUP_CREATED,
      data: { pickup },
    });
  } catch (error) {
    return next(error);
  }
};

const listMyPickups = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || APP_CONSTANTS.PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(parseInt(req.query.limit, 10) || APP_CONSTANTS.PAGINATION.PICKUP_DEFAULT_LIMIT, APP_CONSTANTS.PAGINATION.MAX_LIMIT);
    const result = await pickupService.getUserPickups(req.user.userId, { page, limit });
    return success(res, {
      message: MESSAGES.PICKUPS_FETCHED,
      data: { pickups: result.docs },
      meta: { total: result.total, page: result.page, limit: result.limit, pages: result.pages },
    });
  } catch (error) {
    return next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const pickup = await pickupService.getPickupById(req.params.id, req.user.userId);
    return success(res, { message: MESSAGES.PICKUPS_FETCHED, data: { pickup } });
  } catch (error) {
    return next(error);
  }
};

const cancel = async (req, res, next) => {
  try {
    const pickup = await pickupService.cancelPickup(req.user.userId, req.params.id);
    return success(res, { message: MESSAGES.PICKUP_CANCELLED, data: { pickup } });
  } catch (error) {
    return next(error);
  }
};

const getTracking = async (req, res, next) => {
  try {
    const tracking = await pickupService.getPickupTracking(req.params.id, req.user.userId);
    return success(res, { message: 'Tracking details retrieved', data: tracking });
  } catch (error) {
    return next(error);
  }
};

module.exports = { create, listMyPickups, getOne, cancel, getTracking };
