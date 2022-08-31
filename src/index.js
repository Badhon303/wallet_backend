const mongoose = require('mongoose');
const colors = require('colors');
const app = require('./app');
const redis = require('./utils/redis');
const config = require('./config/config');
const logger = require('./config/logger');

let server;
mongoose
  .connect(config.mongoose.url, config.mongoose.options)
  .then(() => {
    logger.info('Connected to MongoDB'.cyan.underline.bold);
    server = app.listen(config.port, () => {
      if (config.env === 'production') {
        logger.info(`Server is running on https://backend.wes-wallet.com/`.yellow.bold);
      } else logger.info(`Server is running on http://115.127.8.84:${config.port}`.yellow.bold);
    });
  })
  .catch((err) => {
    logger.info(err);
  });

redis.connectRedisClient();

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
