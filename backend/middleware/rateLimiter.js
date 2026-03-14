// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const rateLimiters = {
  sensor: rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 30,
    message: { error: 'Too many sensor requests' },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  general: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  auth: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    message: { error: 'Too many login attempts, please try again in 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  passwordReset: rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: { error: 'Too many password reset requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  register: rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: { error: 'Too many registration attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  device: rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: { error: 'Too many device operations' },
    standardHeaders: true,
    legacyHeaders: false,
  })
};

module.exports = { rateLimiters };