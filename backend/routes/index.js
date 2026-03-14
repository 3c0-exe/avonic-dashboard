// routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const deviceRoutes = require('./devices');
const sensorRoutes = require('./sensors');
const userRoutes = require('./user');
const actuatorRoutes = require('./actuators');
const healthRoute = require('./health');

// Health check (no prefix)
router.use('/health', healthRoute);

// Auth routes - /api/register, /api/login, /api/password/*
router.use('/', authRoutes);

// Device routes - /api/devices/*
router.use('/devices', deviceRoutes);

// Sensor routes - /api/sensors/* and /api/devices/:espID/* (sensor endpoints)
router.use('/sensors', sensorRoutes);

// User routes - /api/user/*
router.use('/user', userRoutes);

// Actuator routes - /api/bin1/*, /api/bin2/*, /api/peltier/*
router.use('/', actuatorRoutes);

module.exports = router;