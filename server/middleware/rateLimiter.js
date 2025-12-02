const rateLimit = require('express-rate-limit');

const generateIconsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: {
      message: 'Too many icon generation requests, please try again later.',
      status: 429
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: {
    error: {
      message: 'Too many requests, please slow down.',
      status: 429
    }
  },
});

module.exports = {
  generateIconsLimiter,
  apiLimiter,
};
