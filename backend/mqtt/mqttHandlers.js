// mqtt/mqttHandlers.js
const { User, Device, SensorReading } = require('../models');
const { createPasswordResetToken, resetPasswordWithToken } = require('../services/passwordReset');
const emailService = require('../emails/emailService');

async function handleMqttMessage(topic, message) {
  console.log('📩 MQTT MESSAGE:', topic);
  console.log('📦 Raw message:', message.toString());
  
  try {
    const data = JSON.parse(message.toString());
    console.log('📋 Parsed data:', JSON.stringify(data));
    
    // Get MQTT client reference
    const { getMqttClient } = require('./mqttClient');
    const mqttClient = getMqttClient();
    
    // ====== Handle Credential Request ======
    if (topic.startsWith('commands/') && topic.endsWith('/request-credentials')) {
      await handleCredentialRequest(topic, data, mqttClient);
      return;
    }
    
    // ====== Handle Password Reset Request ======
    if (topic === 'avonic/password-reset-request') {
      await handlePasswordResetRequest(data);
      return;
    }
    
    // ====== Handle Password Reset Confirmation ======
    if (topic === 'avonic/password-reset') {
      await handlePasswordReset(data, mqttClient);
      return;
    }
    
    // ====== Handle User Registration ======
    if (topic === 'avonic/users') {
      await handleUserRegistration(data, mqttClient);
      return;
    }
    
    // ====== Handle Device Unclaim Request ======
    if (topic === 'avonic/unclaim-device') {
      await handleDeviceUnclaim(data, mqttClient);
      return;
    }
    
    // ====== Handle Sensor Data ======
    if (topic === 'avonic/sensors') {
      await handleSensorData(data);
      return;
    }
    
  } catch (error) {
    console.error('❌ MQTT Handler Error:', error.message);
  }
}

// ====== Individual Handler Functions ======

async function handleCredentialRequest(topic, data, mqttClient) {
  const espID = topic.split('/')[1];
  console.log(`🔍 Credential request from: ${espID}`);
  
  const device = await Device.findOne({ espID: espID }).populate('claimedBy');
  
  if (!device) {
    console.log(`⚠️ Device ${espID} not found in database - creating unclaimed device`);
    
    const newDevice = new Device({
      espID: espID,
      claimedBy: null,
      status: 'active',
      nickname: 'Unclaimed Device'
    });
    await newDevice.save();
    
    console.log(`✅ Created unclaimed device: ${espID}`);
    return;
  }
  
  if (!device.claimedBy) {
    console.log(`⚠️ Device ${espID} exists but is not claimed yet`);
    
    const notClaimedPayload = {
      success: false,
      claimed: false,
      message: 'Device not claimed. Register via web dashboard or ESP32.',
      espID: espID
    };
    
    const errorTopic = `commands/${espID}/sync-error`;
    mqttClient.publish(errorTopic, JSON.stringify(notClaimedPayload), { qos: 1 });
    
    return;
  }
  
  console.log(`✅ Device ${espID} is claimed by: ${device.claimedBy.username}`);
  
  const credPayload = {
    success: true,
    claimed: true,
    username: device.claimedBy.username,
    email: device.claimedBy.email,
    password_hash: device.claimedBy.password_hash,
    synced_at: new Date()
  };
  
  const syncTopic = `commands/${espID}/sync-credentials`;
  mqttClient.publish(syncTopic, JSON.stringify(credPayload), { qos: 1 });
  
  console.log(`📤 Sent credentials to ${espID}`);
  
  device.last_seen = new Date();
  device.mqtt_connected = true;
  await device.save();
}

async function handlePasswordResetRequest(data) {
  const { espID, email } = data;
  console.log(`🔐 Password reset request for: ${email}`);
  
  if (!email) return;
  
  const result = await createPasswordResetToken(email);
  if (!result) {
    console.log(`⚠️ No user found for: ${email}`);
    return;
  }
  
  const { user, resetCode } = result;
  console.log(`✅ Generated code for ${user.username}: ${resetCode}`);
  
  try {
    await emailService.sendPasswordResetEmail(user, resetCode, espID);
  } catch (emailError) {
    console.error('❌ Email send failed:', emailError);
    if (emailError.response) console.error(emailError.response.body);
  }
}

async function handlePasswordReset(data, mqttClient) {
  const { espID, token, new_password } = data;
  console.log(`🔐 Password reset with token: ${token?.substring(0, 6)}...`);
  
  if (!token || !new_password) return;
  
  const user = await resetPasswordWithToken(token, new_password);
  if (!user) {
    console.log('⚠️ Invalid or expired token');
    return;
  }
  
  console.log(`✅ Password changed for: ${user.username}`);
  
  const devices = await Device.find({ claimedBy: user._id });
  
  for (const device of devices) {
    const updatePayload = {
      password_hash: new_password,
      updated_at: new Date()
    };
    
    const updateTopic = `commands/${device.espID}/password-updated`;
    mqttClient.publish(updateTopic, JSON.stringify(updatePayload), { qos: 1 });
    
    console.log(`📤 Sent password update to ${device.espID}`);
  }
  
  try {
    await emailService.sendPasswordChangedEmail(user, espID);
  } catch (emailError) {
    console.error('❌ Confirmation email failed:', emailError);
  }
}

