// mqtt/mqttClient.js
const mqtt = require('mqtt');
const { MQTT_CONFIG } = require('../config/constants');
const { handleMqttMessage } = require('./mqttHandlers');

let mqttClient = null;

function connectMQTT() {
  console.log('🔌 Connecting to MQTT broker...');
  
  const options = {
    host: MQTT_CONFIG.host,
    port: MQTT_CONFIG.port,
    protocol: 'mqtts',
    username: MQTT_CONFIG.username,
    password: MQTT_CONFIG.password,
    rejectUnauthorized: true,
    clean: true,
    clientId: 'avonic-backend-' + Math.random().toString(16).substr(2, 8)
  };
  
  console.log('🔑 Connecting to:', MQTT_CONFIG.host);
  
  mqttClient = mqtt.connect(options);
  
  mqttClient.on('connect', () => {
    console.log('✅ Connected to HiveMQ');
    
    // Subscribe to all relevant topics
    const topics = [
      'avonic/sensors',
      'avonic/users',
      'commands/+/request-credentials',
      'avonic/password-reset-request',
      'avonic/password-reset',
      'avonic/unclaim-device'
    ];
    
    topics.forEach(topic => {
      mqttClient.subscribe(topic, { qos: 0 }, (err) => {
        if (!err) console.log(`✅ Subscribed to ${topic}`);
      });
    });
  });

  mqttClient.on('message', handleMqttMessage);
  
  mqttClient.on('error', (err) => {
    console.error('❌ MQTT error:', err);
  });
  
  mqttClient.on('reconnect', () => {
    console.log('🔄 MQTT reconnecting...');
  });
  
  mqttClient.on('close', () => {
    console.log('⚠️ MQTT connection closed');
  });
}

module.exports = { connectMQTT, mqttClient, getMqttClient: () => mqttClient };