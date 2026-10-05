require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const pickupRoutes = require('./routes/pickup/pickupRoutes');
const collectorRoutes = require('./routes/collector/collectorRoutes');
const geocodeRoutes = require('./routes/geocode/geocodeRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 8020;

connectDB();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static uploads serving
app.use('/uploads', express.static('uploads'));

// Health endpoint
app.get(['/health', '/api/v1/pickups/health'], (req, res) => {
  res.status(200).json({ status: 'ok', service: 'pickup-service', port: PORT });
});

// Mount Routes (supporting direct requests & gateway proxy paths)
app.use(['/', '/api/v1/pickups', '/api/pickups'], pickupRoutes);
app.use(['/collector', '/api/v1/collector', '/api/collector'], collectorRoutes);
app.use(['/geocode', '/api/v1/geocode', '/api/geocode'], geocodeRoutes);

app.use(errorMiddleware);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[PICKUP-SERVICE] Running on port ${PORT}`);
  });
}

module.exports = app;
