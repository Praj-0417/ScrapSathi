'use strict';

const { z } = require('zod');

const contactInquirySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().trim().email('Invalid email address').toLowerCase(),
    phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Invalid 10-digit mobile number').optional().or(z.literal('')),
    subject: z.string().trim().max(200).optional(),
    message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000),
  }),
});

module.exports = { contactInquirySchema };
