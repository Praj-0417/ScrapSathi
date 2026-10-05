'use strict';

const collectorService = require('../../services/collector/collectorService');
const { success } = require('../../utils/apiResponse');
const { MESSAGES, APP_CONSTANTS } = require('../../constants');

const listAvailable = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || APP_CONSTANTS.PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(parseInt(req.query.limit, 10) || APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT, APP_CONSTANTS.PAGINATION.MAX_LIMIT);
    const { longitude, latitude, radius } = req.query;

    const result = await collectorService.listAvailablePickups({
      page,
      limit,
      longitude,
      latitude,
      radius,
    });
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
    const {
      finalWeight,
      actualWeight,
      settledAmount,
      paidAmount,
      adjustmentReason,
      evidenceUrls,
      collectorNotes,
    } = req.body || {};

    const weight = finalWeight !== undefined ? finalWeight : actualWeight;
    const amount = settledAmount !== undefined ? settledAmount : paidAmount;

    const extraData = {};
    if (collectorNotes) extraData.collectorNotes = collectorNotes;
    if (weight !== undefined || amount !== undefined || adjustmentReason || evidenceUrls) {
      extraData.settlement = {
        finalWeight: weight !== undefined ? Number(weight) : undefined,
        settledAmount: amount !== undefined ? Number(amount) : undefined,
        adjustmentReason: adjustmentReason || '',
        evidenceUrls: Array.isArray(evidenceUrls) ? evidenceUrls : [],
        settledAt: new Date(),
        settledBy: req.user.userId,
      };
    }

    const pickup = await collectorService.completePickup(req.user.userId, req.params.id, extraData);
    return success(res, { message: MESSAGES.PICKUP_COMPLETED, data: { pickup } });
  } catch (error) {
    return next(error);
  }
};

const updateLocation = async (req, res, next) => {
  try {
    const { longitude, latitude, heading, speed } = req.body;
    const tracking = await collectorService.updateLocation(req.user.userId, req.params.id, {
      longitude,
      latitude,
      heading,
      speed,
    });
    return success(res, { message: 'Location updated successfully', data: { tracking } });
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

module.exports = { listAvailable, accept, cancel, complete, updateLocation, myPickups };
