// middleware/index.js
const express = require('express');
const cors = require('cors');
const { CORS_ORIGINS } = require('../config/constants');
const { rateLimiters } = require('./rateLimiter');

function configureMiddleware(app) {
  // CORS
  app.use(cors({
    origin: CORS_ORIGINS,
    credentials: true
  }));
  
  // Body parser
  app.use(express.json());
  
  // Trust proxy (for Railway/Heroku)
  app.set('trust proxy', 1);
  
  // Rate limiters for specific routes
  app.use('/api/sensors/latest', rateLimiters.sensor);
  app.use('/api/devices/:espID/latest', rateLimiters.sensor);
  app.use('/api/devices/:espID/readings', rateLimiters.sensor);
}

module.exports = configureMiddleware;