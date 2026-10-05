require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const rateRoutes = require('./routes/rates/rateRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 8030;

connectDB();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health endpoint
app.get(['/health', '/api/v1/rates/health'], (req, res) => {
  res.status(200).json({ status: 'ok', service: 'rate-service', port: PORT });
});

// Mount Routes
app.use(['/', '/api/v1/rates', '/api/rates'], rateRoutes);

app.use(errorMiddleware);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[RATE-SERVICE] Running on port ${PORT}`);
  });
}

module.exports = app;
