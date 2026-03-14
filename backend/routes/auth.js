// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User, Device } = require('../models');
const { JWT_SECRET } = require('../config/constants');
const { sha256 } = require('../utils/helpers');
const { rateLimiters } = require('../middleware/rateLimiter');
const emailService = require('../emails/emailService');
const { createPasswordResetToken, resetPasswordWithToken } = require('../services/passwordReset');

// ✅ Online Register (web users - NO device required initially)
router.post('/register', rateLimiters.register, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const exists = await User.findOne({ 
      $or: [{ username }, { email }]
    });
    if (exists) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    
    const password_hash = sha256(password);
    
    const user = new User({
      username,
      email,
      password_hash,
      synced_at: new Date()
    });
    await user.save();

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user);
    } catch (emailError) {
      console.error('❌ Welcome email failed:', emailError);
    }
    
    const token = jwt.sign(
      { user_id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    console.log(`✅ User registered: ${username}`);
    
    res.status(201).json({
      success: true,
      token,
      user: {
        username: user.username,
        email: user.email
      },
      message: 'Account created! Add your first device to get started.'
    });
    
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ✅ Online Login (Supports Username OR Email)
router.post('/login', rateLimiters.auth, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log(`🔐 Login Attempt for: "${username}"`); 

    if (!username || !password) {
      return res.status(400).json({ error: 'Username/Email and password required' });
    }
    
    // 1. HYBRID FIND: Check Username OR Email (Case-insensitive)
    const user = await User.findOne({
      $or: [
        { username: { $regex: new RegExp(`^${username}$`, 'i') } },
        { email: { $regex: new RegExp(`^${username}$`, 'i') } }
      ]
    });

    if (!user) {
      console.log(`❌ Login Failed: User/Email "${username}" not found`);
      return res.status(401).json({ error: 'Invalid credentials (User not found)' });
    }
    
    // 2. PASSWORD CHECK
    const inputHash = sha256(password);
    
    if (inputHash !== user.password_hash) {
      console.log(`❌ Login Failed: Password mismatch for ${user.username}`);
      return res.status(401).json({ error: 'Invalid credentials (Password mismatch)' });
    }
    
    // 3. GET DEVICES
    const devices = await Device.find({ claimedBy: user._id });
    
    const token = jwt.sign(
      { user_id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    user.last_login = new Date();
    await user.save();
    
    console.log(`✅ Login Success: ${user.username}`);
    
    res.json({
      success: true,
      token,
      user: {
        username: user.username,
        email: user.email,
        device_count: devices.length
      }
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Login system error' });
  }
});

// ✅ Request password reset
router.post('/password/reset-request', rateLimiters.passwordReset, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }
    
    const result = await createPasswordResetToken(email);
    
    if (!result) {
      return res.json({ 
        success: true, 
        message: 'If that email exists, a reset link has been sent' 
      });
    }
    
    const { user, resetCode } = result;
    
    try {
      await emailService.sendPasswordResetWebEmail(user, resetCode);
    } catch (emailError) {
      console.error('❌ Email send failed:', emailError);
      if (emailError.response) {
        console.error(emailError.response.body);
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Reset instructions sent to your email' 
    });
    
  } catch (error) {
    console.error('❌ Reset request error:', error);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
});

// ✅ Verify reset token
router.post('/password/verify-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }
    
    const tokenHash = sha256(token);
    const { ResetToken } = require('../models');
    
    const resetToken = await ResetToken.findOne({
      token: tokenHash,
      used: false,
      expires_at: { $gt: new Date() }
    });
    
    if (!resetToken) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    
    const user = await User.findById(resetToken.user_id);
    
    res.json({ 
      success: true, 
      valid: true,
      username: user.username 
    });
    
  } catch (error) {
    console.error('❌ Token verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// ✅ Reset password with token
router.post('/password/reset', rateLimiters.auth, async (req, res) => {
  try {
    const { token, new_password } = req.body;
    
    if (!token || !new_password) {
      return res.status(400).json({ error: 'Token and new password required' });
    }
    
    if (new_password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const newPasswordHash = sha256(new_password);
    const user = await resetPasswordWithToken(token, newPasswordHash);
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    
    console.log(`✅ Password reset for user: ${user.username}`);
    
    // ✅ Notify ALL devices owned by this user
    const devices = await Device.find({ claimedBy: user._id });
    const { mqttClient } = require('../mqtt/mqttClient');
    
    if (mqttClient && mqttClient.connected) {
      for (const device of devices) {
        const updatePayload = {
          password_hash: newPasswordHash,
          updated_at: new Date()
        };
        
        const updateTopic = `commands/${device.espID}/password-updated`;
        mqttClient.publish(updateTopic, JSON.stringify(updatePayload), { qos: 1 });
        
        console.log(`📤 Sent password update to ${device.espID}`);
      }
    }
    
    try {
      await emailService.sendPasswordChangedEmail(user);
    } catch (emailError) {
      console.error('❌ Confirmation email failed:', emailError);
      if (emailError.response) {
        console.error(emailError.response.body);
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Password reset successful' 
    });
    
  } catch (error) {
    console.error('❌ Password reset error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

module.exports = router;