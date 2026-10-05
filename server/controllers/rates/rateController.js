'use strict';

const rateService = require('../../services/rates/rateService');
const { success } = require('../../utils/apiResponse');

const getRates = async (req, res, next) => {
  try {
    const city = req.query.city || 'delhi-ncr';
    const data = await rateService.getRatesByCity(city);
    return success(res, {
      message: 'Scrap rates retrieved successfully',
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const item = await rateService.updateItemRate(req.body);
    return success(res, {
      message: `Scrap rate for ${item.name} updated successfully`,
      data: { item },
    });
  } catch (error) {
    return next(error);
  }
};

const addItem = async (req, res, next) => {
  try {
    const item = await rateService.addItem(req.body);
    return success(
      res,
      {
        message: `Scrap item ${item.name} added successfully`,
        data: { item },
      },
      201,
    );
  } catch (error) {
    return next(error);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    await rateService.deleteItem(req.params.itemId);
    return success(res, { message: 'Scrap item removed successfully' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getRates,
  updateItem,
  addItem,
  deleteItem,
};
