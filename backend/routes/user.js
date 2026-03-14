// routes/user.js
const express = require('express');
const router = express.Router();
const { User, Device } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { sha256 } = require('../utils/helpers');
const emailService = require('../emails/emailService');

// GET /api/user/profile - Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id)
      .select('username email created_at');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      username: user.username,
      email: user.email,
      created_at: user.created_at
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/user/email - Update email
router.put('/email', authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' });
    }
    
    // Check if email already exists
    const existing = await User.findOne({ email, _id: { $ne: req.user.user_id } });
    if (existing) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    const user = await User.findById(req.user.user_id);
    const oldEmail = user.email;
    
    user.email = email;
    await user.save();
    
    // Send email notification to both addresses
    try {
      await emailService.sendEmailChangedEmail(user, oldEmail, email);
      console.log(`✅ Email change notification sent to ${oldEmail} and ${email}`);
    } catch (emailError) {
      console.error('❌ Email change notification failed:', emailError);
    }
    
    res.json({
      success: true,
      message: 'Email updated successfully',
      email: user.email
    });
  } catch (error) {
    console.error('❌ Update email error:', error);
    res.status(500).json({ error: 'Failed to update email' });
  }
});

// PUT /api/user/password - Update password
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Both passwords required' });
    }
    
    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    
    const user = await User.findById(req.user.user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const currentHash = sha256(current_password);
    if (currentHash !== user.password_hash) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Update to new password
    const newHash = sha256(new_password);
    user.password_hash = newHash;
    await user.save();
    
    // ✅ Notify all user's devices via MQTT
    const devices = await Device.find({ claimedBy: user._id });
    const { mqttClient } = require('../mqtt/mqttClient');
    
    if (mqttClient && mqttClient.connected) {
      for (const device of devices) {
        const updatePayload = {
          password_hash: newHash,
          updated_at: new Date()
        };
        
        const updateTopic = `commands/${device.espID}/password-updated`;
        mqttClient.publish(updateTopic, JSON.stringify(updatePayload), { qos: 1 });
        
        console.log(`📤 Sent password update to ${device.espID}`);
      }
    }
    
    // Send confirmation email
    try {
      await emailService.sendPasswordChangedEmail(user);
    } catch (emailError) {
      console.error('❌ Confirmation email failed:', emailError);
    }
    
    console.log(`✅ Password updated for user: ${user.username}`);
    
    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('❌ Update password error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

module.exports = router;