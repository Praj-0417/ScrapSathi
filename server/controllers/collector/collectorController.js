'use strict';

const collectorService = require('../../services/collector/collectorService');
const { success } = require('../../utils/apiResponse');
const { MESSAGES, APP_CONSTANTS } = require('../../constants');

const listAvailable = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || APP_CONSTANTS.PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(parseInt(req.query.limit, 10) || APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT, APP_CONSTANTS.PAGINATION.MAX_LIMIT);
    const result = await collectorService.listAvailablePickups({ page, limit });
    return success(res, {
      message: MESSAGES.PICKUPS_FETCHED,
      data: { pickups: result.docs },
      meta: { total: result.total, page: result.page, limit: result.limit, pages: result.pages },
    });
  } catch (error) {
    return next(error);
  }
};

const accept = async (req, res, next) => {
  try {
    const pickup = await collectorService.acceptPickup(req.user.userId, req.params.id);
    return success(res, { message: MESSAGES.PICKUP_ACCEPTED, data: { pickup } });
  } catch (error) {
    return next(error);
  }
};

const cancel = async (req, res, next) => {
  try {
    const pickup = await collectorService.cancelPickup(req.user.userId, req.params.id);
    return success(res, { message: MESSAGES.PICKUP_CANCELLED, data: { pickup } });
  } catch (error) {
    return next(error);
  }
};

const complete = async (req, res, next) => {
  try {
    const pickup = await collectorService.completePickup(req.user.userId, req.params.id);
    return success(res, { message: MESSAGES.PICKUP_COMPLETED, data: { pickup } });
  } catch (error) {
    return next(error);
  }
};

const myPickups = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || APP_CONSTANTS.PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(parseInt(req.query.limit, 10) || APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT, APP_CONSTANTS.PAGINATION.MAX_LIMIT);
    const result = await collectorService.getMyPickups(req.user.userId, { page, limit });
    return success(res, {
      message: MESSAGES.PICKUPS_FETCHED,
      data: { pickups: result.docs },
      meta: { total: result.total, page: result.page, limit: result.limit, pages: result.pages },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { listAvailable, accept, cancel, complete, myPickups };
