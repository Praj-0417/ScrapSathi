'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const apiV1Route = require('./routes');
const corsOptions = require('./config/cors');
const errorHandler = require('./middlewares/errorMiddleware');
const logger = require('./utils/logger');
const requestContext = require('./middlewares/requestContextMiddleware');
const securityHeaders = require('./middlewares/securityHeadersMiddleware');
const notFound = require('./middlewares/notFoundMiddleware');
const { apiRateLimit } = require('./middlewares/rateLimitMiddleware');
const { success } = require('./utils/apiResponse');
const { MESSAGES } = require('./constants');

const app = express();

// ─── Request context (must be first) ─────────────────────────────────────────
app.use(requestContext);

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(securityHeaders);

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// ─── Request logging ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on('finish', () => {
    logger.info('HTTP request', {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
      requestId: req.context?.requestId,
    });
  });
  next();
});

// ─── Global health (no rate limiting) ────────────────────────────────────────
app.get('/health', (_req, res) => {
  success(res, { message: MESSAGES.HEALTH_OK });
});

// ─── Apply general rate limit to all API routes ───────────────────────────────
app.use('/api', apiRateLimit);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1', apiV1Route);
app.use('/api', apiV1Route);

// ─── 404 handler for unmatched routes ─────────────────────────────────────────
app.use(notFound);

// ─── Global error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
