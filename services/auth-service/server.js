require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth/authRoutes');
const userRoutes = require('./routes/user/userRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 8010;

// Connect to MongoDB
connectDB();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health endpoint
app.get(['/health', '/api/v1/auth/health'], (req, res) => {
  res.status(200).json({ status: 'ok', service: 'auth-service', port: PORT });
});

// Mount Routes (supporting direct requests & gateway proxy paths)
app.use(['/', '/api/v1/auth', '/api/auth'], authRoutes);
app.use(['/users', '/api/v1/users', '/api/users'], userRoutes);

// Centralized error handling
app.use(errorMiddleware);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[AUTH-SERVICE] Running on port ${PORT}`);
  });
}

module.exports = app;
