'use strict';

const { z } = require('zod');
const { WASTE_UNITS } = require('../../enums');
const { APP_CONSTANTS } = require('../../constants');

const wasteDetailSchema = z.object({
  wasteType: z.string().min(1, 'Waste type is required').max(100),
  subcategory: z.string().max(100).optional(),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unit: z.enum(Object.values(WASTE_UNITS)).default(WASTE_UNITS.KG),
});

const createPickupSchema = z.object({
  body: z.object({
    wasteDetails: z
      .preprocess((val) => {
        if (typeof val === 'string') {
          try {
            return JSON.parse(val);
          } catch {
            return val;
          }
        }
        return val;
      }, z.array(wasteDetailSchema).min(1, 'At least one waste detail is required').max(APP_CONSTANTS.VALIDATION.MAX_WASTE_DETAILS))
      .optional(),
    // Support flat form fields for single waste type (backward compat)
    wasteType: z.string().max(100).optional(),
    subcategory: z.string().max(100).optional(),
    quantity: z.coerce.number().positive().optional(),
    unit: z.enum(Object.values(WASTE_UNITS)).optional(),
    address: z.string().min(5, 'Address is required').max(APP_CONSTANTS.VALIDATION.ADDRESS_MAX_LENGTH),
    preferredTimeSlot: z.string().min(1, 'Preferred time slot is required').max(100),
    scheduledDate: z.coerce.date().optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
  }),
});

const cancelPickupSchema = z.object({
  params: z.object({
    id: z.string().min(24, 'Invalid pickup ID'),
  }),
});

module.exports = {
  createPickupSchema,
  cancelPickupSchema,
};
