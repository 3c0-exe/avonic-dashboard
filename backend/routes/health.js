// routes/health.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { mqttClient } = require('../mqtt/mqttClient');

router.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    mqtt: mqttClient && mqttClient.connected ? 'connected' : 'disconnected'
  });
});

module.exports = router;