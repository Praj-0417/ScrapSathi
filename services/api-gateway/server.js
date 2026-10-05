require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 8000;

// Security and Logging
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(morgan('dev'));

// CORS configuration supporting credentials from Frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev/gateway
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-user-id'],
  })
);

// Global Ingress Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests through API Gateway. Please try again later.' },
});
app.use(limiter);

// Downstream Service URLs
const SERVICES = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:8010',
  pickup: process.env.PICKUP_SERVICE_URL || 'http://localhost:8020',
  rate: process.env.RATE_SERVICE_URL || 'http://localhost:8030',
  donation: process.env.DONATION_SERVICE_URL || 'http://localhost:8040',
  chatbot: process.env.CHATBOT_SERVICE_URL || 'http://localhost:8001',
};

// Health Aggregation Endpoint
app.get(['/health', '/api/health', '/api/v1/health'], (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    gateway: 'ScrapSathi API Gateway v1.0',
    services: SERVICES,
  });
});

// Proxy helper with error forwarding
const createServiceProxy = (target, pathRewrite = {}) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    ws: true,
    pathRewrite,
    onError: (err, req, res) => {
      console.error(`[API-GATEWAY] Proxy Error for ${req.method} ${req.url} -> ${target}:`, err.message);
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          errorCode: 'SERVICE_UNAVAILABLE',
          message: `Downstream microservice at ${target} is currently unavailable.`,
        });
      }
    },
  });
};

// 1. Auth Service Routes
app.use(['/api/v1/auth', '/api/auth'], createServiceProxy(SERVICES.auth));
app.use(['/api/v1/users', '/api/users'], createServiceProxy(SERVICES.auth));

// 2. Pickup & Collector Tracking Routes
app.use(['/api/v1/pickups', '/api/pickups'], createServiceProxy(SERVICES.pickup));
app.use(['/api/v1/collector', '/api/collector'], createServiceProxy(SERVICES.pickup));
app.use(['/api/v1/geocode', '/api/geocode'], createServiceProxy(SERVICES.pickup));

// 3. Rates & Pricing Catalog Routes
app.use(['/api/v1/rates', '/api/rates'], createServiceProxy(SERVICES.rate));

// 4. Donations & Contact Routes
app.use(['/api/v1/donations', '/api/donations'], createServiceProxy(SERVICES.donation));
app.use(['/api/v1/contact', '/api/contact'], createServiceProxy(SERVICES.donation));

// 5. Chatbot Service Routes
app.use(['/api/v1/chat', '/api/chat', '/ask'], createServiceProxy(SERVICES.chatbot, {
  '^/api/v1/chat': '/ask',
  '^/api/chat': '/ask',
}));

// Fallback 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Gateway route not found: ${req.method} ${req.originalUrl}`,
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`[API-GATEWAY] Running on http://localhost:${PORT}`);
    console.log(`[API-GATEWAY] Routing Matrix:`);
    Object.entries(SERVICES).forEach(([name, url]) => {
      console.log(`  -> ${name.padEnd(10)}: ${url}`);
    });
    console.log(`=========================================`);
  });
}

module.exports = app;
