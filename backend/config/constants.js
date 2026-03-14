// config/constants.js
module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'avonic3c0vermicomposting4farmers',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/avonic',
  
  MQTT_CONFIG: {
    host: '3fbd52903d154a689cae6941ba13bfcf.s1.eu.hivemq.cloud',
    port: 8883,
    protocol: 'mqtts',
    username: 'avonic-system',
    password: 'Avonic123'
  },
  
  CORS_ORIGINS: [
    'https://3c0-exe.github.io',
    'http://192.168.4.1',
    'http://localhost:3000',
    'https://avonic-dashboard-production.up.railway.app',
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://127.0.0.1:5501',  // ✅ Add this line
    'http://localhost:5501'    // ✅ Add this line too
  ]
};