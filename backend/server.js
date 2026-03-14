// server.js - AVONIC Backend Server (Refactored)
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const { connectMQTT } = require('./mqtt/mqttClient');
const { initializeEmail, verifyEmailConfig } = require('./config/email');
const configureMiddleware = require('./middleware');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/avonic';

// ====== Configure Middleware ======
configureMiddleware(app);

// ====== Mount Routes ======
app.use('/api', routes);

// ====== Server Startup ======
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    initializeEmail();
    verifyEmailConfig();
    connectMQTT();
    
    app.listen(PORT, () => {
      console.log(`🚀 AVONIC Backend running on port ${PORT}`);
      console.log(`📊 API: http://localhost:${PORT}/api/health`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;