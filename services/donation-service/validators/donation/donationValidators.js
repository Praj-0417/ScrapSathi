'use strict';

const { z } = require('zod');
const { DONATION_CAUSES } = require('../../enums');
const { APP_CONSTANTS } = require('../../constants');

const createDonationSchema = z.object({
  body: z.object({
    amount: z.coerce.number().min(10, 'Donation amount must be at least ₹10').max(1000000, 'Donation cannot exceed ₹10,00,000 per transaction'),
    cause: z.enum(Object.values(DONATION_CAUSES)).default(DONATION_CAUSES.GENERAL),
    donorName: z.string().min(2, 'Donor name is required').max(120).optional(),
    panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN Card format (e.g. ABCDE1234F)').optional(),
    transactionId: z.string().min(6, 'Valid Transaction / UTR ID is required').max(100).optional(),
    paymentMethod: z.enum(['upi_qr', 'card', 'netbanking', 'wallet']).optional(),
    message: z.string().max(APP_CONSTANTS.VALIDATION.MESSAGE_MAX_LENGTH).optional(),
  }),
});

module.exports = { createDonationSchema };
