require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const donationRoutes = require('./routes/donation/donationRoutes');
const contactRoutes = require('./routes/contact/contactRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 8040;

connectDB();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health endpoint
app.get(['/health', '/api/v1/donations/health'], (req, res) => {
  res.status(200).json({ status: 'ok', service: 'donation-service', port: PORT });
});

// Mount Routes
app.use(['/', '/api/v1/donations', '/api/donations'], donationRoutes);
app.use(['/contact', '/api/v1/contact', '/api/contact'], contactRoutes);

app.use(errorMiddleware);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[DONATION-SERVICE] Running on port ${PORT}`);
  });
}

module.exports = app;
