// models/index.js
const mongoose = require('mongoose');

// ✅ User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password_hash: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  created_offline: { type: Number },
  synced_at: { type: Date },
  last_login: { type: Date },
  role: { type: String, default: 'user' }
});

// ✅ Device Schema
const deviceSchema = new mongoose.Schema({
  espID: { type: String, required: true, unique: true, index: true },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  nickname: { type: String, default: 'My Compost Bin' },
  status: { type: String, enum: ['active', 'inactive', 'offline'], default: 'active' },
  last_seen: { type: Date, default: Date.now },
  claimed_at: { type: Date },
  created_at: { type: Date, default: Date.now },
  mqtt_connected: { type: Boolean, default: false },
  firmware_version: String
});

// ✅ Reset Token Schema
const resetTokenSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, unique: true },
  expires_at: { type: Date, required: true },
  used: { type: Boolean, default: false }
});

// ✅ Sensor Reading Schema
const sensorReadingSchema = new mongoose.Schema({
  espID: { type: String, required: true, index: true },
  timestamp: { type: Date, required: true, index: true },
  bin1: {
    temp: Number,
    humidity: Number,
    soil: Number,
    gas: Number,
    ds18b20: Number,
    ultrasonic: Number,
    fan: Boolean,
    pump: Boolean
  },
  bin2: {
    temp: Number,
    humidity: Number,
    soil: Number,
    gas: Number,
    water_level: Number,
    fan: Boolean,
    pump: Boolean
  },
  system: {
    uptime: Number,
    battery_level: Number,
    battery_charging: Boolean,
    wifi_rssi: Number
  },
  source: { type: String, enum: ['mqtt', 'http', 'sync'], default: 'mqtt' }
});

sensorReadingSchema.index({ espID: 1, timestamp: -1 });

const User = mongoose.model('User', userSchema);
const Device = mongoose.model('Device', deviceSchema);
const SensorReading = mongoose.model('SensorReading', sensorReadingSchema);
const ResetToken = mongoose.model('ResetToken', resetTokenSchema);

module.exports = { User, Device, SensorReading, ResetToken };