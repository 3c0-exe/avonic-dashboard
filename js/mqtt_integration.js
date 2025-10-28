// // AVONIC MQTT Integration for GitHub Pages
// // Connects to HiveMQ Cloud and receives real-time sensor data

// // MQTT Configuration
// const MQTT_BROKER = "3fbd52903d154a689cae6941ba13bfcf.s1.eu.hivemq.cloud";
// const MQTT_PORT = 8884; // WebSocket Secure port
// const MQTT_USER = "avonic-system";
// const MQTT_PASS = "Avonic123";
// const MQTT_TOPIC = "avonic/sensors";

// let client;
// let sensorData = null;
// let lastUpdateTime = null;

// // Connect to MQTT Broker
// function connectMQTT() {
//     const clientId = "web_" + Math.random().toString(16).substr(2, 8);
//     client = new Paho.MQTT.Client(MQTT_BROKER, MQTT_PORT, "/mqtt", clientId);
    
//     client.onConnectionLost = function(responseObject) {
//         console.log("❌ MQTT Connection Lost:", responseObject.errorMessage);
//         setTimeout(connectMQTT, 5000); // Reconnect after 5s
//     };
    
//     client.onMessageArrived = function(message) {
//         console.log("📥 Message received:", message.payloadString);
//         try {
//             const data = JSON.parse(message.payloadString);
//             handleMQTTData(data);
//         } catch(e) {
//             console.error("JSON parse error:", e);
//         }
//     };
    
//     const connectOptions = {
//         useSSL: true,
//         userName: MQTT_USER,
//         password: MQTT_PASS,
//         onSuccess: function() {
//             console.log("✅ MQTT Connected!");
//             client.subscribe(MQTT_TOPIC);
//             client.subscribe("avonic/#");
//         },
//         onFailure: function(err) {
//             console.error("❌ MQTT Connection Failed:", err);
//             setTimeout(connectMQTT, 5000);
//         }
//     };
    
//     client.connect(connectOptions);
// }

// // Handle incoming MQTT data
// function handleMQTTData(data) {
//     // Transform nested MQTT structure to flat structure
//     sensorData = {
//         // Bin 1
//         temp1: data.bin1?.temp,
//         hum1: data.bin1?.humidity,
//         soil1_percent: data.bin1?.soil,
//         gas1_ppm: data.bin1?.gas,
//         ds18b20_temp: data.bin1?.ds18b20,
//         ultrasonic: data.bin1?.ultrasonic,
//         fan1_current_state: data.bin1?.fan,
//         pump1_current_state: data.bin1?.pump,
//         sensor1_ok: data.bin1?.status !== "no_data",
        
//         // Bin 2
//         temp2: data.bin2?.temp,
//         hum2: data.bin2?.humidity,
//         soil2_percent: data.bin2?.soil,
//         gas2_ppm: data.bin2?.gas,
//         water_level: data.bin2?.water_level,
//         fan2_current_state: data.bin2?.fan,
//         pump2_current_state: data.bin2?.pump,
//         sensor2_ok: data.bin2?.status !== "no_data",
        
//         // System
//         wifi_connected: true,
//         mqtt_connected: true,
//         lastUpdate: new Date().toLocaleTimeString()
//     };
    
//     lastUpdateTime = new Date();
//     updateUI();
// }

// // Update all UI components
// function updateUI() {
//     if (!sensorData) return;

//     // Update HOME PAGE cards
//     updateSensorCard('Battery', sensorData.battery_percent || 0, null);
//     updateSensorCard('Water', calculateWaterLevel(sensorData.ultrasonic), null);
//     updateSensorCard('Water Temp', sensorData.ds18b20_temp, null);

//     // Update BIN 1 sensors
//     updateSensorCard('Soil Moisture', sensorData.soil1_percent, 1);
//     updateSensorCard('Temperature', sensorData.temp1, 1);
//     updateSensorCard('Humidity', sensorData.hum1, 1);
//     updateSensorCard('Gas Level', sensorData.gas1_ppm, 1);

