'use strict';

const USER_TYPES = Object.freeze({
  INDIVIDUAL: 'individual',
  WASTE_COLLECTOR: 'waste-collector',
  BIG_ORGANIZATION: 'big-organization',
  RECYCLE_COMPANY: 'recycle-company',
});

const ROLES = Object.freeze({
  USER: 'user',
  ADMIN: 'admin',
});

const PROFILE_MODELS = Object.freeze({
  INDIVIDUAL: 'IndividualProfile',
  WASTE_COLLECTOR: 'WasteCollectorProfile',
  BIG_ORGANIZATION: 'BigOrganizationProfile',
  RECYCLE_COMPANY: 'RecycleCompanyProfile',
});

module.exports = {
  USER_TYPES,
  ROLES,
  PROFILE_MODELS,
};
