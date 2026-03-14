// routes/sensors.js
const express = require('express');
const router = express.Router();
const { Device, SensorReading } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { rateLimiters } = require('../middleware/rateLimiter');

// Get latest sensor readings for user's devices
router.get('/latest', authenticateToken, async (req, res) => {
  try {
    // Get user's devices
    const devices = await Device.find({ claimedBy: req.user.user_id });
    const espIDs = devices.map(d => d.espID);
    
    // Get latest reading for each device
    const readings = await SensorReading.aggregate([
      { $match: { espID: { $in: espIDs } } },
      { $sort: { timestamp: -1 } },
      { $group: {
          _id: '$espID',
          latestReading: { $first: '$$ROOT' }
        }
      }
    ]);
    
    res.json({ readings: readings.map(r => r.latestReading) });
  } catch (error) {
    console.error('❌ Error fetching readings:', error);
    res.status(500).json({ error: 'Failed to fetch readings' });
  }
});

// ✅ Get latest sensor data for a specific device
router.get('/:espID/latest', authenticateToken, async (req, res) => {
  try {
    const { espID } = req.params;
    const normalizedEspID = espID.toUpperCase();
    
    const device = await Device.findOne({ 
      espID: normalizedEspID,
      claimedBy: req.user.user_id 
    });
    
    if (!device) {
      return res.status(404).json({ error: 'Device not found or unauthorized' });
    }
    
    const latest = await SensorReading
      .findOne({ espID: normalizedEspID })
      .sort({ timestamp: -1 });
    
    res.json({
      success: true,
      device: {
        espID: device.espID,
        nickname: device.nickname,
        last_seen: device.last_seen,
        status: device.status
      },
      data: latest || null
    });
    
  } catch (error) {
    console.error('❌ Get latest error:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// ✅ Get only readings with bin1 AND bin2 data
router.get('/:espID/valid-readings', authenticateToken, rateLimiters.sensor, async (req, res) => {
  try {
    const { espID } = req.params;
    const { limit = 100 } = req.query;
    
    const normalizedEspID = espID.toUpperCase();
    
    const device = await Device.findOne({ 
      espID: normalizedEspID,
      claimedBy: req.user.user_id 
    });
    
    if (!device) {
      return res.status(403).json({ error: 'Device not found or unauthorized' });
    }
    
    // ✅ ONLY GET READINGS THAT HAVE bin1 AND bin2
    const readings = await SensorReading
      .find({ 
        espID: normalizedEspID,
        bin1: { $exists: true },
        bin2: { $exists: true }
      })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    console.log(`✅ Found ${readings.length} valid readings (with bin data) for ${normalizedEspID}`);
    
    res.json({
      success: true,
      espID: device.espID,
      nickname: device.nickname,
      count: readings.length,
      readings
    });
    
  } catch (error) {
    console.error('❌ Get valid readings error:', error);
    res.status(500).json({ error: 'Failed to fetch valid readings' });
  }
});

// ✅ Get sensor readings with time range
router.get('/:espID/readings', authenticateToken, async (req, res) => {
  try {
    const { espID } = req.params;
    const { start, end, limit = 1000 } = req.query;
    
    const normalizedEspID = espID.toUpperCase();
    
    const device = await Device.findOne({ 
      espID: normalizedEspID,
      claimedBy: req.user.user_id 
    });
    
    if (!device) {
      return res.status(403).json({ error: 'Device not found or unauthorized' });
    }
    
    const query = { espID: normalizedEspID };
    
    if (start || end) {
      query.timestamp = {};
      if (start) query.timestamp.$gte = new Date(start);
      if (end) query.timestamp.$lte = new Date(end);
    }
    
    const readings = await SensorReading
      .find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      espID: device.espID,
      nickname: device.nickname,
      count: readings.length,
      readings
    });
    
  } catch (error) {
    console.error('❌ Get readings error:', error);
    res.status(500).json({ error: 'Failed to fetch readings' });
  }
});

// ✅ Batch upload sensor readings
router.post('/batch', authenticateToken, async (req, res) => {
  try {
    const { device_id, readings } = req.body;
    
    if (!device_id || !Array.isArray(readings)) {
      return res.status(400).json({ error: 'Invalid request format' });
    }
    
    const device = await Device.findOne({ 
      device_id: device_id.toUpperCase(),
      claimedBy: req.user.user_id 
    });
    
    if (!device) {
      return res.status(403).json({ error: 'Device not found or unauthorized' });
    }
    
    const documents = readings.map(r => ({
      device_id: device_id.toUpperCase(),
      timestamp: new Date(r.timestamp),
      bin1: r.bin1,
      bin2: r.bin2,
      system: r.system,
      source: 'sync'
    }));
    
    await SensorReading.insertMany(documents, { ordered: false });
    
    device.last_seen = new Date();
    await device.save();
    
    console.log(`📊 Uploaded ${documents.length} readings from ${device_id}`);
    
    res.json({
      success: true,
      inserted: documents.length,
      message: 'Batch upload successful'
    });
    
  } catch (error) {
    console.error('❌ Batch upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;