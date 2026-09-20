'use strict';

const { z } = require('zod');

const adminLoginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
  }),
});

module.exports = { adminLoginSchema };
