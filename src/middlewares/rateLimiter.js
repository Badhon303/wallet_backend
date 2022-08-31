const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mintues
  max: 20,
  skipSuccessfulRequests: true,
});

module.exports = {
  authLimiter,
};
