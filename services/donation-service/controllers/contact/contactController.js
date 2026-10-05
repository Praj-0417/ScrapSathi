'use strict';

const Contact = require('../../models/contactModel');
const { success } = require('../../utils/apiResponse');
const logger = require('../../utils/logger');

const submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    const inquiry = await Contact.create({
      name,
      email,
      subject: subject || 'General Inquiry',
      message,
    });

    logger.info('Contact inquiry received', {
      contactId: inquiry._id,
      email,
      subject: inquiry.subject,
    });

    return success(res, {
      message: 'Your message has been received! Our green team will get back to you shortly.',
      data: { contactId: inquiry._id },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { submitContact };
