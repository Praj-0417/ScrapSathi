'use strict';

const { randomUUID } = require('crypto');

const requestContext = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || randomUUID();

  req.context = {
    requestId,
    startedAt: Date.now(),
  };

  res.setHeader('X-Request-Id', requestId);
  next();
};

module.exports = requestContext;
