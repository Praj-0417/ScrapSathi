'use strict';

const PICKUP_REQUEST_STATUS = Object.freeze({
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});

const WASTE_UNITS = Object.freeze({
  KG: 'kg',
  PIECES: 'pieces',
  LITERS: 'liters',
});

const LOCATION_TYPES = Object.freeze({
  POINT: 'Point',
});

module.exports = {
  PICKUP_REQUEST_STATUS,
  WASTE_UNITS,
  LOCATION_TYPES,
};
