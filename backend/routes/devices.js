// routes/devices.js
const express = require('express');
const router = express.Router();
const { Device, User, SensorReading } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { rateLimiters } = require('../middleware/rateLimiter');
const emailService = require('../emails/emailService');

// Check if ESP device has registered users (for online claiming)
router.get('/:espID/users', async (req, res) => {
  try {
    const { espID } = req.params;
    const normalizedEspID = espID.toUpperCase();
    
    const device = await Device.findOne({ espID: normalizedEspID })
      .populate('claimedBy', 'username email');
    
    if (!device) {
      return res.status(404).json({ 
        error: 'Device not found',
        espID: normalizedEspID 
      });
    }
    
    if (!device.claimedBy) {
      return res.json({
        espID: normalizedEspID,
        claimed: false,
        message: 'Device exists but is unclaimed'
      });
    }
    
    res.json({
      espID: normalizedEspID,
      claimed: true,
      user: {
        username: device.claimedBy.username,
        email: device.claimedBy.email
      },
      claimed_at: device.claimed_at
    });
    
  } catch (error) {
    console.error('❌ Check device error:', error);
    res.status(500).json({ error: 'Failed to check device' });
  }
});

// ✅ Get all devices claimed by user
router.get('/claimed', authenticateToken, async (req, res) => {
  try {
    const devices = await Device.find({ 
      claimedBy: req.user.user_id 
    }).sort({ claimed_at: -1 });
    
    // Get latest sensor data for each device
    const devicesWithData = await Promise.all(
      devices.map(async (device) => {
        const latestReading = await SensorReading
          .findOne({ espID: device.espID })
          .sort({ timestamp: -1 });
        
        return {
          id: device._id,
          espID: device.espID,
          nickname: device.nickname,
          status: device.status,
          last_seen: device.last_seen,
          claimed_at: device.claimed_at,
          mqtt_connected: device.mqtt_connected,
          firmware_version: device.firmware_version,
          latest_data: latestReading ? {
            timestamp: latestReading.timestamp,
            bin1: latestReading.bin1,
            bin2: latestReading.bin2,
            system: latestReading.system
          } : null
        };
      })
    );
    
    res.json({
      success: true,
      count: devices.length,
      devices: devicesWithData
    });
    
  } catch (error) {
    console.error('❌ Get devices error:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
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

// ✅ Claim a device (Offline → Online linking)
router.post('/claim', authenticateToken, async (req, res) => {
  try {
    const { espID } = req.body;
    
    if (!espID || espID.length < 10) {
      return res.status(400).json({ error: 'Valid ESP ID required (e.g. AVONIC-AABBCCDDEE)' });
    }
    
    const normalizedEspID = espID.toUpperCase().trim();
    
    // Check if device exists in database
    let device = await Device.findOne({ espID: normalizedEspID });
    
    if (!device) {
      // Device doesn't exist yet - create as unclaimed
      device = new Device({
        espID: normalizedEspID,
        claimedBy: null,
        status: 'offline',
        nickname: 'New Device'
      });
      await device.save();
      console.log(`🆕 Created unclaimed device: ${normalizedEspID}`);
    }
    
    // Check if already claimed by another user
    if (device.claimedBy && device.claimedBy.toString() !== req.user.user_id) {
      return res.status(400).json({ 
        error: 'Device already claimed by another user',
        espID: normalizedEspID
      });
    }
    
    // Check if already claimed by current user
    if (device.claimedBy && device.claimedBy.toString() === req.user.user_id) {
      return res.status(200).json({ 
        success: true, 
        message: 'You already own this device',
        device: {
          id: device._id,
          espID: device.espID,
          nickname: device.nickname,
          claimed_at: device.claimed_at
        }
      });
    }
    
    // ✅ CLAIM THE DEVICE
    device.claimedBy = req.user.user_id;
    device.claimed_at = new Date();
    device.status = 'active';
    await device.save();
    
    // Get user info for MQTT sync
    const user = await User.findById(req.user.user_id);
    
    // Send device claimed email
    try {
      await emailService.sendDeviceClaimedEmail(user, device);
    } catch (emailError) {
      console.error('❌ Device claimed email failed:', emailError);
    }
    
    // ✅ Send credentials to ESP via MQTT
    const { mqttClient } = require('../mqtt/mqttClient');
    if (mqttClient && mqttClient.connected) {
      const claimPayload = {
        username: user.username,
        email: user.email,
        password_hash: user.password_hash,
        claimed_at: device.claimed_at,
        claimed_by: user.username
      };
      
      const topic = `commands/${normalizedEspID}/claimed`;
      mqttClient.publish(topic, JSON.stringify(claimPayload), { qos: 1 });
      
      console.log(`📤 Sent credentials to ${normalizedEspID} for user ${user.username}`);
    }
    
    console.log(`✅ Device ${normalizedEspID} claimed by ${user.username}`);
    
    res.json({
      success: true,
      message: 'Device claimed successfully! Your ESP will sync automatically.',
      device: {
        id: device._id,
        espID: device.espID,
        nickname: device.nickname,
        claimed_at: device.claimed_at,
        status: device.status
      }
    });
    
  } catch (error) {
    console.error('❌ Claim device error:', error);
    res.status(500).json({ error: 'Failed to claim device' });
  }
});

// ✅ Update device nickname
router.put('/:espID/nickname', authenticateToken, async (req, res) => {
  try {
    const { espID } = req.params;
    const { nickname } = req.body;
    
    if (!nickname || nickname.length < 1 || nickname.length > 50) {
      return res.status(400).json({ error: 'Nickname must be 1-50 characters' });
    }
    
    const normalizedEspID = espID.toUpperCase();
    
    const device = await Device.findOne({ 
      espID: normalizedEspID,
      claimedBy: req.user.user_id 
    });
    
    if (!device) {
      return res.status(404).json({ error: 'Device not found or unauthorized' });
    }
    
    device.nickname = nickname;
    await device.save();
    
    res.json({
      success: true,
      message: 'Nickname updated',
      device: {
        id: device._id,
        espID: device.espID,
        nickname: device.nickname
      }
    });
    
  } catch (error) {
    console.error('❌ Update nickname error:', error);
    res.status(500).json({ error: 'Failed to update nickname' });
  }
});

// DELETE /api/devices/:espID/unclaim - Unclaim a device
router.delete('/:espID/unclaim', authenticateToken, async (req, res) => {
  try {
    const { espID } = req.params;
    const normalizedEspID = espID.toUpperCase();
    
    const device = await Device.findOne({ 
      espID: normalizedEspID,
      claimedBy: req.user.user_id 
    });
    
    if (!device) {
      return res.status(404).json({ 
        error: 'Device not found or you do not own this device' 
      });
    }
    
    const user = await User.findById(req.user.user_id);
    
    // Send unclaim notification to device via MQTT
    const { mqttClient } = require('../mqtt/mqttClient');
    if (mqttClient && mqttClient.connected) {
      const unclaimPayload = {
        success: true,
        espID: normalizedEspID,
        message: 'Device unclaimed by owner',
        timestamp: new Date()
      };
      
      const unclaimTopic = `commands/${normalizedEspID}/unclaim-confirmed`;
      mqttClient.publish(unclaimTopic, JSON.stringify(unclaimPayload), { qos: 1 });
      
      console.log(`📤 Sent unclaim notification to ${normalizedEspID}`);
    }
    
    // Unclaim the device
    device.claimedBy = null;
    device.claimed_at = null;
    device.status = 'active';
    await device.save();
    
    // Send device unclaimed email
    try {
      await emailService.sendDeviceUnclaimedEmail(user, {
        espID: device.espID,
        nickname: device.nickname
      });
    } catch (emailError) {
      console.error('❌ Device unclaimed email failed:', emailError);
    }
    
    console.log(`✅ Device ${normalizedEspID} unclaimed by ${user.username}`);
    
    res.json({
      success: true,
      message: 'Device unclaimed successfully',
      espID: normalizedEspID
    });
  } catch (error) {
    console.error('❌ Unclaim device error:', error);
    res.status(500).json({ error: 'Failed to unclaim device' });
  }
});

module.exports = router;