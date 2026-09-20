'use strict';

const userEnums = require('./userEnums');
const pickupEnums = require('./pickupEnums');
const donationEnums = require('./donationEnums');

module.exports = {
  ...userEnums,
  ...pickupEnums,
  ...donationEnums,
  userEnums,
  pickupEnums,
  donationEnums,
};
