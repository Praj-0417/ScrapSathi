'use strict';

const rateRepository = require('../../repositories/rates/rateRepository');
const { ApiError } = require('../../utils/ApiError');
const { ERROR_CODES } = require('../../constants');

class RateService {
  async getRatesByCity(city = 'delhi-ncr') {
    const normalizedCity = city.toLowerCase();
    const categories = await rateRepository.getAllCategories();

    const formatted = categories.map((cat) => {
      const rawCat = typeof cat.toObject === 'function' ? cat.toObject() : cat;
      const items = (rawCat.items || []).map((item) => {
        let priceMap = item.prices;
        if (priceMap instanceof Map) {
          priceMap = Object.fromEntries(priceMap);
        } else if (!priceMap || typeof priceMap !== 'object') {
          priceMap = { 'delhi-ncr': 15, bengaluru: 14 };
        }
        const effectivePrice = priceMap[normalizedCity] ?? priceMap['delhi-ncr'] ?? Object.values(priceMap)[0] ?? 0;
        return {
          ...item,
          id: item.itemId || item.id,
          prices: priceMap,
          price: effectivePrice,
          effectivePrice,
        };
      });

      return {
        ...rawCat,
        id: rawCat.categoryId || rawCat.id,
        items,
      };
    });

    return {
      city: normalizedCity,
      updatedAt: new Date().toISOString(),
      categories: formatted,
    };
  }

  async updateItemRate({ itemId, categoryId, prices, name, unit }) {
    if (!itemId) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'itemId is required');
    }

    let category;
    if (categoryId) {
      category = await rateRepository.findCategoryById(categoryId);
    } else {
      category = await rateRepository.findCategoryByItemId(itemId);
    }

    if (!category) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Item or Category not found');
    }

    const item = category.items.find((i) => i.itemId === itemId);
    if (!item) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Item not found in category');
    }

    if (prices && typeof prices === 'object') {
      const currentPrices = item.prices instanceof Map ? Object.fromEntries(item.prices) : { ...(item.prices || {}) };
      Object.entries(prices).forEach(([c, p]) => {
        currentPrices[c.toLowerCase()] = Number(p);
      });
      item.prices = currentPrices;
    }

    if (name) item.name = name;
    if (unit) item.unit = unit;

    await rateRepository.saveCategory(category);
    return item;
  }

  async addItem({ categoryId, name, unit, prices, description, icon, popular }) {
    if (!categoryId || !name) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'categoryId and name are required');
    }

    const category = await rateRepository.findCategoryById(categoryId);
    if (!category) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Category not found');
    }

    const itemId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newItem = {
      itemId,
      name,
      unit: unit || 'kg',
      prices: prices || { 'delhi-ncr': 20, bengaluru: 18 },
      description: description || '',
      icon: icon || '📦',
      popular: Boolean(popular),
    };

    category.items.push(newItem);
    await rateRepository.saveCategory(category);
    return newItem;
  }

  async deleteItem(itemId) {
    const category = await rateRepository.findCategoryByItemId(itemId);
    if (!category) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Item not found');
    }

    category.items = category.items.filter((i) => i.itemId !== itemId);
    await rateRepository.saveCategory(category);
    return true;
  }
}

module.exports = new RateService();