//     // Update BIN 2 sensors
//     updateSensorCard('Soil Moisture', sensorData.soil2_percent, 2);
//     updateSensorCard('Temperature', sensorData.temp2, 2);
//     updateSensorCard('Humidity', sensorData.hum2, 2);
//     updateSensorCard('Gas Level', sensorData.gas2_ppm, 2);

//     // Update timestamps
//     updateTimeStamp();
    
//     console.log(`📡 MQTT: Connected, Data: ${sensorData.sensor1_ok ? 'Bin1 ✅' : 'Bin1 ❌'} ${sensorData.sensor2_ok ? 'Bin2 ✅' : 'Bin2 ❌'}`);
// }

// // Update individual sensor card
// function updateSensorCard(label, value, binId = null) {
//     const cards = document.querySelectorAll('status-card');
    
//     cards.forEach(card => {
//         const cardLabel = card.getAttribute('dataLabel');
//         const cardBinId = card.getAttribute('binId');
        
//         // Filter by binId
//         if (binId !== null) {
//             if (!cardBinId || cardBinId !== String(binId)) return;
//         } else {
//             if (cardBinId) return;
//         }
        
//         if (cardLabel === label) {
//             const cardStats = card.querySelector('.card_stats');
//             if (cardStats && typeof setCardValue === 'function') {
//                 if (value === null || value === undefined || value === -1 || isNaN(value)) {
//                     const valueElem = cardStats.querySelector('.card_value');
//                     const unitElem = cardStats.querySelector('.card_unit');
//                     if (valueElem) valueElem.textContent = '--';
//                     if (unitElem) unitElem.textContent = '';
//                 } else {
//                     setCardValue(cardStats, value);
//                 }
//             }
//         }
//     });
// }

// // Calculate water level from ultrasonic sensor
// function calculateWaterLevel(distance) {
//     if (distance === -1 || distance === null) return 0;
//     const EMPTY_DISTANCE = 30;
//     const FULL_DISTANCE = 5;
//     if (distance >= EMPTY_DISTANCE) return 0;
//     if (distance <= FULL_DISTANCE) return 100;
//     const percentage = ((EMPTY_DISTANCE - distance) / (EMPTY_DISTANCE - FULL_DISTANCE)) * 100;
//     return Math.max(0, Math.min(100, percentage));
// }

// // Update timestamp
// function updateTimeStamp() {
//     if (!lastUpdateTime) return;
//     const now = new Date();
//     const secondsAgo = Math.floor((now - lastUpdateTime) / 1000);
//     const timeElements = document.querySelectorAll('.time-updated');
//     timeElements.forEach(el => {
//         el.textContent = `Updated ${secondsAgo}s ago`;
//     });
// }

// // Refresh button handler
// function setupRefreshButton() {
//     const refreshButtons = document.querySelectorAll('.refresh-sensors');
//     refreshButtons.forEach(button => {
//         button.addEventListener('click', () => {
//             console.log('🔄 Manual refresh (MQTT auto-updates)');
//             // MQTT updates automatically, just give visual feedback
//             button.style.opacity = '0.5';
//             setTimeout(() => {
//                 button.style.opacity = '1';
//             }, 300);
//         });
//     });
// }

// // Initialize when ready
// function initializeWhenReady() {
//     if (typeof setCardValue === 'function') {
//         console.log('✅ setCardValue function detected');
//         setupRefreshButton();
//         connectMQTT();
        
//         // Update timestamps every second
//         setInterval(updateTimeStamp, 1000);
//     } else {
//         console.log('⏳ Waiting for main_components.js to load...');
//         setTimeout(initializeWhenReady, 100);
//     }
// }

// // Start when DOM is ready
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', initializeWhenReady);
// } else {
//     initializeWhenReady();
// }

// // Export for debugging
// window.avonicMQTT = {
//     getCurrentData: () => sensorData,
//     isConnected: () => client && client.isConnected(),
//     lastUpdate: () => lastUpdateTime
// };

// console.log('📦 mqtt_integration.js loaded');
