// server.js - AVONIC Backend Server (Refactored)
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); // 👈 1. ADD THIS LINE

const { connectMQTT } = require('./mqtt/mqttClient');
const { initializeEmail, verifyEmailConfig } = require('./config/email');
const configureMiddleware = require('./middleware');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/avonic';

// ====== Configure Middleware ======
configureMiddleware(app);

// 👈 2. ADD THIS BLOCK RIGHT HERE
// Serve static frontend files (HTML, CSS, JS) from the public folder
app.use(express.static(path.join(__dirname, '../public')));

// ====== Mount Routes ======
app.use('/api', routes);

// 👈 3. ADD THIS CATCH-ALL ROUTE BELOW YOUR API ROUTES
// If a user hits a route that isn't an API, send them the main dashboard HTML
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

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