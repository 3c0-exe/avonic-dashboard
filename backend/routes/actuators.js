// routes/actuators.js
const express = require('express');
const router = express.Router();
const { Device } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// Helper function to control actuators
async function controlActuator(req, res, bin, device, deviceName = null) {
  try {
    const { state } = req.body;
    
    if (!state || (state !== 'on' && state !== 'off')) {
      return res.status(400).json({ error: 'Invalid state. Must be "on" or "off"' });
    }
    
    const devices = await Device.find({ claimedBy: req.user.user_id });
    
    if (devices.length === 0) {
      return res.status(404).json({ error: 'No devices claimed' });
    }
    
    const espID = devices[0].espID;
    const { mqttClient } = require('../mqtt/mqttClient');
    
    if (!mqttClient || !mqttClient.connected) {
      return res.status(503).json({ error: 'MQTT not connected' });
    }
    
    const topic = `commands/${espID}/actuator-control`;
    const payload = JSON.stringify({
      bin: bin,
      device: device,
      state: state === 'on' ? 1 : 0,
      timestamp: Date.now()
    });
    
    mqttClient.publish(topic, payload, { qos: 1 }, (err) => {
      if (err) {
        console.error('❌ MQTT publish error:', err);
        return res.status(500).json({ error: 'Failed to send command' });
      }
      
      const displayName = deviceName || device;
      console.log(`✅ ${displayName}: ${state.toUpperCase()} → ${espID}`);
      res.json({ 
        success: true, 
        message: `${displayName} turned ${state.toUpperCase()}`,
        espID: espID
      });
    });
    
  } catch (error) {
    console.error(`❌ Actuator control error:`, error);
    res.status(500).json({ error: 'Failed to control device' });
  }
}

// ====== BIN 1 CONTROLS ======

// Bin 1 Pump
router.post('/bin1/pump', authenticateToken, (req, res) => {
  controlActuator(req, res, 1, 'pump', 'Bin 1 Pump');
});

// Bin 1 Intake Fan
router.post('/bin1/intake-fan', authenticateToken, (req, res) => {
  controlActuator(req, res, 1, 'intake-fan', 'Bin 1 Intake Fan');
});

// Bin 1 Exhaust Fan
router.post('/bin1/exhaust-fan', authenticateToken, (req, res) => {
  controlActuator(req, res, 1, 'exhaust-fan', 'Bin 1 Exhaust Fan');
});

// Bin 1 Fan (legacy - maps to intake fan)
router.post('/bin1/fan', authenticateToken, (req, res) => {
  controlActuator(req, res, 1, 'intake-fan', 'Bin 1 Fan (legacy)');
});

// ====== BIN 2 CONTROLS ======

// Bin 2 Pump
router.post('/bin2/pump', authenticateToken, (req, res) => {
  controlActuator(req, res, 2, 'pump', 'Bin 2 Pump');
});

// Bin 2 Intake Fan
router.post('/bin2/intake-fan', authenticateToken, (req, res) => {
  controlActuator(req, res, 2, 'intake-fan', 'Bin 2 Intake Fan');
});

// Bin 2 Exhaust Fan
router.post('/bin2/exhaust-fan', authenticateToken, (req, res) => {
  controlActuator(req, res, 2, 'exhaust-fan', 'Bin 2 Exhaust Fan');
});

// Bin 2 Fan (legacy - maps to intake fan)
router.post('/bin2/fan', authenticateToken, (req, res) => {
  controlActuator(req, res, 2, 'intake-fan', 'Bin 2 Fan (legacy)');
});

// ====== PELTIER CONTROLS ======

// Peltier Main (with fan)
router.post('/peltier/main', authenticateToken, (req, res) => {
  controlActuator(req, res, 0, 'peltier-main', 'Peltier Main');
});

// Peltier Pump
router.post('/peltier/pump', authenticateToken, (req, res) => {
  controlActuator(req, res, 0, 'peltier-pump', 'Peltier Pump');
});

module.exports = router;