const redis = require('redis');
const bluebird = require('bluebird');
const logger = require('../config/logger');

let client;

const connectRedisClient = async () => {
  bluebird.promisifyAll(redis);
  client = redis.createClient(6379);
  client.on('connect', function () {
    logger.info(`redis client connected `.blue.bold);
  });

  client.on('error', function (error) {
    logger.error(error);
  });
};

const setData = async (key, data) => {
  await client.setex(key, 120, JSON.stringify(data));
};

const getData = async (key) => {
  let value = await client.getAsync(key);
  value = JSON.parse(value);
  return value;
};

const removeOTP = async (key) => {
  await client.del(key);
  return true;
};

module.exports = {
  getData,
  setData,
  removeOTP,
  connectRedisClient,
};