async function handleUserRegistration(data, mqttClient) {
  console.log('📥 Received user registration from ESP');
  
  const { espID, username, email, password } = data;
  
  if (!username || !email || !password || !espID) {
    console.log('⚠️ Missing required fields');
    return;
  }
  
  const normalizedEspID = espID.toUpperCase();
  
  let user = await User.findOne({ 
    $or: [{ username }, { email }]
  });
  
  let isNewUser = false;
  
  if (!user) {
    user = new User({
      username,
      email,
      password_hash: password,
      synced_at: new Date()
    });
    await user.save();
    isNewUser = true;
    console.log(`✅ NEW USER CREATED: ${username} (from ESP ${normalizedEspID})`);
  } else {
    console.log(`ℹ️ User already exists: ${username}`);
  }

  if (isNewUser) {
    try {
      await emailService.sendWelcomeEmail(user);
    } catch (emailError) {
      console.error('❌ Welcome email failed:', emailError);
    }
  }
  
  let device = await Device.findOne({ espID: normalizedEspID });
  
  if (!device) {
    device = new Device({
      espID: normalizedEspID,
      claimedBy: user._id,
      claimed_at: new Date(),
      status: 'active',
      nickname: `${username}'s Device`
    });
    await device.save();
    console.log(`✅ Device ${normalizedEspID} auto-claimed by ${username} (offline registration)`);
    
  } else if (!device.claimedBy) {
    device.claimedBy = user._id;
    device.claimed_at = new Date();
    device.nickname = `${username}'s Device`;
    await device.save();
    console.log(`✅ Device ${normalizedEspID} claimed by ${username} (offline registration)`);
    
  } else if (device.claimedBy.toString() === user._id.toString()) {
    console.log(`ℹ️ User ${username} re-registering on their device ${normalizedEspID}`);
    device.last_seen = new Date();
    await device.save();
    
  } else {
    console.log(`⚠️ CONFLICT: Device ${normalizedEspID} already claimed by another user`);
    
    const errorPayload = {
      success: false,
      error: 'device_already_claimed',
      message: 'This device is already registered to another account'
    };
    
    const errorTopic = `commands/${normalizedEspID}/sync-error`;
    mqttClient.publish(errorTopic, JSON.stringify(errorPayload), { qos: 1 });
    
    return;
  }
  
  const confirmPayload = {
    success: true,
    username: user.username,
    email: user.email,
    password_hash: user.password_hash,
    synced_at: new Date(),
    claimed: true,
    message: isNewUser ? 
      'Account created and device claimed!' : 
      'Account synced successfully!'
  };
  
  const confirmTopic = `commands/${normalizedEspID}/sync-confirmed`;
  mqttClient.publish(confirmTopic, JSON.stringify(confirmPayload), { qos: 1 });
  
  console.log(`📤 Sent sync confirmation to ${normalizedEspID}`);
  
  if (!isNewUser) {
    try {
      await emailService.sendAccountSyncedEmail(user, normalizedEspID);
    } catch (emailError) {
      console.error('❌ Account synced email failed:', emailError);
    }
  }
}

async function handleDeviceUnclaim(data, mqttClient) {
  console.log('🔓 UNCLAIM HANDLER TRIGGERED');
  const { espID } = data;
  console.log(`🔓 Unclaim request from: ${espID}`);
  
  if (!espID) return;
  
  const normalizedEspID = espID.toUpperCase();
  
  const device = await Device.findOne({ espID: normalizedEspID });
  
  if (!device) {
    console.log(`⚠️ Device ${normalizedEspID} not found in database`);
    return;
  }
  
  if (!device.claimedBy) {
    console.log(`ℹ️ Device ${normalizedEspID} was already unclaimed`);
    return;
  }
  
  const previousOwner = device.claimedBy;
  
  device.claimedBy = null;
  device.claimed_at = null;
  device.status = 'active';
  await device.save();
  
  console.log(`✅ Device ${normalizedEspID} unclaimed successfully`);
  
  try {
    const ownerUser = await User.findById(previousOwner);
    if (ownerUser) {
      await emailService.sendDeviceUnclaimedEmail(ownerUser, {
        espID: device.espID,
        nickname: device.nickname
      });
    }
  } catch (emailError) {
    console.error('❌ Device unclaimed email failed:', emailError);
  }
  
  const confirmPayload = {
    success: true,
    espID: normalizedEspID,
    message: 'Device unclaimed successfully',
    timestamp: new Date()
  };
  
  const confirmTopic = `commands/${normalizedEspID}/unclaim-confirmed`;
  mqttClient.publish(confirmTopic, JSON.stringify(confirmPayload), { qos: 1 });
  
  console.log(`📤 Sent unclaim confirmation to ${normalizedEspID}`);
}

async function handleSensorData(data) {
  const espID = data.espID;
  
  if (!espID) {
    console.log('⚠️ No espID in sensor data');
    return;
  }
  
  const normalizedEspID = espID.toUpperCase();
  
  let device = await Device.findOne({ espID: normalizedEspID });
  
  if (!device) {
    console.log(`🆕 New unclaimed device: ${normalizedEspID}`);
    device = new Device({
      espID: normalizedEspID,
      claimedBy: null,
      nickname: 'Unclaimed Device',
      status: 'active'
    });
    await device.save();
  }
  
  const reading = new SensorReading({
    espID: normalizedEspID,
    timestamp: new Date(),
    bin1: data.bin1,
    bin2: data.bin2,
    system: data.system,
    source: 'mqtt'
  });
  
  await reading.save();
  
  device.last_seen = new Date();
  device.mqtt_connected = true;
  await device.save();
  
  console.log(`💾 Saved sensor data from: ${normalizedEspID} (${device.claimedBy ? 'claimed' : 'unclaimed'})`);
}

module.exports = { handleMqttMessage };