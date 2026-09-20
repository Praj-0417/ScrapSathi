const mongoose = require('mongoose');
const { env } = require('./env');
const logger = require('../utils/logger');

const connectDatabase = async () => {
  mongoose.set('strictQuery', true);

  await mongoose.connect(env.MongoDB, {
    autoIndex: env.NODE_ENV !== 'production',
  });

  logger.info('Connected to MongoDB');
};

mongoose.connection.on('error', (error) => {
  logger.error('MongoDB connection error', { error });
});

module.exports = connectDatabase;
